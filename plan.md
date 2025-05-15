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

## 12. Abonelik ve Kullanıcı Yönetimi - UI ve Navigasyon Odaklı (Hafta 12-13)

### 12.1 UI Bileşenleri ve Ekranları
- [ ] Oturum Açma ve Kayıt Ekranları Geliştirmeleri
  - [ ] `LoginScreen` UI iyileştirmeleri
  - [ ] `RegisterScreen` UI iyileştirmeleri
  - [ ] `ForgotPasswordScreen` UI iyileştirmeleri
  - [ ] Sosyal medya giriş butonları (Google, Apple) UI
- [ ] Abonelik Ekranları
  - [ ] `PricingScreen` UI geliştirmesi
    - [ ] Fiyat tablosu/karşılaştırma kartları
    - [ ] Abonelik paketleri arasında geçiş efektleri
    - [ ] Öne çıkan paket vurgusu
- [ ] Kullanıcı Profil Ekranı Geliştirmeleri
  - [ ] `ProfileScreen` UI iyileştirmeleri
  - [ ] Avatar ve profil fotoğrafı seçimi
  - [ ] Kullanıcı bilgileri form tasarımı
  - [x] Abonelik durumu rozeti/göstergesi

### 12.2 Navigasyon Yapısı
- [ ] Kimlik Doğrulama Navigasyonu
  - [ ] `AuthNavigator` güncellemeleri
  - [ ] Oturumsuz durumda gezinme kısıtlamaları
- [ ] Abonelik Akışı Navigasyonu
  - [ ] Abonelik ekranlarının ana navigasyon yapısına entegrasyonu
  - [ ] Kısıtlı özelliklere erişim kontrolü için navigasyon koruyucuları
- [ ] Uygulama İçi Satın Alma Akışı Navigasyonu
  - [ ] Satın alma akışı için navigasyon yapısı
  - [ ] Başarılı/başarısız ödeme sonrası yönlendirmeler

### 12.3 Premium Özellik UI Göstergeleri
- [ ] Kilitlenen Özellikler UI Tasarımı
  - [ ] Premium özellik kilit ikonları/göstergeleri
  - [ ] Premium içerik teaser UI bileşenleri
  - [ ] "Premium'a Yükselt" çağrı butonları (Call-to-action)
- [ ] Ücretli/Ücretsiz İçerik Ayrımı
  - [ ] Tema ve stil farklılaştırması
  - [x] Premium kullanıcı rozeti/göstergesi

### 12.4 Reklam Yerleşimleri (Ücretsiz Tier)
- [ ] Reklam Alanları UI Tasarımı
  - [ ] Banner reklam konumları (ekranlar arası geçişte)
  - [ ] Ekran içi reklam alanları
  - [ ] Reklamı kaldırmak için premium abonelik promosyonu

### 12.5 Test ve Geliştirme
- [ ] UI/UX Test Yaklaşımı
  - [ ] Tasarım tutarlılığı değerlendirmesi
  - [ ] Düğmelerin ve etkileşimlerin erişilebilirlik kontrolü
  - [ ] Farklı cihaz boyutlarında duyarlı tasarım testleri

## Sonraki Geliştirme Aşamaları (Hafta 14+)

### Firebase ve Backend Entegrasyonu
- [ ] Firebase projesinin oluşturulması ve yapılandırılması
- [ ] Authentication, Firestore ve diğer Firebase hizmetlerinin kurulumu
- [ ] Kullanıcı kimlik doğrulama işlevselliğinin uygulanması

### Abonelik Sistemi İşlevselliği
- [ ] RevenueCat veya alternatif ödeme sistemi entegrasyonu
- [ ] Abonelik işleme mantığı
- [ ] Ödeme doğrulama ve abonelik durumu yönetimi

### Veri Senkronizasyon Sistemi
- [ ] Bulut senkronizasyon işlevselliği
- [ ] Çevrimdışı destek
- [ ] Veri yedekleme ve geri yükleme özellikleri
