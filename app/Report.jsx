import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ErrorReportScreen = () => {
    const { title, description } = useLocalSearchParams();

    const [formData, setFormData] = useState({
        title: title || "erroe",
        description: description || "",
        email: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const { title, description, email } = formData;

        if (!title.trim()) {
            Alert.alert('Error', 'Judul error wajib diisi');
            return false;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'Deskripsi error wajib diisi');
            return false;
        }

        if (!email.trim()) {
            Alert.alert('Error', 'Email wajib diisi');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Format email tidak valid');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Simulasi pengiriman data
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Reset form
            setFormData({
                title: '',
                description: '',
                email: '',
            });

            setShowSuccessModal(true);
        } catch (error) {
            Alert.alert('Error', 'Gagal mengirim laporan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Form',
            'Apakah Anda yakin ingin mengosongkan semua field?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        setFormData({
                            title: '',
                            description: '',
                            email: '',
                        });
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Laporan Error</Text>
                    <Text style={styles.subtitle}>
                        Bantu kami memperbaiki aplikasi dengan melaporkan bug yang Anda temukan
                    </Text>
                </View>

                <View style={styles.form}>
                    {/* Judul Error */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Judul Error *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan judul singkat error"
                            value={formData.title}
                            onChangeText={(value) => handleInputChange('title', value)}
                            maxLength={100}
                        />
                        <Text style={styles.charCount}>{formData.title.length}/100</Text>
                    </View>

                    {/* Deskripsi Error */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Deskripsi Error *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Jelaskan error yang terjadi secara detail"
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text style={styles.charCount}>{formData.description.length}/500</Text>
                    </View>


                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Kontak *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="email@example.com"
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            maxLength={100}
                        />
                        <Text style={styles.charCount}>{formData.email.length}/100</Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.resetButton]}
                            onPress={handleReset}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Kirim Laporan</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Laporan Terkirim!</Text>
                        <Text style={styles.modalMessage}>
                            Terima kasih atas laporan Anda. Tim kami akan segera meninjau dan menindaklanjuti.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    form: {
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    resetButton: {
        backgroundColor: '#f1f3f4',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#007AFF',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 80,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
});

export default ErrorReportScreen;