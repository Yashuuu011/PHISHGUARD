@echo off
title PhishGuard Public Deployer
echo 🛡 Starting PhishGuard Dev Server and Tunneling Publicly...

:: Make sure any existing processes on port 5173 are stopped
echo [1/3] Checking and cleaning up port 5173...
powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue"

echo [2/3] Starting Vite Dev Server...
start /B npm run dev

echo [3/3] Initiating Localtunnel to generate a public URL...
echo Press Ctrl+C to terminate both server and tunnel.
echo.

:tunnel_loop
:: Runs localtunnel on port 5173
npx localtunnel --port 5173
echo.
echo [!] Tunnel connection closed. Re-initiating in 5 seconds...
timeout /t 5 /nobreak > nul
goto tunnel_loop
