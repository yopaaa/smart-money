import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ThreeDotMenu = ({ menuItems = [], dotStyle = {}, dotColor = 'black' }) => {
  const [visible, setVisible] = useState(false);

  const toggleMenu = () => {
    setVisible(!visible);
  };

  const closeMenu = () => {
    setVisible(false);
  };

  return (
    <View style={{ alignItems: 'flex-end' }}>
      {/* Trigger Button (3 Dots) */}
      <TouchableOpacity onPress={toggleMenu} style={dotStyle} >
        <MaterialCommunityIcons name={"dots-vertical"} size={22} color={"black"} />
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                label={item.name}
                onPress={() => {
                  closeMenu();
                  item.fn?.();
                }}
              />
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const MenuItem = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem}>
    <Text style={styles.menuItemText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  dots: {
    textAlign: "center",
    // padding: 10,
    fontSize: 22,
    paddingHorizontal: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 40,
    paddingRight: 10,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 160,
    // padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingVertical: 4,
  },
  menuItem: {
    // padding: 15
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  menuItemText: {
    color: '#000',
    fontSize: 14,
    // fontWeight: "bold"
  },
});

export default ThreeDotMenu;
