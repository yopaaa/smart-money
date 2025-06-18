import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 3;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnimatedTabBar({ tabs, onPress, style, selectedColor }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const translateX = useSharedValue(0);

    const calculateWidth = style.width ? style.width / tabs.length : null
    const TAB_WIDTH = calculateWidth || (SCREEN_WIDTH - 30) / tabs.length;

    const handlePress = (index) => {
        setActiveIndex(index);
        translateX.value = withTiming(index * TAB_WIDTH, { duration: 200 });
    };

    const sliderStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.container, { width: SCREEN_WIDTH - 30 }, style]}>
            <Animated.View style={[styles.slider, { width: TAB_WIDTH }, sliderStyle]} />

            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, { width: TAB_WIDTH }]}
                    onPress={() => {
                        handlePress(index)
                        if (onPress) onPress(tab.key)
                    }}
                >
                    <MaterialCommunityIcons
                        name={tab.icon}
                        size={28}
                        color={activeIndex === index ? selectedColor || '#6200ee' : '#999'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
        position: 'relative',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slider: {
        position: 'absolute',
        width: TAB_WIDTH,
        height: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        zIndex: -1,
        elevation: -1,

    },
});

