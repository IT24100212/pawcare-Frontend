import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getProducts } from '../../api/productApi';
import { addToCart } from '../../api/orderApi';

const C = {
  primary: '#006850', primaryContainer: '#148367', onPrimaryContainer: '#effff6',
  primaryFixedDim: '#78d8b8', secondary: '#8e4e14', secondaryFixed: '#ffdcc4',
  secondaryContainer: '#ffab69', surface: '#faf9f8', surfaceHigh: '#e9e8e7',
  surfaceLow: '#f4f3f2', surfaceLowest: '#ffffff', onSurface: '#1a1c1c',
  onSurfaceVariant: '#3e4944', outline: '#6e7a74', outlineVariant: '#bdc9c3',
  emeraldDark: '#052E25',
};

const CATEGORIES = ['All', 'Food', 'Accessories', 'Grooming', 'Toys', 'Medicine'];

const ProductListScreen = () => {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [addingId, setAddingId] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => { if (isFocused) fetchProducts(); }, [isFocused]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch { Alert.alert('Error', 'Failed to load products'); }
    finally { setLoading(false); }
  };

  const handleAddToCart = async (productId) => {
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      Alert.alert('Added! 🛒', 'Item added to your cart.');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add to cart');
    } finally { setAddingId(null); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
      ) : (
        <View style={[styles.productImage, styles.productImagePlaceholder]}>
          <MaterialIcons name="inventory-2" size={32} color={C.outlineVariant} />
        </View>
      )}
      {item.stock === 0 && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
        <Text style={styles.productPrice}>RM {Number(item.price || 0).toFixed(2)}</Text>
        <TouchableOpacity
          style={[styles.addBtn, item.stock === 0 && styles.addBtnDisabled]}
          onPress={() => handleAddToCart(item._id)}
          disabled={item.stock === 0 || addingId === item._id}
          activeOpacity={0.8}
        >
          {addingId === item._id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialIcons name="add-shopping-cart" size={16} color={item.stock === 0 ? C.outline : '#fff'} />
              <Text style={[styles.addBtnText, item.stock === 0 && { color: C.outline }]}>
                {item.stock === 0 ? 'Unavailable' : 'Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Browse & Shop</Text>
          <Text style={styles.headerTitle}>Pet Store</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag-outline" size={22} color={C.primary} />
          <Text style={styles.cartBtnText}>Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={C.outline} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor={C.outlineVariant}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={C.outline} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catPill, activeCategory === item && styles.catPillActive]}
            onPress={() => setActiveCategory(item)}
          >
            <Text style={[styles.catPillText, activeCategory === item && styles.catPillTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Products Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderProduct}
        numColumns={2}
        contentContainerStyle={[styles.productGrid, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 12 }}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={C.primary} style={{ marginTop: 60 }} /> : (
            <View style={styles.empty}>
              <MaterialIcons name="search-off" size={48} color={C.outlineVariant} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          )
        }
      />

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PetList')}>
          <MaterialIcons name="home" size={24} color={C.outline} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyBookings')}>
          <MaterialIcons name="calendar-today" size={24} color={C.outline} />
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="shopping-bag" size={24} color="#fff" />
          <Text style={styles.navTextActive}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('EditProfile')}>
          <MaterialIcons name="person" size={24} color={C.outline} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerSub: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.onSurface, letterSpacing: -0.5 },
  cartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.onPrimaryContainer, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  cartBtnText: { color: C.primary, fontWeight: '700', fontSize: 13 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceHigh, marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 14, height: 48, gap: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 15, color: C.onSurface },
  categoriesScroll: { maxHeight: 48, marginBottom: 12 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surfaceHigh },
  catPillActive: { backgroundColor: C.primary },
  catPillText: { fontSize: 13, fontWeight: '600', color: C.outline },
  catPillTextActive: { color: '#fff' },
  productGrid: { paddingHorizontal: 16, paddingTop: 4 },
  productCard: { flex: 1, backgroundColor: C.surfaceLowest, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, marginBottom: 12, position: 'relative' },
  productImage: { width: '100%', height: 140, backgroundColor: C.surfaceHigh },
  productImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  outOfStockBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  outOfStockText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  productInfo: { padding: 12 },
  productName: { fontSize: 13, fontWeight: '700', color: C.onSurface, marginBottom: 6, lineHeight: 18 },
  categoryBadge: { backgroundColor: C.secondaryFixed, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: C.secondary },
  productPrice: { fontSize: 16, fontWeight: '800', color: C.primary, marginBottom: 10 },
  addBtn: { backgroundColor: C.primary, borderRadius: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addBtnDisabled: { backgroundColor: C.surfaceHigh },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: C.outline, fontSize: 16 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, backgroundColor: 'rgba(255,255,255,0.97)', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 20 },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 2 },
  navText: { fontSize: 10, fontWeight: '600', color: C.outline, letterSpacing: 0.5, marginTop: 3 },
  navTextActive: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5, marginTop: 3 },
});

export default ProductListScreen;
