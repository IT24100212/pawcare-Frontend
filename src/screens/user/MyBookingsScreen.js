import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getMyBookings } from '../../api/bookingApi';
import axiosInstance from '../../api/axiosInstance';

const C = {
  primary: '#006850', primaryContainer: '#148367', onPrimaryContainer: '#effff6',
  primaryFixedDim: '#78d8b8', secondary: '#8e4e14', secondaryFixed: '#ffdcc4',
  secondaryContainer: '#ffab69', surface: '#faf9f8', surfaceHigh: '#e9e8e7',
  surfaceLow: '#f4f3f2', surfaceLowest: '#ffffff', onSurface: '#1a1c1c',
  onSurfaceVariant: '#3e4944', outline: '#6e7a74', outlineVariant: '#bdc9c3',
  emeraldDark: '#052E25', error: '#ba1a1a', errorContainer: '#ffdad6',
  onErrorContainer: '#410002',
};

const SERVICE_META = {
  Vet: { icon: 'medical-services', color: '#006850', bg: 'rgba(0,104,80,0.1)' },
  Grooming: { icon: 'content-cut', color: '#8e4e14', bg: 'rgba(142,78,20,0.1)' },
  Boarding: { icon: 'home', color: '#1e7a6e', bg: 'rgba(30,122,110,0.1)' },
};

const STATUS_META = {
  Approved: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  Pending: { color: '#78350f', bg: '#fef3c7', label: 'Pending' },
  Rejected: { color: '#410002', bg: '#ffdad6', label: 'Rejected' },
  Cancelled: { color: '#410002', bg: '#ffdad6', label: 'Cancelled' },
};

const TABS = ['Active', 'Cancelled'];

const MyBookingsScreen = () => {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active');
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookings();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (isFocused) fetchBookings(); }, [isFocused]);

  const handleCancel = (booking) => {
    // Only block if explicitly marked as instant slot
    if (booking.isInstantSlot === true) {
      Alert.alert('Cannot Cancel', 'Instant slot bookings cannot be cancelled as another patient may need urgent care.');
      return;
    }
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            const serviceMap = { Vet: 'vet', Grooming: 'grooming', Boarding: 'boarding' };
            const slug = serviceMap[booking.serviceType] || 'vet';
            await axiosInstance.delete(`/bookings/${slug}/${booking._id}`);
            Alert.alert('✅ Cancelled', 'Booking cancelled successfully.');
            fetchBookings();
          } catch (e) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const filteredBookings = bookings.filter(b => {
    const done = b.status === 'Cancelled' || b.status === 'Rejected';
    return activeTab === 'Cancelled' ? done : !done;
  });

  const renderItem = ({ item }) => {
    const meta = SERVICE_META[item.serviceType] || SERVICE_META.Vet;
    const statusMeta = STATUS_META[item.status] || { color: C.outline, bg: C.surfaceHigh, label: item.status };
    const date = item.appointmentDate
      ? new Date(item.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'N/A';
    // Only truly flagged instant slots block cancellation
    const isActualInstantSlot = item.isInstantSlot === true;
    // Can cancel only if Pending and NOT an instant slot
    const canCancel = item.status === 'Pending' && !isActualInstantSlot;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.serviceIconBox, { backgroundColor: meta.bg }]}>
            <MaterialIcons name={meta.icon} size={22} color={meta.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.serviceType}>{item.serviceType} Appointment</Text>
            <Text style={styles.dateText}>{date} · {item.timeSlot || 'N/A'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        </View>

        {item.petId?.name && (
          <View style={styles.petRow}>
            <MaterialIcons name="pets" size={14} color={C.outline} />
            <Text style={styles.petName}>{item.petId.name}</Text>
          </View>
        )}

        {/* Only show instant slot warning if it's genuinely an instant slot AND pending */}
        {isActualInstantSlot && item.status === 'Pending' && (
          <View style={styles.instantBadge}>
            <Ionicons name="flash" size={12} color={C.secondary} />
            <Text style={styles.instantText}>Instant slot — cannot be cancelled</Text>
          </View>
        )}

        {/* Show cancel button only for Pending non-instant bookings */}
        {canCancel && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item)}
            >
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
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
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <MaterialIcons name="calendar-today" size={22} color={C.primary} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={C.primary} style={{ marginTop: 50 }} /> : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="event-busy" size={48} color={C.outlineVariant} />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab} Bookings</Text>
              <Text style={styles.emptyDesc}>You have no {activeTab.toLowerCase()} appointments.</Text>
              {activeTab === 'Active' && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('PetList')}>
                  <Text style={styles.emptyBtnText}>Book a Service</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PetList')}>
          <MaterialIcons name="home" size={24} color="rgba(26,28,28,0.6)" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="calendar-month" size={24} color={C.secondary} />
          <Text style={styles.navTextActive}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProductList')}>
          <MaterialIcons name="shopping-bag" size={24} color="rgba(26,28,28,0.6)" />
          <Text style={styles.navText}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('EditProfile')}>
          <MaterialIcons name="person" size={24} color="rgba(26,28,28,0.6)" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(236,253,245,0.9)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.primary },
  tabsContainer: { flexDirection: 'row', backgroundColor: C.surfaceHigh, margin: 16, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: C.surfaceLowest, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: C.outline },
  tabTextActive: { color: C.primary, fontWeight: '800' },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 12 },
  card: { backgroundColor: C.surfaceLowest, borderRadius: 16, padding: 16, shadowColor: C.onSurface, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  serviceIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  serviceType: { fontSize: 15, fontWeight: '700', color: C.onSurface, marginBottom: 2 },
  dateText: { fontSize: 13, color: C.outline },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800' },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  petName: { fontSize: 13, color: C.onSurfaceVariant },
  instantBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff7ed', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8 },
  instantText: { fontSize: 12, color: C.secondary, fontWeight: '600' },
  cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 12, marginTop: 4 },
  cancelBtn: { backgroundColor: C.errorContainer, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  cancelBtnDisabled: { backgroundColor: C.surfaceHigh },
  cancelBtnText: { color: C.onErrorContainer, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.surfaceHigh, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: C.outline, textAlign: 'center', marginBottom: 20 },
  emptyBtn: { backgroundColor: C.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingTop: 12, backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 48, borderTopRightRadius: 48,
    shadowColor: 'rgba(26,28,28,0.06)', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 1, shadowRadius: 40, elevation: 20,
  },
  navItem: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99 },
  navItemActive: {
    alignItems: 'center', backgroundColor: 'rgba(142,78,20,0.1)',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99,
  },
  navText: { fontSize: 11, fontWeight: '500', color: 'rgba(26,28,28,0.6)', marginTop: 4 },
  navTextActive: { fontSize: 11, fontWeight: '600', color: C.secondary, marginTop: 4 },
});

export default MyBookingsScreen;

