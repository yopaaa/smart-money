import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

const SlideSelect = ({
  options = [
    { key: 'income', label: 'Income', icon: 'arrow-down-circle' },
    { key: 'expense', label: 'Expense', icon: 'arrow-up-circle' },
  ],
  initial = 'income',
  onChange = () => {},
}) => {
  const [selected, setSelected] = useState(initial);
  const anim = useRef(new Animated.Value(initial === options[0].key ? 0 : 1)).current;

  const toggle = () => {
    const next = selected === options[0].key ? options[1].key : options[0].key;
    setSelected(next);
    onChange(next);
    Animated.timing(anim, {
      toValue: next === options[0].key ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const firstWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 45],
  });

  const secondWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [45, 120],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle}>
        <Animated.View style={[styles.item, { width: firstWidth }]}>
          <MaterialCommunityIcons name={options[0].icon} size={22} color="#333" />
          <Animated.Text style={[styles.text, {
            opacity: selected === options[0].key ? 1 : 0,
            position: "absolute", right: 0, marginRight: 25
          }]}>
            {options[0].label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggle}>
        <Animated.View style={[styles.item, { width: secondWidth, justifyContent: 'flex-end' }]}>
          <MaterialCommunityIcons name={options[1].icon} size={22} color="#333" />

          <Animated.Text style={[styles.text, {
            opacity: selected === options[1].key ? 1 : 0,
            position: "absolute", left: 0, marginLeft: 25
          }]}>
            {options[1].label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default SlideSelect;

const styles = StyleSheet.create({
  container: {
    width: 176,
    flexDirection: 'row',
    backgroundColor: '#ddd',
    padding: 4,
    borderRadius: 30,
    alignItems: 'center',
  },
  item: {
    height: 42,
    margin: 1,
    backgroundColor: '#fff',
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  text: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#333',
  },
});
