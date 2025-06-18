import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import {
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { formatCurrency } from '@/utils/number';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import ThreeDotMenu from '../../components/ThreeDots';
import { useTheme } from '../../hooks/ThemeContext';
import { useTransactions } from '../TransactionContext';

const TITLE = "Buckets And Balances"

// Komponen SummaryCard dimemoized
const SummaryCard = React.memo(({ title, value, isHideBalance }) => (
    <View style={styles.summaryCard}>
        <ThemedText style={styles.summaryLabel} type="description">{title}</ThemedText>
        <Text style={[
            styles.summaryValue,
            value > 0 ? styles.assetBalance : styles.liabilityBalance
        ]}>
            {isHideBalance ? (formatCurrency(value) || "0") : "*****"}
        </Text>
    </View>
));

// Komponen AccountItem dimemoized
const AccountItem = React.memo(({ item, isHideBalance, onPress }) => (
    <ThemedView style={styles.accountCard}>
        <TouchableOpacity
            style={styles.accountItem}
            onPress={onPress}
            activeOpacity={0.7}
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
                    <ThemedText style={styles.accountName}>{item.name}</ThemedText>
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
                <MaterialCommunityIcons name="chevron-right" size={24} color="#999" style={styles.arrow} />
            </View>
        </TouchableOpacity>
    </ThemedView>
));

// Komponen SectionHeader dimemoized
const SectionHeader = React.memo(({ title, balance, isHideBalance }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={[
            styles.sectionBalance,
            balance < 0 ? styles.liabilityBalance : styles.assetBalance
        ]}>
            {isHideBalance ? (formatCurrency(balance) || "0") : "*****"}
        </Text>
    </View>
));

export default function AccountsScreen() {
        const { theme } = useTheme();
    
    const router = useRouter();
    const { accounts, accountsGrouped, refetchData } = useTransactions();
    const [isRefreshing, setisRefreshing] = useState(false)
    const [isHideBalance, setisHideBalance] = useState(true)

    // Optimasi: Memoize handleRefresh untuk mencegah re-render
    const handleRefresh = useCallback(() => {
        refetchData()
        setisRefreshing(true)
        setTimeout(() => {
            setisRefreshing(false)
        }, 1000);
    }, [refetchData]);

    // Optimasi: Memoize perhitungan summary
    const summary = useMemo(() => {
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
    }, [accounts]);

    // Optimasi: Memoize toggle balance visibility
    const toggleBalanceVisibility = useCallback(() => {
        setisHideBalance(prev => !prev);
    }, []);

    // Optimasi: Memoize menu items
    const menuItems = useMemo(() => [
        { name: 'Add Bucket', fn: () => router.navigate("(home)/(accounts)/CreateAccountForm") },
        {
            name: 'Show/Hide', fn: () => {
                router.push({
                    pathname: '(home)/(accounts)/ShowAndHideAccount'
                });
            }
        },
        {
            name: 'Delete', fn: () => {
                router.push({
                    pathname: '(home)/(accounts)/DeleteAccount'
                });
            }
        },
        { name: 'Modify Orders', fn: () => router.navigate("(home)/(accounts)/ModifyOrderAccounts") },
    ], [router]);

    // Konversi data section menjadi flat list untuk FlashList
    const flattenedData = useMemo(() => {
        const data = [];
        accountsGrouped.forEach(section => {
            // Tambahkan header section
            data.push({
                type: 'header',
                id: `header-${section.title}`,
                title: section.title,
                balance: section.balance
            });
            // Tambahkan items dalam section
            section.data.forEach(item => {
                data.push({
                    type: 'item',
                    ...item
                });
            });
        });
        return data;
    }, [accountsGrouped]);

    // Optimasi: Memoize renderItem function untuk FlashList
    const renderItem = useCallback(({ item }) => {
        if (item.type === 'header') {
            return (
                <SectionHeader
                    title={item.title}
                    balance={item.balance}
                    isHideBalance={isHideBalance}
                />
            );
        }

        const handlePress = () => {
            router.push({
                pathname: '(home)/(transaction)/PerAccountsTransactions',
                params: {
                    id: item.id,
                    title: item.name
                }
            });
        };

        return (
            <AccountItem
                item={item}
                isHideBalance={isHideBalance}
                onPress={handlePress}
            />
        );
    }, [isHideBalance, router]);

    // Optimasi: Memoize keyExtractor untuk FlashList
    const keyExtractor = useCallback((item) => item.id, []);

    // Optimasi: getItemType untuk FlashList performance
    const getItemType = useCallback((item) => {
        return item.type === 'header' ? 'header' : 'item';
    }, []);

    // Estimasi tinggi item untuk FlashList
    const estimatedItemSize = 80;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>{TITLE}</ThemedText>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={toggleBalanceVisibility}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={isHideBalance ? "eye" : "eye-off"}
                            size={20}
                            color={isHideBalance ? "#2563EB" : "#EF4444"}
                        />
                    </TouchableOpacity>
                    <ThreeDotMenu
                        dotColor="#666"
                        menuItems={menuItems}
                    />
                </View>
            </View>

            {/* Summary Cards */}
            <View style={styles.summarySection}>
                <View style={styles.summaryGrid}>
                    <SummaryCard title="Assets" value={summary.assets} isHideBalance={isHideBalance} />
                    <SummaryCard title="Liabilities" value={summary.liabilities} isHideBalance={isHideBalance} />
                    <SummaryCard title="Total" value={summary.total} isHideBalance={isHideBalance} />
                </View>
            </View>

            {/* Accounts List dengan FlashList */}
            <View style={styles.content}>
                <FlashList
                    data={flattenedData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    getItemType={getItemType}
                    estimatedItemSize={estimatedItemSize}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    // FlashList specific optimizations
                    drawDistance={500}
                    overrideItemLayout={(layout, item) => {
                        // Berbeda tinggi untuk header dan item
                        if (item.type === 'header') {
                            layout.size = 60; // Tinggi header
                        } else {
                            layout.size = 80; // Tinggi item
                        }
                    }}
                    // Optimasi untuk performa
                    removeClippedSubviews={true}
                    disableAutoLayout={false}
                    // Footer component
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
    summarySection: {
        paddingHorizontal: 20,
        marginBottom: 10,
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
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: 'transparent',
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
        // backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
        marginHorizontal: 4,
        marginVertical: 2,
        borderRadius: 12,
        // backgroundColor: '#f8f9fa',
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