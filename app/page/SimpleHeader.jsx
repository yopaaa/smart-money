import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    Text,
    View
} from 'react-native';


function Header({ style, headerTitleStyle, title }) {
    const router = useRouter();

    return (<View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        gap: 20,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc', ...style
    }}>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>

        <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'black',
            textTransform: 'capitalize', ...headerTitleStyle
        }}>{title}</Text>

        <Pressable >
        </Pressable>
    </View>)
}

export default Header
