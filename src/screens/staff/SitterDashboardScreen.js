import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getAllBoardingBookings, updateBookingStatus } from '../../api/boardingApi';
import { AuthContext } from '../../context/AuthContext';

const SitterDashboardScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logoutUser } = useContext(AuthContext);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getAllBoardingBookings();
      const list = Array.isArray(data) ? data : data.bookings || [];
      const validBookings = list.filter(b => b.petId != null);
      setBookings(validBookings);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch boarding bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      fetchBookings();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || `Failed to update booking`);
    }
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Date: {item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString() : 'N/A'} at {item.timeSlot || 'N/A'}</Text>
      <Text style={styles.details}>Pet: {item.petId?.name || 'Unknown'} ({item.petId?.species || 'N/A'})</Text>
      <Text style={styles.details}>Owner: {item.userId?.name || 'Unknown'} - {item.userId?.email || 'N/A'}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      
      {item.status === 'Pending' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.approveButton}
            onPress={() => handleStatusUpdate(item._id, 'Approved')}
          >
            <Text style={styles.actionText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={() => handleStatusUpdate(item._id, 'Rejected')}
          >
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Pet Sitter Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : bookings.length === 0 ? (
        <Text style={styles.emptyText}>No boarding bookings available.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderBooking}
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
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  details: { fontSize: 14, color: '#4b5563', marginBottom: 2 },
  status: { fontSize: 14, fontWeight: 'bold', color: '#10b981', marginVertical: 5 },
  actions: { flexDirection: 'row', marginTop: 10 },
  approveButton: { flex: 1, backgroundColor: '#10b981', padding: 10, borderRadius: 5, marginRight: 5, alignItems: 'center' },
  rejectButton: { flex: 1, backgroundColor: '#ef4444', padding: 10, borderRadius: 5, marginLeft: 5, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic' }
});

export default SitterDashboardScreen;
