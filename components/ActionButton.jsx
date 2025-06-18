import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const ActionButton = ({
    style = {},
    textStyle = {},
    title,
    onPress,
    backgroundColor = '#4CAF50',
    textColor = '#fff',
    disabled = false,
    icon
}) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor, opacity: disabled ? 0.5 : 1 }, style]}
            onPress={onPress}
            disabled={disabled}
        >
            {icon &&
                <MaterialCommunityIcons name={icon.icon || "progress-question"} size={icon.size || 24} style={icon.styles || {}} color={icon.color || black} />
            }
            {title &&
                <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
            }
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: "center",
        flexDirection: "row",
        gap: 5
    },
    text: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ActionButton;
