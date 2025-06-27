// CameraComponent.js - Optimized
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
export const FOLDER_NAME = 'SmartMoney';
export const FOLDER_PATH = `${FileSystem.documentDirectory}${FOLDER_NAME}/`;

// Custom Hooks
const useTempPhotoStorage = () => {
  const saveTempPhoto = useCallback(async (photoUri) => {
    if (!photoUri) return null;
    try {
      const filename = `temp_photo_${Date.now()}.jpg`;
      const tempPath = FileSystem.cacheDirectory + filename;
      await FileSystem.copyAsync({ from: photoUri, to: tempPath });
      return tempPath;
    } catch (error) {
      console.error('Error saving temp photo:', error);
      return null;
    }
  }, []);

  const deleteTempPhoto = useCallback(async (tempUri) => {
    if (!tempUri) return;
    try {
      const fileInfo = await FileSystem.getInfoAsync(tempUri);
      if (fileInfo.exists) await FileSystem.deleteAsync(tempUri);
    } catch (error) {
      console.error('Error deleting temp photo:', error);
    }
  }, []);

  return { saveTempPhoto, deleteTempPhoto };
};

const usePhotoSaver = () => {
  const savePhoto = useCallback(async (photoUri) => {
    if (!photoUri) return false;
    try {
      const filename = `transaksi_${Date.now()}.jpg`;
      await FileSystem.makeDirectoryAsync(FOLDER_PATH, { intermediates: true });
      const newPath = `${FOLDER_PATH}${filename}`;
      await FileSystem.copyAsync({ from: photoUri, to: newPath });
      return { success: true, filePath: newPath, filename };
    } catch (error) {
      console.error('Error saving final photo:', error);
      throw error;
    }
  }, []);

  return { savePhoto };
};

const useImagePicker = () => {
  const pickPhoto = useCallback(async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert('Izin Ditolak', 'Akses ke galeri dibutuhkan untuk memilih foto.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        aspect: [1, 1],
        quality: 0.9,
      });

      return result.canceled ? null : result.assets[0].uri;
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Gagal memilih foto.');
      return null;
    }
  }, []);

  return { pickPhoto };
};

// Main Component
const TakePhoto = ({
  onPhotoSelected,
  onPhotoRemoved,
  buttonStyle,
  buttonText,
  showTriggerButton = true,
  customTriggerButton,
  tempPhotoUri = null,
  onRenderPhotoPreviewPress
}) => {
  // Hooks
  const { pickPhoto } = useImagePicker();
  const { saveTempPhoto, deleteTempPhoto } = useTempPhotoStorage();

  // Handlers
  const handleOpenGallery = useCallback(async () => {
    const photoUri = await pickPhoto();
    console.log(photoUri);

    if (photoUri) {
      const tempUri = await saveTempPhoto(photoUri);
      if (tempUri) {
        if (tempPhotoUri) await deleteTempPhoto(tempPhotoUri);
        onPhotoSelected?.(tempUri);
      }
    }
  }, []);

  const handleOpenCamera = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        const tempUri = await saveTempPhoto(photoUri);
        if (tempUri) {
          if (tempPhotoUri) await deleteTempPhoto(tempPhotoUri);
          onPhotoSelected?.(tempUri);
        }
      }
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  }, []);

  const handleRemovePhoto = useCallback(async () => {
    if (tempPhotoUri) {
      await deleteTempPhoto(tempPhotoUri);
      onPhotoRemoved?.();
    }
  }, [tempPhotoUri, deleteTempPhoto, onPhotoRemoved]);

  // Render Functions
  const renderPhotoPreview = () => (
    <View style={styles.photoPreviewContainer}>
      <TouchableOpacity onPress={onRenderPhotoPreviewPress || null}>
        <Image source={{ uri: tempPhotoUri }} style={styles.previewImage} />
      </TouchableOpacity>
      <View style={styles.photoActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleOpenCamera}>
          <Ionicons name="camera" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Ganti</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={handleRemovePhoto}
        >
          <Ionicons name="trash" size={20} color="#E74C3C" />
          <Text style={[styles.actionButtonText, styles.removeButtonText]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCameraButton = () =>
    customTriggerButton ? (
      React.cloneElement(customTriggerButton, { onPress: handleOpenCamera })
    ) : (
      <View style={{ flexDirection: "row", gap: 10, }}>
        <TouchableOpacity
          style={[styles.cameraButton, buttonStyle]}
          onPress={handleOpenCamera}
        >
          <Ionicons name="camera" size={24} color="white" />
          {buttonText && <Text style={styles.cameraButtonText}>{buttonText}</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cameraButton, buttonStyle]}
          onPress={handleOpenGallery}
        >
          <Ionicons name="albums" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );

  return (
    <>
      {tempPhotoUri ? renderPhotoPreview() : showTriggerButton && renderCameraButton()}
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    width: 100,
    height: 100,
    borderRadius: 10,
    // marginBottom: 20,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  photoPreviewContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  previewImage: {
    height: width - 50,
    width: width - 50,
    borderRadius: 10,
    marginBottom: 10,
  },
  photoActions: {
    width: width - 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'white',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  removeButton: {
    borderColor: '#E74C3C',
  },
  removeButtonText: {
    color: '#E74C3C',
  },
});

export const useFormPhoto = () => {
  const [tempPhotoUri, setTempPhotoUri] = useState(null);
  const { savePhoto } = usePhotoSaver();
  const { deleteTempPhoto } = useTempPhotoStorage();

  const handlePhotoSelected = useCallback((uri) => setTempPhotoUri(uri), []);
  const handlePhotoRemoved = useCallback(() => setTempPhotoUri(null), []);

  const saveFinalPhoto = useCallback(async () => {
    if (!tempPhotoUri) return null;
    try {
      const finalUri = await savePhoto(tempPhotoUri);
      await deleteTempPhoto(tempPhotoUri);
      return finalUri;
    } catch (error) {
      console.error('Error saving final photo:', error);
      throw error;
    }
  }, [tempPhotoUri, savePhoto, deleteTempPhoto]);

  const cleanup = useCallback(async () => {
    if (tempPhotoUri) {
      await deleteTempPhoto(tempPhotoUri);
      setTempPhotoUri(null);
    }
  }, [tempPhotoUri, deleteTempPhoto]);

  return {
    tempPhotoUri,
    handlePhotoSelected,
    handlePhotoRemoved,
    saveFinalPhoto,
    cleanup,
    hasPhoto: !!tempPhotoUri,
  };
};

export default TakePhoto;