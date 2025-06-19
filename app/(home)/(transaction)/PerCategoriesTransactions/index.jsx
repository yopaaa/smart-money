import DoubleBarChart from '@/components/DoubleBarChart';
import PeriodNavigator from '@/components/PeriodNavigator';
import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import TransactionFlashList from '../TransactionFlashList';

export default function HomeScreen() {
    const { title, category, type, viewMode = "month", selectedDate: selectedDates } = useLocalSearchParams();
    const router = useRouter();
    const { filterTransactions } = useTransactions();
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updateTriggers, setUpdateTriggers] = useState();

    useFocusEffect(
        useCallback(() => {
            setSelectedDate(moment(selectedDates))
            setUpdateTriggers(Date.now());
        }, [])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    const filteredTransactions = useMemo(() => {
        const start = moment(selectedDate);
        let end = moment(selectedDate);

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
            endDate: end.valueOf(),
            ...(category && { category }),
            ...(type && { type })
        });
    }, [selectedDate, viewMode, filterTransactions, isRefreshing, updateTriggers, category, type]);

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

    const renderListHeader = useCallback(() => (
        <View style={styles.overviewBox}>
            <View style={styles.row}>
                <Text style={styles.label}>{type} Total</Text>
                <Text style={[styles.amount, totalOverview.net > 0 ? styles.income : styles.expense]}> {formatCurrency(totalOverview.net) || 0}</Text>
            </View>

            <View style={styles.overviewHeader}>
                <Text style={styles.overviewTitle}>Overview per {viewMode == "year" ? "Week" : "Days"}</Text>
                <MaterialCommunityIcons name="information-outline" size={16} />
            </View>
            <DoubleBarChart data={filteredTransactions} mode={viewMode} />
        </View>
    ), [title, totalOverview, filteredTransactions, viewMode]);

    const onTransactionPress = useCallback((item) => {
        router.push({
            pathname: '(home)/(transaction)/TransactionDetails/',
            params: {
                id: item.id,
            },
        });
    }, [router]);

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <SimpleHeader
                title={`${title} Categories`}
                rightComponent={
                    <PeriodNavigator
                        selectedDate={selectedDate}
                        viewMode={viewMode}
                        onDateChange={setSelectedDate}
                    />
                }
            />

            <View style={{ paddingHorizontal: 16, flex: 1 }}>
                <TransactionFlashList
                    groupedTransactions={groupedTransactions}
                    onTransactionPress={onTransactionPress}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                    ListEmptyComponent={
                        <View style={{ justifyContent: "center", alignItems: "center", height: 300 }}>
                            <Text>Tidak ada transaksi</Text>
                        </View>
                    }
                    ListHeaderComponent={renderListHeader}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
    },
    item: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 12,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        color: '#666',
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
    transfer: {
        color: '#7b7b7b',
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
        // paddingHorizontal: 16,
        paddingTop: 16,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
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
        textTransform: "capitalize"
    },
    transactionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        padding: 10
    },
    dateHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 16,
    },
    day: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateSmall: {
        color: '#666',
    },
    transactionRight: {
        marginLeft: 10
    }
});