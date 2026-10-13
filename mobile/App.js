import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

import { AuthProvider, useAuth } from "./src/auth";
import { CartProvider } from "./src/cart";
import LoginScreen from "./src/screens/LoginScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import CartScreen from "./src/screens/CartScreen";

const Stack = createNativeStackNavigator();

function HeaderRight() {
  const { signOut } = useAuth();
  return (
    <TouchableOpacity onPress={signOut}>
      <Text style={{ color: "#c00", fontWeight: "600" }}>Sign out</Text>
    </TouchableOpacity>
  );
}

function Routes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Shop"
        component={ProductsScreen}
        options={{ title: "Corner Shop", headerRight: HeaderRight }}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Your cart" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Routes />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
