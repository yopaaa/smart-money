import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTransactions } from './TransactionContext';


import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { resetTables } = useTransactions();
  const iconItems = [
    {
      icon: 'settings-outline', label: 'Configuration', function: function () {
        router.push("transaction/WebView");
      }
    },
    {
      icon: 'wallet-outline', label: 'Accounts', function: function () {
        // console.log("albums");
        navigation.goBack()
      }
    },
    {
      icon: 'lock-open-outline', label: 'Passcode', function: function () {
        console.log("this.label");
      }
    },
    {
      icon: 'calculator-outline', label: 'CalcBox', function: function () {
        console.log("this.label");
      }
    },
    {
      icon: 'desktop-outline', label: 'PC Manager', function: function () {
        router.push("settings/Test");
      }
    },
    {
      icon: 'cloud-upload-outline', label: 'Backup', function: function () {
        router.push("settings/Json_restore");

      }
    },
    {
      icon: 'mail-outline', label: 'Feedback', function: function () {
        console.log("this.label");
      }
    },
    {
      icon: 'help-circle-outline', label: 'Help', function: function () {
        console.log("this.label");
      }
    },
    {
      icon: 'thumbs-up-outline', label: 'Recommend', function: function () {
        console.log("this.label");
      }
    },
  ];
  return (
    <SafeAreaView style={{ ...styles.container, paddingTop: StatusBar.currentHeight || 0 }}>
      {/* Header */}
      <View style={styles.headercontainer}>
        <Text style={styles.header}>Settings</Text>
      </View>

      {/* Profile Info Placeholder */}
      <View style={styles.profile}>
        <View style={styles.avatar} />
        <View style={styles.profileText}>
          <View style={styles.line} />
          <View style={[styles.line, { width: '70%' }]} />
        </View>
      </View>
      <View style={styles.longBar} />

      <TouchableOpacity onPress={() => resetTables()}>
        <Text>Reset Db</Text>
      </TouchableOpacity>

      {/* Grid Menu */}
      <ScrollView contentContainerStyle={styles.grid}>
        {iconItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.gridItem} onPress={item.function}>
            <Ionicons name={item.icon} size={28} color="#222" />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>



      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Remove Ads.</Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    flexDirection: "column",
    // backgroundColor: '#fff',
  },
  headercontainer: {
    height: 60,
    justifyContent: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ccc',
  },
  profileText: {
    flex: 1,
    marginLeft: 12,
  },
  line: {
    height: 12,
    backgroundColor: '#ddd',
    marginBottom: 6,
    borderRadius: 6,
    width: '90%',
  },
  longBar: {
    height: 40,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: Dimensions.get('window').width / 3 - 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
