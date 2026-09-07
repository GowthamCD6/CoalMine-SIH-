param(
    [string]$source = "light-smoke.mp4"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  COAL MINE AI SMOKE & BREATHABILITY MONITOR SYSTEM" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan

$PythonExe = Join-Path $ScriptDir ".venv\Scripts\python.exe"

if (Test-Path $PythonExe) {
    & $PythonExe (Join-Path $ScriptDir "main.py") --source $source
} else {
    python (Join-Path $ScriptDir "main.py") --source $source
}
