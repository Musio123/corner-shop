import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GOOGLE_CLIENT_ID } from "../config";
import { useAuth } from "../auth";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  async function handlePress() {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith("REPLACE")) {
      Alert.alert(
        "Setup needed",
        "Add your Google Client ID to mobile/app.json (extra.googleClientId) and restart Expo."
      );
      return;
    }
    setBusy(true);
    try {
      await promptAsync();
    } finally {
      setBusy(false);
    }
  }

  // When Google returns an id_token, exchange it for our app JWT.
  if (response?.type === "success") {
    const idToken = response.params.id_token;
    if (idToken) {
      signIn(idToken).catch((e) =>
        Alert.alert("Login failed", e.message)
      );
    }
  }
  if (response?.type === "error") {
    Alert.alert("Google sign-in error", response.error?.message || "Something went wrong");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛍️</Text>
      <Text style={styles.title}>Corner Shop</Text>
      <Text style={styles.subtitle}>Sign in to shop. Use the same Google account as the website.</Text>

      <TouchableOpacity style={styles.button} onPress={handlePress} disabled={!request || busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in with Google</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  logo: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: "700", marginTop: 12 },
  subtitle: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 8, marginBottom: 32 },
  button: { backgroundColor: "#111", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, minWidth: 240, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
