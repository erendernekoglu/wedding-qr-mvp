@echo off
echo ========================================
echo    DUGUN FOTOGRAF ALBUMU - KURULUM
echo ========================================
echo.

echo [1/2] Bağımlılıklar yükleniyor...
call npm install
if %errorlevel% neq 0 (
    echo HATA: npm install başarısız!
    pause
    exit /b 1
)

echo.
echo [2/2] Environment dosyası oluşturuluyor...
if not exist .env (
    copy env.example .env
    echo .env dosyası oluşturuldu!
) else (
    echo .env dosyası zaten mevcut.
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
