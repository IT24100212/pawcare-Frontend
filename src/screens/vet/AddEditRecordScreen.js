import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { addMedicalRecord, updateMedicalRecord } from '../../api/medicalRecordApi';

const AddEditRecordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId, record } = route.params;
  const isEditing = !!record;

  const [vaccineName, setVaccineName] = useState(record?.vaccineName || '');
  const [dateGiven, setDateGiven] = useState(record?.dateGiven ? record.dateGiven.split('T')[0] : '');
  const [nextDueDate, setNextDueDate] = useState(record?.nextDueDate ? record.nextDueDate.split('T')[0] : '');
  const [illnesses, setIllnesses] = useState(record?.illnesses || '');
  const [treatments, setTreatments] = useState(record?.treatments || '');
  const [allergies, setAllergies] = useState(record?.allergies || '');
  const [doctorNotes, setDoctorNotes] = useState(record?.doctorNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        petId,
        vaccineName: vaccineName || undefined,
        dateGiven: dateGiven ? new Date(dateGiven) : undefined,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        illnesses: illnesses || undefined,
        treatments: treatments || undefined,
        allergies: allergies || undefined,
        doctorNotes: doctorNotes || undefined,
      };

      if (isEditing) {
        await updateMedicalRecord(record._id, data);
        Alert.alert('Success', 'Record updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await addMedicalRecord(data);
        Alert.alert('Success', 'Record added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEditing ? 'Edit Medical Record' : 'Add Medical Record'}</Text>

      <Text style={styles.label}>Vaccine Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Rabies, Parvovirus" value={vaccineName} onChangeText={setVaccineName} />

      <Text style={styles.label}>Date Given (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2026-01-15" value={dateGiven} onChangeText={setDateGiven} />

      <Text style={styles.label}>Next Due Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2027-01-15" value={nextDueDate} onChangeText={setNextDueDate} />

      <Text style={styles.label}>Illnesses</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Any diagnosed conditions..." value={illnesses} onChangeText={setIllnesses} multiline numberOfLines={3} />

      <Text style={styles.label}>Treatments</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Antibiotics, surgery, etc." value={treatments} onChangeText={setTreatments} multiline numberOfLines={3} />

      <Text style={styles.label}>Allergies</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Known allergies..." value={allergies} onChangeText={setAllergies} multiline numberOfLines={2} />

      <Text style={styles.label}>Doctor's Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} placeholder="Additional notes..." value={doctorNotes} onChangeText={setDoctorNotes} multiline numberOfLines={4} />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{isEditing ? 'Update Record' : 'Add Record'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f3f4f6' },
  header: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 5, marginTop: 12 },
  input: { height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', marginBottom: 5 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  saveButton: { backgroundColor: '#10b981', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 25, marginBottom: 40 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddEditRecordScreen;
