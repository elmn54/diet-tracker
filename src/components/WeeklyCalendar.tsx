import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTheme } from 'react-native-paper';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const theme = useTheme();
  
  const styles = makeStyles(theme.colors);

  useEffect(() => {
    // Haftanın başlangıcını pazar günü olarak al ve 7 günü hesapla
    const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
    const days = Array(7)
      .fill(0)
      .map((_, i) => addDays(startDate, i));
    
    setWeekDays(days);
  }, []);

  // Gün kısaltmaları
  const getDayShort = (date: Date) => {
    return format(date, 'EEE', { locale: tr });
  };

  // Gün sayısı
  const getDayNumber = (date: Date) => {
    return format(date, 'd');
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.calendarContainer}
    >
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayToday = isToday(day);
        
        return (
          <TouchableOpacity 
            key={day.toISOString()} 
            style={[
              styles.dayContainer,
              isSelected && styles.selectedDayContainer,
              dayToday && !isSelected && styles.todayContainer
            ]}
            onPress={() => onSelectDate(day)}
          >
            <Text style={[
              styles.dayName,
              isSelected && styles.selectedText,
              dayToday && !isSelected && styles.todayText
            ]}>
              {getDayShort(day)}
            </Text>
            <Text style={[
              styles.dayNumber,
              isSelected && styles.selectedText,
              dayToday && !isSelected && styles.todayText
            ]}>
              {getDayNumber(day)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  calendarContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  dayContainer: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant || '#F0F0F0',
    marginHorizontal: 5,
  },
  selectedDayContainer: {
    backgroundColor: colors.primary || '#FF9C8C',
  },
  todayContainer: {
    backgroundColor: colors.secondary || '#E6F7E9',
  },
  dayName: {
    fontSize: 14,
    color: colors.textLight || '#666',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text || '#333',
  },
  selectedText: {
    color: '#fff',
  },
  todayText: {
    color: colors.primary || '#008566',
  },
});

export default WeeklyCalendar; 