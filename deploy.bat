@echo off
echo Building for production...
call npm run build

echo.
echo Build completed! Ready for deployment.
echo.
echo Next steps:
echo 1. Push to GitHub repository
echo 2. Connect to Vercel/Railway
echo 3. Set environment variables
echo 4. Deploy!
echo.
pause
