import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GOOGLE_CLIENT_ID } from "../config";
import { useAuth } from "../auth";
import { loginWithEmail } from "../api";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  async function handleGoogle() {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith("REPLACE")) {
      Alert.alert("Setup needed", "Add your Google Client ID to mobile/app.json (extra.googleClientId) and restart Expo.");
      return;
    }
    setBusy(true);
    try {
      await promptAsync();
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail() {
    if (!email.trim()) {
      Alert.alert("Enter email", "Type the email you use on the website.");
      return;
    }
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), name.trim());
      await refresh(); // pick up the stored token -> app shows the shop
    } catch (e) {
      Alert.alert("Login failed", e.message);
    } finally {
      setBusy(false);
    }
  }

  // Google success -> exchange token for app JWT.
  if (response?.type === "success") {
    const idToken = response.params.id_token;
    if (idToken) {
      signIn(idToken).catch((e) => Alert.alert("Login failed", e.message));
    }
  }
  if (response?.type === "error") {
    Alert.alert("Google sign-in error", response.error?.message || "Something went wrong");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛍️</Text>
      <Text style={styles.title}>Corner Shop</Text>
      <Text style={styles.subtitle}>Sign in with the same email you use on the website.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Name (optional)"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleEmail} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} disabled={!request || busy}>
        <Text style={styles.googleBtnText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  logo: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: "700", marginTop: 12 },
  subtitle: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 8, marginBottom: 24 },
  input: { width: "100%", maxWidth: 320, borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: "#111", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, minWidth: 240, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", width: "100%", maxWidth: 320, marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#e5e5e5" },
  or: { marginHorizontal: 12, color: "#999" },
  googleBtn: { borderWidth: 1, borderColor: "#111", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 10, minWidth: 240, alignItems: "center" },
  googleBtnText: { color: "#111", fontSize: 16, fontWeight: "600" },
});

