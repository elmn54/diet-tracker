import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useTheme, MD3Theme } from 'react-native-paper';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  // Günlere göre kalori durumu: 'complete' (tamamlandı), 'incomplete' (tamamlanmadı), 'exceeded' (aşıldı) veya undefined
  calorieStatus?: Record<string, 'complete' | 'incomplete' | 'exceeded'>;
  // Kalori durumunu belirlemek için kullanılacak fonksiyon
  getCalorieStatus?: (date: Date) => 'complete' | 'incomplete' | 'exceeded' | undefined;
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

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  selectedDate, 
  onSelectDate, 
  calorieStatus = {}, 
  getCalorieStatus 
}) => {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const theme = useTheme();
  
  const styles = makeStyles(theme);
  
  // Kalori durumunu kontrol et - önce props'tan gelen fonksiyonu kullan, yoksa calorieStatus objesini kullan
  const getStatusForDay = (date: Date): 'complete' | 'incomplete' | 'exceeded' | undefined => {
    if (getCalorieStatus) {
      return getCalorieStatus(date);
    }
    
    // calorieStatus içinde bu gün için bir değer varsa onu döndür
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD formatı
    return calorieStatus[dateString];
  };

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
        const calorieStatus = getStatusForDay(day);
        
        return (
          <TouchableOpacity 
            key={day.toISOString()} 
            style={[
              styles.dayContainer,
              isSelected && styles.selectedDayContainer,
              dayToday && !isSelected && styles.todayContainer,
              // Kalori durumuna göre stil ekle (seçili değilse)
              !isSelected && calorieStatus === 'complete' && styles.calorieCompleteContainer,
              !isSelected && calorieStatus === 'incomplete' && styles.calorieIncompleteContainer,
              !isSelected && calorieStatus === 'exceeded' && styles.calorieExceededContainer
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
  // Kalori durumu için stiller
  calorieCompleteContainer: {
    borderWidth: 2,
    borderColor: theme.dark ? '#388E3C' : '#4CAF50', // Koyu ve açık temalar için yeşil renk
  },
  calorieIncompleteContainer: {
    borderWidth: 2,
    borderColor: theme.dark ? '#D32F2F' : '#F44336', // Koyu ve açık temalar için kırmızı renk
  },
  calorieExceededContainer: {
    borderWidth: 2,
    borderColor: theme.dark ? '#D84315' : '#FF5722', // Koyu ve açık temalar için turuncu renk
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