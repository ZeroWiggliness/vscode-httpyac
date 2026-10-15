import * as fs from 'fs';
import Module from 'module';
import * as path from 'path';
import * as vm from 'vm';
import { HttpFile, HttpRegion, HttpyacHooksApi, io, ProcessorContext } from 'httpyac';
import { bailOnFailedTestInterceptor } from './bailOnFailedTestInterceptor';
import { provideOutputChannelLogger } from './outputChannelProvider';
import * as vscode from 'vscode';
import { errorNotificationHandler } from './errorNotificationHandler';

const commonJsConfigFilenames = new Set(['.httpyac.js', '.httpyac.config.js', 'httpyac.config.js']);
let commonJsConfigLoaderInstalled = false;

export function registerVscodePluginsFactory(httpRegionExecutedEmitter: vscode.EventEmitter<HttpRegionExecutedEvent>) {
  return (api: HttpyacHooksApi) => {
    installCommonJsConfigLoaderCompatibility();
    api.hooks.execute.addInterceptor(errorNotificationHandler);
    api.hooks.execute.addInterceptor(bailOnFailedTestInterceptor);
    api.hooks.execute.addInterceptor({
      id: 'httpRegionExecuted',
      afterLoop: async function bail(hookContext: { args: [ProcessorContext] }) {
        const context = hookContext.args[0];
        httpRegionExecutedEmitter.fire(context);
        return true;
      },
      onError: async function bail(_err: Error, hookContext: { args: [ProcessorContext] }) {
        const context = hookContext.args[0];
        httpRegionExecutedEmitter.fire(context);
        return true;
      },
    });
    api.hooks.provideVariables.addHook('provideOutputChannelLogger', provideOutputChannelLogger);
    io.javascriptProvider.require.vscode = vscode;
  };
}

export function installCommonJsConfigLoaderCompatibility() {
  if (commonJsConfigLoaderInstalled) {
    return;
  }
  const originalLoadModule = io.javascriptProvider.loadModule;
  if (!originalLoadModule) {
    return;
  }

  commonJsConfigLoaderInstalled = true;
  const commonJsConfigCache = new Map<string, unknown>();
  io.javascriptProvider.loadModule = <T>(request: string, context: string, force?: boolean): T | undefined => {
    if (force) {
      commonJsConfigCache.delete(request);
    }
    try {
      return originalLoadModule<T>(request, context, force);
    } catch (error) {
      if (
        !(error instanceof Error && error.name === 'ReferenceError') ||
        !error.message.includes('module is not defined')
      ) {
        throw error;
      }
      if (!commonJsConfigFilenames.has(path.basename(request))) {
        throw error;
      }
      if (!force && commonJsConfigCache.has(request)) {
        return commonJsConfigCache.get(request) as T;
      }
      const result = loadCommonJsConfig<T>(request);
      if (!force) {
        commonJsConfigCache.set(request, result);
      }
      return result;
    }
  };
}

function loadCommonJsConfig<T>(filename: string): T {
  const source = fs.readFileSync(filename, 'utf8').replace(/^#!.*(?:\r?\n|$)/u, '');
  const wrapper = vm.runInThisContext(`(function (exports, require, module, __filename, __dirname) {${source}\n})`, {
    filename,
  }) as (
    exports: unknown,
    require: ReturnType<typeof Module.createRequire>,
    module: { exports: unknown },
    filename: string,
    dirname: string
  ) => void;
  const module = { exports: {} as unknown };
  wrapper.call(
    module.exports,
    module.exports,
    Module.createRequire(filename),
    module,
    filename,
    path.dirname(filename)
  );
  return module.exports as T;
}

export type HttpRegionExecutedEvent = {
  httpRegion: HttpRegion;
  httpFile: HttpFile;
};
