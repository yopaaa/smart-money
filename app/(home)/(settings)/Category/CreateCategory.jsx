import colorOptions from '@/app/json/colorOptions.json';
import iconOptions from '@/app/json/iconOptions.json';
import CustomIconPickerGrid from '@/components/CustomIconPickerGrid';
import SimpleHeader from '@/components/SimpleHeader';
import { useTransactions } from '@/hooks/TransactionContext';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

const TransactionForm = () => {
  const { type, title } = useLocalSearchParams();
  const router = useNavigation();
  const { refetchData, categories, addCategory } = useTransactions();

  const [selectedName, setSelectedName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  const [selectedIconColor, setSelectedIconColor] = useState(colorOptions[0]);

  useEffect(() => {
    console.log("Create category form");
  }, []);

  const handleSubmit = () => {
    if (!selectedName.trim()) {
      Alert.alert('Error', 'Mohon isi semua data dengan benar');
      return;
    }
    
    const isNameExist = categories.some(
      category => category.name.toLowerCase() === selectedName.trim().toLowerCase()
    );

    if (isNameExist) {
      Alert.alert('Error', 'Nama akun sudah digunakan, silakan gunakan nama lain');
      return;
    }

    const categoryData = {
      name: selectedName.trim(),
      icon: selectedIcon.icon,
      color: selectedIconColor.color,
      type: type
    }

    try {
      addCategory(categoryData);
      refetchData();
      setSelectedIcon(iconOptions[0]);
      setSelectedIconColor(colorOptions[0]);
      router.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: StatusBar.currentHeight || 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SimpleHeader title={"Create " + title} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Input Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Tabungan, Bank dll"
              value={selectedName}
              placeholderTextColor={"black"}
              onChangeText={setSelectedName}
              autoFocus
            />
          </View>

          <View style={styles.iconColorContainer}>
            <CustomIconPickerGrid
              pickerStyle={styles.iconPicker}
              label="Pilih Ikon"
              selectedIcon={selectedIcon}
              onSelect={setSelectedIcon}
              options={iconOptions}
              iconColor={selectedIconColor.color}
            />

            <CustomIconPickerGrid
              pickerStyle={styles.iconPicker}
              label="Pilih Warna"
              selectedIcon={selectedIconColor}
              onSelect={setSelectedIconColor}
              options={colorOptions}
            />
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Tambah Transaksi"
              onPress={handleSubmit}
              color="#4CAF50"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 32
  },
  formContainer: {
    paddingHorizontal: 8,
    margin: 15
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  label: {
    width: 120,
    marginTop: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: "space-evenly",
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 16,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  iconColorContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    margin: 15
  },
  iconPicker: {
    height: 80,
    justifyContent: "space-around",
    width: 150
  },
  buttonContainer: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default TransactionForm;