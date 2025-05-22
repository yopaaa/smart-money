import moment from 'moment';
import { useEffect, useMemo } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTransactions } from './TransactionContext';

export default function HomeScreen() {
    const { transactions } = useTransactions();

    useEffect(() => {
        console.log("transaction page");
    }, []);

    // Kelompokkan transaksi berdasarkan tanggal (format: 'DD MMMM')
    const groupedTransactions = useMemo(() => {
        const groups = {};

        transactions.forEach((item) => {
            const mDate = moment(Number(item.createdAt)).startOf('day');
            const now = moment().startOf('day');
            const diff = now.diff(mDate, 'days');

            let dateKey = '';

            if (diff === 0) dateKey = 'Today';
            else if (diff === 1) dateKey = 'Yesterday';
            else dateKey = mDate.format('DD MMMM');

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(item);
        });

        return Object.entries(groups)
            .map(([date, data]) => ({ date, data }))
            .sort((a, b) => {
                const parseDate = (label) => {
                    if (label === 'Today') return moment();
                    if (label === 'Yesterday') return moment().subtract(1, 'day');
                    return moment(label, 'DD MMMM');
                };
                return parseDate(b.date).toDate() - parseDate(a.date).toDate();
            });
    }, [transactions]);


    const renderTransactionItem = ({ item }) => {
        const isExpense = item.type === 'expense' || item.type === 'transfer';
        const amountStyle = isExpense ? styles.expense : styles.income;

        return (
            <View style={styles.item}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => Alert.alert("Data", JSON.stringify(item, "", " "))}>

                        <Text style={styles.title}>{item.title}</Text>
                    </TouchableOpacity>
                    <Text style={styles.date}>
                        {moment().diff(moment(Number(item.createdAt)), 'days') > 3
                            ? moment(Number(item.createdAt)).format('HH:mm, DD MMM YYYY')
                            : moment(Number(item.createdAt)).fromNow()}
                    </Text>
                </View>
                <Text style={[styles.amount, amountStyle]}>
                    {isExpense ? '-' : '+'}Rp {Math.abs(item.amount).toLocaleString('id-ID')}
                </Text>
            </View>
        );
    };

    const renderGroup = ({ item }) => {
        return (
            <View>
                {/* Header tanggal */}
                <Text style={styles.groupHeader}>{item.date}</Text>
                {/* Daftar transaksi per tanggal */}
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
            <View style={styles.headercontainer}>
                <Text style={styles.header}>Riwayat Transaksi</Text>
            </View>

            <FlatList
                //   style={{marginBottom: 100}}
                data={groupedTransactions}
                keyExtractor={(item) => item.date}
                renderItem={renderGroup}
                ListEmptyComponent={<Text>Belum ada transaksi</Text>}
                showsVerticalScrollIndicator={false}  // <--- ini baris penting
                ListFooterComponent={<View style={{ margin: 100, justifyContent: "center" }} />}
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
    headercontainer: {
        height: 60,
        justifyContent: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    groupHeader: {
        borderBottomColor: "black",
        borderBottomWidth: 1,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        padding: 10
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
});
