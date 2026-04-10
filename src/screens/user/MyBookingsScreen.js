import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { getMyBookings } from '../../api/bookingApi';
import axiosInstance from '../../api/axiosInstance';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchBookings();
  }, [isFocused]);

  const handleCancel = (booking) => {
    if (booking.isInstantSlot) {
      Alert.alert('Cannot Cancel', 'Instant slot bookings cannot be cancelled.');
      return;
    }

    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this appointment?', [
      { text: 'No' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            // Determine the correct cancel endpoint based on serviceType
            const serviceMap = { Vet: 'vet', Grooming: 'grooming', Boarding: 'boarding' };
            const serviceSlug = serviceMap[booking.serviceType] || 'vet';
            await axiosInstance.delete(`/bookings/${serviceSlug}/${booking._id}`);
            Alert.alert('Success', 'Booking cancelled');
            fetchBookings();
          } catch (error) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to cancel booking');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Rejected':
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tagRow}>
          <Text style={styles.serviceTag}>{item.serviceType}</Text>
          {item.isInstantSlot && <Text style={styles.instantTag}>⚡ Instant</Text>}
        </View>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.date}>
        Date: {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString() : 'N/A'} at {item.timeSlot || 'N/A'}
      </Text>
      {item.petId?.name && (
        <Text style={styles.petName}>Pet: {item.petId.name}</Text>
      )}

      {item.status === 'Pending' && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item)}>
          <Text style={styles.cancelText}>
            {item.isInstantSlot ? '🔒 Cannot Cancel (Instant)' : 'Cancel Booking'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : bookings.length === 0 ? (
        <Text style={styles.emptyText}>You haven't made any bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  tagRow: { flexDirection: 'row', alignItems: 'center' },
  serviceTag: { backgroundColor: '#e0f2fe', color: '#0369a1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  instantTag: { backgroundColor: '#fef3c7', color: '#92400e', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 11, fontWeight: 'bold', marginLeft: 6, overflow: 'hidden' },
  status: { fontWeight: 'bold', fontSize: 14 },
  date: { fontSize: 15, color: '#374151', marginBottom: 4 },
  petName: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  cancelButton: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#dc2626', fontWeight: 'bold', fontSize: 14 },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic', fontSize: 16 },
});

export default MyBookingsScreen;
