import React, { useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CourseViewerScreen() {
  const { courseTitle } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();

  const localHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, sans-serif; 
            background-color: #0F172A; 
            color: white; 
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          h1 { color: #6C8DF5; }
          .btn {
            background-color: #4A6EDB;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>Interactive Learning</h1>
        <p id="course-name">Loading course...</p>
        <div id="content">Welcome to the interactive module for this AI course. Click below to complete this unit.</div>
        <button class="btn" onclick="completeUnit()">Complete Unit</button>
        
        <script>
          // Listen for data from React Native
          window.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'SET_COURSE') {
              document.getElementById('course-name').innerText = 'Course: ' + data.payload;
            }
          });

          function completeUnit() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'UNIT_COMPLETE',
              payload: 'Successfully finished introductory module'
            }));
          }
        </script>
      </body>
    </html>
  `;

  const onMessage = (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'UNIT_COMPLETE') {
      Alert.alert('Unit Complete!', data.payload, [
        { text: 'Back to Dashboard', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  };

  const sendDataToWebView = () => {
    const data = JSON.stringify({
      type: 'SET_COURSE',
      payload: courseTitle
    });
    webViewRef.current?.postMessage(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Interactive Viewer',
        headerStyle: { backgroundColor: Colors.learnAI.background },
        headerTintColor: '#FFFFFF',
      }} />
      
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: localHTML }}
        onMessage={onMessage}
        onLoadEnd={sendDataToWebView}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.learnAI.background,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
