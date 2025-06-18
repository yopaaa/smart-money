import SimpleHeader from '@/components/SimpleHeader';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { FOLDER_PATH } from './TakePhoto';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 30) / 2;

const GalleryScreen = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setLoading(true);

            // Cek apakah direktori ada
            const dirInfo = await FileSystem.getInfoAsync(FOLDER_PATH);
            if (!dirInfo.exists) {
                console.log('Direktori tidak ditemukan');
                setImages([]);
                setLoading(false);
                return;
            }

            // Baca semua file dalam direktori
            const files = await FileSystem.readDirectoryAsync(FOLDER_PATH);

            // Filter hanya file gambar
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
            const imageFiles = files.filter(file =>
                imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
            );

            // Buat array objek gambar dengan informasi lengkap
            const imageData = await Promise.all(
                imageFiles.map(async (fileName) => {
                    const filePath = `${FOLDER_PATH}/${fileName}`;
                    const fileInfo = await FileSystem.getInfoAsync(filePath);

                    return {
                        id: fileName,
                        name: fileName,
                        uri: filePath,
                        size: fileInfo.size,
                        modificationTime: fileInfo.modificationTime,
                    };
                })
            );

            // Urutkan berdasarkan waktu modifikasi (terbaru dulu)
            imageData.sort((a, b) => b.modificationTime - a.modificationTime);

            setImages(imageData);
        } catch (error) {
            console.error('Error loading images:', error);
            Alert.alert('Error', 'Gagal memuat gambar');
        } finally {
            setLoading(false);
        }
    };

    const deleteImage = async (imageItem) => {
        Alert.alert(
            'Hapus Gambar',
            `Apakah Anda yakin ingin menghapus "${imageItem.name}"?`,
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FileSystem.deleteAsync(imageItem.uri);

                            // Update state untuk menghapus gambar dari list
                            setImages(prevImages =>
                                prevImages.filter(img => img.id !== imageItem.id)
                            );

                            Alert.alert('Sukses', 'Gambar berhasil dihapus');
                        } catch (error) {
                            console.error('Error deleting image:', error);
                            Alert.alert('Error', 'Gagal menghapus gambar');
                        }
                    },
                },
            ]
        );
    };

    const shareImage = async (imageItem) => {
        try {
            // Cek apakah sharing tersedia
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('Error', 'Sharing tidak tersedia di perangkat ini');
                return;
            }

            await Sharing.shareAsync(imageItem.uri, {
                mimeType: 'image/*',
                dialogTitle: `Bagikan ${imageItem.name}`,
            });
        } catch (error) {
            console.error('Error sharing image:', error);
            Alert.alert('Error', 'Gagal membagikan gambar');
        }
    };

    const openImageModal = (imageItem) => {
        setSelectedImage(imageItem);
        setModalVisible(true);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderImageItem = ({ item }) => (
        <View style={styles.imageContainer}>
            <TouchableOpacity
                style={styles.imageWrapper}
                onPress={() => openImageModal(item)}
            >
                <Image source={{ uri: item.uri }} style={styles.image} />
                <View style={styles.imageOverlay}>
                    <Text style={styles.imageName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.imageSize}>
                        {formatFileSize(item.size)}
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={() => shareImage(item)}
                >
                    <Ionicons name="share-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteImage(item)}
                >
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Memuat gambar...</Text>
            </View>
        );
    }

    if (images.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="images-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Tidak ada gambar ditemukan</Text>
                <Text style={styles.emptySubText}>
                    Pastikan ada file gambar di direktori SmartMoney
                </Text>
                <TouchableOpacity style={styles.refreshButton} onPress={loadImages}>
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SimpleHeader title={"Gallery SmartMoney"} />

            <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.flatListContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Modal untuk melihat gambar fullscreen */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackground}
                        onPress={() => setModalVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            {selectedImage && (
                                <>
                                    <Image
                                        source={{ uri: selectedImage.uri }}
                                        style={styles.modalImage}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.modalInfo}>
                                        <Text style={styles.modalTitle}>{selectedImage.name}</Text>
                                        <Text style={styles.modalSize}>
                                            {formatFileSize(selectedImage.size)}
                                        </Text>
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.shareButton]}
                                            onPress={() => {
                                                setModalVisible(false);
                                                shareImage(selectedImage);
                                            }}
                                        >
                                            <Ionicons name="share-outline" size={24} color="#fff" />
                                            <Text style={styles.modalButtonText}>Bagikan</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalButton, styles.deleteButton]}
                                            onPress={() => {
                                                setModalVisible(false);
                                                deleteImage(selectedImage);
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={24} color="#fff" />
                                            <Text style={styles.modalButtonText}>Hapus</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        paddingTop: StatusBar.currentHeight || 0
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    flatListContent: {
        padding: 10,
    },
    imageContainer: {
        flex: 1,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        backgroundColor: '#f0f0f0',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
    },
    imageName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    imageSize: {
        color: '#ccc',
        fontSize: 10,
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        borderRadius: 6,
        marginHorizontal: 2,
    },
    shareButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '500',
        marginTop: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    refreshButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '70%',
    },
    modalInfo: {
        marginTop: 20,
        alignItems: 'center',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalSize: {
        color: '#ccc',
        fontSize: 14,
        marginTop: 5,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 15,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default GalleryScreen;