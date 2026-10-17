import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet,
} from "react-native";
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
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => setLoading(true)}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🛍️</Text>
          <Text style={styles.appName}>Corner Shop</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.cartCount}>{cart.count}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Everyday essentials, delivered to your door.</Text>

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardImage}>{item.image}</View>
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.cardPrice}>{formatPrice(item.price_cents)}</Text>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => add(item)}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.cartBar} onPress={() => navigation.navigate("Cart")}>
        <Text style={styles.cartBarText}>View cart · {cart.count} item{cart.count === 1 ? "" : "s"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f7fb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e8ef",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { fontSize: 22 },
  appName: { fontSize: 18, fontWeight: "800", color: "#1f2330" },
  cartButton: { padding: 8 },
  cartCount: { fontSize: 14, fontWeight: "700", color: "#4f46e5", minWidth: 24, textAlign: "center" },
  subtitle: {
    color: "#6b7080",
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: { fontSize: 36, width: 64, height: 64, textAlign: "center", backgroundColor: "#f1f2f8", borderRadius: 10 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#1f2330" },
  cardDesc: { color: "#6b7080", fontSize: 13, marginTop: 2 },
  cardPrice: { fontSize: 15, fontWeight: "700", marginTop: 6, color: "#4f46e5" },
  addBtn: { backgroundColor: "#4f46e5", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#dc2626", padding: 16, textAlign: "center" },
  retry: { marginTop: 12 },
  retryText: { color: "#4f46e5", fontWeight: "600", textDecorationLine: "underline" },
  cartBar: {
    backgroundColor: "#fff",
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e6e8ef",
  },
  cartBarText: { color: "#4f46e5", fontSize: 16, fontWeight: "700" },
});
