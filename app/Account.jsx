import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    SectionList, StyleSheet,
    Text,
    View,
} from 'react-native';

// import 'react-native-get-random-values';
import { getAccounts, initDB } from '../utils/db';


// Dummy data akun
const dummyAccounts = [
    { id: '1', name: 'Dompet', balance: 150000, type: 'cash', isLiability: false, hidden: false },
    { id: '2', name: 'BCA', balance: 3200000, type: 'saving', isLiability: false, hidden: false },
    { id: '3', name: 'BRI', balance: 2200000, type: 'saving', isLiability: false, hidden: false },
    { id: '4', name: 'Kartu Kredit BCA', balance: 2000000, type: 'card', isLiability: true, hidden: false },
    { id: '5', name: 'Reksadana', balance: 1500000, type: 'invest', isLiability: false, hidden: false },
    { id: '6', name: 'Crypto', balance: 1500000, type: 'invest', isLiability: false, hidden: true },
    { id: '7', name: 'Pinjaman Teman', balance: 500000, type: 'liability', isLiability: true, hidden: false },
];

const groupLabels = {
    cash: 'Cash',
    card: 'Credit Card',
    debit: 'Debit Card',
    saving: 'Saving Account',
    invest: 'Investasi',
    liability: 'Liabilities',
    other: 'Lainnya',
};

export default function AccountsScreen() {
    const [accounts, setAccounts] = useState([]);

 

    useEffect(() => {
        initDB();
        loadAccounts()
    }, []);

    const loadAccounts = () => {
        const rows = getAccounts();
        setAccounts(rows);
    };


    // const loadAccounts = () => {
    //     // Ganti dengan load dari AsyncStorage jika perlu
    //     setAccounts(dummyAccounts);
    // };

    const calculateSummary = () => {
        let assets = 0;
        let liabilities = 0;
        for (let acc of accounts) {
            if (acc.hidden) continue; // skip akun tersembunyi
            if (acc.isLiability) {
                liabilities += acc.balance;
            } else {
                assets += acc.balance;
            }
        }
        return {
            assets,
            liabilities,
            total: assets - liabilities
        };
    };


    const groupAccounts = () => {
        const groups = {};
        for (let acc of accounts) {
            const key = acc.type || 'other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(acc); // tampilkan semua, termasuk hidden
        }

        return Object.keys(groups).map((type) => ({
            title: groupLabels[type] || type,
            data: groups[type],
        }));
    };


    const { assets, liabilities, total } = calculateSummary();
    const grouped = groupAccounts();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Akun</Text>

            <View style={styles.summary}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Assets</Text>
                    <Text style={styles.summaryValue}>Rp{assets.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Liabilities</Text>
                    <Text style={styles.summaryValue}>Rp{liabilities.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={styles.summaryValue}>Rp{total.toLocaleString()}</Text>
                </View>
            </View>

            <SectionList
                sections={grouped}
                keyExtractor={(item) => item.id}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.groupTitle}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.accountName}>{item.name}</Text>
                        <Text style={[
                            styles.accountBalance,
                            item.hidden
                                ? styles.hiddenBalance
                                : item.isLiability
                                    ? styles.liabilityBalance
                                    : styles.assetBalance
                        ]}>
                            Rp{item.balance.toLocaleString()}
                        </Text>

                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* <AccountForm onSuccess={(updated) => setAccounts(updated)} /> */}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    summaryBox: { alignItems: 'center' },
    summaryLabel: { fontSize: 14, color: '#555' },
    summaryValue: { fontSize: 16, fontWeight: 'bold' },

    groupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
        color: '#222'
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f2f2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8
    },
    accountName: { fontSize: 16 },
    accountBalance: { fontSize: 16, fontWeight: 'bold' }, assetBalance: {
        color: '#007AFF' // biru
    },
    liabilityBalance: {
        color: '#FF3B30' // merah
    },
    hiddenBalance: {
        color: '#888888' // abu-abu
    }

});
