import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomPicker from '../../components/CustomPicker';
import PeriodNavigator from '../../components/PeriodNavigator';
import { useTransactions } from '../TransactionContext';
import timePeriods from '../json/timePeriods.json';
import TransactionFlashList from './TransactionFlashList';

const OverviewHeader = React.memo(({ totalOverview }) => (
    <View style={styles.overviewBox}>
        <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <MaterialCommunityIcons name="information-outline" size={16} />
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Income</Text>
            <Text style={[styles.amount, styles.income]}>{formatCurrency(totalOverview.income) || 0}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Expense</Text>
            <Text style={[styles.amount, styles.expense]}>{formatCurrency(0 - totalOverview.expense) || 0}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={[styles.amount, totalOverview.net < 0 ? styles.expense : styles.income]}>{formatCurrency(totalOverview.net) || 0}</Text>
        </View>
    </View>
));

const NavigationHeader = React.memo(({
    setViewMode,
    router
}) => (
    <View>
        <View style={styles.headercontainer}>
            <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
            <View style={styles.headerIcons}>
                <TouchableOpacity
                    onPress={() => router.push(`/transaction/Search`)}>
                    <MaterialCommunityIcons name="magnify" size={25} style={styles.iconSpacing} />
                </TouchableOpacity>

                <CustomPicker
                    inputContainerStyle={styles.inputContainer}
                    labelStyle={styles.label}
                    pickerStyle={styles.picker}
                    TouchableComponent={<MaterialCommunityIcons name="calendar-month" size={25} />}
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

export default function HomeScreen() {
    const router = useRouter();
    const { filterTransactions } = useTransactions();
    const [viewMode, setViewMode] = useState('month');
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updateTriggers, setUpdateTriggers] = useState();

    // Auto refresh when focus
    useFocusEffect(
        useCallback(() => {
            setUpdateTriggers(Date.now());
        }, [])
    );

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    }, []);

    const filteredTransactions = useMemo(() => {
        const start = moment(selectedDate);
        let end = moment(selectedDate);
        console.log("Refresh riwayat transaksi...");

        if (viewMode === 'week') {
            start.startOf('week');
            end.endOf('week');
        } else if (viewMode === 'month') {
            start.startOf('month');
            end.endOf('month');
        } else if (viewMode === 'quarter') {
            start.startOf('quarter');
            end.endOf('quarter');
        } else if (viewMode === 'year') {
            start.startOf('year');
            end.endOf('year');
        }

        return filterTransactions({
            startDate: start.valueOf(),
            endDate: end.valueOf()
        });
    }, [selectedDate, viewMode, isRefreshing, updateTriggers, filterTransactions]);

    const groupedTransactions = useMemo(() => {
        const groups = {};

        filteredTransactions.forEach((item) => {
            const mDate = moment(Number(item.createdAt)).startOf('day');
            const now = moment().startOf('day');
            const diff = now.diff(mDate, 'days');

            let dateKey = diff === 0
                ? 'Today'
                : diff === 1
                    ? 'Yesterday'
                    : mDate.format('DD');

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    data: [],
                    timestamp: mDate.valueOf(),
                    total: 0,
                };
            }

            groups[dateKey].data.push(item);

            const value =
                item.type === 'income'
                    ? item.amount
                    : item.type === 'expense'
                        ? -item.amount
                        : 0;

            groups[dateKey].total += value;
        });

        return Object.entries(groups)
            .map(([date, group]) => ({
                date,
                timestamp: group.timestamp,
                total: group.total,
                data: group.data,
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [filteredTransactions]);

    const totalOverview = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;

        filteredTransactions.forEach((item) => {
            if (item.type === 'income') {
                totalIncome += item.amount;
            } else if (item.type === 'expense') {
                totalExpense += item.amount;
            }
        });

        return {
            income: totalIncome,
            expense: totalExpense,
            net: totalIncome - totalExpense,
        };
    }, [filteredTransactions]);

    const onTransactionPress = useCallback((item) => {
        router.push({
            pathname: 'transaction/TransactionDetails/',
            params: {
                id: item.id
            }
        });
    }, [router]);

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <NavigationHeader
                setViewMode={setViewMode}
                router={router}
            />

            <PeriodNavigator
                selectedDate={selectedDate}
                viewMode={viewMode}
                onDateChange={setSelectedDate}
            />

            <TransactionFlashList
                groupedTransactions={groupedTransactions}
                onTransactionPress={onTransactionPress}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />
                }
                ListHeaderComponent={<OverviewHeader totalOverview={totalOverview} />}
                ListEmptyComponent={
                    <View style={{ justifyContent: "center", alignItems: "center", height: 300 }}>
                        <Text>Tidak ada transaksi</Text>
                    </View>
                }
            />
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
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '600',
    },
    overviewBox: {
        paddingTop: 16,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10
    },
    overviewTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    label: {
        color: '#555',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    income: {
        color: '#2e7d32',
    },
    expense: {
        color: '#c62828',
    },
});