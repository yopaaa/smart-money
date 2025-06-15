import BarChart from '@/components/DoubleBarChart';
import SimpleHeader from '@/components/SimpleHeader';
import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { useTransactions } from '../../TransactionContext';


export default function HomeScreen() {
    const { title, id, viewMode = "month", selectedDate: selectedDates } = useLocalSearchParams();
    const router = useRouter();
    const { filterTransactions, getCategoryById } = useTransactions();
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
            return `${start.format('D')}-${end.format('D MMM YYYY')}`;
        }
        if (viewMode === 'month') return selectedDate.format('MMMM YYYY');
        if (viewMode === 'quarter') return `Q${selectedDate.quarter()} ${selectedDate.year()}`;
        if (viewMode === 'year') return selectedDate.format('YYYY');
    };

    function FindIcon({ id, size = 30, style }) {
        const category = getCategoryById(id) || {
            "id": "29680517",
            "name": "Lainnya",
            "icon": "dots-horizontal",
            "color": "#b0bec5",
            "type": "expense"
        };

        return <MaterialCommunityIcons name={category.icon} size={size} color={category.color} style={style} />;
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
            ...(id && { accountId: id }),
        });
    }, [selectedDate, viewMode, filterTransactions, isRefreshing, updateTriggers]);

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
            expense: -totalExpense,
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
                    router.push({
                        pathname: 'transaction/TransactionDetails/',
                        params: {
                            id: item.id
                        }
                    });
                }}
                style={styles.item}
            >
                <View style={{ paddingHorizontal: 15 }}>
                    <FindIcon id={item.category} />
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
                    {isExpense ? '-' : isTransfer ? "" : '+'} {formatCurrency(item.amount)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderGroup = ({ item }) => {
        const isNew = item.date !== "Today" && item.date !== "Yesterday";
        const amountStyle = item.total < 0 ? styles.expense : styles.income;

        return (
            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
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
            <SimpleHeader
                // title={`${title}`}
                headerComponent={
                    <View style={{ flexDirection: "row", gap: 15 }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: 'black',
                            textTransform: 'capitalize'
                        }}>{title}</Text>
                        <TouchableOpacity onPress={() => {
                            router.push({
                                pathname: 'transaction/EditAccount',
                                params: {
                                    id
                                }
                            });
                        }}>
                            <MaterialCommunityIcons name="pencil-outline" size={22} color="#007AFF" />
                        </TouchableOpacity>
                    </View>

                }
                rightComponent={
                    <View style={styles.monthNav}>
                        <TouchableOpacity onPress={goToPrev}>
                            <MaterialCommunityIcons name="chevron-left" size={30} />
                        </TouchableOpacity>

                        <Text style={styles.monthText}>{getPeriodLabel()}</Text>

                        <TouchableOpacity onPress={goToNext}>
                            <MaterialCommunityIcons name="chevron-right" size={30} />
                        </TouchableOpacity>
                    </View>
                }
            />


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
                        <View style={styles.row}>
                            <Text style={styles.label}>{title} Income</Text>
                            <Text style={[styles.amount, styles.income]}> {formatCurrency(totalOverview.income) || 0}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{title} Expense</Text>
                            <Text style={[styles.amount, styles.expense]}> {formatCurrency(totalOverview.expense) || 0}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>{title} Total</Text>
                            <Text style={[styles.amount, totalOverview.net > 0 ? styles.income : styles.expense]}> {formatCurrency(totalOverview.net) || 0}</Text>
                        </View>

                        <View style={styles.overviewHeader}>
                            <Text style={styles.overviewTitle}>Overview per {viewMode == "year" ? "Week" : "Days"}</Text>
                            <MaterialCommunityIcons name="information-outline" size={16} />
                        </View>
                        <BarChart data={filteredTransactions.filter(val => val.type != "transfer")
                        } mode={viewMode} />
                    </View>
                }
                ListFooterComponent={<View style={{ margin: 200 }} />}
            />
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
        paddingHorizontal: 16,
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