@echo off
echo ========================================
echo    DUGUN FOTOGRAF ALBUMU - MVP
echo ========================================
echo.

echo [1/4] Bağımlılıklar kontrol ediliyor...
call npm install
if %errorlevel% neq 0 (
    echo HATA: npm install başarısız!
    pause
    exit /b 1
)

echo.
echo [2/4] Environment dosyası kontrol ediliyor...
if not exist .env (
    echo .env dosyası bulunamadı! env.example'dan kopyalanıyor...
    copy env.example .env
    echo.
    echo UYARI: .env dosyasını düzenleyerek Google Drive API bilgilerini girin!
    echo.
    pause
)

echo.
echo [3/4] Veritabanı hazırlanıyor...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo HATA: Veritabanı migration başarısız!
    pause
    exit /b 1
)

call npx prisma generate
if %errorlevel% neq 0 (
    echo HATA: Prisma generate başarısız!
    pause
    exit /b 1
)

echo.
echo [4/4] Geliştirme sunucusu başlatılıyor...
echo.
echo ========================================
echo    SERVER BAŞLATILIYOR...
echo    http://localhost:3000
echo ========================================
echo.
echo Sunucuyu durdurmak için Ctrl+C tuşlayın
echo.

call npm run dev
