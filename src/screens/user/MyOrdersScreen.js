import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getMyOrders, cancelOrder } from '../../api/orderApi';

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused]);

  const handleCancel = (id) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelOrder(id);
            fetchOrders();
          } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order ID: {item._id}</Text>
      <Text style={styles.price}>Total: ${item.totalPrice != null ? Number(item.totalPrice).toFixed(2) : '0.00'}</Text>
      <Text style={styles.date}>Date: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
      <Text style={[styles.status, { color: item.status === 'Cancelled' ? '#ef4444' : '#10b981' }]}>
        Status: {item.status || 'Pending'}
      </Text>
      {item.status === 'Pending' && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item._id)}>
          <Text style={styles.cancelText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  orderId: { fontSize: 13, color: '#6b7280', marginBottom: 5 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  date: { fontSize: 14, color: '#4b5563', marginBottom: 5 },
  status: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  cancelButton: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#dc2626', fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic', fontSize: 16 },
});

export default MyOrdersScreen;
