import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface CaloriesCardProps {
  food: number;
  exercise: number;
  remaining: number;
}

const CaloriesCard: React.FC<CaloriesCardProps> = ({ food, exercise, remaining }) => {
  const theme = useTheme();
  
  const styles = makeStyles(theme.colors);

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

const makeStyles = (colors: any) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.dark ? '#333333' : '#F8E8F0',
    borderRadius: 16,
    padding: 15,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    color: colors.text,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  remainingValue: {
    fontSize: 22,
    color: colors.dark ? '#47A0FF' : '#4169E1',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight || colors.placeholder,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: colors.dark ? '#444444' : '#E0E0E0',
    marginHorizontal: 5,
  },
});

export default CaloriesCard; 