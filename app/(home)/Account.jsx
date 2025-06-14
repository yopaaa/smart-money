import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    RefreshControl,
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

    const SummaryCard = ({ title, value }) => (
        <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{title}</Text>
            <Text style={[
                styles.summaryValue,
                value > 0 ? styles.assetBalance : styles.liabilityBalance
            ]}>
                {isHideBalance ? (formatCurrency(value) || "0") : "*****"}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{TITLE}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={() => setisHideBalance(!isHideBalance)}
                        style={styles.eyeButton}
                    >
                        <MaterialCommunityIcons
                            name={isHideBalance ? "eye" : "eye-off"}
                            size={20}
                            color={isHideBalance ? "#2563EB" : "#EF4444"}
                        />
                    </TouchableOpacity>
                    <ThreeDotMenu
                        dotColor="#666"
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
            </View>

            {/* Summary Cards */}
            <View style={styles.summarySection}>
                <View style={styles.summaryGrid}>
                    <SummaryCard title="Assets" value={assets} />
                    <SummaryCard title="Liabilities" value={liabilities} />
                    <SummaryCard title="Total" value={total} />
                </View>
            </View>

            {/* Accounts List */}
            <View style={styles.content}>
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
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                            <Text style={[
                                styles.sectionBalance,
                                balance < 0 ? styles.liabilityBalance : styles.assetBalance
                            ]}>
                                {isHideBalance ? (formatCurrency(balance) || "0") : "*****"}
                            </Text>
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <View style={styles.accountCard}>
                            <TouchableOpacity
                                style={styles.accountItem}
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
                                <View style={styles.accountLeft}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons
                                            name={item.icon}
                                            size={24}
                                            color={item.iconColor}
                                        />
                                    </View>
                                    <View style={styles.accountInfo}>
                                        <Text style={styles.accountName}>{item.name}</Text>
                                      
                                    </View>
                                </View>
                                <View style={styles.accountRight}>
                                    <Text style={[
                                        styles.accountBalance,
                                        item.hidden
                                            ? styles.hiddenBalance
                                            : item.isLiability || item.balance < 0
                                                ? styles.liabilityBalance
                                                : styles.assetBalance
                                    ]}>
                                        {isHideBalance ? (formatCurrency(item.balance) || "0") : "*****"}
                                    </Text>
                                    <MaterialCommunityIcons name="chevron-right" size={24} color="#999" style={styles.arrow}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListFooterComponent={<View style={{ height: 50 }} />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#F8F9FA',
        paddingTop: StatusBar.currentHeight || 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        // backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
        flex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    eyeButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
    },
    summaryGrid: {
        flexDirection: 'row',
        gap: 5,
    },
    summaryCard: {
        flex: 1,
        padding: 14,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 4,
        // marginTop: 20,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionBalance: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    accountCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
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
    accountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        
    },
    accountLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111',
        marginBottom: 2,
    },
    hiddenLabel: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    accountRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
    },
    accountBalance: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    arrow: {
        justifyContent: "center",
        color: '#CCC',
    },
    assetBalance: {
        color: '#2563EB',
    },
    liabilityBalance: {
        color: '#EF4444',
    },
    hiddenBalance: {
        color: '#999',
    },
});