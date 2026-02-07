@echo off
echo ========================================
echo OnTrip - Git Repository Setup
echo ========================================
echo.

REM Initialize Git
echo [1/5] Initializing Git repository...
git init
echo.

REM Add all files
echo [2/5] Adding files to Git...
git add .
echo.

REM Create initial commit
echo [3/5] Creating initial commit...
git commit -m "Initial commit: OnTrip tour comparison platform

- Complete backend API (Node.js/Express/TypeScript)
- Complete frontend (Next.js/React/TailwindCSS)
- Python workers for data ingestion
- PostgreSQL schema (20+ tables)
- Docker configuration
- Comprehensive documentation
- Local network setup for development"
echo.

REM Prompt for GitHub repository URL
echo [4/5] Enter your GitHub repository URL
echo Example: https://github.com/username/ontrip.git
echo.
set /p REPO_URL="Repository URL: "

REM Add remote and push
echo.
echo [5/5] Pushing to GitHub...
git branch -M main
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ========================================
echo Git Setup Complete!
echo ========================================
echo.
echo Repository: %REPO_URL%
echo Branch: main
echo.
echo Next steps:
echo 1. Visit your GitHub repository
echo 2. Add a description and topics
echo 3. Enable GitHub Actions (optional)
echo.
pause
