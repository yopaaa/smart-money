import { useTransactions } from '@/hooks/TransactionContext';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Success() {
    const router = useRouter();
    const { refetchData } = useTransactions();

    const handleStart = () => {
        refetchData()
        router.replace('(home)'); // ganti dengan halaman utama aplikasi
    };

    return (
        <View style={styles.container}>
            {/* Ilustrasi */}
            <Image
                source={require('@/assets/illustrations/success.jpg')} // Ganti sesuai lokasi file
                style={styles.image}
                resizeMode="contain"
            />

            <Text style={styles.title}>Bucket Berhasil Dibuat</Text>
            <Text style={styles.subtitle}>Sekarang kamu siap untuk mulai mencatat keuanganmu!</Text>

            {/* Tombol */}
            <TouchableOpacity onPress={handleStart} style={styles.button}>
                <Text style={styles.buttonText}>Mulai Gunakan Aplikasi</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    image: {
        width: 350,
        height: 350,
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        paddingHorizontal: 30,
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
