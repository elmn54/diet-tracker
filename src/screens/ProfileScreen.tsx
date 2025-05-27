import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, List, useTheme, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, spacing, typography, metrics } from '../constants/theme';
import { useUIStore } from '../store/uiStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useAuth } from '../context/AuthContext';
import { useUserStatsStore } from '../store/userStatsStore';
import { getFirestore, collection, doc, getDoc } from '@react-native-firebase/firestore';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useTheme();
  const { showAlert } = useUIStore();
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { calculateStreakDays, calculateTotalLogsCount } = useUserStatsStore();
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  const [joinDateError, setJoinDateError] = useState(false);
  
  // Abonelik bilgisini al
  const { isSubscribed, activePlanId } = useSubscriptionStore();
  
  // Kullanıcı katılma tarihini Firebase'den al
  useEffect(() => {
    if (user && user.uid) {
      const fetchUserData = async () => {
        try {
          // Modular API kullanımı
          const db = getFirestore();
          const usersCollection = collection(db, 'users');
          const userDocRef = doc(usersCollection, user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists() && userSnapshot.data()?.createdAt) {
            // Firebase Timestamp'i Date'e çevir
            const createdAtTimestamp = userSnapshot.data()?.createdAt;
            setJoinDate(createdAtTimestamp.toDate());
            setJoinDateError(false);
          } else {
            // Veri yoksa
            setJoinDate(null);
            setJoinDateError(true);
          }
        } catch (error) {
          console.error('Kullanıcı verisi alınırken hata oluştu:', error);
          setJoinDate(null);
          setJoinDateError(true);
        }
      };
      
      fetchUserData();
    }
  }, [user]);
  
  // Abonelik türüne göre renk ve metin
  const getSubscriptionColor = () => {
    if (!isSubscribed) {
      return theme.dark ? '#585858' : 'rgba(255, 255, 255, 0.8)';
    }
    
    switch (activePlanId) {
      case 'premium': return theme.colors.primary;
      case 'basic': return theme.dark ? '#686868' : theme.colors.surfaceVariant;
      default: return theme.dark ? '#686868' : theme.colors.surfaceVariant;
    }
  };
  
  const getSubscriptionLabel = () => {
    if (!isSubscribed) {
      return 'Free';
    }
    
    switch (activePlanId) {
      case 'premium': return 'Premium';
      case 'basic': return 'Basic';
      default: return activePlanId; // Fallback to plan ID if unknown
    }
  };
  
  const handleLogout = () => {
    showAlert(
      'Logout',
      'Are you sure you want to logout?',
      'warning',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              // AuthNavigator sayesinde otomatik olarak Login ekranına yönlendirilecek
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Error logging out.');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive' 
        }
      ]
    );
  };
  
  const handleOpenCalorieGoalScreen = () => {
    navigation.navigate('CalorieGoal');
  };
  
  const handleOpenThemeSettings = () => {
    navigation.navigate('ThemeSettings');
  };
  
  const formatDate = (date: Date): string => {
    return format(date, 'd MMMM yyyy', { locale: enUS });
  };

  // İstatistikleri hesapla
  const streakDays = calculateStreakDays();
  const totalLogsCount = calculateTotalLogsCount();

  // Üyelik tarihini gösterme fonksiyonu
  const getMembershipDateText = () => {
    if (joinDateError) {
      return '-';
    }
    
    return joinDate ? formatDate(joinDate) : 'Loading...';
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView 
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.header}>
          {/* Abonelik durumu badge */}
          <Badge
            style={[
              styles.subscriptionBadge,
              { 
                backgroundColor: getSubscriptionColor(),
                color: theme.dark ? '#FFFFFF' : '#000000'
              }
            ]}
          >
            {getSubscriptionLabel()}
          </Badge>
          
          <Text style={[styles.userName, { color: theme.colors.onBackground }]}>{user?.displayName || 'Guest User'}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.onBackground }]}>{user?.email || 'guest@example.com'}</Text>
          <Text style={[styles.joinDate, { color: theme.colors.onBackground }]}>
            Membership: {getMembershipDateText()}
          </Text>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Statistics</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{streakDays}</Text>
                <Text style={styles.statLabel}>Streak Days</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalLogsCount}</Text>
                <Text style={styles.statLabel}>Total Logs</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={styles.planContainer}>
                  <Text 
                    style={[
                      styles.planValue, 
                      { 
                        color: !isSubscribed
                          ? theme.dark ? '#FFFFFF' : '#7F7F7F'
                          : (activePlanId === 'premium' 
                              ? theme.colors.primary 
                              : theme.dark ? '#FFFFFF' : getSubscriptionColor()) 
                      }
                    ]}
                  >
                    {getSubscriptionLabel()}
                  </Text>
                  <Text style={styles.statLabel}>Subscription</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Settings</Text>
            
            <List.Item
              title="Calorie and Nutrition Goals"
              description="Set your daily food intake goals"
              left={props => <List.Icon {...props} icon="target" />}
              onPress={handleOpenCalorieGoalScreen}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Theme Settings"
              description="Change your app theme preferences"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              onPress={handleOpenThemeSettings}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Subscription Plans"
              description="Access premium features"
              left={props => <List.Icon {...props} icon="cash" />}
              onPress={() => navigation.navigate('Pricing')}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="API Settings"
              description="Configure AI food recognition services"
              left={props => <List.Icon {...props} icon="api" />}
              onPress={() => navigation.navigate('ApiSettings')}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Support</Text>
            
            <List.Item
              title="About the App"
              left={props => <List.Icon {...props} icon="information" />}
              onPress={() => Alert.alert('Diet Tracking', 'Version 1.0.0\n© 2023 All Rights Reserved')}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              onPress={() => Linking.openURL('https://example.com/privacy')}
            />
          </Card.Content>
        </Card>
        
        {/* Kullanıcı giriş durumuna göre hesap kartı */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Account</Text>
            
            {user ? (
              // Kullanıcı giriş yapmışsa
              <List.Item
                title="Logout"
                left={props => <List.Icon {...props} icon="logout" color={colors.error} />}
                onPress={handleLogout}
                titleStyle={{ color: colors.error }}
              />
            ) : (
              // Kullanıcı giriş yapmamışsa
              <>
                <List.Item
                  title="Login"
                  description="Login to your existing account"
                  left={props => <List.Icon {...props} icon="login" />}
                  onPress={() => navigation.navigate('Login')}
                />
                
                <Divider style={styles.divider} />
                
                <List.Item
                  title="Register"
                  description="Create a new account"
                  left={props => <List.Icon {...props} icon="account-plus" />}
                  onPress={() => navigation.navigate('Register')}
                />
              </>
            )}
          </Card.Content>
        </Card>
        
        <View style={styles.extraSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.l,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.medium,
    marginBottom: spacing.xs,
    opacity: 0.8,
  },
  joinDate: {
    fontSize: typography.fontSize.small,
    opacity: 0.6,
    marginBottom: spacing.m,
  },
  card: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    elevation: 2,
    borderRadius: metrics.borderRadius.medium,
  },
  sectionTitle: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.m,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.small,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  divider: {
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  extraSpace: {
    height: 60,
  },
  subscriptionBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: 12,
    height: 28,
    minWidth: 80,
    paddingHorizontal: 4,
  },
  planContainer: {
    alignItems: 'center',
  },
  planValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 