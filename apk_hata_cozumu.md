# APK Çökmesi Sorunu Çözümü

## Yapılan İşlemler

1. app.json dosyasındaki hatalı "proguard" satırı kaldırıldı
2. Eksik bağımlılıklar eklendi:
   - `npx expo install expo-system-ui`
   - `yarn add @expo/plist`
3. Native kodlar temizlendi: `npx expo prebuild --clean`
4. Release APK oluşturuldu: `cd android && ./gradlew.bat assembleRelease`

## APK Konumları
- Debug APK: android/app/build/outputs/apk/debug/app-debug.apk
- Release APK: android/app/build/outputs/apk/release/app-release.apk

## Gelecekte Aynı Sorunla Karşılaşırsanız
2. app.json'da geçersiz yapılandırmaları kontrol edin
3. Eksik bağımlılıkları yükleyin
4. `npx expo prebuild --clean` ile native kodları yenileyin
5. `cd android && ./gradlew.bat assembleRelease` ile release APK oluşturun 