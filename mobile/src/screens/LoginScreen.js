import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert,
} from "react-native";
import { useAuth } from "../auth";
import { loginWithEmail } from "../api";

export default function LoginScreen() {
  const { refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🛍️</Text>
        <Text style={styles.title}>Corner Shop</Text>
        <Text style={styles.subtitle}>
          Sign in with the same email you use on the website.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCompleteType="email"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Name (optional)"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          onSubmitEditing={handleEmail}
        />
        <TouchableOpacity style={styles.button} onPress={handleEmail} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f6f7fb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: "800", color: "#1f2330", marginBottom: 6 },
  subtitle: {
    fontSize: 14,
    color: "#6b7080",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d0d3dc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1f2330",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

