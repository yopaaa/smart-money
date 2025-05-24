import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    RefreshControl,
    SafeAreaView,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { formatNumber } from '@/utils/number';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTransactions } from './TransactionContext';
import groupLabels from './groupLabels.json';

export default function AccountsScreen() {
    const { accounts, refetchTransactions } = useTransactions();
    const router = useRouter();

    const [isRefreshing, setisRefreshing] = useState(false)

    const handleRefresh = () => {
        refetchTransactions()
        setisRefreshing(true)
        setTimeout(() => {
            setisRefreshing(false)
        }, 1000);
    }

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

            if (!groups[key]) {
                groups[key] = {
                    balance: 0,
                    accounts: []
                };
            }

            groups[key].accounts.push(acc);
            if (acc.hidden === 0) {

                groups[key].balance += acc.balance;
            }
        }

        // console.log(JSON.stringify(groups," ", " "));

        return groupLabels
            .filter(group => groups[group.key]) // hanya yang ada datanya
            .map(group => ({
                title: group.name,
                icon: group.icon,
                color: group.color,
                balance: groups[group.key].balance,
                data: groups[group.key].accounts
            }));
    };


    const { assets, liabilities, total } = calculateSummary();
    const grouped = groupAccounts();

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <View style={styles.headercontainer}>
                <Text style={styles.header}>Accounts</Text>
            </View>
            <View style={styles.summary}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Assets</Text>
                    <Text style={[styles.summaryValue, styles.assetBalance]}>Rp{formatNumber(assets)}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Liabilities</Text>
                    <Text style={[styles.summaryValue, styles.liabilityBalance]}>Rp{formatNumber(liabilities) || 0}</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={[styles.summaryValue, total > 0 ? styles.assetBalance : styles.liabilityBalance]}>Rp{formatNumber(total)}</Text>
                </View>
            </View>

            {/* <Text>
                {JSON.stringify(grouped, " ", " ")}
            </Text> */}

            <TouchableOpacity onPress={() => router.navigate("page/CreateAccountForm")} style={{ position: "relative" }}>
                <Text>Add account</Text>

            </TouchableOpacity>

            <View style={{ flex: 1 }}>
                <SectionList
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                    style={{ flex: 1 }}
                    scrollEnabled
                    sections={grouped}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section: { title, balance } }) => (
                        <View style={{
                            ...styles.item, padding: 0, margin: 0, paddingVertical: 18, borderBottomColor: "black",
                            borderBottomWidth: 1
                        }}>

                            <Text style={styles.groupTitle}>{title}</Text>
                            <Text style={[
                                styles.accountBalance,
                                balance < 0
                                    ? styles.liabilityBalance
                                    : styles.assetBalance
                            ]}>
                                Rp{formatNumber(balance) || 0}
                            </Text>
                        </View>

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
                                Rp{formatNumber(item.balance) || 0}
                            </Text>

                        </View>
                    )}
                    ListFooterComponent={<View style={{ margin: 100, justifyContent: "center" }} />}
                />
            </View>



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
        // paddingBottom: 15,
        fontSize: 16,
        fontWeight: 'bold',
        // marginTop: 20,
        // marginBottom: 8,
        color: '#222'
    },
    item: {
        flexDirection: 'row',
        alignItems: "center",
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
