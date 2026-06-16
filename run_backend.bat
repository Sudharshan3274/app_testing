@echo off
cd /d "%~dp0\backend"
c:/Users/reddy/OneDrive/Desktop/app/.venv/Scripts/python.exe -m uvicorn main:app --reload --port 8000
pause
