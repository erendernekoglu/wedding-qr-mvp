@echo off
echo ========================================
echo    DUGUN FOTOGRAF ALBUMU - MVP
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
echo [2/3] Environment dosyası kontrol ediliyor...
if not exist .env (
    echo .env dosyası bulunamadı! env.example'dan kopyalanıyor...
    copy env.example .env
    echo.
    echo UYARI: .env dosyasını düzenleyerek Google Drive API bilgilerini girin!
    echo.
    pause
)

echo.
echo [3/3] Geliştirme sunucusu başlatılıyor...
echo.
echo ========================================
echo    SERVER BAŞLATILIYOR...
echo    http://localhost:3000
echo ========================================
echo.
echo Sunucuyu durdurmak için Ctrl+C tuşlayın
echo.

call npm run dev
