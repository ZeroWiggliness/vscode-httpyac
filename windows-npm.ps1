param(
    [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
    [string[]] $NpmArguments
)

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is required to run npm commands with this script."
}

$repositoryPath = $PSScriptRoot
$containerCommand = 'npm "$@"'

& docker run --rm `
    --volume "$($repositoryPath):/workspace" `
    --volume /workspace/node_modules `
    --workdir /workspace `
    node:24 `
    bash -c $containerCommand -- @NpmArguments

exit $LASTEXITCODE
