import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { useRouter } from 'expo-router';
import CustomList from './CustomList';

const DeleteAccountScreen = () => {
    const router = useRouter();
    const { deleteAccount, accountsGrouped, refetchData, saveSetting } = useTransactions();
    const [data, setData] = useState(accountsGrouped);

    const handleDelete = (accountId, groupTitle) => {
        Alert.alert('Delete Account', 'Are you sure you want to delete this account?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteAccount(accountId);

                    // Perbarui SAVED_ACCOUNT_ORDER_NAME
                    const updatedGroups = data.map(group => {
                        if (group.title === groupTitle) {
                            return {
                                ...group,
                                data: group.data.filter(acc => acc.id !== accountId)
                            };
                        }
                        return group;
                    }).filter(group => group.data.length > 0); // hilangkan grup kosong

                    setData(updatedGroups);
                    refetchData()
                    await saveSetting("@modified_account_order", updatedGroups)
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: StatusBar.currentHeight || 0 }]}>
            <SimpleHeader title="Delete Account" style={{ paddingHorizontal: 15 }} />

            <CustomList
                data={data}
                groupTools={(data) => {
                    return (
                        <Text
                            style={[
                                styles.accountBalance,
                                data.balance < 0 ? styles.liabilityBalance : styles.assetBalance,
                            ]}
                        >
                            {formatCurrency(data.balance) || 0}
                        </Text>
                    );
                }}
                itemsTools={(data, groupTitle) => (
                    <>
                        <TouchableOpacity onPress={() => handleDelete(data.id, groupTitle)}>
                            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF3B30" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            router.push({
                                pathname: '(home)/(accounts)/EditAccount',
                                params: {
                                    id: data.id
                                }
                            });
                        }}>
                            <MaterialCommunityIcons name="pencil-outline" size={22} color="#007AFF" />
                        </TouchableOpacity>
                    </>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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