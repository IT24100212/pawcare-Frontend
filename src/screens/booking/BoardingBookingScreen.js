import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPets } from '../../api/petApi';
import { getAvailableSlots, lockSlot, confirmBooking } from '../../api/boardingApi';

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const BoardingBookingScreen = () => {
  const [selectedDate, setSelectedDate] = useState(getTomorrowDateString());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [lockedBookingId, setLockedBookingId] = useState(null);
  
  const [loadingPets, setLoadingPets] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [locking, setLocking] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDate.length === 10) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchPets = async () => {
    try {
      const data = await getPets();
      setPets(data);
      if (data && data.length > 0) {
        setSelectedPet(data[0]._id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pets');
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const data = await getAvailableSlots(selectedDate);
      setAvailableSlots(Array.isArray(data) ? data : data.slots || []);
      setSelectedSlot(null);
      setLockedBookingId(null);
    } catch (error) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotPress = async (slot) => {
    if (locking) return;
    
    setSelectedSlot(slot);
    setLocking(true);
    try {
      const data = await lockSlot(selectedDate, slot);
      const bookingId = data._id || data.id || data.bookingId || (data.booking && data.booking._id);
      setLockedBookingId(bookingId);
    } catch (error) {
      Alert.alert('Error', 'Failed to lock slot. It may have been taken.');
      setSelectedSlot(null);
    } finally {
      setLocking(false);
    }
  };

  const handleConfirm = async () => {
    if (!lockedBookingId || !selectedPet) return;

    setConfirming(true);
    try {
      await confirmBooking(lockedBookingId, selectedPet);
      Alert.alert('Success', 'Boarding stay confirmed!', [
        { text: 'OK', onPress: () => navigation.navigate('PetList') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm booking.');
    } finally {
      setConfirming(false);
    }
  };

  const renderSlot = ({ item }) => {
    const isSelected = selectedSlot === item;
    return (
      <TouchableOpacity 
        style={[styles.slotItem, isSelected && styles.slotItemSelected]} 
        onPress={() => handleSlotPress(item)}
      >
        <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
          {typeof item === 'string' ? item : item.time || JSON.stringify(item)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Book Boarding Stay</Text>
      <Text style={styles.label}>Select Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={selectedDate}
        onChangeText={setSelectedDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Select Pet</Text>
      {loadingPets ? (
        <ActivityIndicator size="small" color="#3b82f6" />
      ) : pets.length === 0 ? (
        <Text style={styles.emptyText}>No pets found. Please add a pet first.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
          {pets.map(pet => (
             <TouchableOpacity 
               key={pet._id} 
               style={[styles.petItem, selectedPet === pet._id && styles.petItemSelected]}
               onPress={() => setSelectedPet(pet._id)}
             >
               <Text style={[styles.petText, selectedPet === pet._id && styles.petTextSelected]}>
                 {pet.name}
               </Text>
             </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>Available Slots</Text>
      {loadingSlots ? (
        <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 20 }} />
      ) : availableSlots.length === 0 ? (
        <Text style={styles.emptyText}>No slots available for this date.</Text>
      ) : (
        <FlatList
          data={availableSlots}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          renderItem={renderSlot}
          scrollEnabled={false}
          columnWrapperStyle={styles.slotsRow}
        />
      )}

      {lockedBookingId && selectedPet && (
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={confirming}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Stay</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#374151',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  petScroll: {
    marginBottom: 10,
  },
  petItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  petItemSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  petText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '600',
  },
  petTextSelected: {
    color: '#fff',
  },
  slotsRow: {
    justifyContent: 'flex-start',
  },
  slotItem: {
    flex: 1,
    margin: 5,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  slotItemSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  slotText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  slotTextSelected: {
    color: '#fff',
  },
  emptyText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default BoardingBookingScreen;
