import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

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
  
  const styles = makeStyles(theme.colors);
  
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
            {carbs.current}<Text style={styles.macroGoal}>/{carbs.goal}</Text>
          </Text>
          <Text style={styles.macroLabel}>Carbs (g)</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>
            {protein.current}<Text style={styles.macroGoal}>/{protein.goal}</Text>
          </Text>
          <Text style={styles.macroLabel}>Protein (g)</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>
            {fat.current}<Text style={styles.macroGoal}>/{fat.goal}</Text>
          </Text>
          <Text style={styles.macroLabel}>Fat (g)</Text>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surfaceVariant || colors.surface,
    borderRadius: 16,
    padding: 15,
    marginLeft: 8,
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
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  macroGoal: {
    fontSize: 16,
    color: colors.textLight || colors.placeholder,
    fontWeight: 'normal',
  },
  macroLabel: {
    fontSize: 12,
    color: colors.textLight || colors.placeholder,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: colors.divider || '#DDD',
    marginHorizontal: 5,
  },
});

export default MacrosCard; 