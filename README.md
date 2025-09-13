# Düğün Fotoğraf Albümü 🎉

Düğün misafirlerinin fotoğraflarını kolayca paylaşmasını sağlayan modern bir web uygulaması. QR kod ile hızlı erişim, Google Drive entegrasyonu ve admin paneli ile tam özellikli bir çözüm.

## ✨ Özellikler

- **QR Kod ile Kolay Erişim**: Misafirler QR kodu okutarak anında fotoğraf yükleyebilir
- **Google Drive Entegrasyonu**: Tüm fotoğraflar güvenli şekilde Google Drive'da saklanır
- **Admin Paneli**: Yüklenen fotoğrafları görüntüleme ve yönetme
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu modern arayüz
- **Gerçek Zamanlı Progress**: Dosya yükleme durumunu canlı takip
- **Çoklu Dosya Desteği**: Birden fazla fotoğraf/video aynı anda yükleme

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+ 
- Google Drive API erişimi
- SQLite veritabanı (Prisma ile)

### Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd wedding-qr
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp env.example .env
```

`.env` dosyasını düzenleyerek gerekli değerleri girin:

```env
# Database
DATABASE_URL="file:./dev.db"

# Google Drive API
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REFRESH_TOKEN="your_google_refresh_token"
DRIVE_ROOT_FOLDER_ID="your_drive_root_folder_id"

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. **Veritabanını hazırlayın**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacak.

## 📱 Kullanım

### Album Oluşturma
1. Ana sayfada album kodu girin veya "Hızlı Oluştur" butonuna tıklayın
2. QR kodu indirin veya URL'yi kopyalayın
3. QR kodu misafirlerinizle paylaşın

### Fotoğraf Yükleme (Misafirler)
1. QR kodu okutun veya URL'ye gidin
2. "Foto/Video Seç" butonuna tıklayın
3. Dosyalarınızı seçin ve yüklemeyi bekleyin

### Admin Paneli
1. Ana sayfada "Admin Paneli" butonuna tıklayın
2. Yüklenen tüm fotoğrafları görüntüleyin
3. Dosyaları indirin veya Google Drive'da görüntüleyin

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite + Prisma ORM
- **File Storage**: Google Drive API
- **QR Codes**: qrcode.react
- **Icons**: Lucide React

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── albums/        # Album yönetimi
│   │   ├── u/[code]/      # Upload endpoints
│   │   └── admin/         # Admin paneli
│   ├── admin/[code]/      # Admin sayfası
│   ├── u/[code]/          # Misafir upload sayfası
│   └── page.tsx           # Ana sayfa
├── components/            # React bileşenleri
│   ├── ui/               # UI bileşenleri
│   └── UploadDropzone.tsx # Dosya yükleme
└── lib/                  # Yardımcı fonksiyonlar
    ├── prisma.ts         # Database client
    ├── drive.ts          # Google Drive API
    └── google.ts         # OAuth işlemleri
```

## 🔧 API Endpoints

- `POST /api/albums/create` - Yeni album oluşturma
- `POST /api/u/[code]/sign` - Upload URL alma
- `POST /api/u/[code]/complete` - Upload tamamlama
- `GET /api/admin/[code]` - Admin verileri
- `GET /api/files/[fileId]/download` - Dosya indirme

## 🚀 Deployment

### Vercel (Önerilen)
1. Projeyi GitHub'a push edin
2. Vercel'e bağlayın
3. Environment variables'ları ayarlayın
4. Deploy edin

### Diğer Platformlar
- Railway
- Render
- DigitalOcean App Platform

## 📝 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

**Not**: Bu uygulama düğün ve özel etkinlikler için tasarlanmıştır. Ticari kullanım için lisans kontrolü yapın.