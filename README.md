# Momento - Anı Paylaşım Uygulaması

Etkinliklerinizin anılarını kolayca paylaşın. Düğün, şirket etkinliği, arkadaş buluşması - her türlü etkinlik için tasarlanmış profesyonel fotoğraf paylaşım platformu.

## 🎯 Özellikler

- **QR Kod ile Anında Erişim** - Uygulama indirmeden, kayıt olmadan fotoğraf paylaşımı
- **Google Drive Entegrasyonu** - Güvenli ve organize dosya saklama
- **Gerçek Zamanlı Admin Paneli** - Yüklenen fotoğrafları canlı takip
- **Mobil Optimize** - Tüm cihazlarda mükemmel deneyim
- **Çoklu Dosya Desteği** - Toplu fotoğraf/video yükleme
- **Özel Etkinlik Kodları** - Her etkinlik için benzersiz erişim

## 🏢 İş Modeli

### Temel Plan - Ücretsiz
- 1 etkinlik
- 50 fotoğraf limiti
- Temel QR kod

### Premium Plan - ₺299/ay
- Sınırsız etkinlik
- Sınırsız fotoğraf
- Özel branding
- Gelişmiş analytics
- Öncelikli destek

### Kurumsal Plan - Özel Fiyat
- Beyaz etiket çözüm
- API erişimi
- Özel entegrasyonlar
- 7/24 destek

## 🚀 Teknoloji

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Google Drive API
- **Deployment**: Vercel
- **Database**: Redis/KV (Upstash)

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Redis hesabı (Upstash)
- Google Drive API anahtarı

### Adımlar
1. Projeyi klonlayın
2. `npm install` ile bağımlılıkları yükleyin
3. `.env.local` dosyasını oluşturun ve gerekli değişkenleri ekleyin
4. `npm run dev` ile geliştirme sunucusunu başlatın

### Admin Kullanıcısı Oluşturma
```bash
# API ile admin kullanıcısı oluşturma
curl -X POST https://momentobeta.vercel.app/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@momento.com","password":"admin123","name":"Admin User"}'
```

Bu komut admin@momento.com kullanıcısını oluşturur:
- **E-posta**: admin@momento.com
- **Şifre**: ---
- **Yetki**: Admin

## 📈 Roadmap

### Q1 2025
- [ ] Kullanıcı hesap sistemi
- [ ] Ödeme entegrasyonu
- [ ] Email bildirimleri
- [ ] Fotoğraf galerisi

### Q2 2025
- [ ] Mobil uygulama
- [ ] Video streaming
- [ ] Sosyal medya entegrasyonu
- [ ] Gelişmiş analytics

### Q3 2025
- [ ] AI fotoğraf düzenleme
- [ ] Otomatik etkinlik oluşturma
- [ ] API marketplace
- [ ] Çoklu dil desteği

## 📞 İletişim

- **Website**: --
- **Email**: --
- **Telefon**: --

## 📄 Lisans

Tüm hakları saklıdır. © 2025 Momento. Ticari kullanım yasaktır.

---

**Momento** - Etkinlik anılarınızı dijitalleştirin.
