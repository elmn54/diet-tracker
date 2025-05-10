import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTheme, MD3Theme } from 'react-native-paper';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

// Türkçe gün kısaltmaları
const turkishDays = {
  0: 'Paz',
  1: 'Pzt',
  2: 'Sal',
  3: 'Çar',
  4: 'Per',
  5: 'Cum',
  6: 'Cmt'
};

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const theme = useTheme();
  
  const styles = makeStyles(theme);

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
    const dayIndex = date.getDay();
    return turkishDays[dayIndex as keyof typeof turkishDays];
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

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
  calendarContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dayContainer: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: theme.dark ? theme.colors.surfaceVariant : '#F0F0F0',
    marginHorizontal: 5,
  },
  selectedDayContainer: {
    backgroundColor: theme.colors.primary,
  },
  todayContainer: {
    backgroundColor: theme.dark ? theme.colors.surfaceDisabled : '#E6E6FA',
  },
  dayName: {
    fontSize: 14,
    color: theme.dark ? theme.colors.onSurfaceVariant : '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.dark ? theme.colors.onSurface : '#333',
  },
  selectedText: {
    color: theme.dark ? '#FFFFFF' : '#FFFFFF',
  },
  todayText: {
    color: theme.dark ? theme.colors.primary : theme.colors.primary,
  },
});

export default WeeklyCalendar; 