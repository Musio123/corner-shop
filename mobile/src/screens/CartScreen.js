import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { formatPrice } from "../format";
import { useCart } from "../cart";

export default function CartScreen({ navigation }) {
  const { cart, loading, setQty, remove } = useCart();

  if (loading && cart.items.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Loading cart…</Text>
      </View>
    );
  }

  if (cart.items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Your cart is empty.</Text>
        <Text style={styles.hint}>Add items from the Shop tab — they'll sync with the website.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Shop")}>
          <Text style={styles.btnText}>Go shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.emoji}>{item.image}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.line}>{formatPrice(item.price_cents * item.quantity)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => setQty(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qty}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => setQty(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(cart.total_cents)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { fontSize: 18, fontWeight: "700" },
  hint: { color: "#777", marginTop: 8, textAlign: "center" },
  btn: { backgroundColor: "#111", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, marginTop: 20 },
  btnText: { color: "#fff", fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", gap: 10, padding: 14, borderRadius: 12, marginBottom: 10 },
  emoji: { fontSize: 30 },
  name: { fontSize: 15, fontWeight: "600" },
  line: { color: "#666", marginTop: 4 },
  qtyBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { backgroundColor: "#eee", width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 18, fontWeight: "700" },
  qty: { minWidth: 20, textAlign: "center", fontSize: 16 },
  remove: { color: "#c00", marginLeft: 8 },
  totalBar: { flexDirection: "row", justifyContent: "space-between", padding: 18, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  totalValue: { fontSize: 18, fontWeight: "700" },
});
