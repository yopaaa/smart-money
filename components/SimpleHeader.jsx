import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    Pressable,
    Text,
    View
} from 'react-native';


function Header({ style, headerTitleStyle, title, rightComponent }) {
    const router = useRouter();

    return (<View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc', ...style
    }}>
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 60,
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
        </View>


        {rightComponent}
    </View>)
}

export default Header
