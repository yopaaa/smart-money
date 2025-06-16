import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

import { useTransactions } from '@/app/TransactionContext';
import SimpleHeader from '@/components/SimpleHeader';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const DeleteAccountScreen = () => {
    const router = useRouter();
    const { editAccount, accountsGrouped, refetchData, saveSetting } = useTransactions();
    const [data, setData] = useState(accountsGrouped);

    useEffect(() => {
        setData(accountsGrouped);
    }, [accountsGrouped]);

    const handleHide = async (accountId, groupTitle, isHidden) => {
        try {
            const updatedGroups = data.map(group => {
                if (group.title === groupTitle) {
                    return {
                        ...group,
                        data: group.data.map(acc =>
                            acc.id === accountId ? { ...acc, hidden: isHidden == 0 ? true : false } : acc
                        )
                    };
                }
                return group;
            });

            setData(updatedGroups);
            // Update hidden di database
            await editAccount(accountId, { hidden: isHidden == 0 ? true : false });
            await saveSetting("@modified_account_order", updatedGroups)
            refetchData()

            console.log(`Account ${accountId} marked as hidden.`);
        } catch (e) {
            console.error("Failed to hide account:", e);
            Alert.alert("Error", "Failed to hide the account.");
        }
    };


    const renderAccount = (account, groupTitle) => {
        // console.log(account);

        return (
            <View style={styles.accountRow}>
                <View style={styles.accountInfo}>
                    <MaterialCommunityIcons name={account.icon || 'wallet'} size={20} color={account.iconColor || '#333'} />
                    <Text style={styles.accountText}>{account.name}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 0 }}>
                    <TouchableOpacity
                        onPress={() => handleHide(account.id, groupTitle, account.hidden)}
                        style={{ paddingHorizontal: 15 }}>
                        <MaterialCommunityIcons name={account.hidden ? "eye-off" : "eye"} size={22} color={account.hidden ? "brown" : "green"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        router.push({
                            pathname: '(home)/(accounts)/EditAccount',
                            params: {
                                id: account.id
                            }
                        });
                    }}>
                        <MaterialCommunityIcons name="pencil-outline" size={22} color="#007AFF" />
                    </TouchableOpacity>
                </View>

            </View>
        )
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}>
            <SimpleHeader title="Show And Hide Settings" style={{ paddingHorizontal: 15 }} />

            <FlatList
                initialNumToRender={1}
                windowSize={10}
                removeClippedSubviews={true}
                data={data}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => {
                    const { title, balance, icon, color } = item;

                    return (<View style={styles.groupContainer}>
                        <TouchableOpacity
                            style={styles.sectionHeader}
                        // onPress={() => setShowList(showList === title ? null : title)}
                        >
                            <View style={styles.sectionTitleContainer}>
                                <TouchableOpacity>
                                    <MaterialCommunityIcons name="dots-grid" size={20} color="#90a4ae" style={{ marginRight: 10 }} />
                                </TouchableOpacity>
                                <MaterialCommunityIcons name={icon} size={20} color={color} />
                                <Text style={styles.groupTitle}>{title}</Text>
                            </View>
                            <Text
                                style={[
                                    styles.accountBalance,
                                    balance < 0 ? styles.liabilityBalance : styles.assetBalance
                                ]}>
                                {formatCurrency(balance) || 0}
                            </Text>
                        </TouchableOpacity>

                        {item.data.map(acc => (
                            <View key={acc.id}>
                                {renderAccount(acc, item.title)}
                            </View>
                        ))}
                    </View>)
                }
                }
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>No accounts available</Text>
                }
                contentContainerStyle={{ padding: 16 }}
                ListFooterComponent={
                    <View style={{ padding: 150 }}></View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    groupContainer: {
        marginBottom: 24
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    accountText: {
        fontSize: 15,
        color: '#222'
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 8
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222'
    },
    accountBalance: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 8
    },
    assetBalance: {
        color: '#007AFF'
    },
    liabilityBalance: {
        color: '#FF3B30'
    },
});

export default DeleteAccountScreen;
