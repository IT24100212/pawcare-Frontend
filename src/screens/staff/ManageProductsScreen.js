import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getProducts, deleteProduct } from '../../api/productApi';
import { AuthContext } from '../../context/AuthContext';

const ManageProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { logoutUser } = useContext(AuthContext);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchProducts();
  }, [isFocused]);

  const handleDelete = (id, name) => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            fetchProducts();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete product');
          }
        },
      },
    ]);
  };

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={styles.noImage}><Text style={styles.noImageText}>No Photo</Text></View>
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>Category: {item.category}</Text>
        <Text style={styles.details}>Price: ${item.price}</Text>
        <Text style={styles.details}>Stock: {item.stock}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddEditProduct', { product: item })}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.name)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Products</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabActiveText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('ShopOrders')}>
          <Text style={styles.tabText}>Orders</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : products.length === 0 ? (
        <Text style={styles.emptyText}>No products yet.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEditProduct', { product: null })}>
        <Text style={styles.addButtonText}>+ Add New Product</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#ef4444', padding: 8, borderRadius: 5 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabActiveText: { color: '#3b82f6', fontWeight: 'bold' },
  list: { padding: 15, paddingBottom: 80 },
  card: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' },
  productImage: { width: '100%', height: 150, resizeMode: 'cover' },
  noImage: { width: '100%', height: 80, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: '#9ca3af', fontStyle: 'italic' },
  cardInfo: { padding: 12 },
  name: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  details: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#e5e7eb' },
  editBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#dbeafe' },
  editText: { color: '#2563eb', fontWeight: 'bold' },
  deleteBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: '#fee2e2' },
  deleteText: { color: '#dc2626', fontWeight: 'bold' },
  addButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#3b82f6', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic', fontSize: 16 },
});

export default ManageProductsScreen;
