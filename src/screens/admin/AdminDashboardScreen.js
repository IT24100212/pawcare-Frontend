import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { getAllUsers, blockUser, createServiceProvider } from '../../api/adminApi';
import { getAllFeedback, deleteFeedback } from '../../api/feedbackApi';
import { AuthContext } from '../../context/AuthContext';

const ROLES = ['Vet', 'Groomer', 'BoardingManager', 'ShopOwner', 'Admin'];

const AdminDashboardScreen = () => {
  const [tab, setTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New Provider Form State
  const [providerName, setProviderName] = useState('');
  const [providerEmail, setProviderEmail] = useState('');
  const [providerPassword, setProviderPassword] = useState('');
  const [providerRole, setProviderRole] = useState('Vet');
  const [creatingProvider, setCreatingProvider] = useState(false);

  const { logoutUser } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'Users') {
        const data = await getAllUsers();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else if (tab === 'Feedback') {
        const data = await getAllFeedback();
        setFeedbacks(Array.isArray(data) ? data : data.feedbacks || []);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to fetch ${tab.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const handleBlockUser = async (id) => {
    try {
      await blockUser(id);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle user block status');
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await deleteFeedback(id);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete feedback');
    }
  };

  const handleCreateProvider = async () => {
    if (!providerName || !providerEmail || !providerPassword || !providerRole) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    setCreatingProvider(true);
    try {
      await createServiceProvider({
        name: providerName,
        email: providerEmail,
        password: providerPassword,
        role: providerRole
      });
      Alert.alert('Success', 'Service provider created successfully');
      setProviderName('');
      setProviderEmail('');
      setProviderPassword('');
      setTab('Users');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to create provider');
    } finally {
      setCreatingProvider(false);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.details}>{item.email}</Text>
      <Text style={styles.details}>Role: {item.role}</Text>
      <Text style={[styles.details, { color: item.isBlocked ? '#ef4444' : '#10b981', fontWeight: 'bold' }]}>
        Status: {item.isBlocked ? 'Blocked' : 'Active'}
      </Text>
      {item.role !== 'Admin' && (
        <TouchableOpacity 
          style={[styles.actionButton, item.isBlocked ? styles.unblockButton : styles.blockButton]}
          onPress={() => handleBlockUser(item._id)}
        >
          <Text style={styles.actionText}>{item.isBlocked ? 'Unblock Account' : 'Block Account'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFeedback = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Service: {item.serviceType}</Text>
      <Text style={styles.details}>Rating: {item.rating} / 5</Text>
      <Text style={styles.details}>Comment: {item.comment}</Text>
      <Text style={styles.details}>By: {item.user?.email || 'N/A'}</Text>
      <TouchableOpacity 
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => handleDeleteFeedback(item._id)}
      >
        <Text style={styles.actionText}>Delete Review</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddProvider = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Text style={styles.formTitle}>Create Service Provider</Text>
      
      <TextInput style={styles.input} placeholder="Full Name" value={providerName} onChangeText={setProviderName} />
      <TextInput style={styles.input} placeholder="Email" value={providerEmail} onChangeText={setProviderEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={providerPassword} onChangeText={setProviderPassword} secureTextEntry />
      
      <Text style={styles.roleLabel}>Select Role:</Text>
      <View style={styles.rolesContainer}>
        {ROLES.map(role => (
          <TouchableOpacity 
            key={role} 
            style={[styles.roleChip, providerRole === role && styles.roleChipActive]}
            onPress={() => setProviderRole(role)}
          >
            <Text style={[styles.roleText, providerRole === role && styles.roleTextActive]}>{role}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreateProvider} disabled={creatingProvider}>
        {creatingProvider ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Create Account</Text>}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logoutUser}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, tab === 'Users' && styles.tabActive]} onPress={() => setTab('Users')}>
          <Text style={[styles.tabText, tab === 'Users' && styles.tabTextActive]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'Feedback' && styles.tabActive]} onPress={() => setTab('Feedback')}>
          <Text style={[styles.tabText, tab === 'Feedback' && styles.tabTextActive]}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'Add Provider' && styles.tabActive]} onPress={() => setTab('Add Provider')}>
          <Text style={[styles.tabText, tab === 'Add Provider' && styles.tabTextActive]}>+ Provider</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : tab === 'Users' ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
        />
      ) : tab === 'Feedback' ? (
        <FlatList
          data={feedbacks}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderFeedback}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No feedback found.</Text>}
        />
      ) : (
        renderAddProvider()
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
  tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderColor: '#3b82f6' },
  tabText: { color: '#6b7280', fontWeight: 'bold', fontSize: 16 },
  tabTextActive: { color: '#3b82f6' },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  details: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  actionButton: { padding: 12, borderRadius: 5, marginTop: 15, alignItems: 'center' },
  blockButton: { backgroundColor: '#f59e0b' },
  unblockButton: { backgroundColor: '#10b981' },
  deleteButton: { backgroundColor: '#ef4444' },
  actionText: { color: '#fff', fontWeight: 'bold' },
  loader: { marginTop: 50 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#6b7280', fontStyle: 'italic', fontSize: 16 },
  formContainer: { padding: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1f2937' },
  input: { height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', marginBottom: 15 },
  roleLabel: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10 },
  rolesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 10, marginBottom: 10 },
  roleChipActive: { backgroundColor: '#3b82f6' },
  roleText: { color: '#4b5563', fontWeight: 'bold', fontSize: 14 },
  roleTextActive: { color: '#fff' },
  submitButton: { backgroundColor: '#10b981', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default AdminDashboardScreen;
