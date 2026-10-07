param(
  [string]$NodeImage = 'node:24'
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
$manifest = Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw | ConvertFrom-Json
$vsixPath = Join-Path $repoRoot "$($manifest.name)-$($manifest.version).vsix"

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
  throw 'Docker CLI was not found. Install Docker Desktop and ensure docker is on PATH.'
}

$dockerArgs = @(
  'run',
  '--rm',
  '--mount', "type=bind,source=$repoRoot,target=/workspace",
  '--tmpfs', '/workspace/node_modules:exec',
  '--workdir', '/workspace',
  $NodeImage,
  'sh',
  '-c',
  'npm ci && npm run package'
)

& $docker.Source @dockerArgs
if ($LASTEXITCODE -ne 0) {
  throw "Docker build failed with exit code $LASTEXITCODE."
}

if (-not (Test-Path -LiteralPath $vsixPath)) {
  throw "The build completed without producing the expected VSIX: $vsixPath"
}

$code = Get-Command code -ErrorAction SilentlyContinue
if (-not $code) {
  throw 'VS Code CLI was not found. Add code to PATH, then run this script again.'
}

& $code.Source --install-extension $vsixPath --force
if ($LASTEXITCODE -ne 0) {
  throw "VS Code failed to install the VSIX with exit code $LASTEXITCODE."
}

Write-Host "Built and installed $vsixPath"
