# Fix Windows permissions for Expo
Write-Host "Fixing Windows permissions for Expo..." -ForegroundColor Cyan
Write-Host ""

# Fix permissions on tsconfig.json
if (Test-Path "tsconfig.json") {
    Write-Host "Granting full permissions to tsconfig.json..." -NoNewline
    $path = (Get-Item "tsconfig.json").FullName
    $user = $env:USERNAME
    icacls $path /grant "$($user):F" /T | Out-Null
    Write-Host " DONE" -ForegroundColor Green
} else {
    Write-Host "tsconfig.json not found, skipping..." -ForegroundColor Yellow
}

# Fix permissions on package.json
if (Test-Path "package.json") {
    Write-Host "Granting full permissions to package.json..." -NoNewline
    $path = (Get-Item "package.json").FullName
    $user = $env:USERNAME
    icacls $path /grant "$($user):F" /T | Out-Null
    Write-Host " DONE" -ForegroundColor Green
} else {
    Write-Host "package.json not found, skipping..." -ForegroundColor Yellow
}

# Fix permissions on app.json
if (Test-Path "app.json") {
    Write-Host "Granting full permissions to app.json..." -NoNewline
    $path = (Get-Item "app.json").FullName
    $user = $env:USERNAME
    icacls $path /grant "$($user):F" /T | Out-Null
    Write-Host " DONE" -ForegroundColor Green
} else {
    Write-Host "app.json not found, skipping..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done! You can now run 'npm start'" -ForegroundColor Green
