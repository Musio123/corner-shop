import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from "react-native";
import * as api from "../api";
import { formatPrice } from "../format";
import { useCart } from "../cart";

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { cart, add } = useCart();

  useEffect(() => {
    api
      .fetchProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.emoji}>{item.image}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.price}>{formatPrice(item.price_cents)}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => add(item)}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate("Cart")}>
        <Text style={styles.cartBarText}>View cart · {cart.count} item{cart.count === 1 ? "" : "s"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#c00", padding: 16, textAlign: "center" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, gap: 12 },
  emoji: { fontSize: 36 },
  name: { fontSize: 16, fontWeight: "700" },
  desc: { color: "#777", fontSize: 13, marginTop: 2 },
  price: { fontSize: 15, fontWeight: "700", marginTop: 6 },
  addBtn: { backgroundColor: "#111", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  addBtnText: { color: "#fff", fontWeight: "600" },
  cartBar: { backgroundColor: "#111", padding: 16, alignItems: "center" },
  cartBarText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
