import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../cart";
import { placeOrder } from "../api";
import { formatPrice } from "../format";

export default function CheckoutScreen() {
  const { cart } = useCart();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customer_name: "", phone: "", address: "", city: "", country: "",
  });

  async function handleSubmit() {
    const values = Object.values(form);
    if (values.some((v) => !v || !v.trim())) {
      Alert.alert("Fill in all fields", "Please complete name, phone, address, city and country.");
      return;
    }
    if (cart.items.length === 0) {
      Alert.alert("Empty cart", "Add items before checking out.");
      return;
    }
    setBusy(true);
    try {
      const data = await placeOrder({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country.trim(),
        items: cart.items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });
      navigation.navigate("Order", { orderId: data.orderId, total: cart.total_cents, emailSent: !!data.emailSent });
    } catch (e) {
      Alert.alert("Order failed", e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.page, { paddingBottom: Math.max(16, insets.bottom) + 14 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shipping details</Text>
          {Object.entries(form).map(([key, value]) => {
            const labels = { customer_name: "Full name", phone: "Phone number", address: "Address", city: "City", country: "Country" };
            const keyboard = key === "phone" ? "numeric" : "default";
            return (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{labels[key]}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={(t) => setForm({ ...form, [key]: t })}
                  keyboardType={keyboard}
                  autoCapitalize={key === "country" ? "words" : "none"}
                  autoCompleteType={key === "customer_name" ? "name" : "off"}
                />
              </View>
            );
          })}
        </View>
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          {cart.items.map((i) => (
            <View key={i.id} style={styles.summaryRow}>
              <Text style={styles.summaryName}>{i.image} {i.name} × {i.quantity}</Text>
              <Text style={styles.summaryPrice}>{formatPrice(i.price_cents * i.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(cart.total_cents)}</Text>
          </View>
          <Text style={styles.note}>Demo shop: no real payment is taken.</Text>
        </View>
        <TouchableOpacity style={styles.placeBtn} onPress={handleSubmit} disabled={busy}>
          {busy ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.placeBtnText}>Place order · {formatPrice(cart.total_cents)}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f7fb" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e8ef",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#1f2330" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#1f2330", marginBottom: 12 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#1f2330", marginBottom: 6 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d0d3dc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#1f2330",
    backgroundColor: "#fff",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  summaryName: { fontSize: 14, color: "#1f2330" },
  summaryPrice: { fontSize: 14, fontWeight: "700", color: "#4f46e5" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: { fontSize: 16, fontWeight: "800", color: "#1f2330" },
  totalValue: { fontSize: 17, fontWeight: "800", color: "#4f46e5" },
  note: { color: "#6b7080", fontSize: 12, marginTop: 10, textAlign: "center" },
  placeBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
