# Premium Özellikler ve Abonelik Sistemi

Bu dokümantasyon, Diet Tracker uygulamasının premium abonelik sistemi ve özellikleri hakkında geliştiriciler için teknik ayrıntıları içerir.

## Abonelik Seviyeleri

Uygulama şu abonelik seviyelerini destekler:

1. **Ücretsiz (free):** Temel özellikler, lokal veri depolama
2. **Temel (basic):** Reklamsız deneyim, ücretsiz özelliklere ek olarak
3. **Premium:** Bulut veri senkronizasyonu, cihazlar arası erişim, tüm özellikler

## Teknik Implementasyon

### Abonelik Durumunun Yönetimi

Abonelik durumu `src/store/subscriptionStore.ts` dosyasında Zustand state yönetimi ile kontrol edilir.

Kritik fonksiyonlar:
- `loadUserSubscription`: Firestore'dan veya yerel depolamadan kullanıcının abonelik durumunu yükler
- `updateSubscriptionInFirestore`: Kullanıcının aboneliğini Firestore'da günceller veya oluşturur
- `activateSubscribedPlan`: Ödeme sonrası aboneliği etkinleştirir

### Önemli Güncelleme (23/07/2024)

**Hata Düzeltmesi:** Premium abonelik sürecinde şu hata düzeltilmiştir:

```
Error updating subscription in Firestore for user W30iixBrJVfxL0nIHlSxRorAXzE2: [Error: [firestore/not-found] Some requested document was not found.]
```

Bu hata, kullanıcının Firestore'da henüz bir dokümanı yokken `updateDoc` kullanılmaya çalışılmasından kaynaklanıyordu. Çözüm olarak `updateSubscriptionInFirestore` methodu düzeltildi:

1. Önce doküman varlığını kontrol eder
2. Varsa `updateDoc` ile günceller
3. Yoksa `setDoc` ile yeni doküman oluşturur

## Veri Yapısı

### Firestore Şeması

```
/users/{userId}
  - uid: String
  - email: String
  - displayName: String
  - photoURL: String | null
  - createdAt: Timestamp
  - activePlanId: 'free' | 'basic' | 'premium'
  - subscriptionEndDate: Timestamp | null
  - userSettings: Map
    - calorieGoal: Number
    - nutrientGoals: Map (protein, carbs, fat)
    - updatedAt: Timestamp
```

### Premium Kullanıcılar İçin Alt Koleksiyonlar

```
/users/{userId}/meals/{mealId}
  - ...meal bilgileri

/users/{userId}/activities/{activityId}
  - ...aktivite bilgileri
```

## Abonelik Süreci

1. Kullanıcı PricingScreen'den bir plan seçer
2. PaymentScreen'de ödeme bilgileri alınır
3. Başarılı ödemeden sonra:
   - `activateSubscribedPlan` çağrılır
   - Bu `updateSubscriptionInFirestore` kullanarak veritabanını günceller
   - Abonelik bilgileri yerel olarak da depolanır

## Sorun Giderme

Yaygın hatalar ve çözümleri:

### "Document Not Found" Hatası

**Sebep:** Kullanıcı Firestore'da henüz kayıtlı değilken bir dokümanı güncellemeye çalışılması.

**Çözüm:** Doküman yoksa önce oluştur, varsa güncelle yaklaşımı.

### Abonelik Bilgilerinin Senkronizasyonu Sorunları

Kullanıcı giriş/çıkış yaptığında veya farklı cihazlarda abonelik durumu doğru görünmüyorsa:

1. AsyncStorage'daki abonelik bilgilerini temizleyin
2. `useSubscriptionStore.getState().loadUserSubscription()` ile tekrar yükleyin
3. Firestore veri tutarlılığını kontrol edin

## Premium Özelliklerin Test Edilmesi

Geliştirme sürecinde premium özellikleri test etmek için:

1. `PaymentScreen.tsx` dosyasında:
   ```javascript
   const isSuccess = true; // Force success scenario
   ```

2. Yeni bir kullanıcı oluşturun ve ödeme sürecini tamamlayın
3. Firestore'da kullanıcı dokümanının doğru oluşturulduğunu kontrol edin 