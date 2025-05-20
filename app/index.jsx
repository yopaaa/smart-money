import Account from '@/app/Account';
import Home from '@/app/Home';
import HomeScreen from '@/app/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';

// // Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync();

// // Set the animation options. This is optional.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// });


const Screen1 = () => <View><Text>Home</Text></View>;
const Screen2 = () => <HomeScreen />;

const renderTabBar = ({ routeName, selectedTab, navigate }) => {
  let icon = routeName === 'home' ? 'home' : 'person';

  return (
    <TouchableOpacity
      // name={icon}
      // size={24}
      // color={routeName === selectedTab ? '#00BFFF' : 'gray'}
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


  // const [appIsReady, setAppIsReady] = useState(false);

  // useEffect(() => {
  //   async function prepare() {
  //     try {
  //       // Pre-load fonts, make any API calls you need to do here
  //       await Font.loadAsync(Entypo.font);
  //       // Artificially delay for two seconds to simulate a slow loading
  //       // experience. Remove this if you copy and paste the code!
  //       await new Promise(resolve => setTimeout(resolve, 2000));
  //     } catch (e) {
  //       console.warn(e);
  //     } finally {
  //       // Tell the application to render
  //       setAppIsReady(true);
  //     }
  //   }

  //   prepare();
  // }, []);

  // const onLayoutRootView = useCallback(() => {
  //   if (appIsReady) {
  //     // This tells the splash screen to hide immediately! If we call this after
  //     // `setAppIsReady`, then we may see a blank screen while the app is
  //     // loading its initial state and rendering its first pixels. So instead,
  //     // we hide the splash screen once we know the root view has already
  //     // performed layout.
  //     SplashScreen.hide();
  //   }
  // }, [appIsReady]);

  // if (!appIsReady) {
  //   return null;
  // }

  return (
    <CurvedBottomBarExpo.Navigator
      type="DOWN"
      height={100}
      circleWidth={60}
      bgColor="white"
      initialRouteName="home"
      renderCircle={({ selectedTab, navigate }) => (
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: '#00BFFF',
            justifyContent: 'center',
            alignItems: 'center',
            bottom: 15,
          }}
        >
          <Ionicons name="add" size={24} color="#FFF" onPress={() => router.navigate("page/TransactionForm")} />
        </View>
      )}
      tabBar={renderTabBar}
    >
      <CurvedBottomBarExpo.Screen name="home" position="LEFT" component={Home} />
      <CurvedBottomBarExpo.Screen name="analytics" position="LEFT" component={HomeScreen} />
      <CurvedBottomBarExpo.Screen name="albums" position="RIGHT" component={Account} />
      <CurvedBottomBarExpo.Screen name="settings" position="RIGHT" component={Screen2} />
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




