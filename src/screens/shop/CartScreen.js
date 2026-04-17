import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getCart, removeFromCart, placeOrder } from '../../api/orderApi';

const C = {
  primary: '#006850', primaryContainer: '#148367', onPrimaryContainer: '#effff6',
  primaryFixedDim: '#78d8b8', secondary: '#8e4e14', secondaryFixed: '#ffdcc4',
  surface: '#faf9f8', surfaceHigh: '#e9e8e7', surfaceLow: '#f4f3f2',
  surfaceLowest: '#ffffff', onSurface: '#1a1c1c', onSurfaceVariant: '#3e4944',
  outline: '#6e7a74', outlineVariant: '#bdc9c3', emeraldDark: '#052E25',
  error: '#ba1a1a', errorContainer: '#ffdad6', onErrorContainer: '#410002',
};

const CartScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCart(Array.isArray(data) ? data : data.items || []);
    } catch {
      // If getCart API doesn't exist, fall back to route params or empty
      setCart([]);
    } finally { setLoading(false); }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      fetchCart();
    } catch {
      setCart(prev => prev.filter(i => i._id !== itemId));
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    const price = item.price || item.productId?.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) { Alert.alert('Empty Cart', 'Add items before checkout.'); return; }
    setPlacingOrder(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId?._id || item._id,
          quantity: item.quantity || 1,
        })),
        totalPrice,
      };
      await placeOrder(orderData);
      Alert.alert('🎉 Order Placed!', 'Your order has been placed successfully.', [
        { text: 'View Orders', onPress: () => navigation.navigate('MyOrders') },
        { text: 'Keep Shopping', onPress: () => navigation.navigate('ProductList') },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to place order');
    } finally { setPlacingOrder(false); }
  };

  const renderItem = ({ item }) => {
    const name = item.name || item.productId?.name || 'Product';
    const price = item.price || item.productId?.price || 0;
    const image = item.image || item.productId?.image;
    const qty = item.quantity || 1;
    return (
      <View style={styles.cartItem}>
        {image ? (
          <Image source={{ uri: image }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
            <MaterialIcons name="inventory-2" size={24} color={C.outlineVariant} />
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
          <Text style={styles.itemPrice}>RM {Number(price).toFixed(2)}</Text>
          <Text style={styles.itemQty}>Qty: {qty}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>RM {(price * qty).toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item._id)}
          >
            <MaterialIcons name="delete-outline" size={18} color={C.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={C.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        {cart.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{cart.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 60 }} />
      ) : cart.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <MaterialIcons name="shopping-cart" size={48} color={C.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Add some items from the pet shop!</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ProductList')}>
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</Text>
          }
        />
      )}

      {cart.length > 0 && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>RM {totalPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutBtn, placingOrder && { opacity: 0.7 }]}
            onPress={handleCheckout}
            disabled={placingOrder}
            activeOpacity={0.85}
          >
            {placingOrder ? <ActivityIndicator color="#fff" /> : (
              <>
                <MaterialIcons name="shopping-bag" size={20} color="#fff" />
                <Text style={styles.checkoutBtnText}>Place Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(236,253,245,0.9)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.primary },
  countBadge: { backgroundColor: C.secondary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  countBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 160 },
  listHeader: { fontSize: 13, color: C.outline, fontWeight: '600', marginBottom: 12 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLowest, borderRadius: 16, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemImage: { width: 72, height: 72, borderRadius: 12, backgroundColor: C.surfaceHigh, marginRight: 12 },
  itemImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: C.onSurface, marginBottom: 4, lineHeight: 20 },
  itemPrice: { fontSize: 13, color: C.outline, marginBottom: 2 },
  itemQty: { fontSize: 12, color: C.outline },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  itemTotal: { fontSize: 15, fontWeight: '800', color: C.primary },
  removeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.errorContainer, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: C.surfaceHigh, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: C.onSurface, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: C.outline, textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: C.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.98)', paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { fontSize: 14, color: C.outline, fontWeight: '600' },
  totalPrice: { fontSize: 24, fontWeight: '800', color: C.onSurface },
  checkoutBtn: { backgroundColor: C.primary, height: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  checkoutBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default CartScreen;
