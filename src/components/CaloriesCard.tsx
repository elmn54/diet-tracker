import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, MD3Theme } from 'react-native-paper';

interface CaloriesCardProps {
  food: number;
  exercise: number;
  remaining: number;
}

const CaloriesCard: React.FC<CaloriesCardProps> = ({ food, exercise, remaining }) => {
  const theme = useTheme();
  
  const styles = makeStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔥</Text>
        </View>
        <Text style={styles.title}>Calories</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{food}</Text>
          <Text style={styles.statLabel}>Food</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>{exercise}</Text>
          <Text style={styles.statLabel}>Exercise</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.remainingValue]}>{remaining}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.dark ? theme.colors.surfaceVariant : '#F8E8F0',
    borderRadius: 16,
    padding: 10,
    marginRight: 8,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  remainingValue: {
    fontSize: 16,
    color: theme.dark ? '#7C8BFF' : '#4169E1',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: theme.dark ? theme.colors.surfaceDisabled : '#E0E0E0',
    marginHorizontal: 5,
  },
});

export default CaloriesCard; 