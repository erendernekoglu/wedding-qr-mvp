@echo off
echo ========================================
echo    DUGUN FOTOGRAF ALBUMU - KURULUM
echo ========================================
echo.

echo [1/3] Bağımlılıklar yükleniyor...
call npm install
if %errorlevel% neq 0 (
    echo HATA: npm install başarısız!
    pause
    exit /b 1
)

echo.
echo [2/3] Environment dosyası oluşturuluyor...
if not exist .env (
    copy env.example .env
    echo .env dosyası oluşturuldu!
) else (
    echo .env dosyası zaten mevcut.
)

echo DATABASE_URL kontrol ediliyor...
findstr /C:"file:./dev.db" .env >nul
if %errorlevel% neq 0 (
    echo DATABASE_URL düzeltiliyor...
    echo DATABASE_URL="file:./dev.db" > .env.temp
    echo. >> .env.temp
    echo # Google Drive API >> .env.temp
    echo GOOGLE_CLIENT_ID="your_google_client_id" >> .env.temp
    echo GOOGLE_CLIENT_SECRET="your_google_client_secret" >> .env.temp
    echo GOOGLE_REFRESH_TOKEN="your_google_refresh_token" >> .env.temp
    echo DRIVE_ROOT_FOLDER_ID="your_drive_root_folder_id" >> .env.temp
    echo. >> .env.temp
    echo # App >> .env.temp
    echo NEXT_PUBLIC_BASE_URL="http://localhost:3000" >> .env.temp
    move .env.temp .env
    echo .env dosyası düzeltildi!
)

echo.
echo [3/3] Veritabanı kuruluyor...
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
echo ========================================
echo    KURULUM TAMAMLANDI!
echo ========================================
echo.
echo SONRAKI ADIMLAR:
echo 1. .env dosyasını düzenleyin
echo 2. Google Drive API bilgilerini girin
echo 3. start.bat dosyasını çalıştırın
echo.
echo Google Drive API kurulumu için:
echo 1. https://console.cloud.google.com/ adresine gidin
echo 2. Yeni proje oluşturun
echo 3. Google Drive API'yi etkinleştirin
echo 4. OAuth 2.0 kimlik bilgileri oluşturun
echo 5. Refresh token alın
echo.
pause
