import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    SafeAreaView,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useRouter } from 'expo-router';
import { useTransactions } from './TransactionContext';
import groupLabels from './groupLabels.json';

export default function AccountsScreen() {
    const { accounts } = useTransactions();
    const router = useRouter();

    const calculateSummary = () => {
        let assets = 0;
        let liabilities = 0;
        for (let acc of accounts) {            
            if (acc.hidden) continue; // skip akun tersembunyi
            if (acc.isLiability > 0) {
                liabilities -= acc.balance;
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
            groups[key].push(acc);
        }

        return groupLabels
            .filter(group => groups[group.key]) // hanya yang punya data
            .map(group => ({
                title: group.name,
                icon: group.icon,
                color: group.color,
                data: groups[group.key],
            }));
    };


    const { assets, liabilities, total } = calculateSummary();
    const grouped = groupAccounts();

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <View style={styles.headercontainer}>
                <Text style={styles.header}>Riwayat Transaksi</Text>
            </View>
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

            {/* <Text>
                {JSON.stringify(calculateSummary(), " ", " ")}
            </Text> */}

            <View>
                <SectionList
                    sections={grouped}
                    keyExtractor={(item) => item.id}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.groupTitle}>{title}</Text>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.item}>

                            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 20 }}>
                                <MaterialCommunityIcons name={item.icon} size={24} color={item.iconColor} />
                                <Text style={styles.accountName}>
                                    {item.name}
                                </Text>
                            </View>
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
            </View>

            <TouchableOpacity onPress={() => router.navigate("page/CreateAccountForm")} style={{ position: "relative" }}>
                <Text>Add account</Text>

            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        flexDirection: "column"
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
