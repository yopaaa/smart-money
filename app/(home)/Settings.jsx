import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { expo } from '../../app.json';

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const iconItems = [
    {
      icon: 'settings-outline', label: 'Configuration', function: function () {
        router.push("settings");
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
        router.push("settings/Json_restore");
      }
    },
    {
      icon: 'cloud-upload-outline', label: 'Backup', function: function () {


      }
    },
    {
      icon: 'mail-outline', label: 'Feedback', function: function () {
        router.push("settings/Log");

      }
    },
    {
      icon: 'help-circle-outline', label: 'Help', function: function () {
        router.push("transaction/WebView");
      }
    },
    {
      icon: 'thumbs-up-outline', label: 'Recommend', function: function () {
        router.push("settings/AppInfoScreen");

      }
    },
  ];

  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('User logged out') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Account deleted') }
      ]
    );
  };

  const SettingItem = ({ title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && <Text style={styles.arrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <SettingSection title="Profile">
          <SettingItem
            title="Account Information"
            subtitle="Update your personal details"
            onPress={() => {
              router.push("settings/test/One");
            }}
          />
          {/* <SettingItem
            title="Change Password"
            subtitle="Update your password"
            onPress={() => console.log('Change password pressed')}
          /> */}
          <SettingItem
            title="Backup & Restore"
            subtitle="Manage your data backup"
            onPress={() => {
              router.push("settings/(backup)");
            }}
          />
        </SettingSection>

        {/* Security Section */}
        <SettingSection title="Security">
          <SettingItem
            title="Biometric Authentication"
            subtitle="Use fingerprint or face unlock"
            rightComponent={
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                thumbColor={biometric ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            title="Auto Lock"
            subtitle="Lock app after inactivity"
            onPress={() => console.log('Auto lock pressed')}
          />
          <SettingItem
            title="Privacy Settings"
            subtitle="Manage your privacy preferences"
            onPress={() => console.log('Privacy pressed')}
          />
        </SettingSection>

        {/* Preferences Section */}
        <SettingSection title="Preferences">
          <SettingItem
            title="Notifications"
            subtitle="Manage notification settings"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            title="Dark Mode"
            subtitle="Switch between light and dark theme"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            title="Language"
            subtitle="English"
            onPress={() => console.log('Language pressed')}
          />
          <SettingItem
            title="Currency"
            subtitle="Indonesian Rupiah (IDR)"
            onPress={() => console.log('Currency pressed')}
          />
        </SettingSection>

        {/* Data Section */}
        <SettingSection title="Data">
          <SettingItem
            title="Auto Backup"
            subtitle="Automatically backup your data"
            rightComponent={
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                thumbColor={autoBackup ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            title="Export Data"
            subtitle="Export your data to file"
            onPress={() => {
              router.push("settings/(backup)");
            }}
          />
          <SettingItem
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={() => console.log('Clear cache pressed')}
          />
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="Support">
          <SettingItem
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => console.log('Help pressed')}
          />
          <SettingItem
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() => console.log('Contact pressed')}
          />
          <SettingItem
            title="Rate App"
            subtitle="Rate us on the app store"
            onPress={() => console.log('Rate app pressed')}
          />
          <SettingItem
            title="About"
            subtitle="App version and information"
            onPress={() => console.log('About pressed')}
          />
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Account">
          <SettingItem
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
          />
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <View style={styles.settingContent}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </SettingSection>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version {expo.version}</Text>
          <Text style={styles.versionSubtext}>© 2025 {expo.name}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 25,
    // backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#777',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    color: '#CCC',
    marginLeft: 8,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
    marginBottom: 2,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
    marginBottom: 300
  },
  versionText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999',
  },
});