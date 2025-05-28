import { InterstitialAd, AdEventType, TestIds, RewardedInterstitialAd } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Test Ad IDs - Gerçek uygulama için değiştirilmeli
const TEST_INTERSTITIAL_ID = TestIds.INTERSTITIAL;

// Prodüksiyon ortamında kullanılacak gerçek Ad ID'leri
// Uygulamanız Google Ads'e kaydedildiğinde buraya gerçek ID'leri eklemelisiniz
const ANDROID_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712'; // Google test ad ID 
const IOS_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/4411468910'; // Google test ad ID

export class AdService {
  private interstitialAd: InterstitialAd | null = null;
  private isLoaded = false;
  private isLoading = false;
  private unsubscribeCallbacks: Array<() => void> = [];
  private lastAdShownTimestamp: number = 0;
  private readonly MIN_AD_INTERVAL_MS: number = 60000; // 1 dakika - reklam bombardımanını önlemek için

  constructor() {
    // Sınıf oluşturulduğunda hemen bir reklam yükle
    this.initialize();
  }

  /**
   * AdService'i başlatır ve ilk reklamı yükler
   */
  public initialize(): void {
    this.loadInterstitialAd();
  }

  /**
   * Interstitial reklamı yükler
   */
  public loadInterstitialAd(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    // Önceki event listener'ları temizle
    this.cleanupEventListeners();

    // Geliştirme ortamında test ID'lerini, prodüksiyonda gerçek ID'leri kullan
    const adUnitId = __DEV__ 
      ? TEST_INTERSTITIAL_ID 
      : Platform.OS === 'ios' 
        ? IOS_INTERSTITIAL_ID 
        : ANDROID_INTERSTITIAL_ID;

    this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

    // Reklam olaylarını dinle
    const unsubscribeLoaded = this.interstitialAd.addAdEventListener(
      AdEventType.LOADED,
      () => {
        this.isLoaded = true;
        this.isLoading = false;
        console.log('Interstitial ad loaded successfully');
      }
    );

    const unsubscribeClosed = this.interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        this.isLoaded = false;
        console.log('Interstitial ad closed, loading new ad');
        this.loadInterstitialAd(); // Yeni bir reklam yükle
      }
    );

    const unsubscribeError = this.interstitialAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Ad error:', error);
        this.isLoading = false;
        this.isLoaded = false;
        
        // Hata durumunda tekrar yüklemeyi dene
        setTimeout(() => {
          this.loadInterstitialAd();
        }, 5000);
      }
    );

    // Unsubscribe callback'leri kaydet
    this.unsubscribeCallbacks.push(
      unsubscribeLoaded,
      unsubscribeClosed,
      unsubscribeError
    );

    // Reklamı yükle
    this.interstitialAd.load();
  }

  /**
   * Event listener'ları temizler
   */
  private cleanupEventListeners(): void {
    this.unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
    this.unsubscribeCallbacks = [];
  }

  /**
   * Son reklam gösteriminden beri yeterli zaman geçti mi kontrolü
   * @returns boolean
   */
  private hasMinimumAdIntervalPassed(): boolean {
    const now = Date.now();
    return now - this.lastAdShownTimestamp >= this.MIN_AD_INTERVAL_MS;
  }

  /**
   * Interstitial reklamı gösterir
   * @returns Promise<boolean> - Reklamın tamamen izlenip izlenmediğini döndürür
   */
  public async showInterstitialAd(): Promise<boolean> {
    // Kısa süre içinde çok fazla reklam göstermeyi engelle
    if (!this.hasMinimumAdIntervalPassed()) {
      console.log('Minimum ad interval not passed, skipping ad');
      return false;
    }

    return new Promise(async (resolve) => {
      if (!this.isLoaded || !this.interstitialAd) {
        console.log('Ad not loaded yet, loading new ad');
        this.loadInterstitialAd();
        resolve(false);
        return;
      }

      // Kapanma olayını dinle (reklam izlendiğinde)
      const unsubscribeAdClosed = this.interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeAdClosed(); // Dinleyiciyi kaldır
          this.lastAdShownTimestamp = Date.now(); // Son gösterim zamanını güncelle
          console.log('Interstitial ad watched completely');
          resolve(true); // Reklam izlendi
        }
      );

      // Hata durumunda dinleyici
      const unsubscribeError = this.interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error('Ad display error:', error);
          unsubscribeError();
          unsubscribeAdClosed();
          resolve(false); // Reklam gösterilemedi
        }
      );

      // Reklamı göster
      await this.interstitialAd.show();
    });
  }

  /**
   * Reklamın yüklenip yüklenmediğini kontrol eder
   */
  public isAdLoaded(): boolean {
    return this.isLoaded;
  }
}

// Singleton instance
const adService = new AdService();
export default adService; 