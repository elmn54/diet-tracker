## Premium Özellikler Geliştirme TODO Listesi (Revize Edilmiş)

### 0. Hazırlık ve Kütüphane Kurulumları
- [ ] Firebase projesi oluşturuldu ve React Native uygulamasına Firebase SDK'sı entegre edildi (`@react-native-firebase/app`, `@react-native-firebase/firestore`, `@react-native-firebase/auth`).
- [ ] ID üretimi için bir kütüphane (örn: `uuid`) ekle (`yarn add uuid @types/uuid` veya `npm install uuid @types/uuid`).

### 1. Firestore Veri Yapısı Tasarımı ve Kurulumu

- [ ] **`users` Koleksiyonu Ana Dokümanları:**
    - Her kullanıcı için `/users/{userId}` dokümanı oluşturulacak.
    - Bu dokümana eklenecek alanlar:
        - `uid`: (String) Firebase Auth UID'si (doküman ID'si ile aynı olacak).
        - `email`: (String) Kullanıcının e-posta adresi.
        - `createdAt`: (Firebase Timestamp) Kullanıcı kaydının oluşturulma zamanı.
        - `activePlanId`: (String, varsayılan: `"free"`) Kullanıcının aktif planını belirtir ("free", "basic", "premium").
        - `subscriptionEndDate`: (Firebase Timestamp, isteğe bağlı) Ücretli aboneliklerin bitiş tarihi.
        - `userSettings`: (Map) Kullanıcıya özel ayarlar. İçeriği:
            - `calorieGoal`: (Number) `calorieGoalStore`'dan (`calorieGoal`).
            - `nutrientGoals`: (Map) `protein`, `carbs`, `fat` alanlarını içeren map. `calorieGoalStore`'dan (`nutrientGoals`).
            - `preferredTheme`: (String, isteğe bağlı) `themeStore`'dan (eğer tema kullanıcıya özelse ve senkronize edilecekse).
            - `updatedAt`: (Firebase Timestamp) Bu ayarların son güncellenme zamanı.

- [ ] **Kullanıcıya Özel Alt Koleksiyonlar:** Her bir `/users/{userId}` dokümanının altına:
    - **`/meals` (Alt Koleksiyon):**
        - `foodStore`'daki her bir `FoodItem` için bir doküman.
        - Doküman ID'si: Firestore tarafından otomatik üretilebilir veya lokalde üretilen `FoodItem.id` kullanılabilir.
        - Alanlar: `FoodItem` içindeki tüm alanlar (`id` dahil) + `createdAt` (Firebase Timestamp), `updatedAt` (Firebase Timestamp).
    - **`/activities` (Alt Koleksiyon):**
        - `activityStore`'daki her bir `ActivityItem` için bir doküman.
        - Doküman ID'si: Firestore tarafından otomatik üretilebilir veya lokalde üretilen `ActivityItem.id` kullanılabilir.
        - Alanlar: `ActivityItem` içindeki tüm alanlar (`id` dahil) + `createdAt` (Firebase Timestamp), `updatedAt` (Firebase Timestamp).
    - **`/userStatsSummaries` (Alt Koleksiyon):**
        - Hesaplanan ve zamanla değişebilen özet istatistikler için.
        - Örneğin, `/users/{userId}/userStatsSummaries/dailyLogSummary` gibi tek bir doküman olabilir.
        - Alanlar:
            - `streakDays`: (Number) `userStatsStore.calculateStreakDays()` sonucu.
            - `totalLogsCount`: (Number) `userStatsStore.calculateTotalLogsCount()` sonucu.
            - `lastCalculatedAt`: (Firebase Timestamp) Bu özetin en son hesaplandığı zaman.
            - `schemaVersion`: (Number, örn: 1) İleride yapıyı değiştirirseniz.

- [ ] **Test Verisi:** Firebase konsolunda manuel olarak bir test kullanıcısı için yukarıdaki yapıyı oluştur (birkaç öğün, aktivite ve ayar ile).

### 2. Lokal Veri Modellerini (Zustand Store Types) Güncelle

- [ ] **Firebase Timestamp Tipi:** Projenizde Firebase Timestamp tipini tanımlayın (örn: `import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'; type FirebaseTimestamp = FirebaseFirestoreTypes.Timestamp;`).
- [ ] **`foodStore.ts` (`FoodItem` interface):**
    - `id`: (String) Mevcut, doküman ID'si olarak kullanılacak.
    - `createdAt`: (FirebaseTimestamp | Date, isteğe bağlı) Firestore'a gönderirken `FieldValue.serverTimestamp()`. Okurken `FirebaseTimestamp`, lokalde `Date` olabilir.
    - `updatedAt`: (FirebaseTimestamp | Date, isteğe bağlı) Firestore'a gönderirken `FieldValue.serverTimestamp()`. Okurken `FirebaseTimestamp`, lokalde `Date` olabilir.
- [ ] **`activityStore.ts` (`ActivityItem` interface):**
    - `id`: (String) **EKLENMELİ!** UUID ile oluşturulabilir. Doküman ID'si olarak kullanılacak.
    - `createdAt`: (FirebaseTimestamp | Date, isteğe bağlı)
    - `updatedAt`: (FirebaseTimestamp | Date, isteğe bağlı)
- [ ] **`calorieGoalStore.ts`:**
    - Bu store'daki `calorieGoal` ve `nutrientGoals` doğrudan `users/{userId}` dokümanındaki `userSettings` map'ine yazılacak.
    - Bu store'un state'i `userSettings.updatedAt` ile senkronize edilebilir. Lokal state'de `lastSyncedAt` gibi bir alan tutulabilir.
- [ ] **`userStatsStore.ts`:**
    - Bu store'un kendisi doğrudan bir veri yapısı tutmuyor, hesaplama yapıyor.
    - Firestore'daki `/userStatsSummaries/dailyLogSummary` dokümanının yapısına uygun bir interface tanımlanabilir (senkronizasyon servisinde kullanılmak üzere).
        - `UserStatsSummary`: `{ streakDays: number; totalLogsCount: number; lastCalculatedAt: FirebaseTimestamp; }`

### 3. Abonelik Yönetimi (`subscriptionStore` ve Firestore Entegrasyonu)

- [ ] `useSubscriptionStore` (veya benzeri bir store) oluştur:
    - State: `activePlanId: string` (varsayılan: 'free'), `subscriptionEndDate: Date | null`, `isSubscriptionLoading: boolean`.
- [ ] **Abonelik Değişikliklerini Firestore'a Yazma:**
    - Abonelik satın alma/iptal etme (`subscribe`, `cancelSubscription` vb.) fonksiyonları:
        - İlgili kullanıcının `/users/{auth.currentUser.uid}` dokümanındaki `activePlanId` ve `subscriptionEndDate` alanlarını güncellemeli.
- [ ] **Abonelik Durumunu Firestore'dan Yükleme:**
    - Kullanıcı oturum açtığında veya uygulama başladığında (`AuthContext` veya ana App bileşeninde):
        - Firestore'dan `/users/{auth.currentUser.uid}` dokümanını çek.
        - `activePlanId` ve `subscriptionEndDate` bilgilerini alarak `useSubscriptionStore`'daki state'i güncelle.
        - `subscriptionEndDate` geçmişte kalmışsa `activePlanId`'yi 'free' olarak güncelle (hem lokalde hem Firestore'da - bu idealde bir Cloud Function ile yapılmalı ama başlangıç için client-side olabilir).
- [ ] **Premium Erişim Kontrolü:** Uygulama içinde premium özelliklere erişim `subscriptionStore.activePlanId === 'premium'` (veya 'basic', 'premium' gibi ücretli planlar) ile kontrol edilecek.

### 4. `firestoreService.ts` Oluşturma (`src/services/firestoreService.ts`)

- [ ] Temel Firestore işlemleri için genel fonksiyonlar:
    - `getCurrentUserId(): string | null` (Firebase Auth'dan aktif kullanıcı ID'sini alır).
    - `addDocument(collectionPath: string, data: any, docId?: string): Promise<string>` (docId verilirse onu kullanır, verilmezse Firestore üretir. Oluşturulan/verilen ID'yi döndürür).
    - `setDocument(docPath: string, data: any, options?: { merge: boolean }): Promise<void>`
    - `getDocument<T>(docPath: string): Promise<T | null>`
    - `updateDocument(docPath: string, data: Partial<any>): Promise<void>`
    - `deleteDocument(docPath: string): Promise<void>`
    - `getCollection<T>(collectionPath: string, queryConstraints?: QueryConstraint[]): Promise<T[]>` (Sorgu filtreleri ekleyebilmek için `QueryConstraint` eklendi)
    - `getCollectionRealtime<T>(collectionPath: string, callback: (data: T[]) => void, queryConstraints?: QueryConstraint[]): () => void` (unsubscribe fonksiyonu döndürür).
- [ ] Fonksiyonlar, `getCurrentUserId()` kullanarak dinamik olarak doğru kullanıcı yolunu (`users/${userId}/...`) oluşturmalı.
- [ ] `FieldValue.serverTimestamp()` kullanımı için yardımcılar veya doğrudan kullanım.

### 5. `syncService.ts` Oluşturma (`src/services/syncService.ts`)

- [ ] **İnterface'ler:**
    - `SyncableItem { id: string; createdAt?: FirebaseTimestamp | Date; updatedAt?: FirebaseTimestamp | Date; [key: string]: any; }`
- [ ] **Veri Yazma (Client -> Firestore):**
    - `syncItemUpstream(userId: string, collectionName: 'meals' | 'activities', item: SyncableItem): Promise<void>`
        - Yeni eklenen/güncellenen öğeyi Firestore'a yazar. `createdAt` (yoksa) ve `updatedAt` için `FieldValue.serverTimestamp()` kullanır.
    - `deleteItemFromFirestore(userId:string, collectionName: 'meals' | 'activities', itemId: string): Promise<void>`
    - `syncUserSettingsUpstream(userId: string, settings: { calorieGoal: number, nutrientGoals: NutrientGoals }): Promise<void>`
        - `/users/{userId}` dokümanındaki `userSettings` map'ini günceller, `userSettings.updatedAt` için `FieldValue.serverTimestamp()` kullanır.
    - `syncUserStatsSummaryUpstream(userId: string, stats: { streakDays: number, totalLogsCount: number }): Promise<void>`
        - `/users/{userId}/userStatsSummaries/dailyLogSummary` dokümanını günceller, `lastCalculatedAt` için `FieldValue.serverTimestamp()` kullanır.
- [ ] **Veri Okuma (Firestore -> Client - İlk Yükleme / Manuel Senkronizasyon):**
    - `fetchAllDataForUser(userId: string): Promise<{ meals: FoodItem[], activities: ActivityItem[], userSettings: UserSettings | null, userStatsSummary: UserStatsSummary | null }>`
        - Kullanıcının tüm verilerini Firestore'dan çeker.
    - `syncDownstreamDataToStores(data: { meals: FoodItem[], activities: ActivityItem[], userSettings: UserSettings | null /* ...diğerleri */ }): void`
        - Çekilen verileri ilgili Zustand store'larına (yeni action'lar aracılığıyla) yazar. Lokal verilerle çakışma yönetimi (örn: "Firestore'daki daha yeniyse üzerine yaz").
- [ ] **Çakışma Çözümleme Stratejisi:**
    - Basit "en son yazılan kazanır" (`updatedAt` timestamp'ine göre). Firestore'dan gelen veri her zaman daha güvenilir kabul edilebilir veya daha karmaşık bir birleştirme mantığı kurulabilir. Başlangıç için Firestore'dan gelenin lokaldeki üzerine yazması yeterli olabilir.
- [ ] **Çevrimdışı Desteği (İleri Seviye - Başlangıçta Opsiyonel):**
    - [ ] Firestore'un kendi çevrimdışı kalıcılığını etkinleştir.
    - [ ] Bağlantı yokken yapılan değişiklikleri bir kuyruğa (örn: AsyncStorage) alıp bağlantı gelince işleme mantığı (daha karmaşık). Firestore'un kendi mekanizması çoğu durumda yeterli olacaktır.

### 6. Zustand Store Güncellemeleri (Senkronizasyon Entegrasyonu)

- [ ] **Genel:**
    - Her store'a `lastSyncedAt: Date | null` gibi bir alan eklenebilir (opsiyonel, debug için).
    - `loadFromFirestore(items: T[]): void` gibi action'lar ekle (mevcut `loadFoods`, `loadActivities` benzeri ama Firestore'dan gelen veriyle).
    - Store action'ları (add, update, remove) premium kullanıcılar için `syncService`'i çağıracak.

- [ ] **`useFoodStore`:**
    - `addFood`: Lokal ID (`uuid()`) üret, `createdAt` ve `updatedAt` için `new Date()` (lokal) veya placeholder ekle. `syncService.syncItemUpstream` çağır. Firestore'dan dönen ID ve timestamp'ler ile lokal state güncellenebilir.
    - `updateFood`: `updatedAt` güncelle. `syncService.syncItemUpstream` çağır.
    - `removeFood`: `syncService.deleteItemFromFirestore` çağır.
    - `setFoodsFromFirestore(foods: FoodItem[]): void`: `foods` state'ini topluca günceller. Timestampleri `Date` objesine çevir.
- [ ] **`useActivityStore`:**
    - `ActivityItem`'a `id` ekle.
    - `addActivity`: Lokal ID (`uuid()`) üret. Benzer şekilde `syncService` çağrıları.
    - `updateActivity`: Benzer şekilde `syncService` çağrıları.
    - `removeActivity`: Benzer şekilde `syncService` çağrıları.
    - `setActivitiesFromFirestore(activities: ActivityItem[]): void`: `activities` state'ini topluca günceller. Timestampleri `Date` objesine çevir.
- [ ] **`useCalorieGoalStore`:**
    - `setCalorieGoal`, `setNutrientGoals`: Değişiklik sonrası `syncService.syncUserSettingsUpstream` çağır.
    - `setUserSettingsFromFirestore(settings: UserSettings): void`: `calorieGoal` ve `nutrientGoals` state'lerini Firestore'dan gelenle günceller.
- [ ] **`useUserStatsStore`:**
    - Mevcut hesaplama fonksiyonları (`calculateStreakDays`, `calculateTotalLogsCount`) kalacak.
    - Belirli aralıklarla veya önemli bir olaydan sonra (örn: yeni log eklendiğinde) bu fonksiyonları çağırıp `syncService.syncUserStatsSummaryUpstream` ile Firestore'a yazacak bir mekanizma (belki `App.tsx` içinde veya `useEffect` ile).
    - `setUserStatsSummaryFromFirestore(summary: UserStatsSummary): void`: (Eğer bu özet lokalde de tutulacaksa).
- [ ] **`isLoading` Durumları:** Tüm store'lardaki `load...` fonksiyonları ve senkronizasyon işlemleri sırasında `isLoading` state'lerini doğru yönet.

### 7. UI Güncellemeleri

- [ ] **`PricingScreen.tsx`:**
    - Premium plan özelliklerine "Cihazlar Arası Senkronizasyon" ve "Veri Yedekleme (Bulut)" ekle.
- [ ] **Ayarlar Ekranı:**
    - Kullanıcının mevcut planını göster (`subscriptionStore.activePlanId`).
    - Son senkronizasyon zamanını göster (eğer `lastSyncedAt` tutuluyorsa veya `userStatsSummary.lastCalculatedAt`).
    - Manuel "Şimdi Senkronize Et" butonu ekle (`syncService.fetchAllDataForUser` ve ardından `syncDownstreamDataToStores` çağıracak).
    - Senkronizasyon durumu göstergesi (yükleniyor, başarılı, hata).
- [ ] **Veri Giriş/Listeleme Ekranları:**
    - Veri yüklenirken (`isLoading`) yükleme göstergeleri.
    - Senkronizasyon hatalarında kullanıcıya bilgi mesajı.

### 8. Kimlik Doğrulama ve Kullanıcı Yönetimi (`AuthContext` veya benzeri)

- [ ] Kullanıcı giriş (`signIn`) yaptığında:
    - Firebase Auth ile kimlik doğrulama.
    - `firestoreService` ile `/users/{userId}` dokümanını kontrol et. Yoksa oluştur (yeni kullanıcı için `activePlanId: 'free'`, `createdAt`, `email` vb. ile).
    - `subscriptionStore.loadSubscriptionDetails(userId)` çağır.
    - `syncService.fetchAllDataForUser(userId)` ile tüm verileri çekip store'ları doldur.
- [ ] Kullanıcı çıkış (`signOut`) yaptığında:
    - Lokal store'ları temizle (`reset` fonksiyonları).
    - `subscriptionStore`'u sıfırla.

### 9. Hata Yönetimi ve Test Stratejileri

- [ ] **Ağ Hataları:** `firestoreService` ve `syncService` içindeki tüm ağ isteklerinde `try-catch` blokları kullan.
- [ ] **Kullanıcı Geri Bildirimi:** Başarısız işlemler için kullanıcıya anlaşılır hata mesajları göster (örn: "Senkronizasyon başarısız. İnternet bağlantınızı kontrol edin.").
- [ ] **Çevrimdışı Test:**
    - Cihaz çevrimdışıyken veri ekle/güncelle.
    - Cihaz tekrar çevrimiçi olduğunda Firestore'un otomatik senkronizasyonunu gözlemle.
- [ ] **Çoklu Cihaz Testi:** Mümkünse, aynı hesapla iki farklı cihazda veri değişiklikleri yapıp senkronizasyonu test et.
- [ ] **Abonelik Durumları Testi:**
    - Ücretsiz kullanıcıyken senkronizasyonun olmaması.
    - Premium kullanıcıyken senkronizasyonun çalışması.
    - Abonelik bittiğinde senkronizasyonun durması.

### 10. Firestore Güvenlik Kuralları (`firestore.rules`)

- [ ] **Temel Kural:** Kullanıcılar varsayılan olarak hiçbir şeyi okuyup yazamasın.
  ```firestore
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Varsayılan olarak erişimi engelle
      match /{document=**} {
        allow read, write: if false;
      }
      // Kullanıcıların sadece kendi ana dokümanlarına erişimi
      match /users/{userId} {
        allow read, update: if request.auth.uid == userId;
        allow create: if request.auth.uid == userId && request.resource.data.uid == userId; // Yeni kullanıcı oluşturma

        // ÖNEMLİ: activePlanId ve subscriptionEndDate alanlarının client tarafından
        // keyfi olarak değiştirilmesini engellemek kritik öneme sahiptir.
        // Bu alanlar idealde güvenli bir backend (örn: Cloud Functions ile ödeme onayı sonrası) tarafından güncellenmelidir.
        // Client tarafı güncellemeye sadece çok kısıtlı ve dikkatli senaryolarda izin verilebilir.
        // Örnek kısıtlama (client'ın activePlanId'yi değiştirmesini engeller):
        // allow update: if request.auth.uid == userId &&
        //                  request.resource.data.activePlanId == resource.data.activePlanId &&
        //                  request.resource.data.subscriptionEndDate == resource.data.subscriptionEndDate;
        // Ya da sadece belirli alanların güncellenmesine izin ver:
        // allow update: if request.auth.uid == userId &&
        //                  request.resource.data.keys().hasOnly(['userSettings', 'email', 'başkaGüvenliAlan']);
      }
      // Kullanıcıların kendi alt koleksiyonlarına erişimi
      match /users/{userId}/{collection}/{docId} {
        allow read, write, delete: if request.auth.uid == userId;
        // Örneğin, 'meals' koleksiyonu için daha detaylı oluşturma kuralı:
        // allow create: if request.auth.uid == userId && request.resource.data.calories > 0;
      }

      // "kullanıcının bilgilerini görebilmem lazım" (Admin Erişimi - Dikkatli Olunmalı):
      // Bu, özel bir admin rolü ve arayüzü gerektirir.
      // Örnek: Adminlerin tüm kullanıcı verilerini okumasına izin verme (Custom Claims veya admin koleksiyonu ile)
      // match /users/{userId}/{document=**} {
      //   allow read: if request.auth.uid == userId ||
      //                  (request.auth.token.admin == true && request.auth.token.admin != null); // Custom claim kontrolü
      //   // veya:
      //   // allow read: if request.auth.uid == userId ||
      //   //                exists(/databases/$(database)/documents/admins/$(request.auth.uid)); // Admins koleksiyonu kontrolü
      // }
    }
  }