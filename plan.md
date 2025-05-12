# Kalori Takip Uygulaması Revize Kodlama Planı

## 1. Test Altyapısı ve Temel Kurulum (Hafta 1)

### 1.1 [x] Test Altyapısı Kurulumu
- [x] Jest ve React Native Testing Library kurulumu
- [x] Jest konfigürasyonu

### 1.2 [x] Temel Proje Yapılandırması

### 1.3 Temel Navigasyon
- [x] Test öncesi hazırlık
- [x] Temel navigasyon paketlerinin kurulumu
- [x] AppNavigator.tsx oluşturma
- Test doğrulaması

### 1.4 Depolama Stratejisi (Revize)
- **Tüm Tier'lar:**
  - Kullanıcı kimlik bilgileri Firebase Authentication ile merkezi olarak saklanır.
  - Kullanıcı profil bilgileri ve abonelik durumu Firestore'da saklanır.

- **Tier 1 (Ücretsiz / Reklamlı):**
  - Verilerin cihazda yerel olarak saklanması (Zustand persist middleware ile AsyncStorage).
  - Reklam gösterimi aktif.
  - Temel diyet takip özellikleri.

- **Tier 2 (Premium Basic):**
  - Yerel depolama devam eder.
  - Reklamlar kaldırılır.
  - Ek özellikler: Detaylı besin analizi, gelişmiş grafikler, yemek önerileri.

- **Tier 3 (Premium Pro):**
  - Cloud Storage ile cihazlar arası senkronizasyon.
  - Reklamlar kaldırılır.
  - Tüm premium özellikler + yedekleme ve geri yükleme.
  - Gelişmiş AI yemek tanıma limitleri.

### 1.5 [x] Klasör Yapısı
```
src/
├── api/              # API entegrasyonları
│   └── client.ts     # Axios yapılandırması
├── components/       # Ortak kullanılan bileşenler
├── screens/          # Uygulama ekranları
├── navigation/       # Navigasyon yapılandırması
│   ├── AppNavigator.tsx
│   └── AuthNavigator.tsx
├── hooks/            # Özel hook'lar
├── utils/            # Yardımcı fonksiyonlar
├── types/            # TypeScript tip tanımlamaları
├── context/          # Context API ile durum yönetimi
├── services/         # Servis sağlayıcılar (Firebase, veri senkronizasyon, vb.)
└── constants/        # Sabitler ve tema
__tests__/            # Test dosyaları (src yapısını yansıtır)
```

### 1.6 [x] Durum Yönetimi
- [x] Zustand kurulumu
- [x] foodStore.ts oluşturma
- [x] themeStore.ts oluşturma
- [x] apiKeyStore.ts oluşturma
- [x] calorieGoalStore.ts oluşturma
- [x] subscriptionStore.ts oluşturma
- [ ] userStore.ts oluşturma (Firebase Auth entegrasyonu ile)

### 1.7 Kimlik Doğrulama (Authentication) (Revize) (Hafta 1-2)
- [x] Firebase Authentication entegrasyonu
- [x] Login Ekranı (`LoginScreen`) UI, Firebase Auth entegrasyonu
- [x] Register Ekranı (`RegisterScreen`) UI, Firebase Auth ile kullanıcı oluşturma
- [x] Auth Durumuna Göre Navigasyon Mantığı (Giriş kontrolü ve yönlendirme)
- [x] Şifre Sıfırlama Akışı
- [ ] Sosyal medya ile giriş seçenekleri (Google, Apple) (Opsiyonel)
- [ ] Kimlik Doğrulama Testleri (Birim ve Entegrasyon Testleri)

## 2. UI Bileşenleri ve Veri Gösterimi (Hafta 2)

### 2.1 UI Bileşenlerinin Testleri
- Button bileşeni testleri
- Input bileşeni testleri
- Card bileşeni testleri
- FoodItem bileşeni testleri

### 2.2 [x] UI Kütüphanesi Entegrasyonu
- [x] React Native Paper kurulumu
- [x] UI bileşenlerinin oluşturulması
  - [x] Button.tsx
  - [x] Card.tsx
  - [x] Input.tsx
  - [x] MacrosCard.tsx
  - [x] CaloriesCard.tsx
  - [x] FoodEntryBar.tsx
  - [x] NutritionChart.tsx
  - [x] WeeklyCalendar.tsx

### 2.3 Tab Navigasyonu Testi
- Tab ekranlarının test edilmesi
- Tab geçişlerinin test edilmesi

### 2.4 [x] Tab Navigasyonu Uygulaması
- [x] Tab navigasyon paketlerinin kurulumu
- [x] Tab navigasyonunun oluşturulması

## 3. Form İşlemleri ve Doğrulama (Hafta 3)

### 3.1 Form Doğrulama Testleri
- Zorunlu alanların kontrolü
- E-posta formatı kontrolü
- Şifre uzunluğu kontrolü

### 3.2 [x] Form Yönetimi Uygulaması
- [x] Form yönetimi paketlerinin kurulumu (react-hook-form)
- [x] Form doğrulama mantığının implementasyonu (zod)

## 4. Yemek İşlemleri (Hafta 4)

### 4.1 Yemek Ekleme Testi
- Yemek ekleme formunun test edilmesi
- Store entegrasyonunun test edilmesi (`FoodEntryScreen` odaklı)

### 4.2 Yemek Listesini Görüntüleme Testi
- Yemek listesinin görüntülenmesi (`DailySummaryScreen` ve/veya `HomeScreen` üzerinde)
- Günlük özet bilgilerinin gösterilmesi (`DailySummaryScreen` ve/veya `HomeScreen` üzerinde)

### 4.3 [x] Kodlama ve Uygulama
- [x] Yemek işlemleri ekranlarının kodlanması
  - [x] `FoodEntryScreen`: Form yönetimi, kamera/galeri entegrasyonu (opsiyonel), store'a kayıt.
  - [x] `DailySummaryScreen`: Günlük yemeklerin ve besin değerlerinin listelenmesi.

## 5. Grafikler ve İstatistikler (Hafta 5)

### 5.1 Grafik Bileşenleri Testi
- `StatsScreen`: Besin değerleri grafiğinin test edilmesi
- `StatsScreen`: Veri gösteriminin ve periyot seçiminin kontrolü

### 5.2 [x] Grafik Kütüphanesi Entegrasyonu
- [x] Victory Native kurulumu
- [x] Grafik bileşenlerinin oluşturulması

### 5.3 [x] İstatistik Ekranı Uygulaması (`StatsScreen`)
- [x] Haftalık/Aylık kalori ve besin değeri grafiklerinin `StatsScreen` üzerinde gösterimi.
- [x] Veri filtreleme ve periyot seçimi özelliklerinin eklenmesi.

## 6. Medya İşlemleri (Hafta 6)

### 6.1 Görüntü Seçici Testi
- Galeri erişiminin test edilmesi
- Görüntü seçiminin test edilmesi

### 6.2 [x] Görüntü İşlemleri Entegrasyonu
- [x] Görüntü işleme paketlerinin kurulumu (expo-image-picker)
- [x] Görüntü seçici bileşeninin oluşturulması

### 6.3 AI Sağlayıcı Yapılandırması
- AI sağlayıcı sabitlerinin tanımlanması
- API endpoint'lerinin yapılandırılması

### 6.4 [x] API Anahtarı Depolama (`apiKeyStore.ts`)
- [x] API anahtarı store'unun (`apiKeyStore.ts`) oluşturulması ve yönetimi
- [x] API anahtarının güvenli saklanması için stratejiler

### 6.5 Fotoğrafla Yemek Ekleme Ekranı
- Kamera arayüzünün oluşturulması
- Yemek tanıma sonuçlarının gösterilmesi

### 6.6 Fotoğrafla Yemek Ekleme Akışında API Ayarları (`ApiSettingsScreen` Entegrasyonu)
- `ApiSettingsScreen`'e yönlendirme ve API ayarlarının yemek ekleme akışına entegrasyonu
- API anahtarı eksikse veya geçersizse kullanıcıyı bilgilendirme ve yönlendirme

## 7. Fotoğraf ile Besin Değerlerini Tespit Etme (Hafta 4-5)

### 7.1 [x] Kamera ve Fotoğraf Kütüphanesi Entegrasyonu
- [x] Kamera ve fotoğraf kütüphanelerinin kurulumu
- [x] İzin yönetimi ve testleri

### 7.2 Yemek Tanıma AI API Entegrasyonu
- API bağlantı testleri
- Yemek tanıma servisinin oluşturulması

### 7.3 AI Sağlayıcı Yapılandırması
- AI sağlayıcı sabitlerinin tanımlanması
- API endpoint'lerinin yapılandırılması

### 7.4 [x] API Anahtarı Yönetimi
- [x] API anahtarı store'unun oluşturulması
- [x] API anahtarı yönetim ekranının tasarlanması

### 7.5 Fotoğrafla Yemek Ekleme Ekranı
- Kamera arayüzünün oluşturulması
- Yemek tanıma sonuçlarının gösterilmesi

### 7.6 [x] API Anahtarları Ayarları Ekranı
- [x] API sağlayıcı seçim arayüzü
- [x] API anahtarı giriş ve yönetimi

## 8. Kullanıcı Deneyimini İyileştirme (Hafta 9)

### 8.1 [x] Kamera Deneyimi Geliştirmeleri
- [x] Fotoğraf ön izleme
- [x] Galeri entegrasyonu
- [x] Yakınlaştırma ve odaklama
- [x] Flash kontrolü

### 8.2 AI İşleme ve Düzenleme
- Sonuç düzenleme arayüzü
- Çoklu yemek tespiti
- Porsiyon boyutu yönetimi
- Besin değerleri geçmişi

## 9. Kullanıcı Profili ve Ayarlar (Hafta 7-8)

### 9.1 [x] Kullanıcı Profili Yönetimi (`ProfileScreen`)
- [x] `ProfileScreen` UI tasarımı ve geliştirmesi.
- [x] Kullanıcı adı, e-posta gibi profil bilgilerini görüntüleme ve düzenleme.
- [x] (Opsiyonel) Profil fotoğrafı seçimi (`react-native-image-picker` vb.) ve güncellenmesi.
- [x] İlgili store (örn: `userStore`) entegrasyonu.

### 9.2 [x] Uygulama Genel Ayarları
- [x] `ThemeSettingsScreen`: Tema (açık/koyu mod) seçimi ve uygulanması (`themeStore.ts` entegrasyonu).
- (Gelecek Özellik) Uygulama dili seçimi ve yerelleştirme altyapısı.

### 9.3 [x] Beslenme ve Hedef Ayarları
- [x] `CalorieGoalScreen`: Günlük kalori, protein, karbonhidrat, yağ hedefi belirleme ve güncelleme (`calorieGoalStore.ts` entegrasyonu).
- [x] Hedeflerin `HomeScreen` ve `DailySummaryScreen` gibi ekranlarda gösterilmesi.

### 9.4 [x] Abonelik ve API Ayarları
- [x] `PricingScreen`: Ücretsiz ve ücretli abonelik planlarını, özelliklerini ve fiyatlarını gösterme.
  - [ ] Ödeme sistemi entegrasyonu (`RevenueCat` vb.).
- [x] `ApiSettingsScreen` (UI ve İşlevsellik):
  - [x] Desteklenen yemek tanıma API sağlayıcılarının listelenmesi ve seçimi.
  - [x] Seçilen sağlayıcı için API anahtarı giriş, güncelleme ve silme (`apiKeyStore.ts` entegrasyonu).
  - [x] API anahtarının geçerliliğini doğrulama mekanizması.

## 10. Hata Ayıklama ve Test Kapsamı (Hafta 10)

### 10.1 [x] Hata Yakalama ve İşleme
- [x] API hata yönetimi
- [x] Genel hata yakalama
- [x] Hata loglama

## 11. Takvim ve Hedef Takip Sistemi (Hafta 11-12)

### 11.1 [x] Takvim Görünümü
- [x] Takvim store'unun oluşturulması
- [x] Takvim bileşeninin tasarlanması
- [x] Günlük hedef durumu gösterimi

### 11.2 [x] Hedef İlerleme Göstergeleri
- [x] İlerleme çubuklarının tasarlanması
- [x] Besin değeri göstergeleri
- [x] Hedef tamamlama durumu

### 11.3 [x] Günlük Hedef Tamamlama Göstergesi
- [x] Hedef durumu göstergesi
- [x] Kalan/fazla kalori gösterimi
- [x] Görsel geri bildirim

## 12. Abonelik ve Kullanıcı Yönetimi (Hafta 12-14)

### 12.1 Firebase Entegrasyonu
- [ ] Firebase projesinin oluşturulması ve yapılandırılması
- [ ] Firebase SDK'nın kurulması ve inicialize edilmesi
- [ ] Firestore ve Firebase Auth bağlantılarının kurulması
- [ ] Firebase Yapılandırma Dosyalarının Oluşturulması
  - [ ] `firebaseConfig.ts` (yapılandırma bilgileri)
  - [ ] `firebaseService.ts` (genel Firebase servisleri)

### 12.2 Kullanıcı Kimlik Doğrulama Sistemi
- [ ] `authService.ts` Oluşturulması
  - [ ] Kayıt fonksiyonu (e-posta/şifre)
  - [ ] Giriş fonksiyonu
  - [ ] Şifre sıfırlama
  - [ ] Sosyal medya ile giriş (İleride)
- [ ] `userStore.ts` Güncellenmesi
  - [ ] Firebase Auth durumunun yönetimi
  - [ ] Kullanıcı oturum bilgilerinin tutulması
  - [ ] Kullanıcı profil bilgilerinin Firestore ile senkronizasyonu

### 12.3 Abonelik Sistemi
- [ ] `subscriptionService.ts` Oluşturulması
  - [ ] RevenueCat entegrasyonu (veya alternatif sistem)
  - [ ] Abonelik durumu yönetimi
  - [ ] Satın alma işlemleri
  - [ ] Abonelik yenileme ve iptal yönetimi
- [ ] `subscriptionStore.ts` Güncellenmesi
  - [ ] Kullanıcı abonelik durumunun izlenmesi
  - [ ] Tier'a göre özellik bayraklarının ayarlanması
  - [ ] Abonelik durumu değişikliklerinin takibi

### 12.4 Veri Senkronizasyon Sistemi
- [ ] `syncService.ts` Oluşturulması
  - [ ] Yerel veri - bulut veri senkronizasyonu (Tier 3)
  - [ ] Çevrimdışı destek
  - [ ] Çakışma çözümleme stratejileri
- [ ] Mevcut store'ların senkronizasyon için güncellenmesi
  - [ ] `foodStore.ts` senkronizasyon desteği
  - [ ] `calorieGoalStore.ts` senkronizasyon desteği
  - [ ] Diğer gerekli store'ların güncellenmesi

### 12.5 Reklam Entegrasyonu (Tier 1)
- [ ] AdMob kurulumu ve yapılandırması
- [ ] `adService.ts` Oluşturulması
  - [ ] Banner reklamlar yönetimi
  - [ ] Interstitial reklamlar yönetimi
  - [ ] Kullanıcı deneyimini bozmayan reklam stratejileri
- [ ] Tier 2+ kullanıcılar için reklamların devre dışı bırakılması

### 12.6 Abonelik UI ve Akışları
- [ ] Geliştirilmiş `PricingScreen` Ekranı
  - [ ] Tier 1, 2 ve 3 özelliklerinin detaylı karşılaştırması
  - [ ] Satın alma düğmeleri ve işlem akışı
  - [ ] Deneme süresi teklifi
- [ ] Abonelik Yönetim Ekranı (`SubscriptionManagementScreen`)
  - [ ] Mevcut abonelik durumu
  - [ ] Yükseltme/düşürme seçenekleri
  - [ ] Faturalandırma bilgileri ve geçmişi
- [ ] İptal Akışı Yönetimi
  - [ ] Abonelik iptal akışı
  - [ ] Kullanıcı geri bildirimi toplama

### 12.7 Veri Güvenliği ve Gizlilik
- [ ] GDPR/KVKK Uyumluluğu
  - [ ] Veri işleme izinleri
  - [ ] Veri silme hakları
  - [ ] Verilerin taşınabilirliği
- [ ] Firestore Güvenlik Kuralları
  - [ ] Kullanıcılarının sadece kendi verilerine erişmesi
  - [ ] Yetkilendirme kontrolleri
- [ ] Hassas veri şifreleme stratejileri
