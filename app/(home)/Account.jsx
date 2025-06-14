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

import { formatCurrency } from '@/utils/number';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ThreeDotMenu from '../../components/ThreeDots';
import { useTransactions } from '../TransactionContext';

const TITLE = "Buckets And Balances"

export default function AccountsScreen() {
    const router = useRouter();
    const { accounts, accountsGrouped, refetchData } = useTransactions();
    const [isRefreshing, setisRefreshing] = useState(false)
    const [isHideBalance, setisHideBalance] = useState(true)

    const handleRefresh = () => {
        refetchData()
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

    const { assets, liabilities, total } = calculateSummary();

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <View style={styles.headercontainer}>
                <Text style={styles.header}>{TITLE}</Text>
                <View style={{ marginHorizontal: 20 }}></View>
                <TouchableOpacity onPress={() => setisHideBalance(!isHideBalance)} style={{ paddingHorizontal: 15 }}>
                    <MaterialCommunityIcons name={isHideBalance ? "eye" : "eye-off"} size={22} color={isHideBalance ? "green" : "brown"} />
                </TouchableOpacity>
                <ThreeDotMenu
                    dotColor="black"
                    menuItems={[
                        { name: 'Add Bucket', fn: () => router.navigate("transaction/CreateAccountForm") },
                        {
                            name: 'Show/Hide', fn: () => {
                                router.push({
                                    pathname: 'settings/ShowAndHideAccount'
                                });
                            }
                        },
                        {
                            name: 'Delete', fn: () => {
                                router.push({
                                    pathname: 'settings/DeleteAccount'
                                });
                            }
                        },
                        { name: 'Modify Orders', fn: () => router.navigate("settings/ModifyOrderAccounts") },
                    ]}
                />

            </View>

            <View style={styles.summary}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Assets</Text>
                    <Text style={[styles.summaryValue, assets >= 0 ? styles.assetBalance : styles.liabilityBalance]}>
                        {isHideBalance ? formatCurrency(assets) || 0 : "*****"}

                    </Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Liabilities</Text>
                    <Text style={[styles.summaryValue, styles.liabilityBalance]}>
                        {isHideBalance ? formatCurrency(liabilities) || 0 : "*****"}

                    </Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={[styles.summaryValue, total > 0 ? styles.assetBalance : styles.liabilityBalance]}>
                        {isHideBalance ? formatCurrency(total) || 0 : "*****"}
                    </Text>
                </View>
            </View>

            {/* <Text>
                {JSON.stringify(grouped, " ", " ")}
            </Text> */}

            <View>
                <SectionList
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                    initialNumToRender={3}
                    windowSize={10}
                    removeClippedSubviews={true}
                    scrollEnabled
                    sections={accountsGrouped}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    renderSectionHeader={({ section: { title, balance } }) => (
                        <View style={{
                            ...styles.item, padding: 0, margin: 0, paddingVertical: 18, borderBottomColor: "black",
                            borderBottomWidth: 1,
                        }}>

                            <Text style={styles.groupTitle}>{title}</Text>
                            <Text style={[
                                styles.accountBalance,
                                balance < 0
                                    ? styles.liabilityBalance
                                    : styles.assetBalance
                            ]}>
                                {isHideBalance ? formatCurrency(balance) || 0 : "*****"}
                            </Text>
                        </View>

                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.item, {
                            marginHorizontal: 4,
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
                            borderBottomWidth: 1,
                            padding: 15
                        }]}
                            onPress={() => {
                                router.push({
                                    pathname: 'transaction/PerAccountsTransactions',
                                    params: {
                                        id: item.id,
                                        title: item.name
                                    }
                                });

                            }}
                        >

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
                                    : item.isLiability || item.balance < 0
                                        ? styles.liabilityBalance
                                        : styles.assetBalance
                            ]}>
                                {isHideBalance ? formatCurrency(item.balance) || 0 : "*****"}
                            </Text>

                        </TouchableOpacity>
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
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
        // backgroundColor: '#f2f2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
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
