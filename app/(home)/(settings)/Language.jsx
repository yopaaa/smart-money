import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'th', name: 'ภาษาไทย (Thai)' },
];

export default function ChooseLanguageScreen() {
  const { saveSetting } = useTransactions();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsModalVisible(false);
  };

  const handleNext = () => {
    if (selectedLanguage) {
      saveSetting("@language", selectedLanguage);
      router.push("/");
    }
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(item)}
    >
      <Text style={styles.languageName}>{item.name}</Text>
      {selectedLanguage?.code === item.code && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
      <SimpleHeader title="Change Language" />

      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Choose Language</Text>
          <Text style={styles.subtitle}>Select the language you prefer.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Language</Text>

          <TouchableOpacity
            style={styles.selector}
            onPress={() => setIsModalVisible(true)}
          >
            {selectedLanguage ? (
              <Text style={styles.selected}>{selectedLanguage.name}</Text>
            ) : (
              <Text style={styles.placeholder}>Select language</Text>
            )}
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!selectedLanguage}
            style={[
              styles.button,
              selectedLanguage ? styles.buttonEnabled : styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Save Setting</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  selector: {
    backgroundColor: '#F2F2F2',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selected: {
    fontSize: 16,
    color: '#111',
  },
  placeholder: {
    fontSize: 16,
    color: '#A0A0A0',
  },
  arrow: {
    fontSize: 12,
    color: '#777',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#3B82F6',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#777',
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageName: {
    fontSize: 16,
    color: '#111',
  },
  checkmark: {
    fontSize: 18,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
