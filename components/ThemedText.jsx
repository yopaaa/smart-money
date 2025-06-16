import { Text } from 'react-native';
import { useTheme } from '../hooks/ThemeContext';

export const ThemedText = (props) => {
  const { theme } = useTheme();
  let color = theme.colors.text
  if (props.type == "description") {
    color = theme.colors.description
  }
  return <Text {...props}
    style={[{ color: color }
      , props.style]} />;
};