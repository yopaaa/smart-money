import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function TouchableLink({ href, children, style, ...props }) {
  const router = useRouter();

  const handlePress = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style} {...props}>
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TouchableOpacity>
  );
}
