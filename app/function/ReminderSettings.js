// ReminderSettings.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Alert, Button, Platform, SafeAreaView, StatusBar, Switch, Text, View } from 'react-native';

import SimpleHeader from '../../components/SimpleHeader';
import {
    cancelReminders,
    registerForPushNotificationsAsync,
    scheduleDailyReminder,
} from './NotificationService';

function Reminder() {
    const [enabled, setEnabled] = useState(false);
    const [time, setTime] = useState(new Date(0, 0, 0, 20, 0));
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const savedEnabled = await AsyncStorage.getItem('reminder_enabled');
            const savedTime = await AsyncStorage.getItem('reminder_time');

            if (savedEnabled === 'true') setEnabled(true);
            if (savedTime) setTime(new Date(savedTime));
        };

        loadSettings();
    }, []);

    const toggleReminder = async () => {
        const newState = !enabled;
        setEnabled(newState);
        await AsyncStorage.setItem('reminder_enabled', String(newState));

        if (newState) {
            const granted = await registerForPushNotificationsAsync();
            if (granted) {
                await scheduleDailyReminder(time.getHours(), time.getMinutes());
                Alert.alert('Pengingat diaktifkan');
            }
        } else {
            await cancelReminders();
            Alert.alert('Pengingat dimatikan');
        }
    };

    const changeTime = async (event, selected) => {
        if (!selected) {
            setShowPicker(false);
            return;
        }

        setShowPicker(Platform.OS === 'ios');
        setTime(selected);
        await AsyncStorage.setItem('reminder_time', selected.toString());

        if (enabled) {
            await scheduleDailyReminder(selected.getHours(), selected.getMinutes());
            Alert.alert('Waktu pengingat diperbarui');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Pengingat Harian</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ flex: 1 }}>Aktifkan pengingat</Text>
                <Switch value={enabled} onValueChange={toggleReminder} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1 }}>Waktu pengingat</Text>
                <Button
                    title={`${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`}
                    onPress={() => setShowPicker(true)}
                />
            </View>

            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={changeTime}
                />
            )}
        </View>
    );
}

export default function ReminderSettings() {
    return (
        <SafeAreaView style={{paddingTop: StatusBar.currentHeight || 0 }}>
            <SimpleHeader />

            <Reminder />
        </SafeAreaView>)
}