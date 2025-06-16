import appJson from '@/app.json';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AppInfoScreen() {
  const info = appJson.expo;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="information-outline" size={48} color="#4F46E5" />
        <Text style={styles.title}>Informasi Aplikasi</Text>
        <Text style={styles.subtitle}>Versi: {info.version}</Text>
      </View>

      <View style={styles.card}>
        <InfoItem label="Nama Aplikasi" value={info.name} />
        <InfoItem label="Slug" value={info.slug} />
        <InfoItem label="Orientasi" value={info.orientation} />
        {/* <InfoItem label="UI Style" value={info.userInterfaceStyle} /> */}
        {/* <InfoItem label="Platform" value={info.platforms?.join(', ')} /> */}
      </View>

      <Text style={styles.footer}>© 2025 {info.name}</Text>
    </ScrollView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: "center",
    backgroundColor: '#F9FAFB',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    gap: 16,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  label: {
    color: '#6B7280',
    fontSize: 14,
  },
  value: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: '#9CA3AF',
  },
});
