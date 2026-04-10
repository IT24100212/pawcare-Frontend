import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProducts } from '../../api/productApi';

const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState(null); // 'priceAsc', 'priceDesc', 'nameAsc', 'nameDesc', null
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFiltered(data);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Filter by search keyword
    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sortType === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortType === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortType === 'nameAsc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'nameDesc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    setFiltered(result);
  }, [search, sortType, products]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const toggleSort = () => {
    if (sortType === null) setSortType('priceAsc');
    else if (sortType === 'priceAsc') setSortType('priceDesc');
    else if (sortType === 'priceDesc') setSortType('nameAsc');
    else if (sortType === 'nameAsc') setSortType('nameDesc');
    else setSortType(null);
  };

  const sortLabel = 
    sortType === 'priceAsc' ? 'Price: Low–High' : 
    sortType === 'priceDesc' ? 'Price: High–Low' : 
    sortType === 'nameAsc' ? 'Name: A–Z' :
    sortType === 'nameDesc' ? 'Name: Z–A' : '⇅ Sort';

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>{item.category}</Text>
        <Text style={styles.details}>Price: ${item.price}</Text>
        <Text style={styles.details}>Stock: {item.stock}</Text>
      </View>
      <TouchableOpacity onPress={() => addToCart(item)} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <Text style={styles.sortButtonText}>{sortLabel}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyText}>No products found.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      
      <View style={styles.cartContainer}>
        <TouchableOpacity 
          style={styles.viewCartButton}
          onPress={() => navigation.navigate('Cart', { cart })}
        >
          <Text style={styles.viewCartText}>View Cart ({cartItemCount} items)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  searchRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', alignItems: 'center' },
  searchInput: { flex: 1, height: 42, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, fontSize: 15, backgroundColor: '#f9fafb', marginRight: 8 },
  sortButton: { backgroundColor: '#e0f2fe', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  sortButtonText: { color: '#0369a1', fontWeight: 'bold', fontSize: 12 },
  list: { padding: 15, paddingBottom: 80 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  details: { fontSize: 14, color: '#6b7280' },
  addButton: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 5 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontSize: 16 },
  cartContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  viewCartButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center' },
  viewCartText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProductListScreen;
