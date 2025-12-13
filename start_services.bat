@echo off
echo ========================================
echo   Starting Scene Solver Services
echo ========================================

echo.
echo 1. Checking MongoDB (via Docker)...
echo    Attempting to start 'scen_solver_mongo' container...
docker run -d -p 27017:27017 --name scene_solver_mongo mongo:latest
:: If it already exists, start it
docker start scene_solver_mongo

echo.
echo 2. Launching AI Service (Python)...
:: Note: If you prefer Docker for AI, you can run 'docker-compose up' in Ai folder manually.
:: This script tries the local Python version first.
start "SceneSolver AI Service" cmd /k "cd Ai && python ai_service.py"

echo.
echo 3. Launching Backend (Node.js)...
start "SceneSolver Backend" cmd /k "cd Backend && npm start"

echo.
echo 4. Launching Frontend (React)...
start "SceneSolver Frontend" cmd /k "cd Frontendnew && npm start"

echo.
echo ========================================
echo   All services (AI, Backend, Frontend, Mongo) triggered!
echo   Please check the opened windows for logs.
echo ========================================
pause
