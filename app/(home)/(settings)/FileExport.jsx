import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import RNHTMLtoPDF from 'react-native-html-to-pdf';

import { zip } from 'react-native-zip-archive';
import { FOLDER_NAME, FOLDER_PATH } from '../(root)/GalleryScreen';
import { getBackupPath } from '../../(backup)/_index';

export const backupFolderToZip = async () => {
    try {
        const folderInfo = await FileSystem.getInfoAsync(FOLDER_PATH);
        if (!folderInfo.exists) {
            console.log('Folder tidak ditemukan:', FOLDER_PATH);
            return null;
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const zipFileName = `${FOLDER_NAME}${dateStr}.zip`;
        const zipOutputPath = `${FileSystem.documentDirectory}${zipFileName}`; // JANGAN di dalam FOLDER_PATH

        const contents = await FileSystem.readDirectoryAsync(FOLDER_PATH);
        console.log('Isi folder:', contents);

        if (contents.length === 0) {
            throw new Error('Folder kosong, tidak bisa di-zip');
        }


        const sourcePath = FOLDER_PATH.replace('file://', '');
        const outputPath = zipOutputPath.replace('file://', '');

        const zipResult = await zip(sourcePath, outputPath);

        console.log('ZIP berhasil disimpan di:', zipResult);

        return zipResult.startsWith('file://') ? zipResult : `file://${zipResult}`;
    } catch (error) {
        console.error('Gagal membuat ZIP:', error);
        return null;
    }
};

export async function generatePdf(transactions) {
    const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>Laporan Keuangan</h1>
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td>${tx.date}</td>
                <td>${tx.type}</td>
                <td>${tx.category}</td>
                <td>${tx.amount}</td>
                <td>${tx.note || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

    const file = await RNHTMLtoPDF.convert({
        html,
        fileName: 'laporan_keuangan',
        directory: 'Documents',
    });

    return file.filePath;
}

const ExportScreen = () => {
    const { transactions, getTransactions } = useTransactions();
    const [loading, setLoading] = useState('');

    const exportCSV = async () => {
        setLoading('csv');
        try {
            const csvHeader = 'Date,Type,Category,Amount,Note\n';

            const csvRows = getTransactions().map(tx =>
                `${tx.date},${tx.type},${tx.category},${tx.amount},${tx.note || ''}`
            ).join('\n');

            const content = csvHeader + csvRows;
            const fileUri = FileSystem.documentDirectory + 'exported_data.csv';
            console.log(fileUri);

            await FileSystem.writeAsStringAsync(fileUri, content);

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Bagikan file CSV',
            });
        } catch (e) {
            Alert.alert('Gagal', `Gagal mengekspor CSV: ${e.message}`);
        } finally {
            setLoading('');
        }
    };

    const exportExcel = async () => {
        setLoading('excel');
        try {
            const content = `Tanggal\tTipe\tKategori\tJumlah\tCatatan\n` +
                getTransactions().map(tx =>
                    `${tx.date}\t${tx.type}\t${tx.category}\t${tx.amount}\t${tx.note || ''}`
                ).join('\n');

            const fileUri = FileSystem.documentDirectory + 'exported_data.xls';
            await FileSystem.writeAsStringAsync(fileUri, content);

            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/vnd.ms-excel',
                dialogTitle: 'Bagikan file Excel',
            });
        } catch (e) {
            Alert.alert('Gagal', `Gagal mengekspor Excel: ${e.message}`);
        } finally {
            setLoading('');
        }
    };

    const exportPDF = async () => {
        setLoading('pdf');
        try {
            const uri = await generatePdf(getTransactions());
            console.log(uri);

            await Sharing.shareAsync("file://" + uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Bagikan Laporan PDF',
            });
        } catch (e) {
            Alert.alert('Gagal', `Gagal membuat PDF: ${e.message}`);
        } finally {
            setLoading('');
        }
    };

    const exportZIP = async () => {
        try {
            const uri = await backupFolderToZip();

            if (!uri) return null

            const backupUrl = await getBackupPath();

            const base64Content = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const fileName = uri.split('/').pop() || 'backup.zip';
            const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                backupUrl,
                fileName,
                'application/zip'
            );

            await FileSystem.writeAsStringAsync(newFileUri, base64Content, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/zip',
                dialogTitle: 'Bagikan file ZIP',
            });

            await FileSystem.deleteAsync(uri);
        } catch (e) {
            Alert.alert('Gagal', `Gagal membuat ZIP: ${e.message}`);
            console.error(e);
        }
    };


    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <SimpleHeader title="Export Data" />
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="download-outline" size={24} color="#27AE60" />
                        <Text style={styles.sectionTitle}>Export ke CSV</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        File CSV dapat dibuka di Excel, Google Sheets, dan lainnya.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#27AE60' }]}
                        onPress={exportCSV}
                        disabled={loading !== ''}
                    >
                        {loading === 'csv' ? <ActivityIndicator color="#fff" /> : <Ionicons name="document-text-outline" size={20} color="#fff" />}
                        <Text style={styles.buttonText}>Export ke CSV</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="download-outline" size={24} color="#2980B9" />
                        <Text style={styles.sectionTitle}>Export ke Excel</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Format Excel sederhana (.xls).
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#2980B9' }]}
                        onPress={exportExcel}
                        disabled={loading !== ''}
                    >
                        {loading === 'excel' ? <ActivityIndicator color="#fff" /> : <Ionicons name="document-outline" size={20} color="#fff" />}
                        <Text style={styles.buttonText}>Export ke Excel</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document" size={24} color="#8E44AD" />
                        <Text style={styles.sectionTitle}>Laporan Keuangan (PDF)</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Laporan ringkas dalam format teks sebagai placeholder PDF.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#8E44AD' }]}
                        onPress={exportPDF}
                        disabled={loading !== ''}
                    >
                        {loading === 'pdf' ? <ActivityIndicator color="#fff" /> : <Ionicons name="print-outline" size={20} color="#fff" />}
                        <Text style={styles.buttonText}>Export PDF</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="file-tray-full-outline" size={24} color="#fbc02d" />
                        <Text style={styles.sectionTitle}>Backup Gambar (Image)</Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Ekspor semua gambar yang tersedia ke dalam file ZIP.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#fbc02d' }]}
                        onPress={exportZIP}
                        disabled={loading !== ''}
                    >
                        {loading === 'pdf' ? <ActivityIndicator color="#fff" /> : <Ionicons name="print-outline" size={20} color="#fff" />}
                        <Text style={styles.buttonText}>Export Zip</Text>
                    </TouchableOpacity>
                </View>

                <View style={{marginBottom: 200}}/>
            </ScrollView>
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
        shadowOffset: { width: 0, height: 2 },
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
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default ExportScreen;
