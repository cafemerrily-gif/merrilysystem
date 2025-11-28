import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// 通知ハンドラーの設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // あなたのNext.jsアプリのURL
  const APP_URL = 'https://your-app-url.vercel.app'; // ここを実際のURLに変更

  useEffect(() => {
    // プッシュ通知の許可をリクエスト
    registerForPushNotificationsAsync();

    // Androidの戻るボタンハンドリング
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [canGoBack]);

  // プッシュ通知の登録
  async function registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('通知', '通知の許可が必要です');
      return;
    }

    // トークンを取得してサーバーに送信
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    
    // トークンを保存（後でサーバーに送信するため）
    await AsyncStorage.setItem('pushToken', token);
  }

  // WebViewからのメッセージを受信
  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'SAVE_TOKEN') {
        // 認証トークンを保存
        AsyncStorage.setItem('authToken', data.token);
      } else if (data.type === 'LOGOUT') {
        // ログアウト時にトークンを削除
        AsyncStorage.removeItem('authToken');
      } else if (data.type === 'NOTIFICATION') {
        // ローカル通知を表示
        Notifications.scheduleNotificationAsync({
          content: {
            title: data.title,
            body: data.body,
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  };

  // WebView読み込み完了時
  const onLoadEnd = async () => {
    setIsLoading(false);
    
    // 保存された認証トークンをWebViewに送信
    const authToken = await AsyncStorage.getItem('authToken');
    const pushToken = await AsyncStorage.getItem('pushToken');
    
    if (authToken || pushToken) {
      const message = JSON.stringify({
        type: 'INIT_TOKENS',
        authToken,
        pushToken
      });
      webViewRef.current?.postMessage(message);
    }
  };

  // ナビゲーション状態が変わった時
  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  // JavaScript注入（WebViewとネイティブアプリ間の通信設定）
  const injectedJavaScript = `
    (function() {
      // ネイティブアプリからのメッセージを受信
      window.addEventListener('message', function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INIT_TOKENS') {
            // トークンをlocalStorageに保存
            if (data.authToken) {
              localStorage.setItem('authToken', data.authToken);
            }
            if (data.pushToken) {
              localStorage.setItem('pushToken', data.pushToken);
            }
          }
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // ネイティブアプリにメッセージを送信する関数を定義
      window.sendToNative = function(type, data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: type,
          ...data
        }));
      };

      // 認証トークンが変更されたら通知
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        if (key === 'authToken') {
          window.sendToNative('SAVE_TOKEN', { token: value });
        }
      };
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        style={styles.webview}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
        onNavigationStateChange={onNavigationStateChange}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsBackForwardNavigationGestures={true}
        // キャッシュを有効化
        cacheEnabled={true}
        // メディアプレイバックを許可
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
});
