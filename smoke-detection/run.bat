@echo off
cd /d "%~dp0"
echo =========================================================
echo   COAL MINE AI SMOKE AND BREATHABILITY MONITOR SYSTEM
echo =========================================================
if exist .venv\Scripts\python.exe (
    .\.venv\Scripts\python.exe main.py %*
) else (
    python main.py %*
)
