import { useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

const CustomSwitch = ({
  value = false,
  onValueChange,
  activeColor = '#4CAF50',
  inactiveColor = '#e0e0e0',
  thumbColor = 'white',
  size = 'medium',
  disabled = false,
}) => {
  const [isOn, setIsOn] = useState(value);
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  // Define sizes
  const sizes = {
    small: { width: 40, height: 20, thumbSize: 16 },
    medium: { width: 50, height: 24, thumbSize: 20 },
    large: { width: 60, height: 28, thumbSize: 24 },
  };

  const selectedSize = sizes[size] || sizes.medium;

  const toggleSwitch = () => {
    if (disabled) return;

    const newValue = !isOn;
    setIsOn(newValue);
    onValueChange?.(newValue);

    Animated.timing(animation, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, selectedSize.width - selectedSize.thumbSize - 2],
  });

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={toggleSwitch}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.container,
          {
            width: selectedSize.width,
            height: selectedSize.height,
            backgroundColor,
            borderRadius: selectedSize.height / 2,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: selectedSize.thumbSize,
              height: selectedSize.thumbSize,
              borderRadius: selectedSize.thumbSize / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  thumb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default CustomSwitch;