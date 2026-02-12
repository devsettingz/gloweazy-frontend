@echo off
echo Fixing Windows permissions for Expo...
echo.

:: Fix permissions on tsconfig.json
if exist tsconfig.json (
    echo Granting full permissions to tsconfig.json...
    icacls tsconfig.json /grant %username%:F /T
    echo ✓ tsconfig.json permissions fixed
) else (
    echo tsconfig.json not found, skipping...
)

:: Fix permissions on package.json
if exist package.json (
    echo Granting full permissions to package.json...
    icacls package.json /grant %username%:F /T
    echo ✓ package.json permissions fixed
) else (
    echo package.json not found, skipping...
)

:: Fix permissions on app.json
if exist app.json (
    echo Granting full permissions to app.json...
    icacls app.json /grant %username%:F /T
    echo ✓ app.json permissions fixed
) else (
    echo app.json not found, skipping...
)

echo.
echo Done! You can now run 'npm start'
pause
