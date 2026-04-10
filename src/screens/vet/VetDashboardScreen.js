import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getVetBookings, updateBookingStatus } from '../../api/vetBookingApi';
import { AuthContext } from '../../context/AuthContext';

const VetDashboardScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logoutUser } = useContext(AuthContext);
  const navigation = useNavigation();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getVetBookings();
      const list = Array.isArray(data) ? data : data.bookings || [];
      const validBookings = list.filter(b => b.petId != null);
      setBookings(validBookings);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch bookings');
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
      Alert.alert('Error', error.response?.data?.message || error.message);
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

      {item.petId && (
        <TouchableOpacity 
          style={styles.recordsButton}
          onPress={() => navigation.navigate('MedicalRecords', { petId: item.petId._id, petName: item.petId.name })}
        >
          <Text style={styles.recordsText}>📋 View Medical Records</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Vet Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : bookings.length === 0 ? (
        <Text style={styles.emptyText}>No bookings available.</Text>
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
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic' },
  recordsButton: { backgroundColor: '#f0fdf4', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#86efac' },
  recordsText: { color: '#15803d', fontWeight: 'bold', fontSize: 13 },
});

export default VetDashboardScreen;
