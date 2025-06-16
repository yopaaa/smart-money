// components/ThemedView.js
import { View } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

export const ThemedView = (props) => {
  const { theme } = useTheme();
  return <View {...props} 
  style={[{ backgroundColor: theme.colors.card }, props.style]} />;
};