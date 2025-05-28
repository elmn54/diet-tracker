import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useSubscriptionStore } from '../store/subscriptionStore';

// Test Ad IDs - Gerçek uygulama için değiştirilmeli
const TEST_BANNER_ID = TestIds.BANNER;

// Prodüksiyon ortamında kullanılacak gerçek Ad ID'leri
// Uygulamanız Google Ads'e kaydedildiğinde buraya gerçek ID'leri eklemelisiniz
const ANDROID_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111'; // Google test ad ID
const IOS_BANNER_ID = 'ca-app-pub-3940256099942544/2934735716'; // Google test ad ID

interface AdBannerProps {
  size?: BannerAdSize;
  isKeyboardVisible?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  size = BannerAdSize.BANNER,
}) => {
  const isAdFree = useSubscriptionStore(state => state.isFeatureAvailable('isAdFree'));
  const [shouldShowAd, setShouldShowAd] = useState(!isAdFree);

  // Kullanıcının abonelik durumu değişirse reklamı göster/gizle
  useEffect(() => {
    setShouldShowAd(!isAdFree);
  }, [isAdFree]);

  if (shouldShowAd) {
    // Geliştirme ortamında test ID'lerini, prodüksiyonda gerçek ID'leri kullan
    const adUnitId = __DEV__ 
      ? TEST_BANNER_ID 
      : Platform.OS === 'ios' 
        ? IOS_BANNER_ID 
        : ANDROID_BANNER_ID;

    return (
      <View style={[
        styles.container,
      ]}>
        <BannerAd
          unitId={adUnitId}
          size={size}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    );
  }

  // Kullanıcı premium ise veya reklam gösterilmemesi gerekiyorsa boş bir view döndür
  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 10,
  },
});

export default AdBanner; 