import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg } from 'react-native-svg';
import { VictoryPie } from 'victory';
import { Text, useTheme, MD3Theme } from 'react-native-paper';
import { Nutrients } from '../store/foodStore';

const { width } = Dimensions.get('window');
const chartSize = width * 0.8;

interface NutritionChartProps {
  data: Nutrients;
}

const NutritionChart: React.FC<NutritionChartProps> = ({ data }) => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // Skip rendering if all values are zero
  const totalValue = data.protein + data.carbs + data.fat;
  if (totalValue === 0) {
    return (
      <View style={styles.emptyContainer} testID="empty-chart">
        <Text style={styles.emptyText}>Henüz besin girişi yapılmadı</Text>
      </View>
    );
  }

  // Format data for Victory Pie
  const chartData = [
    { x: 'Protein', y: data.protein, color: theme.dark ? '#7C8BFF' : '#6979F8' },
    { x: 'Karbonhidrat', y: data.carbs, color: theme.dark ? '#FFD97A' : '#FFCF5C' },
    { x: 'Yağ', y: data.fat, color: theme.dark ? '#FF7A8F' : '#FF647C' }
  ];

  // Calculate percentages for display
  const getPercentage = (value: number) => {
    return totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
  };

  const proteinPercentage = getPercentage(data.protein);
  const carbsPercentage = getPercentage(data.carbs);
  const fatPercentage = getPercentage(data.fat);

  return (
    <View style={styles.container} testID="nutrition-chart">
      <Text style={styles.title}>Besin Oranları</Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartSize} height={chartSize}>
          <VictoryPie
            standalone={false}
            data={chartData}
            width={chartSize}
            height={chartSize}
            padding={40}
            innerRadius={chartSize / 5}
            labelRadius={chartSize / 3}
            style={{
              data: {
                fill: ({ datum }) => datum.color,
              },
              labels: {
                fill: theme.colors.onSurface,
                fontSize: 12,
                fontWeight: 'bold',
              },
            }}
            labels={({ datum }) => `${datum.x}\n${Math.round(datum.y)}g`}
          />
        </Svg>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: chartData[0].color }]} />
          <Text style={styles.legendText}>Protein: {data.protein}g ({proteinPercentage}%)</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: chartData[1].color }]} />
          <Text style={styles.legendText}>Karbonhidrat: {data.carbs}g ({carbsPercentage}%)</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: chartData[2].color }]} />
          <Text style={styles.legendText}>Yağ: {data.fat}g ({fatPercentage}%)</Text>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.onSurface,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    height: 200,
    width: '100%',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});

export default NutritionChart; 