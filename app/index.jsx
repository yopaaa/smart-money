import Account from '@/app/Account';
import Home from '@/app/Home';
import Settings from '@/app/Settings';
import StatsScreen from '@/app/StatsScreen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';


const renderTabBar = ({ routeName, selectedTab, navigate }) => {
  return (
    <TouchableOpacity
      onPress={() => navigate(routeName)}

      style={styles.tabbarItem}
    >
      <Ionicons
        name={routeName}
        size={28}
        color={routeName === selectedTab ? '#00BFFF' : 'gray'}
        onPress={() => navigate(routeName)}
      />
    </TouchableOpacity>
  );
};

export default function App() {
  const router = useRouter();

  return (
    <CurvedBottomBarExpo.Navigator
      screenOptions={{headerShown: false}}
      type="DOWN"
      height={100}
      circleWidth={60}
      bgColor="white"
      initialRouteName="home"
      renderCircle={({ selectedTab, navigate }) => (
        <TouchableOpacity
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: '#00BFFF',
            justifyContent: 'center',
            alignItems: 'center',
            bottom: 15,
          }}
          onPress={() => router.navigate("page/TransactionForm")}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      tabBar={renderTabBar}
    >
      <CurvedBottomBarExpo.Screen name="home" position="LEFT" component={Home} />
      <CurvedBottomBarExpo.Screen name="analytics" position="LEFT" component={StatsScreen} />
      <CurvedBottomBarExpo.Screen name="albums" position="RIGHT" component={Account} />
      <CurvedBottomBarExpo.Screen name="settings" position="RIGHT" component={Settings} />
    </CurvedBottomBarExpo.Navigator>
  );
}

export const styles = StyleSheet.create({
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
})




