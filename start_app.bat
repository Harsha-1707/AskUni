@echo off
echo Starting AskUni with Docker...
docker-compose up -d
echo.
echo Application started!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
pause
