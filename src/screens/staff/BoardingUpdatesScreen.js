import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addBoardingUpdate } from '../../api/boardingApi';
import axiosInstance from '../../api/axiosInstance';

const C = {
  primary: '#006850', primaryContainer: '#148367', onPrimaryContainer: '#effff6',
  surface: '#faf9f8', surfaceHigh: '#e9e8e7', onSurface: '#1a1c1c', outline: '#6e7a74',
};

const BoardingUpdatesScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [updates, setUpdates] = useState(booking.updates || []);
  const [message, setMessage] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    
    formData.append('image', { uri, name: filename, type });

    try {
      const response = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  };

  const handlePostUpdate = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message for the update.');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;
      if (imageUri) {
        photoUrl = await uploadImage(imageUri);
      }

      const updatedBooking = await addBoardingUpdate(booking._id, { message, photoUrl });
      setUpdates(updatedBooking.updates);
      setMessage('');
      setImageUri(null);
      Alert.alert('Success', 'Pawtocast sent to the owner!');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post update');
    } finally {
      setLoading(false);
    }
  };

  const renderUpdate = ({ item }) => (
    <View style={styles.updateCard}>
      <Text style={styles.updateDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.updateMessage}>{item.message}</Text>
      {item.photoUrl && (
        <Image source={{ uri: item.photoUrl }} style={styles.updateImage} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={updates}
        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
        renderItem={renderUpdate}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No updates sent yet.</Text>}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
              <Ionicons name="camera" size={24} color={C.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="What's the pet up to?"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handlePostUpdate} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surfaceHigh },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', color: C.outline, marginTop: 40 },
  updateCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  updateDate: { fontSize: 12, color: C.outline, marginBottom: 8 },
  updateMessage: { fontSize: 16, color: C.onSurface, marginBottom: 12 },
  updateImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  inputContainer: { backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderTopColor: C.surfaceHigh },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, maxHeight: 100, fontSize: 16 },
  iconBtn: { padding: 8 },
  sendBtn: { backgroundColor: C.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  imagePreviewContainer: { position: 'relative', marginBottom: 12 },
  imagePreview: { width: 100, height: 100, borderRadius: 8 },
  removeImageBtn: { position: 'absolute', top: -8, left: 88, backgroundColor: '#fff', borderRadius: 12 },
});

export default BoardingUpdatesScreen;
