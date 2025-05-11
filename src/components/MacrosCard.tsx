import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, MD3Theme } from 'react-native-paper';

interface MacrosCardProps {
  carbs: {
    current: number;
    goal: number;
  };
  protein: {
    current: number;
    goal: number;
  };
  fat: {
    current: number;
    goal: number;
  };
}

const MacrosCard: React.FC<MacrosCardProps> = ({ carbs, protein, fat }) => {
  const theme = useTheme();
  
  const styles = makeStyles(theme);
  
  // Format numbers to have at most 1 decimal place
  const formatNumber = (num: number): string => {
    return num.toFixed(1).replace(/\.0$/, '');
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🥗</Text>
        </View>
        <Text style={styles.title}>Macros</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>
            {formatNumber(carbs.current)}<Text style={styles.macroGoal}>/{formatNumber(carbs.goal)}</Text>
          </Text>
          <Text style={styles.macroLabel}>Carbs (g)</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>
            {formatNumber(protein.current)}<Text style={styles.macroGoal}>/{formatNumber(protein.goal)}</Text>
          </Text>
          <Text style={styles.macroLabel}>Protein (g)</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>
            {formatNumber(fat.current)}<Text style={styles.macroGoal}>/{formatNumber(fat.goal)}</Text>
          </Text>
          <Text style={styles.macroLabel}>Fat (g)</Text>
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
    marginLeft: 8,
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
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  macroGoal: {
    fontSize: 11,
    color: theme.dark ? theme.colors.onSurfaceVariant : '#AAAAAA',
    fontWeight: 'normal',
  },
  macroLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: theme.dark ? theme.colors.surfaceDisabled : '#E0E0E0',
    marginHorizontal: 5,
  },
});

export default MacrosCard; 