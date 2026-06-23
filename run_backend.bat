@echo off
cd /d "%~dp0\backend"
c:/Users/reddy/OneDrive/Desktop/app/.venv/Scripts/python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
