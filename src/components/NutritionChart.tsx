import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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

  // Format data for chart
  const chartData = [
    { name: 'Protein', value: data.protein, color: theme.dark ? '#7C8BFF' : '#6979F8' },
    { name: 'Karbonhidrat', value: data.carbs, color: theme.dark ? '#FFD97A' : '#FFCF5C' },
    { name: 'Yağ', value: data.fat, color: theme.dark ? '#FF7A8F' : '#FF647C' }
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
        {/* Basit daire gösterimi */}
        <View style={styles.pieChartContainer}>
          <View style={styles.pieCenter}>
            <Text style={styles.totalText}>{totalValue}g</Text>
            <Text style={styles.totalLabel}>Toplam</Text>
          </View>
          
          <View style={styles.pieSegmentsContainer}>
            {chartData.map((item, index) => (
              <View 
                key={index}
                style={[
                  styles.pieSegment,
                  {
                    backgroundColor: item.color,
                    height: (item.value / totalValue) * 100, 
                  }
                ]}
              />
            ))}
          </View>
        </View>
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
    marginVertical: 20,
  },
  pieChartContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceVariant,
  },
  pieCenter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  totalLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  pieSegmentsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  pieSegment: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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