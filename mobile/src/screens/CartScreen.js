import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "../format";
import { useCart } from "../cart";
import { useNavigation } from "@react-navigation/native";

export default function CartScreen() {
  const { cart, loading, setQty, remove } = useCart();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(16, insets.bottom) + 14;

  if (loading && cart.items.length === 0) {
    return (
      <View style={[styles.center, { paddingBottom: bottomPadding }]}>
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={[styles.center, { paddingBottom: bottomPadding }]}>
        <Text style={styles.empty}>Your cart is empty.</Text>
        <Text style={styles.hint}>Add items from the Shop — they'll sync with the website.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Shop")}>
          <Text style={styles.btnText}>Go shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.page, { paddingBottom: bottomPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your cart</Text>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.cardImage}>{item.image}</View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardLine}>{formatPrice(item.price_cents * item.quantity)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <TouchableOpacity
                onPress={() => setQty(item.id, Math.max(0, item.quantity - 1))}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => setQty(item.id, item.quantity + 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(cart.total_cents)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f7fb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e8ef",
  },
  back: { padding: 6 },
  backText: { fontSize: 20, color: "#4f46e5" },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: "#1f2330" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { fontSize: 18, fontWeight: "800", color: "#1f2330" },
  hint: { color: "#6b7080", marginTop: 8, textAlign: "center", paddingHorizontal: 32 },
  btn: { backgroundColor: "#4f46e5", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 20 },
  btnText: { color: "#fff", fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: { fontSize: 30 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#1f2330" },
  cardLine: { color: "#6b7080", marginTop: 4 },
  qtyBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { backgroundColor: "#f1f2f8", width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 18, fontWeight: "800", color: "#4f46e5" },
  qty: { minWidth: 24, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#1f2330" },
  remove: { color: "#dc2626", marginLeft: 8, fontWeight: "600" },
  bottomBar: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#e6e8ef",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1f2330" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#4f46e5" },
  checkoutBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
