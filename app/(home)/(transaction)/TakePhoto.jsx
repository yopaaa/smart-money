// CameraComponent.js - Optimized
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  visible = false,
  onClose,
  onPhotoSelected,
  onPhotoRemoved,
  buttonStyle,
  buttonText,
  showTriggerButton = true,
  customTriggerButton,
  tempPhotoUri = null,
  onRenderPhotoPreviewPress
}) => {
  // Permissions and Refs
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // State
  const [showCamera, setShowCamera] = useState(visible);
  const [showReview, setShowReview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [currentPhotoUri, setCurrentPhotoUri] = useState(null);

  // Hooks
  const { pickPhoto } = useImagePicker();
  const { saveTempPhoto, deleteTempPhoto } = useTempPhotoStorage();

  // Effects
  useEffect(() => setShowCamera(visible), [visible]);
  useEffect(() => {
    if (showCamera) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showCamera, slideAnim]);

  // Handlers
  const handleOpenCamera = useCallback(async () => {
    if (!permission?.granted) await requestPermission();
    setShowCamera(true);
  }, [permission, requestPermission]);

  const handleCloseCamera = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCamera(false);
      slideAnim.setValue(Dimensions.get('window').height);
      onClose?.();
    });
  }, [slideAnim, onClose]);

  const handleTakePhoto = useCallback(async () => {
    if (!cameraRef.current) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      setCurrentPhotoUri(photo.uri);
      handleCloseCamera();
      setTimeout(() => setShowReview(true), 350);
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Gagal mengambil foto. Silakan coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  }, [handleCloseCamera]);

  const handleConfirmPhoto = useCallback(async () => {
    if (!currentPhotoUri) return;
    try {
      const tempUri = await saveTempPhoto(currentPhotoUri);
      if (tempUri) {
        if (tempPhotoUri) await deleteTempPhoto(tempPhotoUri);
        onPhotoSelected?.(tempUri);
        setShowReview(false);
        setCurrentPhotoUri(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan foto sementara.');
    }
  }, [currentPhotoUri, saveTempPhoto, onPhotoSelected, tempPhotoUri, deleteTempPhoto]);

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
      <TouchableOpacity
        style={[styles.cameraButton, buttonStyle]}
        onPress={handleOpenCamera}
      >
        <Ionicons name="camera" size={24} color="white" />
        {buttonText && <Text style={styles.cameraButtonText}>{buttonText}</Text>}
      </TouchableOpacity>
    );

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      {tempPhotoUri ? renderPhotoPreview() : showTriggerButton && renderCameraButton()}

      {/* Camera Modal */}
      <Modal visible={showCamera} transparent onRequestClose={handleCloseCamera}>
        <Animated.View style={[styles.cameraModal, { transform: [{ translateY: slideAnim }] }]}>
          <StatusBar barStyle="light-content" />
          <View style={styles.cameraContainer}>
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.topButton} onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
                <Ionicons name={flash === 'off' ? 'flash-off' : 'flash'} size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.modeIndicator}>
                <Text style={styles.modeText}>FOTO</Text>
              </View>
              <TouchableOpacity style={styles.topButton} onPress={handleCloseCamera}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <CameraView
              mirror={true}
              style={styles.camera}
              facing={facing}
              flash={flash}
              ref={cameraRef}
              ratio='1:1'
            >
              <View style={styles.focusArea}>
                <View style={styles.focusSquare} />
              </View>
            </CameraView>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.galleryButton} onPress={pickPhoto}>
                <Ionicons name="images-outline" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.captureButton, isCapturing && styles.capturingButton]}
                onPress={handleTakePhoto}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner}>
                  {isCapturing && <View style={styles.captureButtonProcessing} />}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.topButton} onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
                <Ionicons name="camera-reverse-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={showReview} transparent onRequestClose={() => setShowReview(false)}>
        <View style={styles.reviewContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.reviewHeader}>
            <TouchableOpacity style={styles.reviewHeaderButton} onPress={() => setShowReview(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.reviewHeaderTitle}>Preview Foto</Text>
            <View style={styles.reviewHeaderButton} />
          </View>

          <View style={styles.previewImageContainer}>
            {currentPhotoUri && (
              <Image source={{ uri: currentPhotoUri }} style={styles.fullPreviewImage} />
            )}
          </View>

          <View style={styles.reviewControls}>
            <TouchableOpacity style={styles.reviewButton} onPress={() => { setCurrentPhotoUri(null); setShowReview(false); setShowCamera(true); }}>
              <Ionicons name="camera-outline" size={24} color="#007AFF" />
              <Text style={styles.reviewButtonText}>Ambil Ulang</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPhoto}>
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.confirmButtonText}>Gunakan Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 20,
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
  cameraModal: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  modeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  focusArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusSquare: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 100,
    paddingHorizontal: 30,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    position: 'relative',
  },
  captureButtonProcessing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
  },
  capturingButton: {
    backgroundColor: '#007AFF',
  },
  reviewContainer: {
    flex: 1,
    backgroundColor: '#00000085',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reviewHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullPreviewImage: {
    width: width - 40,
    height: width - 40,
    borderRadius: 10,
  },
  reviewControls: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 200,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  reviewButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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