import ActionButton from '@/components/ActionButton';
import CustomPicker from '@/components/CustomPicker';
import SimpleHeader from '@/components/SimpleHeader';
import SlideSelect from '@/components/SlideSelect';
import { useTransactions } from '@/hooks/TransactionContext';
import { formatCurrency, unformatCurrency } from '@/utils/number';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import ChatInput from './ChatInput';
// import ImageModal from './ImageModal';
// import CameraComponent, { useFormPhoto } from './TakePhoto';

const TransactionForm = () => {
  const router = useRouter();
  const { id: copyDataId } = useLocalSearchParams();
  const { refetchData,
    accounts,
    addTransaction,
    getCategoriesByType,
    getTransactionById,
    getCategoryById,
    filterTransactions } = useTransactions();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [incomeCategories, setIncomeCategories] = useState();
  const [expenseCategories, setExpenseCategories] = useState();
  const [type, setType] = useState('keyboard');

  const [modalVisible, setModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'expense',
    accountId: '',
    targetAccountId: '',
    category: '',
    fee: '0',
    img: ""
  });

  useEffect(() => {
    if (copyDataId) {
      const tx = getTransactionById(copyDataId);
      if (tx) {
        let matchedCategory = getCategoryById(tx.category)
        console.log(matchedCategory);

        setFormData({
          title: tx.title,
          description: tx.description || "",
          amount: tx.amount,
          type: tx.type,
          accountId: accounts.find(acc => acc.id === tx.accountId) || accounts[0],
          targetAccountId: accounts.find(acc => acc.id === tx.targetAccountId) || "",
          category: matchedCategory,
          fee: tx.fee
        });
      } else {
        router.back();
      }
    }
  }, [copyDataId, accounts]);

  useEffect(() => {
    const tempX = getCategoriesByType("income")
    const tempY = getCategoriesByType("expense")
    setIncomeCategories(tempX)
    setExpenseCategories(tempY)

    if (!copyDataId) {
      formData.type === "income"
        ? handleChange('category', tempX[0])
        : handleChange('category', tempY[0])
    }

    setSelectedDate(new Date())
    setSelectedTime(new Date())

    if (accounts.length > 0 && !copyDataId) {
      setFormData(prev => ({
        ...prev,
        accountId: accounts[0],
        targetAccountId: accounts[1]
      }));
    }
  }, [accounts]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.amount || isNaN(formData.amount)) {
      Alert.alert('Error', 'Mohon isi semua data dengan benar');
      return;
    }
    if (!formData.accountId) {
      Alert.alert('Error', 'Pilih akun asal');
      return;
    }
    if (!formData.category && formData.type != 'transfer') {
      Alert.alert('Error', 'Pilih category');
      return;
    }
    if (formData.type === 'transfer' && formData.accountId === formData.targetAccountId) {
      Alert.alert('Error', 'Akun asal dan tujuan harus berbeda untuk transfer');
      return;
    }

    const mergedDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes(),
      selectedTime.getSeconds(),
      selectedTime.getMilliseconds(),
    );

    let finalPhotoUri = null;

    // Save foto hanya jika ada foto temporary
    if (hasPhoto) {
      finalPhotoUri = await saveFinalPhoto();
    }

    const transaction = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      amount: parseInt(formData.amount),
      type: formData.type,
      accountId: formData.accountId.id,
      targetAccountId: formData.type === 'transfer' ? formData.targetAccountId.id : undefined,
      createdAt: mergedDate.getTime(),
      category: formData.type === 'transfer' ? "52841730" : formData.category.id,
      fee: formData.type === 'transfer' ? parseInt(formData.fee || '0') : 0,
      img: finalPhotoUri.filename
    };

    try {
      // console.log(moment(mergedDate).format('MMMM Do YYYY, h:mm:ss a'));
      addTransaction(transaction);
      refetchData();

      // reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        type: 'expense',
        accountId: accounts[0],
        targetAccountId: accounts[0],
        category: '',
        fee: '0'
      });
      setSelectedDate(new Date())
      setSelectedTime(new Date())

      router.push("/");
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      await cleanup();
    }
  };

  useEffect(() => {
    if (searchQuery.length >= 3) {
      const tx = filterTransactions({
        search: searchQuery,
        limit: 1,
        type: formData.type
      })[0];

      try {
        let matchedCategory = getCategoryById(tx.category)
        handleChange('category', matchedCategory)
        handleChange('accountId', accounts.find(acc => acc.id === tx.accountId) || accounts[0])
      } catch (error) {
        console.log(tx);
        console.info(error);
      }
    }
  }, [searchQuery]);


  // const {
  //   tempPhotoUri,
  //   handlePhotoSelected,
  //   handlePhotoRemoved,
  //   saveFinalPhoto,
  //   cleanup,
  //   hasPhoto,
  // } = useFormPhoto();

  // const handleCancel = async () => {
  //   await cleanup();
  // };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingTop: StatusBar.currentHeight || 0 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SimpleHeader
        title={formData.type}
        rightComponent={
          <SlideSelect
            initial={type}
            onChange={(val) => setType(val)}
            options={[
              { key: 'keyboard', label: 'Keyboard', icon: 'keyboard' },
              { key: 'chat', label: 'Chat', icon: 'chat' },
            ]}
          />
        }
        // onBack={handleCancel}
      />

      {type == "chat" && <ChatInput />}


      {type == "keyboard" &&
        <>
          <View style={styles.tabContainer}>
            {['income', 'expense', 'transfer'].map(type => (
              <Pressable
                key={type}
                style={[styles.tab, formData.type === type && styles.activeTab]}
                onPress={() => {
                  handleChange('type', type)
                  type === "income"
                    ? handleChange('category', incomeCategories[0])
                    : handleChange('category', expenseCategories[0])
                }
                }
              >
                <Text style={[styles.tabText, formData.type === type && styles.activeTabText]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>

              {/* Input date */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Date</Text>
                <View style={styles.input}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={{ fontWeight: '800' }}>{selectedDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <Text style={{ fontWeight: '800' }}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setSelectedDate(date);
                    }}
                  />
                )}


                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={(event, time) => {
                      setShowTimePicker(false);
                      if (time) setSelectedTime(time);
                    }}
                  />
                )}
              </View>

              {/* Input Title */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Judul Transaksi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dinner, Gaji or Transfer"
                  // placeholderTextColor={"black"}
                  value={formData.title}
                  onChangeText={(text) => {
                    handleChange('title', text)
                    setSearchQuery(text)
                  }}
                  autoFocus
                />
              </View>

              {/* Input Amount */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Jumlah (Rp)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="100.000"
                  value={formatCurrency(formData.amount)}
                  onChangeText={(text) => handleChange('amount', unformatCurrency(text))}
                />
              </View>

              {/* Input Category */}
              {formData.type != 'transfer' && (
                <CustomPicker
                  inputContainerStyle={styles.inputContainer}
                  labelStyle={styles.label}
                  pickerStyle={styles.picker}
                  label="Kategori"
                  selected={formData.category}
                  onSelect={(val) => {
                    handleChange('category', val)
                  }}
                  options={formData.type === "income" ? incomeCategories : expenseCategories}
                  selectedComponent={(val) => {
                    return (
                      <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", flex: 1 }}>
                        <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.color} />
                        <Text style={{ width: "80%", textAlign: "center" }}>{`${val.name}`}</Text>
                      </View>
                    )
                  }}
                />
              )}


              <CustomPicker
                inputContainerStyle={styles.inputContainer}
                labelStyle={styles.label}
                pickerStyle={styles.picker}
                label="Akun Sumber"
                selected={formData.accountId}
                onSelect={(val) => handleChange('accountId', val)}
                options={accounts}
                selectedComponent={(val) => {
                  return (
                    <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", flex: 1 }}>
                      <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.iconColor} />
                      <Text style={{ width: "80%", textAlign: "center" }}>{`${val.name} ( ${formatCurrency(val.balance)})`}</Text>
                    </View>
                  )
                }}
              />

              {/* Transfer Form */}
              {formData.type === 'transfer' && (
                <>
                  <CustomPicker
                    inputContainerStyle={styles.inputContainer}
                    labelStyle={styles.label}
                    pickerStyle={styles.picker}
                    label="Akun Tujuan"
                    selected={formData.targetAccountId}
                    onSelect={(val) => handleChange('targetAccountId', val)}
                    options={accounts}
                    selectedComponent={(val) => {
                      return (
                        <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", flex: 1 }}>
                          <MaterialCommunityIcons name={val.icon} size={20} style={{ marginRight: 10 }} color={val.iconColor} />
                          <Text style={{ width: "80%", textAlign: "center" }}>{`${val.name} ( ${formatCurrency(val.balance)})`}</Text>
                        </View>
                      )
                    }}
                  />

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Biaya Transfer (Rp)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="0"
                      value={formatCurrency(formData.fee)}
                      onChangeText={(text) => handleChange('fee', unformatCurrency(text))}
                    />
                  </View>
                </>
              )}

              {/* Description Input */}
              {/* <Text style={{ ...styles.label, padding: 10 }}>Deskripsi</Text>
              {hasPhoto ? <View style={{ flexDirection: "column", gap: 10 }}>
                <TextInput
                  style={[styles.input, { height: 80, width: "100%" }]}
                  placeholder="Tambahkan deskripsi (opsional)"
                  multiline
                  value={formData.description}
                  onChangeText={(text) => handleChange('description', text)}
                />


                <CameraComponent
                  onPhotoSelected={handlePhotoSelected}
                  onPhotoRemoved={handlePhotoRemoved}
                  tempPhotoUri={tempPhotoUri}
                  buttonStyle={{ height: 50, width: 50, margin: 10 }}
                  onRenderPhotoPreviewPress={() => setModalVisible(true)}
                />

                <ImageModal
                  onDeleteImage={handlePhotoRemoved}
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                  imageItem={tempPhotoUri}
                />
              </View> :
                <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}> */}
                  <TextInput
                    style={[styles.input, { height: 80, width: "100%" }]}
                    placeholder="Tambahkan deskripsi (opsional)"
                    multiline
                    value={formData.description}
                    onChangeText={(text) => handleChange('description', text)}
                  />


                  {/* <CameraComponent
                    onPhotoSelected={handlePhotoSelected}
                    onPhotoRemoved={handlePhotoRemoved}
                    tempPhotoUri={tempPhotoUri}
                    buttonStyle={{ height: 50, width: 50, margin: 10 }}
                  />
                </View>} */}
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <ActionButton title="Tambah Transaksi" backgroundColor="#2196F3" onPress={handleSubmit} />
          </View>
        </>

      }
    </KeyboardAvoidingView>
  );
};

export const options = {
  animation: 'fade_from_bottom',
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
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  },
  buttonContainer: {
    height: 80,
    margin: 10,
    padding: 14,
  },
});

export default TransactionForm;
