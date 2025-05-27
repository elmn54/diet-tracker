import { useEffect, useState } from 'react';
import { useAdStore } from '../store/adStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useUIStore } from '../store/uiStore';
import adService from '../services/adService';

export const useAdManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert, showToast } = useUIStore();
  
  // Ad store state ve metotları
  const { 
    entryCount, 
    incrementEntryCount, 
    resetEntryCount,
    shouldShowAd,
    showAd,
    getRemainingUses
  } = useAdStore();
  
  // Subscription store'dan premium durumunu kontrol et
  const isAdFree = useSubscriptionStore(state => state.isFeatureAvailable('isAdFree'));
  
  // Kullanıcı bir şey eklerken veya bir aksiyon gerçekleştirdiğinde çağrılacak
  const trackUserEntry = async () => {
    if (isAdFree) return; // Premium kullanıcılar için hiçbir şey yapma
    
    try {
      setIsLoading(true);
      await incrementEntryCount();
      
      // Eğer kullanım hakkı kalmadıysa ve reklam görüntülendi ve başarılı olduysa
      if (shouldShowAd()) {
        const wasAdWatched = await showAd();
        if (wasAdWatched) {
          // Kullanıcıya geri bildirim ver
          showToast('You won 2 more uses!', 'success');
        }
      }
    } catch (error) {
      console.error('Error tracking user entry:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reklamı manuel olarak gösterme fonksiyonu (genellikle belirli durumlarda kullanılır)
  const showAdManually = async (): Promise<boolean> => {
    if (isAdFree) return false; // Premium kullanıcılar için hiçbir şey yapma
    
    try {
      setIsLoading(true);
      const wasAdWatched = await showAd();
      
      if (wasAdWatched) {
        // Kullanıcıya geri bildirim ver
        showToast('You won 2 more uses!', 'success');
      }
      
      return wasAdWatched;
    } catch (error) {
      console.error('Error showing ad:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reklamların aktif olduğunu kullanıcıya bildirmek için
  const showAdReminder = () => {
    if (isAdFree) return; // Premium kullanıcılar için hiçbir şey yapma
    
    // Kalan giriş hakkını hesapla
    const remainingEntries = getRemainingUses();
    
    if (remainingEntries === 1) {
      showAlert(
        'Reklam Hatırlatması',
        'Your free usage limit has 1 left. The next time you use the app, an ad will be shown. Watching ads will give you 2 more uses.',
        'info'
      );
    } else if (remainingEntries === 0) {
      showAlert(
        'Reklam Bilgilendirmesi',
        'Your free usage limit has been reached. To continue using the app, you need to watch ads. Watching ads will give you 2 more uses.',
        'info'
      );
    }
  };
  
  // Komponent yüklendiğinde reklamları ön yükle
  useEffect(() => {
    if (!isAdFree) {
      adService.initialize();
    }
  }, [isAdFree]);
  
  return {
    trackUserEntry,
    showAdManually,
    showAdReminder,
    entryCount,
    isLoading,
    remainingEntries: getRemainingUses(),
    isAdFree
  };
}; 