import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoginScreen } from './src/screens/LoginScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { mobileApi } from './src/services/api';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    mobileApi.logout();
    setCurrentUser(null);
  };

  const handleSwitchUser = async (user) => {
    // Switch to target user without requiring password entry for simulation convenience
    try {
      const res = await mobileApi.login(user.email || user.username, 'Admin@12345');
      setCurrentUser(res.user);
    } catch {
      setCurrentUser(user);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      {currentUser ? (
        <AppNavigator
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
        />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});

export default App;
