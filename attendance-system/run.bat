@echo off
title Coal Mine ML Facial Attendance System
echo ============================================================
echo   Coal Mine ML Facial Recognition Attendance System
echo ============================================================
echo.

if exist "..\smoke-detection\venv\Scripts\python.exe" (
    echo [INFO] Using virtual environment python...
    ..\smoke-detection\venv\Scripts\python.exe app.py
) else if exist "venv\Scripts\python.exe" (
    echo [INFO] Using local virtual environment python...
    venv\Scripts\python.exe app.py
) else (
    echo [INFO] Using system python...
    python app.py
)

pause
