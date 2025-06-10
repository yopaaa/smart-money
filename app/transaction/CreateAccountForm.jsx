import CustomIconPickerGrid from '@/components/CustomIconPickerGrid';
import CustomPicker from '@/components/CustomPicker';
import SimpleHeader from '@/components/SimpleHeader';
import SwitchToggle from '@/components/SwitchToggle';
import { formatCurrency, unformatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import colorOptions from '../json/colorOptions.json';
import groupLabels from '../json/groupLabels.json';
import iconOptions from '../json/iconOptions.json';
import { useTransactions } from '../TransactionContext';

const TransactionForm = () => {
  const router = useNavigation();
  const { refetchData, addAccount, accounts, getCategoriesByType } = useTransactions();
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0]);
  const [selectedIconColor, setSelectedIconColor] = useState(colorOptions[0]);
  const [isVisible, setIsVisible] = useState(true);


  const [formData, setFormData] = useState({
    name: "",
    balance: 0,
    type: groupLabels[0],
    description: ""
  });

  useEffect(() => {
    console.log("Create account form")
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || isNaN(formData.balance)) {
      Alert.alert('Error', 'Mohon isi semua data dengan benar');
      return;
    }
    // Validasi nama unik (case insensitive)
    const isNameExist = accounts.some(
      account => account.name.toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (isNameExist) {
      Alert.alert('Error', 'Nama akun sudah digunakan, silakan gunakan nama lain');
      return;
    }

    const accountData = {
      name: formData.name.trim(),
      balance: formData.balance,
      type: formData.type.key,
      isLiability: formData.type.isLiability ? 1 : 0,
      hidden: isVisible ? 0 : 1,
      icon: selectedIcon.icon,
      iconColor: selectedIconColor.color,
      description: formData.description.trim()
    }

    try {
      addAccount(accountData)

      Alert.alert('Sukses', 'Transaksi berhasil ditambahkan');
      refetchData();


      // reset form
      setFormData({
        name: "",
        balance: 0,
        type: groupLabels[0],
        description: ""
      });
      setSelectedIcon(iconOptions[0])
      setSelectedIconColor(colorOptions[0])
      setIsVisible(true)

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
      <SimpleHeader title={"Buat Akun"} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>

          {/* Input Title */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nama Akun</Text>
            <TextInput
              style={styles.input}
              placeholder="Tabungan, Bank dll"
              value={formData.name}
              placeholderTextColor={"black"}
              onChangeText={(text) => handleChange('name', text)}
              autoFocus
            />
          </View>

          {/* Input Amount */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Jumlah</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="100.000"
              placeholderTextColor={"black"}
              value={formatCurrency(formData.balance)}
              onChangeText={(text) => handleChange('balance', unformatCurrency(text))}
            />
          </View>

          {/* Input Category */}
          <CustomPicker
            inputContainerStyle={styles.inputContainer}
            labelStyle={styles.label}
            pickerStyle={styles.picker}
            label="Kategori"
            selected={formData.type}
            onSelect={(val, index) => {
              handleChange('type', val)
              // console.log(index);
              setSelectedIcon(iconOptions[index])
              setSelectedIconColor(colorOptions[index])
            }}
            options={groupLabels}
            selectedComponent={(val) => {
              return (<>
                <MaterialCommunityIcons name={selectedIcon.icon} size={30} style={{ marginRight: 10 }} color={selectedIconColor.color} />
                <Text>{val.name}</Text>
              </>)
            }}
          />

          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around", margin: 15 }}>
            <CustomIconPickerGrid
              pickerStyle={{ height: 80, justifyContent: "space-around", width: 150 }}
              label="Pilih Ikon"
              selectedIcon={selectedIcon}
              onSelect={setSelectedIcon}
              options={iconOptions}
              iconColor={selectedIconColor.color}
            />

            <CustomIconPickerGrid
              pickerStyle={{ height: 80, justifyContent: "space-around", width: 150 }}
              label="Pilih Warna"
              selectedIcon={selectedIconColor}
              onSelect={setSelectedIconColor}
              options={colorOptions}
            />
          </View>

          {/* Visibility Option */}
          <View style={{ ...styles.inputContainer, paddingVertical: 15 }}>
            <Text style={{ ...styles.label, width: "80%", marginTop: 0 }}>Tampilkan Saldo Akun Ini ke Total</Text>
            <SwitchToggle
              value={isVisible}
              onValueChange={setIsVisible}
              activeColor="#34C759"
              inactiveColor="#E5E5EA"
              thumbColor="white"
              size="medium"
            />
          </View>

          {/* Description Input */}
          <Text style={{ ...styles.label, padding: 10 }}>Deskripsi</Text>
          <TextInput
            style={[styles.input, { height: 80, width: "100%" }]}
            placeholder="Tambahkan deskripsi (opsional)"
            multiline
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
          />

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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },

  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff'
  },
  saveButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  saveText: {
    color: '#007AFF',
    fontWeight: 'bold'
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15
  },
  tab: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  activeTab: {
    backgroundColor: '#E0F0FF',
    borderColor: '#007AFF'
  },
  tabText: {
    color: '#333',
    textTransform: 'capitalize'
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold'
  },
  scrollContainer: {
    paddingBottom: 32
  },
  formContainer: {
    paddingHorizontal: 8
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
    // width: 250,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: 250,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default TransactionForm;
