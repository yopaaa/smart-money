import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import moment from 'moment';
import { memo, useCallback, useMemo, useState } from 'react';
import {
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import TransactionFlashList from '../(transaction)/TransactionFlashList';

function SearchScreen() {
    const router = useRouter();
    const { filterTransactions, getCategoryById } = useTransactions();
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

    const filteredTransactions = useMemo(() => {
        const filteredData = filterTransactions({
            search: searchQuery,
            ...(selectedType && { type: selectedType }),
            ...(selectedCategory && { category: selectedCategory.name })
        });

        return !searchQuery ? filteredData.slice(0, 15) : filteredData;
    }, [searchQuery, selectedType, selectedCategory, updateTriggers]);

    const groupedTransactions = useMemo(() => {
        const groups = {};

        filteredTransactions.forEach((item) => {
            const mDate = moment(Number(item.createdAt)).startOf('day');
            const now = moment().startOf('day');
            const diff = now.diff(mDate, 'days');

            let dateKey = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : mDate.format('DD MMM YYYY');

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    data: [],
                    timestamp: mDate.valueOf(),
                    total: 0,
                };
            }

            groups[dateKey].data.push(item);

            const value = item.type === 'income' ? item.amount : item.type === 'expense' ? -item.amount : 0;

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
            <SimpleHeader title="Search Transactions" />

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

            <View style={styles.filterContainer}>
                {['income', 'expense', 'transfer'].map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.filterButton, selectedType === type && styles.activeFilter]}
                        onPress={() => setSelectedType(selectedType === type ? null : type)}
                    >
                        <Text>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

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
                />
            </View>

        </SafeAreaView>
    );
}

export default memo(SearchScreen);

const styles = StyleSheet.create({
    container: {
        // padding: 16,
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
        // marginBottom: 10,
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
        shadowOffset: { width: 0, height: 1 },
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
        padding: 10,
    },
    dateHeader: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
