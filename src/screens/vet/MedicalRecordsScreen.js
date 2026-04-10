import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getMedicalRecords, deleteMedicalRecord } from '../../api/medicalRecordApi';

const MedicalRecordsScreen = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();
  const { petId, petName } = route.params;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getMedicalRecords(petId);
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const unsubscribe = navigation.addListener('focus', fetchRecords);
    return unsubscribe;
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMedicalRecord(id);
            fetchRecords();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete record');
          }
        },
      },
    ]);
  };

  const renderRecord = ({ item }) => (
    <View style={styles.card}>
      {item.vaccineName && (
        <View style={styles.row}>
          <Text style={styles.label}>💉 Vaccine:</Text>
          <Text style={styles.value}>{item.vaccineName}</Text>
        </View>
      )}
      {item.dateGiven && (
        <View style={styles.row}>
          <Text style={styles.label}>Date Given:</Text>
          <Text style={styles.value}>{new Date(item.dateGiven).toLocaleDateString()}</Text>
        </View>
      )}
      {item.nextDueDate && (
        <View style={styles.row}>
          <Text style={styles.label}>Next Due:</Text>
          <Text style={styles.value}>{new Date(item.nextDueDate).toLocaleDateString()}</Text>
        </View>
      )}
      {item.illnesses && (
        <View style={styles.row}>
          <Text style={styles.label}>🩺 Illness:</Text>
          <Text style={styles.value}>{item.illnesses}</Text>
        </View>
      )}
      {item.treatments && (
        <View style={styles.row}>
          <Text style={styles.label}>💊 Treatment:</Text>
          <Text style={styles.value}>{item.treatments}</Text>
        </View>
      )}
      {item.allergies && (
        <View style={styles.row}>
          <Text style={styles.label}>⚠️ Allergies:</Text>
          <Text style={styles.value}>{item.allergies}</Text>
        </View>
      )}
      {item.doctorNotes && (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Doctor's Notes:</Text>
          <Text style={styles.noteText}>{item.doctorNotes}</Text>
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddEditRecord', { petId, record: item })}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Medical Records — {petName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : records.length === 0 ? (
        <Text style={styles.emptyText}>No medical records for this pet.</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderRecord}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEditRecord', { petId, record: null })}>
        <Text style={styles.addButtonText}>+ Add Medical Record</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', padding: 15, paddingTop: 10 },
  list: { padding: 15, paddingBottom: 80 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { fontWeight: 'bold', color: '#374151', width: 110 },
  value: { flex: 1, color: '#4b5563' },
  noteBox: { backgroundColor: '#f9fafb', padding: 10, borderRadius: 6, marginTop: 8 },
  noteLabel: { fontWeight: 'bold', color: '#374151', marginBottom: 4 },
  noteText: { color: '#4b5563', fontStyle: 'italic' },
  actions: { flexDirection: 'row', marginTop: 10, borderTopWidth: 1, borderColor: '#e5e7eb', paddingTop: 10 },
  editBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#dbeafe', borderRadius: 5, marginRight: 5 },
  editText: { color: '#2563eb', fontWeight: 'bold' },
  deleteBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: '#fee2e2', borderRadius: 5, marginLeft: 5 },
  deleteText: { color: '#dc2626', fontWeight: 'bold' },
  addButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10b981', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic', fontSize: 16 },
});

export default MedicalRecordsScreen;
