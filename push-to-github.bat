@echo off
cd /d "C:\rae website"
set "PATH=C:\Users\user\mingit\cmd;%PATH%"
echo ====================================================
echo  Rise Altitude Enterprises - GitHub Deployment
echo  Target: https://github.com/AslamCoder/rise-altitude-website.git
echo  Branch: main
echo ====================================================
echo.
echo Pushing repository to GitHub...
echo If prompted for password, use your GitHub Personal Access Token (PAT).
echo (Create one with 'repo' scope at: https://github.com/settings/tokens)
echo.
git push -u origin main
echo.
echo ====================================================
pause
