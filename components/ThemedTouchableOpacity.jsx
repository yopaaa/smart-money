// components/ThemedView.js
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

export const ThemedTouchableOpacity = (props) => {
  const { theme } = useTheme();
  return <TouchableOpacity {...props} 
  style={[{ backgroundColor: theme.colors.card }, props.style]} />;
};