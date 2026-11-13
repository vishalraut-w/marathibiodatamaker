$ErrorActionPreference = 'Stop'
$projectPath = $PSScriptRoot
$localUrl = 'http://127.0.0.1:4173'
try {
    $response = Invoke-WebRequest -Uri "$localUrl/api/config" -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Start-Process $localUrl
        exit
    }
} catch {}
$nodePath = (Get-Command node -ErrorAction Stop).Source
if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'node_modules/playwright-core'))) {
    throw 'Please run npm install in this project folder first.'
}
$logDirectory = Join-Path $projectPath '.data'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
$serverPath = Join-Path $projectPath 'server/index.cjs'
Start-Process -FilePath $nodePath -ArgumentList @(('"' + $serverPath + '"')) -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'server.log') -RedirectStandardError (Join-Path $logDirectory 'server-error.log')
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 300
    try {
        $response = Invoke-WebRequest -Uri "$localUrl/api/config" -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Start-Process $localUrl
            exit
        }
    } catch {}
}
throw 'The website did not start. Please check .data/server-error.log.'

