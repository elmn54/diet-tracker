import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, useTheme, Divider, List } from 'react-native-paper';
import { spacing, typography } from '../constants/theme';

interface FeatureItem {
  title: string;
  free: boolean;
  basic: boolean;
  premium: boolean;
  description?: string;
}

const FreeVsPremiumCard = () => {
  const theme = useTheme();

  const features: FeatureItem[] = [
    {
      title: 'Basic Diet Tracking',
      free: true,
      basic: true,
      premium: true,
      description: 'Track your daily meals and calories'
    },
    {
      title: 'Ad-Free Experience',
      free: false,
      basic: true,
      premium: true,
      description: 'No advertisements while using the app'
    },
    {
      title: 'Local Data Storage',
      free: true,
      basic: true,
      premium: true,
      description: 'Data is stored locally on your device (will be lost if app is uninstalled)'
    },
    {
      title: 'Cloud Data Backup',
      free: false,
      basic: false,
      premium: true,
      description: 'Your data is securely backed up to the cloud'
    },
    {
      title: 'Device Sync',
      free: false,
      basic: false,
      premium: true,
      description: 'Sync your data across multiple devices'
    },
    {
      title: 'Daily & Weekly Reports',
      free: false,
      basic: true,
      premium: true,
      description: 'Detailed analysis of your diet progress'
    },
    {
      title: 'Advanced Statistics',
      free: false,
      basic: true,
      premium: true,
      description: 'Access to detailed statistics and analytics'
    },
    {
      title: 'Unlimited Food Entries',
      free: true,
      basic: true,
      premium: true,
      description: 'Add as many food entries as you need'
    }
  ];

  const renderFeatureStatus = (available: boolean) => {
    return (
      <Text style={{ 
        color: available ? theme.colors.primary : theme.colors.error,
        fontWeight: 'bold'
      }}>
        {available ? 'Yes' : 'No'}
      </Text>
    );
  };

  return (
    <Card style={styles.card}>
      <Card.Title 
        title="Free vs Premium Features" 
        titleStyle={[styles.title, { color: theme.colors.primary }]} 
      />
      <Card.Content>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.featureCell]}>Feature</Text>
          <Text style={[styles.headerCell, { color: theme.colors.onSurfaceVariant }]}>Free</Text>
          <Text style={[styles.headerCell, { color: theme.colors.secondary }]}>Basic</Text>
          <Text style={[styles.headerCell, { color: theme.colors.primary }]}>Premium</Text>
        </View>
        <Divider />
        
        <ScrollView style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              <View style={styles.featureRow}>
                <View style={styles.featureCell}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  {feature.description && (
                    <Text style={[styles.featureDescription, { color: theme.colors.onSurfaceVariant }]}>
                      {feature.description}
                    </Text>
                  )}
                </View>
                <View style={styles.statusCell}>
                  {renderFeatureStatus(feature.free)}
                </View>
                <View style={styles.statusCell}>
                  {renderFeatureStatus(feature.basic)}
                </View>
                <View style={styles.statusCell}>
                  {renderFeatureStatus(feature.premium)}
                </View>
              </View>
              {index < features.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </ScrollView>

        <View style={[styles.infoContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.infoTitle, { color: theme.colors.onSurface }]}>
            Free User Limitations:
          </Text>
          <List.Item
            title="Local storage only"
            description="Data is stored only on your device and will be lost if the app is uninstalled"
            left={props => <List.Icon {...props} icon="information" />}
            titleStyle={styles.infoItemTitle}
            descriptionStyle={[styles.infoItemDescription, { color: theme.colors.onSurfaceVariant }]}
          />
          <List.Item
            title="Ads are shown"
            description="Free users will see ads after every few uses"
            left={props => <List.Icon {...props} icon="information" />}
            titleStyle={styles.infoItemTitle}
            descriptionStyle={[styles.infoItemDescription, { color: theme.colors.onSurfaceVariant }]}
          />
          <List.Item
            title="Limited features"
            description="Advanced statistics and cloud features require a subscription"
            left={props => <List.Icon {...props} icon="information" />}
            titleStyle={styles.infoItemTitle}
            descriptionStyle={[styles.infoItemDescription, { color: theme.colors.onSurfaceVariant }]}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: spacing.m,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    marginVertical: spacing.s,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: typography.fontSize.medium,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    marginVertical: spacing.s,
    paddingVertical: spacing.xs,
  },
  featureCell: {
    flex: 2.5,
    paddingRight: spacing.s,
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: '500',
  },
  featureDescription: {
    fontSize: typography.fontSize.small,
    marginTop: 2,
  },
  featuresContainer: {
    maxHeight: 480,
  },
  infoContainer: {
    marginTop: spacing.m,
    padding: spacing.s,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    marginLeft: spacing.s,
  },
  infoItemTitle: {
    fontSize: typography.fontSize.medium,
  },
  infoItemDescription: {
    fontSize: typography.fontSize.small,
  }
});

export default FreeVsPremiumCard; 