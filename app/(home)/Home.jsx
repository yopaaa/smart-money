import CustomPicker from '@/components/CustomPicker';
import { useTheme } from '@/hooks/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import timePeriods from '../json/timePeriods.json';
import AnimatedTabBar from './(root)/AnimatedTabBar';
import { GalleryScreen } from './(root)/GalleryScreen';
import HistoryScreen from './(root)/HistoryScreen';

const NavigationHeader = React.memo(({
    setViewMode,
    router,
    theme,
    onNavigate
}) => (
    <View>
        <View style={styles.headercontainer}>
            <View>
                <AnimatedTabBar tabs={TABS} onPress={onNavigate
                } style={{ height: 40, width: 200 }} selectedColor={theme.colors.primary}/>
            </View>

            <View style={styles.headerIcons}>
                <TouchableOpacity
                    onPress={() => router.push(`(home)/(root)/Search`)}>
                    <MaterialCommunityIcons name="magnify" size={25} style={styles.iconSpacing} color={theme.colors.text} />
                </TouchableOpacity>

                <CustomPicker
                    inputContainerStyle={styles.inputContainer}
                    labelStyle={styles.label}
                    pickerStyle={styles.picker}
                    TouchableComponent={<MaterialCommunityIcons name="calendar-month" size={25} color={theme.colors.text} />}
                    onSelect={(val) => { setViewMode(String(val.name).toLocaleLowerCase()) }}
                    options={timePeriods}
                    selectedComponent={(val) => (
                        <>
                            <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.color} />
                            <Text>{val.name}</Text>
                        </>
                    )}
                />
            </View>
        </View>
    </View>
));

// ✅ GANTI atau TAMBAH ikon di sini
const TABS = [
    { key: 'format-list-bulleted', icon: 'format-list-bulleted' },
    { key: 'folder-image', icon: 'folder-image' },
    // { key: 'layers', icon: 'layers-outline' },
    // { key: 'cloud', icon: 'cloud-outline' },        // Tambahan
    // { key: 'code-tags', icon: 'code-tags' },        // Tambahan
];

export default function HomeScreen() {
    const { theme } = useTheme();

    const router = useRouter();
    const [viewMode, setViewMode] = useState('month');
    const [see, setSee] = useState(TABS[0].key);

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <NavigationHeader
                setViewMode={setViewMode}
                router={router}
                theme={theme}
                onNavigate={(val) => setSee(val)}
            />

            {see == "format-list-bulleted" && <HistoryScreen viewMode={viewMode} />}
            {see == "folder-image" &&
                <View>
                    <GalleryScreen viewMode={viewMode} />
                </View>}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        flexDirection: "column",
    },
    headercontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconSpacing: {
        marginHorizontal: 10,
    },
});