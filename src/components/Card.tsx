import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card as PaperCard, Text } from 'react-native-paper';
import { colors, spacing, metrics } from '../constants/theme';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: number;
  testID?: string;
}

interface CardSubComponents {
  Content: React.FC<{children: React.ReactNode, style?: StyleProp<ViewStyle>}>;
}

/**
 * Özel stillendirilmiş kart bileşeni - bilgileri göstermek için kullanılır
 */
const Card: React.FC<CardProps> & CardSubComponents = ({
  title,
  children,
  style,
  contentStyle,
  onPress,
  elevation = 1,
  testID,
}) => {
  return (
    <PaperCard
      style={[styles.card, { elevation }, style]}
      onPress={onPress}
      testID={testID || 'card-container'}
    >
      {title && (
        <PaperCard.Title
          title={title}
          titleStyle={styles.title}
        />
      )}
      <PaperCard.Content style={[styles.content, contentStyle]}>
        {children}
      </PaperCard.Content>
    </PaperCard>
  );
};

// Card.Content alt bileşenini tanımlama
Card.Content = ({ children, style }: {children: React.ReactNode, style?: StyleProp<ViewStyle>}) => (
  <PaperCard.Content style={style}>
    {children}
  </PaperCard.Content>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: metrics.borderRadius.medium,
    marginVertical: spacing.s,
    borderColor: colors.divider,
    borderWidth: 0.5,
  },
  title: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {
    paddingVertical: spacing.s,
  },
});

export default Card; 