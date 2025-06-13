import SimpleHeader from '@/components/SimpleHeader';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTransactions } from '../../TransactionContext';
import { convertTransactions, convertTransferFormat } from './convert';
import { assetGroups, getAssets, getTransactions } from './json_restore';
import ProgressModal from './ProgressModal';

const DB_PATH_MMBAK = `${FileSystem.documentDirectory}SQLite/money_manager.db`;

const BackupRestoreScreen = () => {
    const { addAccount, resetTables, addTransaction } = useTransactions();
    const [isRestoringMMBAK, setIsRestoringMMBAK] = useState(false);

    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let timer;
        if (visible && progress < 100) {
            timer = setInterval(() => {
                setProgress((prev) => Math.min(prev + 1, 100));
            }, 50);
        }
        if (progress === 99) {
            setVisible(false);
            Alert.alert('Sukses', 'Database berhasil direstore!\n\nSilakan restart aplikasi untuk memastikan semua data terupdate.', [
                {
                    text: 'OK',
                    onPress: () => {
                        refetchData()
                        router.replace("/")
                    }
                }
            ]);
        }
        return () => clearInterval(timer);
    }, [visible, progress]);


    async function fetchDb() {
        try {
            const newData = getAssets().map(val => ({
                "balance": 0,
                "description": "",
                "hidden": 0,
                "icon": assetGroups[val.groupUid].icon,
                "iconColor": assetGroups[val.groupUid].color,
                "id": val.uid,
                "isLiability": assetGroups[val.groupUid].isLiability ? 1 : 0,
                "name": val.NIC_NAME,
                "type": assetGroups[val.groupUid].key
            }));

            const transactions = convertTransferFormat(convertTransactions(getTransactions(), newData));

            // Return data yang akan digunakan
            return {
                accounts: newData,
                transactions: transactions
            };
        } catch (error) {
            console.error("Error in fetchDb:", error);
            throw error; // Reject promise secara otomatis
        }
    }

    async function transaksi() {
        try {
            setProgress(0);
            setVisible(true);

            const { accounts, transactions } = await fetchDb();
            resetTables();

            accounts.map(val => {
                addAccount(val)
            })

            transactions.map(val => {
                addTransaction(
                    {
                        title: val.title,
                        description: val.description,
                        amount: Number(val.amount),
                        type: val.type,
                        accountId: val.accountId,
                        targetAccountId: val.targetAccountId,
                        createdAt: Number(val.createdAt),
                        category: val.category,
                        fee: Number(val.fee)
                    }
                )
            })
        } catch (error) {
            console.error("Error in transaksi:", error);
        }
    }

    const handleRestoreMMBAK = async () => {
        Alert.alert(
            'Konfirmasi Restore',
            'Restore akan mengganti semua data yang ada. Apakah Anda yakin?',
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya, Restore', style: 'destructive', onPress: performRestoreMMBAK }
            ]
        );
    };

    const performRestoreMMBAK = async () => {
        setIsRestoringMMBAK(true);

        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: '*/*',
                multiple: false,
            });

            if (result.canceled) return;

            const pickedFile = result.assets[0];
            const pickedPath = pickedFile.uri;

            if (!pickedFile.name.endsWith('.mmbak')) {
                Alert.alert('Error', 'File harus berformat .mmbak');
                return;
            }

            const pickedInfo = await FileSystem.getInfoAsync(pickedPath);
            if (!pickedInfo.exists) {
                Alert.alert('Error', 'File tidak ditemukan');
                return;
            }

            const tempBackupPath = `${FileSystem.documentDirectory}temp_backup_${Date.now()}.db`;
            const currentDbExists = await FileSystem.getInfoAsync(DB_PATH_MMBAK);
            if (currentDbExists.exists) {
                await FileSystem.copyAsync({
                    from: DB_PATH_MMBAK,
                    to: tempBackupPath,
                });
            }

            await FileSystem.copyAsync({
                from: pickedPath,
                to: DB_PATH_MMBAK,
            });

            if (currentDbExists.exists) {
                await FileSystem.deleteAsync(tempBackupPath);
            }


            await transaksi()
        } catch (error) {
            console.error(error);
            Alert.alert('Gagal Restore', `Terjadi kesalahan: ${error.message}`);
        } finally {
            setIsRestoringMMBAK(false);
        }
    };


    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <SimpleHeader title="Pulihkan data dari file backup" />

            <ProgressModal visible={visible} progress={progress} />
            <View style={styles.content}>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cloud-download-outline" size={24} color="#FF6B6B" />
                        <Text style={styles.sectionTitle}>Restore from .mmbak file </Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Pulihkan data dari file backup (.mmbak). Ini akan mengganti semua data yang ada.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.restoreButton]}
                        onPress={handleRestoreMMBAK}
                        disabled={isRestoringMMBAK}
                    >
                        {isRestoringMMBAK ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                        )}
                        <Text style={styles.buttonText}>
                            {isRestoringMMBAK ? 'Melakukan Restore...' : 'Restore Data'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <Ionicons name="information-circle-outline" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        Backup file akan disimpan dengan format .smbak dan dapat dibagikan ke berbagai aplikasi penyimpanan cloud.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginLeft: 12,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 20,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        minHeight: 50,
    },
    backupButton: {
        backgroundColor: '#4A90E2',
    },
    restoreButton: {
        backgroundColor: '#FF6B6B',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginLeft: 10,
    },
});

export default BackupRestoreScreen;