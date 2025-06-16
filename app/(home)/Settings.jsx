import { expo } from '@/app.json';
import { currencySetting } from '@/utils/number';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useTheme } from '../../hooks/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();

  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [darkMode, setDarkMode] = useState(theme.mode == "dark");

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
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.colors.border }]} onPress={onPress}>
      <View style={styles.settingContent}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        {subtitle && <ThemedText style={styles.settingSubtitle} type={"description"}>{subtitle}</ThemedText>}
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && <ThemedText style={styles.arrow} type={"description"}>›</ThemedText>}
      </View>
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.sectionContent}>
        {children}
      </ThemedView>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
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
              router.push("(home)/(settings)/(backup)");
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
                onValueChange={(value) => {
                  // console.log(value);
                  setDarkMode(value)
                  toggleTheme()
                }}
                trackColor={{ false: '#E5E5E5', true: '#2563EB' }}
                thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
              />
            }
            showArrow={false}
          />
          <SettingItem
            title="Language"
            subtitle="English"
            onPress={() => {
              router.push("(home)/(settings)/Language");
            }}
          />
          <SettingItem
            title="Currency"
            subtitle={`${currencySetting.name} (${currencySetting.currency})`}
            onPress={() => {
              router.push("(home)/(settings)/Currency");
            }}
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
              router.push("/(home)/(settings)/FileExport");
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
            onPress={() => {
              router.push("(home)/(settings)/WebView");
            }}
          />
          <SettingItem
            title="About"
            subtitle="App version and information"
            onPress={() => {
              router.push("(home)/(settings)/AppInfoScreen");
            }}
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
              <ThemedText style={styles.dangerTitle}>Delete Account</ThemedText>
              <ThemedText style={styles.settingSubtitle} type={"description"}>Permanently delete your account</ThemedText>
            </View>
            <ThemedText style={styles.arrow} type={"description"}>›</ThemedText>
          </TouchableOpacity>
        </SettingSection>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <ThemedText style={styles.versionText} type={"description"}>Version {expo.version}</ThemedText>
          <ThemedText style={styles.versionSubtext} type={"description"}>© 2025 {expo.name}</ThemedText>
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
    borderBottomWidth: 1,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 18,
    marginLeft: 8,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
  },
});