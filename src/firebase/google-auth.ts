import { getAuth, GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google işlemleri için bir sınıf oluşturuyoruz
class GoogleAuthService {
  // Google Sign In'i yapılandırıyoruz
  static init() {
    // Web client ID'yi Firebase console'dan alıyoruz
    GoogleSignin.configure({
      webClientId: '56494544581-6lt2pgs75mq9ta9alul9s56scdi9r6rq.apps.googleusercontent.com', // web client ID'nizi buraya girin
      offlineAccess: true,
    });
  }

  // Google ile giriş yapma
  static async signIn() {
    try {
      // Google Play hizmetlerinin mevcut olduğunu kontrol et
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true
      });
      
      // Google ile giriş işlemi - kullanıcı seçim ekranını gösterir
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In userInfo:', userInfo);
      
      // Google kimlik bilgileriyle Firebase'e giriş yapıyoruz
      const { idToken } = await GoogleSignin.getTokens();
      console.log('Google Sign-In idToken received');
      
      // Firebase kimlik sağlayıcısına Google ID token'ı ile giriş yap
      const auth = getAuth();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      console.log('Google credential created');
      
      // Firebase'e Google kimliği ile giriş yap
      return auth.signInWithCredential(googleCredential);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  // Google ile çıkış yapma
  static async signOut() {
    try {
      const auth = getAuth();
      console.log('Starting sign out process');
      
      // Her iki çıkış işlemini de dene, hatalar olsa bile devam et
      try {
        // Google'dan çıkış yapmayı dene
        await GoogleSignin.revokeAccess().catch(error => {
          console.log('Google revokeAccess error (non-critical):', error);
        });
        
        await GoogleSignin.signOut().catch(error => {
          console.log('Google signOut error (non-critical):', error);
        });
        
        console.log('Google sign out attempt completed');
      } catch (googleError) {
        // Google çıkış hataları önemli değil, devam et
        console.log('Google sign out general error (continuing anyway):', googleError);
      }
      
      // Her durumda Firebase'den çıkış yap
      await auth.signOut();
      console.log('Firebase sign out successful');
      
      return true;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
}

export default GoogleAuthService; 