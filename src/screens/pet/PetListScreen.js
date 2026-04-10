import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getPets, deletePet } from '../../api/petApi';
import { AuthContext } from '../../context/AuthContext';

const PetListScreen = () => {
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
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPets();
    }
  }, [isFocused]);

  const handleDelete = async (id) => {
    try {
      await deletePet(id);
      fetchPets();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete pet');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>{item.species} - {item.breed}</Text>
        <Text style={styles.details}>Age: {item.age}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('EditPet', { pet: item })} style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Pets</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dashLinks}>
        <TouchableOpacity 
          style={styles.dashButton}
          onPress={() => navigation.navigate('MyBookings')}
        >
          <Text style={styles.dashButtonText}>📅 My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dashButton}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.dashButtonText}>📦 My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dashButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.dashButtonText}>👤 Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.bookVetButton}
        onPress={() => navigation.navigate('VetBooking')}
      >
        <Text style={styles.bookVetText}>📅 Book Vet</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bookGroomingButton}
        onPress={() => navigation.navigate('GroomingBooking')}
      >
        <Text style={styles.bookGroomingText}>✂️ Book Grooming</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.bookBoardingButton}
        onPress={() => navigation.navigate('BoardingBooking')}
      >
        <Text style={styles.bookBoardingText}>🏠 Book Boarding</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => navigation.navigate('ProductList')}
      >
        <Text style={styles.shopText}>🛒 Visit Pet Shop</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.feedbackButton}
        onPress={() => navigation.navigate('FeedbackWall')}
      >
        <Text style={styles.feedbackText}>⭐ Read Reviews & Feedback</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : pets.length === 0 ? (
        <Text style={styles.emptyText}>You haven't added any pets yet.</Text>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('AddPet')}
      >
        <Text style={styles.addButtonText}>+ Add New Pet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#ef4444',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#6b7280',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  editButtonText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    margin: 20,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookVetButton: {
    backgroundColor: '#10b981',
    marginHorizontal: 20,
    marginTop: 15,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookVetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookGroomingButton: {
    backgroundColor: '#f59e0b',
    marginHorizontal: 20,
    marginTop: 10,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookGroomingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookBoardingButton: {
    backgroundColor: '#0ea5e9',
    marginHorizontal: 20,
    marginTop: 10,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBoardingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopButton: {
    backgroundColor: '#8b5cf6', // A purple color to distinguish it
    marginHorizontal: 20,
    marginTop: 10,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackButton: {
    backgroundColor: '#f43f5e', // A rose color
    marginHorizontal: 20,
    marginTop: 10,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dashLinks: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    justifyContent: 'space-between',
  },
  dashButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  dashButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6b7280',
    fontSize: 16,
  }
});

export default PetListScreen;
