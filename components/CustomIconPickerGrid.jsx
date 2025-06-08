import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CustomIconPickerGrid({
  label,
  selectedIcon,
  onSelect,
  options,
  inputContainerStyle,
  labelStyle,
  pickerStyle,
  numColumns = 4, // jumlah kolom grid,
  iconColor
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <View style={{ ...inputContainerStyle }}>
        <Text style={{ ...styles.label, ...labelStyle }}>{label}</Text>
        <TouchableOpacity
          style={{ ...styles.picker, ...pickerStyle }}
          onPress={() => setVisible(true)}
        >
          {selectedIcon ? (
            <MaterialCommunityIcons
              name={selectedIcon.icon}
              size={50}
              color={iconColor || selectedIcon.color || '#555'}
            />
          ) : (
            <Text>Pilih Ikon</Text>
          )}
          <MaterialCommunityIcons name="arrow-down-drop-circle" size={20} />
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${item.icon}-${item.color || index}`}
              numColumns={numColumns}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.iconBox}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={28}
                    color={iconColor || item.color || '#333'}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.grid}
            />
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    fontSize: 16,
    width: 200,
    backgroundColor: '#f9f9f9',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '85%',
    padding: 16,
    borderRadius: 12,
    maxHeight: '60%',
  },
  grid: {
    justifyContent: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
});
