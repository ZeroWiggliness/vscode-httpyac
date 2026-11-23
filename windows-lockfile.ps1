param(
  [string]$NodeImage = 'node:24'
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path -LiteralPath $PSScriptRoot).Path
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
  $NodeImage
)

& $docker.Source @dockerArgs npm install --package-lock-only --ignore-scripts
if ($LASTEXITCODE -ne 0) {
  throw "Docker lockfile update failed with exit code $LASTEXITCODE."
}

& $docker.Source @dockerArgs npm ci --dry-run --ignore-scripts --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
  throw "Docker clean-install validation failed with exit code $LASTEXITCODE."
}
