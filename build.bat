@echo off
echo ========================================
echo    DUGUN FOTOGRAF ALBUMU - BUILD
echo ========================================
echo.

echo [1/3] Bağımlılıklar kontrol ediliyor...
call npm install
if %errorlevel% neq 0 (
    echo HATA: npm install başarısız!
    pause
    exit /b 1
)

echo.
echo [2/3] TypeScript kontrol ediliyor...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo HATA: TypeScript hataları var!
    pause
    exit /b 1
)

echo.
echo [3/3] Production build oluşturuluyor...
call npm run build
if %errorlevel% neq 0 (
    echo HATA: Build başarısız!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    BUILD TAMAMLANDI!
echo ========================================
echo.
echo Production dosyaları .next/ klasöründe hazır.
echo Deploy için: npm run start
echo.
pause
