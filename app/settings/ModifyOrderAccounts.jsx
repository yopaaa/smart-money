import SimpleHeader from '@/components/SimpleHeader';
import { formatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ThreeDotMenu from '../../components/ThreeDots';
import { useTransactions } from '../TransactionContext';

function AlertComponent({ text = "any" }) {
    return (
        <View style={{
            margin: 16,
            backgroundColor: '#f0f8ff',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: '#007AFF',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
        }}>
            <MaterialCommunityIcons name="information" size={20} color="#007AFF" />
            <Text style={{
                fontSize: 14,
                color: '#007AFF',
                flex: 1
            }}>
                {text}
            </Text>
        </View>
    )
}

export default function ModifyOrderScreen() {
    const router = useRouter();
    const [showList, setShowList] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const { accountsGrouped, refetchData, saveSetting } = useTransactions();
    const [data, setData] = useState(accountsGrouped);

    const replaceAccountData = (groupTitle, newData) => {
        setData(prevGroups =>
            prevGroups.map(group =>
                group.title === groupTitle ? { ...group, data: newData } : group
            )
        );
    };

    const handleSave = () => {
        Alert.alert('Save Changes', 'Are you sure you want to save the new order?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Save',
                onPress: async () => {
                    try {
                        await saveSetting("@modified_account_order", data)
                        refetchData()
                        router.back();
                    } catch (e) {
                        console.error('Failed to save order:', e);
                        Alert.alert('Error', 'Failed to save the new order.');
                    }
                }
            }
        ]);
    };

    const handleReset = () => {
        Alert.alert('Reset Order', 'Reset to original order?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                onPress: () => {
                    setData(initialGroupedAccounts);
                    setIsModified(false);
                }
            }
        ]);
    };

    const renderItem = ({ item, drag, isActive }) => (
        <View style={{ flexDirection: 'row', backgroundColor: isActive ? '#f8f9fa' : '', padding: 10, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
                <MaterialCommunityIcons
                    name={item.icon || 'wallet'}
                    size={20}
                    color={item.iconColor || '#333'}
                    style={{ marginRight: 10 }}
                />
                <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <Text
                    style={[
                        styles.accountBalance,
                        item.balance < 0 ? styles.liabilityBalance : styles.assetBalance
                    ]}>
                    {formatCurrency(item.balance) || 0}
                </Text>
                <TouchableOpacity onLongPress={drag}>
                    <MaterialCommunityIcons name="dots-grid" size={20} color="#90a4ae" style={{ marginRight: 10 }} />
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <GestureHandlerRootView>
            <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
                <SimpleHeader
                    title={"Modify Account Order"}
                    style={{ paddingHorizontal: 15 }}
                    rightComponent={<ThreeDotMenu
                        dotColor="black"
                        menuItems={[
                            {
                                name: 'Reset Ordered', fn: async () => {
                                    setData(accountsGrouped)
                                }
                            }
                        ]}
                    />} />


                <AlertComponent text='Hold and drag the ⋮⋮⋮ handle up/down to reorder' />

                <DraggableFlatList
                    style={{ padding: 16 }}
                    data={data}
                    keyExtractor={item => `${item.title}-${item.balance}`}
                    onDragEnd={({ data }) => {
                        setData(data);
                        setIsModified(true);
                    }}
                    renderItem={({ item, drag }) => {
                        const { title, balance, icon, color } = item;
                        return (
                            <View>
                                <TouchableOpacity
                                    style={styles.sectionHeader}
                                    onPress={() => setShowList(showList === title ? null : title)}>
                                    <View style={styles.sectionTitleContainer}>
                                        <TouchableOpacity onLongPress={drag}>
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

                                {showList === title && (
                                    <DraggableFlatList
                                        data={item.data}
                                        keyExtractor={item => item.id}
                                        onDragEnd={({ data }) => {
                                            replaceAccountData(title, data);
                                            setIsModified(true);
                                        }}
                                        renderItem={renderItem}
                                    />
                                )}
                            </View>
                        );
                    }}
                />

                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.resetButton]}
                        onPress={handleReset}>
                        <MaterialCommunityIcons name="restore" size={20} color="#FF3B30" />
                        <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Reset</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.saveButton, !isModified && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={!isModified}>
                        <MaterialCommunityIcons name="content-save" size={20} color={isModified ? 'white' : '#ccc'} />
                        <Text style={[styles.actionButtonText, { color: isModified ? 'white' : '#ccc' }]}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        // padding: 16,
        flex: 1
    },
    headerContainer: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold'
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
    bottomActions: {
        padding: 16,
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 12
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8
    },
    resetButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#FF3B30'
    },
    saveButton: {
        backgroundColor: '#007AFF'
    },
    disabledButton: {
        backgroundColor: '#f8f9fa',
        borderColor: '#e9ecef'
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600'
    }
});
