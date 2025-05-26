import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const MyWebViewScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://github.com/yopaaa' }} // ganti dengan URL kamu
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

export default MyWebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
