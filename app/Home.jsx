import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomPicker from '../components/CustomPicker';
import { useTransactions } from './TransactionContext';
import expenseCategories from './json/expenseCategories.json';
import incomeCategories from './json/incomeCategories.json';
import timePeriods from './json/timePeriods.json';
import transferCategories from './json/transferCategories.json';

export function findCategory(categoryName) {
    const categories = [...expenseCategories, ...incomeCategories, ...transferCategories];
    const category = categories.find(c => c.name === categoryName);
    return category || categories[9];
}

export function FindIcon({ name, size = 30, style }) {
    const category = findCategory(name);
    return <MaterialCommunityIcons name={category.icon} size={size} color={category.color} style={style} />;
};

export default function HomeScreen() {
    const router = useRouter();
    const { filterTransactions } = useTransactions();
    const [viewMode, setViewMode] = useState('month'); // 'week' | 'month' | 'quarter' | 'year'
    const [selectedDate, setSelectedDate] = useState(moment()); // bisa hari berapa pun
    const [isRefreshing, setisRefreshing] = useState(false)

    // Auto refresh when focus
    const [updateTrigers, setupdateTrigers] = useState()
    useFocusEffect(
        useCallback(() => {
            setupdateTrigers(Date.now());
        }, [])
    );

    const handleRefresh = () => {
        setisRefreshing(true)
        setTimeout(() => {
            setisRefreshing(false)
        }, 1000);
    }

    const goToPrev = () => {
        const newDate = moment(selectedDate);
        if (viewMode === 'week') setSelectedDate(newDate.subtract(1, 'week'));
        if (viewMode === 'month') setSelectedDate(newDate.subtract(1, 'month'));
        if (viewMode === 'quarter') setSelectedDate(newDate.subtract(1, 'quarter'));
        if (viewMode === 'year') setSelectedDate(newDate.subtract(1, 'year'));
    };

    const goToNext = () => {
        const newDate = moment(selectedDate);
        if (viewMode === 'week') setSelectedDate(newDate.add(1, 'week'));
        if (viewMode === 'month') setSelectedDate(newDate.add(1, 'month'));
        if (viewMode === 'quarter') setSelectedDate(newDate.add(1, 'quarter'));
        if (viewMode === 'year') setSelectedDate(newDate.add(1, 'year'));
    };

    const getPeriodLabel = () => {
        if (viewMode === 'week') {
            const start = moment(selectedDate).startOf('week');
            const end = moment(selectedDate).endOf('week');
            return `${start.format('D MMM')} - ${end.format('D MMM YYYY')}`;
        }
        if (viewMode === 'month') return selectedDate.format('MMMM YYYY');
        if (viewMode === 'quarter') return `Q${selectedDate.quarter()} ${selectedDate.year()}`;
        if (viewMode === 'year') return selectedDate.format('YYYY');
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

        // Gunakan filterTransactions dari context
        return filterTransactions({
            startDate: start.valueOf(),
            endDate: end.valueOf()
        });
    }, [selectedDate, viewMode, isRefreshing, updateTrigers]);

    const groupedTransactions = useMemo(() => {
        const groups = {};

        // console.log(filteredTransactions); 

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

    const renderTransactionItem = ({ item }) => {
        const isExpense = item.type === 'expense';
        const isTransfer = item.type === 'transfer';
        const amountStyle = isExpense ? styles.expense : isTransfer ? styles.transfer : styles.income;

        return (
            <TouchableOpacity
                onPress={() => {
                    router.push(`/transaction/${item.id}`);
                }}
                style={styles.item}
            >
                <View style={{ paddingHorizontal: 15 }}>
                    <FindIcon name={item.category} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>
                        {moment().diff(moment(Number(item.createdAt)), 'days') > 3
                            ? moment(Number(item.createdAt)).format('HH:mm, DD MMM YYYY')
                            : moment(Number(item.createdAt)).fromNow()}
                    </Text>
                </View>
                <Text style={[styles.amount, amountStyle]}>
                    {isExpense ? '-' : isTransfer ? "" : '+'}{formatCurrency(item.amount)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderGroup = ({ item }) => {
        const isNew = item.date !== "Today" && item.date !== "Yesterday";
        const amountStyle = item.total < 0 ? styles.expense : styles.income;

        return (
            <View style={{ marginTop: 20 }}>
                <View style={styles.transactionBox}>
                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <Text style={[styles.dateHeader, isNew && { fontSize: 30 }]}>{item.date}</Text>
                        {isNew && (
                            <View style={styles.transactionRight}>
                                <Text style={styles.day}>{moment(item.timestamp).format('dddd')}</Text>
                                <Text style={styles.dateSmall}>{moment(item.timestamp).format("MMM YYYY")}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.amount, amountStyle]}>
                        {formatCurrency(item.total)}
                    </Text>
                </View>

                {item.data.map(tx => (
                    <View key={tx.id}>
                        {renderTransactionItem({ item: tx })}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            {/* Header */}
            <View style={styles.headercontainer}>
                <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        onPress={() => {
                            router.push(`/transaction/Search`);
                        }}>

                        <MaterialCommunityIcons name="magnify" size={25} style={styles.iconSpacing} />
                    </TouchableOpacity>

                    <CustomPicker
                        inputContainerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                        pickerStyle={styles.picker}
                        TouchableComponent={<MaterialCommunityIcons name="calendar-month" size={25} />}
                        onSelect={(val) => { setViewMode(String(val.name).toLocaleLowerCase()) }}
                        options={timePeriods}
                        selectedComponent={(val) => {
                            return (<>
                                <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.color} />
                                <Text>{val.name}</Text>
                            </>)
                        }}
                    />
                </View>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
                <TouchableOpacity onPress={goToPrev}>
                    <MaterialCommunityIcons name="chevron-left" size={30} />
                </TouchableOpacity>

                <Text style={styles.monthText}>{getPeriodLabel()}</Text>

                <TouchableOpacity onPress={goToNext}>
                    <MaterialCommunityIcons name="chevron-right" size={30} />
                </TouchableOpacity>

            </View>

            <FlatList
                data={groupedTransactions}
                keyExtractor={(item) => item.date}
                renderItem={renderGroup}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                ListEmptyComponent={
                    <View style={{ justifyContent: "center", alignItems: "center", height: "50%" }}>
                        <Text>Tidak ada transaksi</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.overviewBox}>
                        <View style={styles.overviewHeader}>
                            <Text style={styles.overviewTitle}>Overview</Text>
                            <MaterialCommunityIcons name="information-outline" size={16} />
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Income</Text>
                            <Text style={[styles.amount, { color: '#2196f3' }]}> {formatCurrency(totalOverview.income) || 0}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Expense</Text>
                            <Text style={[styles.amount, { color: '#f44336' }]}>-  {formatCurrency(totalOverview.expense) || 0}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Total</Text>
                            <Text style={styles.amount}> {formatCurrency(totalOverview.net) || 0}</Text>
                        </View>
                    </View>
                }
                ListFooterComponent={<View style={{ margin: 200 }} />}
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
    item: {
        flexDirection: 'row',
        paddingVertical: 12,
        // borderBottomColor: '#ddd',
        // borderBottomWidth: 1,
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
        // justifyContent: 'space-between',
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
    }
});