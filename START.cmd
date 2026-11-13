@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -File "%~dp0Start-Website.ps1"
if errorlevel 1 pause

