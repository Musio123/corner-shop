import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { formatPrice } from "../format";

export default function OrderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { orderId, total, emailSent } = route.params ?? {};

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <View style={[styles.page, { paddingBottom: Math.max(24, insets.bottom) + 14 }]}>
      <View style={styles.card}>
        <Text style={styles.badge}>🎉</Text>
        <Text style={styles.title}>Thank you for your order!</Text>
        <Text style={styles.subtitle}>
          Order <strong style={{ color: "#4f46e5" }}>#{orderId}</strong> has been placed.
        </Text>
        {emailSent ? (
          <View style={styles.alertSuccess}>
            <Text style={styles.alertText}>A confirmation email has been sent.</Text>
          </View>
        ) : (
          <View style={styles.alertWarn}>
            <Text style={styles.alertText}>
              Your order was saved, but we couldn't send the confirmation email right now.
            </Text>
          </View>
        )}
        <Text style={styles.totalRowLabel}>Order total</Text>
        <Text style={styles.totalValue}>{formatSize(total)}</Text>
      </View>

      <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.popToTop()}>
        <Text style={styles.shopBtnText}>Keep shopping</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatSize(value) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format((value || 0) / 100);
  } catch {
    return "$0.00";
  }
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#f6f7fb" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  badge: { fontSize: 56, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f2330", marginBottom: 6, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#6b7080", textAlign: "center", marginBottom: 20 },
  alertSuccess: {
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  alertWarn: {
    backgroundColor: "#fef9c3",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  alertText: { color: "#166534", fontSize: 13, textAlign: "center" },
  totalRowLabel: { fontSize: 14, color: "#6b7080", marginBottom: 4 },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#4f46e5", marginBottom: 24 },
  shopBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
