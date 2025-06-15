import SimpleHeader from '@/components/SimpleHeader';
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTransactions } from '../TransactionContext';

export default function SearchScreen() {
    const router = useRouter();
    const { filterTransactions, accounts, getCategoryById } = useTransactions();
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [updateTriggers, setUpdateTriggers] = useState();
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useFocusEffect(
        useCallback(() => {
            setUpdateTriggers(Date.now());
        }, [])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
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
        const filteredData = filterTransactions({
            search: searchQuery,
            ...(selectedType && { type: selectedType }),
            ...(selectedCategory && { category: selectedCategory.name })
        });

        if (!searchQuery) {
            return filteredData.slice(0, 15)
        }

        return filteredData
    }, [searchQuery, selectedType, selectedCategory, updateTriggers, filterTransactions]);

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
                    : mDate.format('DD MMM YYYY');

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

    const renderTransactionItem = ({ item }) => {
        const isExpense = item.type === 'expense';
        const isTransfer = item.type === 'transfer';
        const amountStyle = isExpense ? styles.expense : isTransfer ? styles.transfer : styles.income;

        return (
            <TouchableOpacity
                onPress={() => {
                    router.push({
                        pathname: '/transaction/TransactionDetails',
                        params: {
                            id: item.id,
                            category: item.category,
                            type: item.type
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
                        {moment(Number(item.createdAt)).format('HH:mm, DD MMM YYYY')}
                    </Text>
                </View>
                <Text style={[styles.amount, amountStyle]}>
                    {isExpense ? '-' : isTransfer ? '' : '+'} {formatCurrency(item.amount)}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderGroup = ({ item }) => {
        const amountStyle = item.total < 0 ? styles.expense : styles.income;

        return (
            <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
                <View style={styles.transactionBox}>
                    <Text style={styles.dateHeader}>{item.date}</Text>
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
            <SimpleHeader title="Search Transactions" />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus={true}
                />
                <MaterialCommunityIcons name="magnify" size={24} style={styles.searchIcon} />
            </View>

            {/* Filter Options */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, selectedType === 'income' && styles.activeFilter]}
                    onPress={() => setSelectedType(selectedType === 'income' ? null : 'income')}
                >
                    <Text>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, selectedType === 'expense' && styles.activeFilter]}
                    onPress={() => setSelectedType(selectedType === 'expense' ? null : 'expense')}
                >
                    <Text>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, selectedType === 'transfer' && styles.activeFilter]}
                    onPress={() => setSelectedType(selectedType === 'transfer' ? null : 'transfer')}
                >
                    <Text>Transfer</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                initialNumToRender={3}
                windowSize={10}
                removeClippedSubviews={true}
                data={groupedTransactions}
                keyExtractor={(item) => item.date}
                renderItem={renderGroup}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                ListEmptyComponent={
                    <View style={{ justifyContent: "center", alignItems: "center", height: "50%" }}>
                        <Text>No transactions found</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingLeft: 40,
    },
    searchIcon: {
        position: 'absolute',
        left: 25,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    filterButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    activeFilter: {
        backgroundColor: '#E0F0FF',
        borderColor: '#007AFF',
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
        fontSize: 16,
        fontWeight: 'bold',
    },
});