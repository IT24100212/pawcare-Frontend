import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllOrders, updateOrderStatus } from '../../api/orderApi';
import { AuthContext } from '../../context/AuthContext';

const ShopDashboardScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logoutUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || `Failed to update order`);
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Order ID: {item._id}</Text>
      <Text style={styles.details}>Date: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
      <Text style={styles.details}>Customer: {item.userId?.name || 'Unknown'} - {item.userId?.email || 'N/A'}</Text>
      <Text style={styles.details}>Total: ${item.totalPrice != null ? Number(item.totalPrice).toFixed(2) : '0.00'}</Text>
      <Text style={styles.details}>Items: {item.items?.length || 0}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      
      {item.status === 'Pending' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.shipButton}
            onPress={() => handleStatusUpdate(item._id, 'Ready')}
          >
            <Text style={styles.actionText}>Mark as Ready</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Shop Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate('ManageProducts')}>
          <Text style={styles.tabText}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabActiveText}>Orders</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders available.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#ef4444', padding: 8, borderRadius: 5 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  tabText: { color: '#6b7280', fontWeight: '600' },
  tabActiveText: { color: '#3b82f6', fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  title: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  details: { fontSize: 15, color: '#374151', marginBottom: 2 },
  status: { fontSize: 15, fontWeight: 'bold', color: '#10b981', marginVertical: 5 },
  actions: { marginTop: 10 },
  shipButton: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 5, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic' }
});

export default ShopDashboardScreen;
