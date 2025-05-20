import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getTransactions, initDB } from '../utils/db'; // fungsi baru, lihat bawah

const HomeScreen = () => {
    const [transactions, setTransactions] = useState([]);



    const fetchTransactions = () => {
        const txs = getTransactions();
        setTransactions(txs);
    };

    useEffect(() => {
        initDB()

        fetchTransactions();
    }, []);

    const renderItem = ({ item }) => {
        const isExpense = item.type === 'expense';
        const amountStyle = isExpense ? styles.expense : styles.income;

        return (
            <View style={styles.item}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.date}>{moment(item.createdAt).format('DD MMM YYYY')}</Text>
                </View>
                <Text style={[styles.amount, amountStyle]}>
                    {isExpense ? '-' : '+'}Rp {Math.abs(item.amount).toLocaleString('id-ID')}
                </Text>


            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Riwayat Transaksi</Text>
            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text>Belum ada transaksi</Text>}
            />

            {/* <TransactionForm onSuccess={fetchTransactions} /> */}

        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        flexDirection: "column"
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
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
