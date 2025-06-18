import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { zip } from 'react-native-zip-archive';

const compressFolderToZip = async (folderPath, outputZipName = 'backup.zip') => {
  try {
    // Hapus trailing slash jika ada
    if (folderPath.endsWith('/')) {
      folderPath = folderPath.slice(0, -1);
    }

    const zipTargetPath = `${FileSystem.documentDirectory}${outputZipName}`;

    // Kompres folder
    const zipPath = await zip(folderPath, zipTargetPath);
    console.log('✅ ZIP berhasil dibuat:', zipPath);

    // Cek apakah sharing tersedia
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      throw new Error('Sharing tidak tersedia di perangkat ini');
    }

    // Bagikan ZIP file
    await Sharing.shareAsync(zipPath, {
      mimeType: 'application/zip',
      dialogTitle: 'Bagikan file backup ZIP',
    });

    return zipPath;
  } catch (error) {
    console.error('❌ Gagal kompres & share ZIP:', error);
    throw error;
  }
};


export default compressFolderToZip