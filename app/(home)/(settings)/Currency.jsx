import currencies from '@/app/json/currency.json';
import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { currencySetting, reloadCurrencySetting } from '@/utils/number';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AddAccountScreen() {
  const { addAccount, saveSetting } = useTransactions();

  const [selectedCurrency, setSelectedCurrency] = useState(currencySetting);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
    setIsModalVisible(false);
  };

  const handleNext = () => {
    if (selectedCurrency) {
      // console.log('Selected currency:', selectedCurrency);
      // handleChange("currency", selectedCurrency)
      saveSetting("@currency", selectedCurrency)
      reloadCurrencySetting()
      router.push("/")
    }
  };

  const renderCurrencyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.currencyItem}
      onPress={() => handleCurrencySelect(item)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.currencySymbol}>{item.symbol}</Text>
        <View>
          <Text style={styles.currencyName}>{item.name}</Text>
          <Text style={styles.currencyCode}>{item.code}</Text>
        </View>
      </View>
      {selectedCurrency?.code === item.code && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
      <SimpleHeader title={"Change Currency"} />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Currency</Text>
          <Text style={styles.subtitle}>Choose a currency for your account.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Currency</Text>

          {/* Currency Selector */}
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setIsModalVisible(true)}
          >
            {selectedCurrency ? (
              <View style={styles.selectedCurrency}>
                <Text style={styles.selectedSymbol}>{selectedCurrency.symbol}</Text>
                <View style={{flex: 1, alignItems: "center", flexDirection: "row", gap: 10}}>
                  <Text style={styles.selectedCode}>{selectedCurrency.currency}</Text>
                  <Text style={styles.selectedName}>{selectedCurrency.name}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.placeholder}>Select currency</Text>
            )}
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={!selectedCurrency}
            style={[
              styles.button,
              selectedCurrency ? styles.buttonEnabled : styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>Save Setting</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={currencies}
              renderItem={renderCurrencyItem}
              keyExtractor={(item) => item.currency}
              style={styles.currencyList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    // marginTop: 50,
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
  selectedCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginRight: 12,
    minWidth: 30,
  },
  selectedName: {
    textAlign: "center",
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  selectedCode: {
    fontSize: 16,
    color: '#777',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#777',
  },
  currencyList: {
    paddingHorizontal: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginRight: 16,
    minWidth: 30,
  },
  currencyName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  currencyCode: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#2563EB',
    fontWeight: 'bold',
  },
});