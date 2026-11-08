@echo off
chcp 65001 >nul
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Не найден Python. Установи его с python.org или запусти любой другой локальный сервер в этой папке.
  pause
  exit /b 1
)
echo Бастау запущен: http://127.0.0.1:8830  (закрой это окно, чтобы остановить)
start "" "http://127.0.0.1:8830/"
python -m http.server 8830 --bind 127.0.0.1
