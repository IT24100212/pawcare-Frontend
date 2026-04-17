import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, StatusBar, ScrollView, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getPets, deletePet } from '../../api/petApi';
import { AuthContext } from '../../context/AuthContext';

const C = {
  primary: '#006850', primaryContainer: '#148367', onPrimaryContainer: '#effff6',
  primaryFixedDim: '#78d8b8', secondary: '#8e4e14', secondaryContainer: '#ffab69',
  secondaryFixed: '#ffdcc4', surface: '#faf9f8', surfaceHigh: '#e9e8e7',
  surfaceLow: '#f4f3f2', surfaceLowest: '#ffffff', onSurface: '#1a1c1c',
  onSurfaceVariant: '#3e4944', outline: '#6e7a74', outlineVariant: '#bdc9c3',
  emeraldDark: '#052E25',
};

const PET_COLORS = ['#148367', '#8e4e14', '#9f3a21', '#006850', '#783d01', '#1e7a6e'];
const SPECIES_ICONS = { Dog: 'pets', Cat: 'pets', Bird: 'flutter-dash', Fish: 'set-meal', default: 'pets' };

const PetListScreen = () => {
  const insets = useSafeAreaInsets();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { logoutUser } = useContext(AuthContext);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const data = await getPets();
      setPets(data);
    } catch {
      Alert.alert('Error', 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isFocused) fetchPets(); }, [isFocused]);

  const handleDelete = (id) => {
    Alert.alert('Remove Pet', 'Are you sure you want to remove this pet?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try { await deletePet(id); fetchPets(); }
          catch { Alert.alert('Error', 'Failed to remove pet'); }
        },
      },
    ]);
  };

  const renderPet = ({ item, index }) => {
    const color = PET_COLORS[index % PET_COLORS.length];
    const icon = SPECIES_ICONS[item.species] || SPECIES_ICONS.default;
    return (
      <View style={[styles.petCard, { borderLeftColor: color }]}>
        <View style={[styles.petAvatarBox, { backgroundColor: color + '18' }]}>
          <MaterialIcons name={icon} size={28} color={color} />
        </View>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petDetails}>{item.species}{item.breed ? ` · ${item.breed}` : ''}</Text>
          {item.age != null && <Text style={styles.petAge}>{item.age} yr{item.age !== 1 ? 's' : ''} old</Text>}
        </View>
        <View style={styles.petActions}>
          <TouchableOpacity
            style={styles.petActionBtn}
            onPress={() => navigation.navigate('EditPet', { pet: item })}
          >
            <MaterialIcons name="edit" size={18} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.petActionBtn, styles.petDeleteBtn]}
            onPress={() => handleDelete(item._id)}
          >
            <MaterialIcons name="delete-outline" size={18} color="#ba1a1a" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const bookingCards = [
    { label: 'Vet', icon: 'medical-services', screen: 'VetBooking', color: C.primary },
    { label: 'Grooming', icon: 'content-cut', screen: 'GroomingBooking', color: C.secondary },
    { label: 'Boarding', icon: 'home', screen: 'BoardingBooking', color: '#1e7a6e' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.emeraldDark} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back 🐾</Text>
          <Text style={styles.headerTitle}>PawCare</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <MaterialIcons name="logout" size={18} color="rgba(236,253,245,0.85)" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Book a Service */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BOOK A SERVICE</Text>
          <View style={styles.bookingRow}>
            {bookingCards.map(bc => (
              <TouchableOpacity
                key={bc.screen}
                style={[styles.bookingCard, { borderTopColor: bc.color }]}
                onPress={() => navigation.navigate(bc.screen)}
                activeOpacity={0.8}
              >
                <View style={[styles.bookingIconBox, { backgroundColor: bc.color + '18' }]}>
                  <MaterialIcons name={bc.icon} size={24} color={bc.color} />
                </View>
                <Text style={styles.bookingLabel}>{bc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: C.primary }]}>
            <Text style={styles.statNum}>{pets.length}</Text>
            <Text style={styles.statLabel}>Pets</Text>
          </View>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: C.secondaryFixed }]}
            onPress={() => navigation.navigate('MyBookings')}>
            <MaterialIcons name="calendar-today" size={22} color={C.secondary} />
            <Text style={[styles.statLabel, { color: C.secondary }]}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: C.surfaceHigh }]}
            onPress={() => navigation.navigate('FeedbackWall')}>
            <MaterialIcons name="star" size={22} color={C.outline} />
            <Text style={[styles.statLabel, { color: C.outline }]}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* My Pets */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>MY PETS</Text>
            <TouchableOpacity style={styles.addPetBtn} onPress={() => navigation.navigate('AddPet')}>
              <MaterialIcons name="add" size={16} color={C.primary} />
              <Text style={styles.addPetText}>Add Pet</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 30 }} />
          ) : pets.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="pets" size={48} color={C.outlineVariant} />
              </View>
              <Text style={styles.emptyTitle}>No pets yet</Text>
              <Text style={styles.emptyDesc}>Add your first pet to get started with PawCare.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddPet')}>
                <Text style={styles.emptyBtnText}>Add Your First Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            pets.map((item, index) => (
              <View key={item._id}>{renderPet({ item, index })}</View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.navItemActive}>
          <MaterialIcons name="home" size={24} color="#fff" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MyBookings')}>
          <MaterialIcons name="calendar-today" size={24} color={C.outline} />
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ProductList')}>
          <MaterialIcons name="shopping-bag" size={24} color={C.outline} />
          <Text style={styles.navText}>Shop</Text>
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
  safe: { flex: 1, backgroundColor: C.emeraldDark },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: C.emeraldDark,
  },
  headerGreeting: { fontSize: 12, color: 'rgba(120,216,184,0.8)', fontWeight: '600', letterSpacing: 0.5 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  logoutText: { color: 'rgba(236,253,245,0.85)', fontSize: 13, fontWeight: '600' },
  scroll: { flex: 1, backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.primary, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 14 },
  addPetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.onPrimaryContainer, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addPetText: { fontSize: 12, fontWeight: '700', color: C.primary },

  bookingRow: { flexDirection: 'row', gap: 12 },
  bookingCard: {
    flex: 1, backgroundColor: C.surfaceLowest, borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 10, borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  bookingIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  bookingLabel: { fontSize: 13, fontWeight: '700', color: C.onSurface },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  statNum: { fontSize: 28, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },

  petCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceLowest, borderRadius: 16,
    padding: 16, marginBottom: 12, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  petAvatarBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  petInfo: { flex: 1 },
  petName: { fontSize: 16, fontWeight: '800', color: C.onSurface, marginBottom: 2 },
  petDetails: { fontSize: 13, color: C.onSurfaceVariant, fontWeight: '500' },
  petAge: { fontSize: 12, color: C.outline, marginTop: 2 },
  petActions: { flexDirection: 'row', gap: 8 },
  petActionBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceLow, justifyContent: 'center', alignItems: 'center' },
  petDeleteBtn: { backgroundColor: '#ffdad6' },

  emptyBox: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.surfaceHigh, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.onSurface, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: C.outline, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { backgroundColor: C.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 28, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingTop: 12, backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 20,
  },
  navItem: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  navItemActive: { alignItems: 'center', backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 2 },
  navText: { fontSize: 10, fontWeight: '600', color: C.outline, letterSpacing: 0.5, marginTop: 3 },
  navTextActive: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5, marginTop: 3 },
});

export default PetListScreen;
