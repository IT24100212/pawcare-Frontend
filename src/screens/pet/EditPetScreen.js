import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updatePet } from '../../api/petApi';

const EditPetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pet = route.params?.pet;

  const [name, setName] = useState(pet?.name || '');
  const [species, setSpecies] = useState(pet?.species || '');
  const [breed, setBreed] = useState(pet?.breed || '');
  const [age, setAge] = useState(pet?.age != null ? String(pet.age) : '');
  const [medicalNotes, setMedicalNotes] = useState(pet?.medicalNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !species) {
      Alert.alert('Error', 'Name and Species are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePet(pet._id, {
        name,
        species,
        breed,
        age: age ? Number(age) : null,
        medicalNotes,
      });
      Alert.alert('Success', 'Pet updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update pet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Pet Details</Text>

      <TextInput style={styles.input} placeholder="Name (Required)" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Species (e.g. Dog, Cat) (Required)" value={species} onChangeText={setSpecies} />
      <TextInput style={styles.input} placeholder="Breed" value={breed} onChangeText={setBreed} />
      <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInput style={[styles.input, styles.textArea]} placeholder="Medical Notes / Allergies" value={medicalNotes} onChangeText={setMedicalNotes} multiline numberOfLines={4} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  input: { height: 50, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, backgroundColor: '#f9fafb' },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
  button: { backgroundColor: '#3b82f6', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 40 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditPetScreen;
