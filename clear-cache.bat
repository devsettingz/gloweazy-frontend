@echo off
echo Clearing Expo and Metro cache...
echo.

:: Kill any running node processes
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul

:: Clear watchman (if installed)
echo Clearing watchman...
watchman watch-del-all 2>nul

:: Clear metro cache
echo Clearing Metro cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo ✅ Cache cleared!
echo.
echo Now run: npm start
echo Then press 'w' for web or scan QR code for mobile
pause
