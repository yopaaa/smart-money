import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomPicker({
    label,
    selected,
    onSelect,
    options,
    inputContainerStyle,
    labelStyle,
    pickerStyle,
    selectedComponent,
    TouchableComponent
}) {
    const [visible, setVisible] = useState(false);

    return (
        <>
            {TouchableComponent ?
                <TouchableOpacity onPress={() => setVisible(true)}>
                    {TouchableComponent}
                </TouchableOpacity>
                :
                <View style={{ ...inputContainerStyle }}>
                    <Text style={{ ...styles.label, ...labelStyle }}>{label}</Text>
                    <TouchableOpacity style={{ ...styles.picker, ...pickerStyle }} onPress={() => setVisible(true)}>

                        {selected ? selectedComponent(selected) : <Text> Pilih Kategori</Text>}

                        <MaterialCommunityIcons name={"arrow-down-drop-circle"} size={20} />
                    </TouchableOpacity>
                </View>
            }


            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalContainer}
                    onPress={() => setVisible(false)} // Tutup jika ditekan di luar
                >
                    <TouchableOpacity
                        style={styles.modalBox}
                        onPress={(e) => e.stopPropagation()} // Jangan tutup saat tekan isi modal
                    >
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.name}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => {
                                        onSelect(item, index);
                                        setVisible(false);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={item.icon}
                                        size={20}
                                        style={{ marginRight: 10 }}
                                        color={item.color || item.iconColor}
                                    />
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Text style={{ textAlign: 'center', color: '#888', marginTop: 10 }}>Tutup</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
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
        gap: 20,
        alignItems: "center",
        justifyContent: "space-evenly",
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginTop: 6,
        fontSize: 16,
        // width: "65%",
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%',
    },
    cancelBtn: {
        paddingVertical: 12,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBox: {
        backgroundColor: 'white',
        width: '80%',
        padding: 16,
        borderRadius: 12,
        maxHeight: '60%',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    // modalContainer: {
    //   flex: 1,
    //   backgroundColor: 'rgba(0,0,0,0.5)',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    // },

    // modalBox: {
    //   backgroundColor: 'white',
    //   borderRadius: 10,
    //   padding: 20,
    //   maxHeight: '80%',
    //   width: '80%',
    // },

});
