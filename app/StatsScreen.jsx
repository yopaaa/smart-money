import { formatNumber } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
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
import { FindIcon } from './Home';
import { useTransactions } from './TransactionContext';
import timePeriods from './timePeriods.json';


function convertTransactionsByType(transactions, type = 'expense') {
    // Filter hanya transaksi dengan tipe sesuai (income atau expense)
    const filtered = transactions.filter(t => t.type === type);

    // Hitung total nominal untuk semua kategori
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);

    // Kelompokkan berdasarkan kategori
    const grouped = {};
    filtered.forEach(t => {
        const key = t.category || 'Other';
        if (!grouped[key]) {
            grouped[key] = 0;
        }
        grouped[key] += t.amount;
    });

    // Konversi ke array dengan persentase
    const result = Object.entries(grouped).map(([category, amount]) => {
        const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
        return { category, amount, percent };
    });

    // Urutkan berdasarkan amount terbesar
    return result.sort((a, b) => b.amount - a.amount);
}

export default function HomeScreen() {
    const router = useRouter();
    const { transactions, refetchTransactions } = useTransactions();
    const [viewMode, setViewMode] = useState('month'); // 'week' | 'month' | 'quarter' | 'year'
    const [selectedDate, setSelectedDate] = useState(moment()); // bisa hari berapa pun
    const [isRefreshing, setisRefreshing] = useState(false)

    const [expenseCategoriesGroub, setExpenseCategoriesGroub] = useState([])
    const [incomeCategoriesGroub, setIncomeCategoriesGroub] = useState([])

    // Hnaya Mengembalikan Transaksi Yang Berada DI Range yang Di Minta
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

        return transactions.filter(item => {
            const created = moment(Number(item.createdAt));
            return created.isBetween(start, end, null, '[]'); // inklusif
        });
    }, [transactions, selectedDate, viewMode]);

    useEffect(() => {
        setExpenseCategoriesGroub(convertTransactionsByType(filteredTransactions, 'expense'))
        setIncomeCategoriesGroub(convertTransactionsByType(filteredTransactions, 'income'))
    }, [filteredTransactions])

    const handleRefresh = () => {
        refetchTransactions()
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


    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            {/* Header */}
            <View style={styles.headercontainer}>
                <Text style={styles.headerTitle}>Balance Statistics</Text>
                <View style={styles.headerIcons}>
                    <MaterialCommunityIcons name="magnify" size={25} style={styles.iconSpacing} />

                    <CustomPicker
                        inputContainerStyle={styles.inputContainer}
                        labelStyle={styles.label}
                        pickerStyle={styles.picker}
                        TouchableComponent={<MaterialCommunityIcons name="calendar-month" size={25} />}
                        onSelect={(val) => setViewMode(val.name)}
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
                data={expenseCategoriesGroub}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                keyExtractor={(item, i) => i.toString()}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <View style={styles.itemLeft}>
                            <View style={[styles.percentBox]}>
                                <Text style={styles.percentText}>{item.percent}%</Text>
                            </View>
                            <FindIcon name={item.category} />
                            <Text style={styles.label}>{item.category}</Text>
                        </View>
                        <Text style={styles.amount}>Rp {formatNumber(item.amount) || 0}</Text>
                    </View>
                )}
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
                            <Text style={[styles.amount, { color: '#2196f3' }]}>Rp {formatNumber(totalOverview.income) || 0}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Expense</Text>
                            <Text style={[styles.amount, { color: '#f44336' }]}>- Rp {formatNumber(totalOverview.expense) || 0}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Total</Text>
                            <Text style={styles.amount}>Rp {formatNumber(totalOverview.net) || 0}</Text>
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
        paddingBottom: 100
    },
    item: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        alignItems: 'center',
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
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomColor: '#1F2937',
        borderBottomWidth: 1,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    percentBox: {
        width: 40,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    percentText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    }
});