import SimpleHeader from '@/components/SimpleHeader';
import ThreeDotMenu from '@/components/ThreeDots';
import { useTransactions } from '@/hooks/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressModal from './ProgressModal';

const DB_NAME = 'smart_money';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}.db`;
const BACKUP_FOLDER_URI_KEY = 'backup_folder_uri';
const TITLE = "Backup & Restore"

const BackupRestoreScreen = () => {
    const router = useRouter();
    const { resetTables, refetchData } = useTransactions();

    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [alertText, setalertText] = useState('Database berhasil direstore!\n\nSilakan restart aplikasi untuk memastikan semua data terupdate.');

    useEffect(() => {
        let timer;
        if (visible && progress < 100) {
            timer = setInterval(() => {
                setProgress((prev) => Math.min(prev + 1, 100));
            }, 50);
        }
        return () => clearInterval(timer);
    }, [visible, progress]);

    useEffect(() => {
        if (progress === 99) {
            setVisible(false);
            Alert.alert('Sukses', alertText, [
                {
                    text: 'OK',
                    onPress: () => {
                        router.replace("/")
                        refetchData()
                    }
                }
            ]);
        }
    }, [progress])

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const exists = await FileSystem.getInfoAsync(DB_PATH);
            if (!exists.exists) {
                Alert.alert('Gagal', 'Database tidak ditemukan.');
                return;
            }

            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const backupName = `${DB_NAME}_backup_${dateStr}_${timeStr}.smbak`;
            const backupPath = `${FileSystem.documentDirectory}${backupName}`;

            await FileSystem.copyAsync({
                from: DB_PATH,
                to: backupPath,
            });

            const isAvailable = await Sharing.isAvailableAsync();

            if (Platform.OS === 'android') {
                let targetFolderUri = await AsyncStorage.getItem(BACKUP_FOLDER_URI_KEY);

                if (!targetFolderUri) {
                    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                    if (!permissions.granted) {
                        Alert.alert('Dibatalkan', 'Backup dibatalkan karena tidak ada folder yang dipilih.');
                        return;
                    }

                    targetFolderUri = permissions.directoryUri;
                    await AsyncStorage.setItem(BACKUP_FOLDER_URI_KEY, targetFolderUri);
                }

                const backupContent = await FileSystem.readAsStringAsync(backupPath, {
                    encoding: FileSystem.EncodingType.Base64
                });

                const fileUri = await StorageAccessFramework.createFileAsync(
                    targetFolderUri,
                    backupName,
                    'application/octet-stream'
                );

                await FileSystem.writeAsStringAsync(fileUri, backupContent, {
                    encoding: FileSystem.EncodingType.Base64
                });

                if (isAvailable) {
                    await Sharing.shareAsync(backupPath, {
                        dialogTitle: 'Pilih aplikasi untuk menyimpan backup',
                        mimeType: 'application/octet-stream',
                    });
                }

                await FileSystem.deleteAsync(backupPath);

                Alert.alert(
                    'Backup Berhasil',
                    `Backup disimpan ke folder yang telah dipilih sebelumnya`
                );
            } else if (Platform.OS === 'ios') {
                await Sharing.shareAsync(backupPath, {
                    dialogTitle: 'Pilih aplikasi untuk menyimpan backup',
                    mimeType: 'application/octet-stream',
                });

                Alert.alert(
                    'Backup Berhasil',
                    `File backup telah dibuat dengan nama: ${backupName}\n\nAnda dapat menyimpannya ke Files, iCloud Drive, atau aplikasi lain.`
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Gagal Backup', `Terjadi kesalahan: ${error.message}`);
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async () => {
        Alert.alert(
            'Konfirmasi Restore',
            'Restore akan mengganti semua data yang ada. Apakah Anda yakin?',
            [
                { text: 'Batal', style: 'cancel' },
                { text: 'Ya, Restore', style: 'destructive', onPress: performRestore }
            ]
        );
    };

    const performRestore = async () => {
        setIsRestoring(true);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: '*/*',
                multiple: false,
            });

            if (result.canceled) return;

            const pickedFile = result.assets[0];
            const pickedPath = pickedFile.uri;

            if (!pickedFile.name.endsWith('.smbak')) {
                Alert.alert('Error', 'File harus berformat .smbak');
                return;
            }

            const pickedInfo = await FileSystem.getInfoAsync(pickedPath);
            if (!pickedInfo.exists) {
                Alert.alert('Error', 'File tidak ditemukan');
                return;
            }

            const tempBackupPath = `${FileSystem.documentDirectory}temp_backup_${Date.now()}.db`;
            const currentDbExists = await FileSystem.getInfoAsync(DB_PATH);
            if (currentDbExists.exists) {
                await FileSystem.copyAsync({
                    from: DB_PATH,
                    to: tempBackupPath,
                });
            }

            await FileSystem.copyAsync({
                from: pickedPath,
                to: DB_PATH,
            });

            if (currentDbExists.exists) {
                await FileSystem.deleteAsync(tempBackupPath);
            }

            setalertText('Database berhasil direstore!\n\nSilakan restart aplikasi untuk memastikan semua data terupdate.')
            setProgress(0);
            setVisible(true);
        } catch (error) {
            console.error(error);
            Alert.alert('Gagal Restore', `Terjadi kesalahan: ${error.message}`);
        } finally {
            setIsRestoring(false);
        }
    };

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <SimpleHeader title={TITLE} rightComponent={
                <ThreeDotMenu
                    dotColor="black"
                    menuItems={[
                        { name: 'Restore from .mmbak file', fn: () => router.navigate("/MMBAK_Restore") },
                        {
                            name: 'Reset app data', fn: () => {
                                resetTables()
                                setalertText(" Data Aplikasi telah di reset sepenuhnya")
                                setProgress(0);
                                setVisible(true);
                            }
                        },
                    ]}
                />
            } />
            <ProgressModal visible={visible} progress={progress} />

            <View style={styles.content}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#4A90E2" />
                        <Text style={styles.sectionTitle}>Backup Database</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Simpan salinan data Anda ke penyimpanan pilihan (Google Drive, Dropbox, dll.)
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.backupButton]}
                        onPress={handleBackup}
                        disabled={isBackingUp}
                    >
                        {isBackingUp ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                        )}
                        <Text style={styles.buttonText}>
                            {isBackingUp ? 'Membuat Backup...' : 'Buat Backup'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cloud-download-outline" size={24} color="#FF6B6B" />
                        <Text style={styles.sectionTitle}>Restore Database</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Pulihkan data dari file backup (.smbak). Ini akan mengganti semua data yang ada.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.restoreButton]}
                        onPress={handleRestore}
                        disabled={isRestoring}
                    >
                        {isRestoring ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Ionicons name="cloud-download-outline" size={20} color="#fff" />
                        )}
                        <Text style={styles.buttonText}>
                            {isRestoring ? 'Melakukan Restore...' : 'Restore Data'}
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