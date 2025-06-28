import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import * as Sharing from 'expo-sharing';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionButton from '../../../components/ActionButton';

const { width } = Dimensions.get('window');

const ImageModal = ({
    visible,
    onClose,
    imageItem,
    onDeleteImage,
    enableDelete = true
}) => {
    if (!imageItem) return null;
    if (typeof imageItem == 'string') {
        imageItem = {
            "id": "transaksi.jpg",
            "modificationTime": 1750231168.2480001,
            "name": "transaksi.jpg",
            "size": null,
            "uri": imageItem
        }
    }

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
                            console.log('Error deleting image:', error);
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.fullScreenButton}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContent}>
                            <Image
                                source={{ uri: imageItem.uri }}
                                style={styles.modalImage}
                                contentFit="cover"
                            />
                            <View style={styles.modalInfo}>
                                <Text style={styles.modalTitle}>{imageItem.name}</Text>

                                {imageItem.size && <Text style={styles.modalSize}>
                                    {formatFileSize(imageItem.size)}
                                </Text>}
                            </View>

                            <View style={styles.modalActions}>
                                <ActionButton
                                    icon={{
                                        icon: "share",
                                        color: "#fff",
                                        size: 24
                                    }}
                                    title="Bagikan"
                                    backgroundColor="#007AFF"
                                    onPress={() => {
                                        onClose();
                                        shareImage(imageItem);
                                    }}
                                    style={[styles.modalButton]}
                                />

                                <ActionButton
                                    disabled={!enableDelete}
                                    icon={{
                                        icon: "trash-can-outline",
                                        color: "#fff",
                                        size: 24
                                    }}
                                    title="Hapus" backgroundColor="#FF3B30"
                                    style={[styles.modalButton]}
                                    onPress={() => {
                                        onClose();
                                        if (onDeleteImage) {
                                            onDeleteImage()
                                            return
                                        }
                                        deleteImage(imageItem);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    fullScreenButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        width: '100%',
        height: '100%',
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
        width: width - 20,
        height: width - 20,
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

export default ImageModal;