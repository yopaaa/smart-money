import PeriodNavigator from '@/components/PeriodNavigator';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/ThemeContext';
import { useTransactions } from '@/hooks/TransactionContext';
import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import {
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import TransactionFlashList from '../(transaction)/TransactionFlashList';

const OverviewHeader = React.memo(({ totalOverview, theme }) => (
    <View style={styles.overviewBox}>
        <View style={styles.overviewHeader}>
            <ThemedText style={styles.overviewTitle}>Overview</ThemedText>
            <MaterialCommunityIcons name="information-outline" size={16} color={theme.colors.text} />
        </View>
        <View style={styles.row}>
            <ThemedText type="description">Income</ThemedText>
            <Text style={[styles.amount, styles.income]}>{formatCurrency(totalOverview.income) || 0}</Text>
        </View>
        <View style={styles.row}>
            <ThemedText type="description">Expense</ThemedText>
            <Text style={[styles.amount, styles.expense]}>{formatCurrency(0 - totalOverview.expense) || 0}</Text>
        </View>
        <View style={styles.row}>
            <ThemedText type="description">Total</ThemedText>
            <Text style={[styles.amount, totalOverview.net < 0 ? styles.expense : styles.income]}>{formatCurrency(totalOverview.net) || 0}</Text>
        </View>
    </View>
));

export default function HistoryScreen({ viewMode }) {
    const { theme } = useTheme();

    const router = useRouter();
    const { filterTransactions } = useTransactions();
    const [selectedDate, setSelectedDate] = useState(moment());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updateTriggers, setUpdateTriggers] = useState();

    // Auto refresh when focus
    // useFocusEffect(
    //     useCallback(() => {
    //         setUpdateTriggers(Date.now());
    //     }, [])
    // );

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
    }, [selectedDate, viewMode, isRefreshing, filterTransactions]);

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
            pathname: '(home)/(transaction)/TransactionDetails/',
            params: {
                id: item.id
            }
        });
    }, [router]);

    return (
        <>
            <PeriodNavigator
                selectedDate={selectedDate}
                viewMode={viewMode}
                onDateChange={setSelectedDate}
                theme={theme}
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
                ListHeaderComponent={<OverviewHeader totalOverview={totalOverview} theme={theme} />}
                ListEmptyComponent={
                    <View style={{ justifyContent: "center", alignItems: "center", height: 300 }}>
                        <Text>Tidak ada transaksi</Text>
                    </View>
                }
            />
        </>
    );
}

const styles = StyleSheet.create({
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