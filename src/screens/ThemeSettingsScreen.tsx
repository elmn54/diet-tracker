import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useThemeStore } from '../store/themeStore';

const ThemeSettingsScreen = () => {
  const theme = useTheme();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  
  const styles = makeStyles(theme.colors);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark theme</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>
      
      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>Preview</Text>
        <View style={[styles.previewBox, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.previewText, { color: theme.colors.onSurface }]}>
            You are currently using the {isDarkMode ? 'dark' : 'light'} theme.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const makeStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.onSurface,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider || '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.onSurface,
  },
  previewSection: {
    padding: 16,
    marginHorizontal: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.onSurface,
  },
  previewBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewText: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.onSurface,
  }
});

export default ThemeSettingsScreen; 