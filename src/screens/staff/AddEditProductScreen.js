import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { addProduct, updateProduct } from '../../api/productApi';
import { uploadImage } from '../../api/userApi';

const AddEditProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const existingProduct = route.params?.product;
  const isEditing = !!existingProduct;

  const [name, setName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState(existingProduct?.category || '');
  const [price, setPrice] = useState(existingProduct?.price != null ? String(existingProduct.price) : '');
  const [stock, setStock] = useState(existingProduct?.stock != null ? String(existingProduct.stock) : '');
  const [imageUrl, setImageUrl] = useState(existingProduct?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop();
        const ext = filename.split('.').pop();
        const formData = new FormData();
        formData.append('image', { uri, name: filename, type: `image/${ext}` });
        const uploadResult = await uploadImage(formData);
        setImageUrl(uploadResult.imageUrl);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name || !category || !price || !stock) {
      Alert.alert('Error', 'Name, category, price, and stock are required');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name,
        category,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      };

      if (isEditing) {
        await updateProduct(existingProduct._id, productData);
        Alert.alert('Success', 'Product updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await addProduct(productData);
        Alert.alert('Success', 'Product added!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>

      <TouchableOpacity onPress={handlePickImage} style={styles.imageContainer}>
        {uploading ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷 Tap to add product photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Product Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Premium Dog Food" value={name} onChangeText={setName} />

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} placeholder="e.g. Food, Toys, Accessories" value={category} onChangeText={setCategory} />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput style={styles.input} placeholder="e.g. 29.99" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      <Text style={styles.label}>Stock Quantity</Text>
      <TextInput style={styles.input} placeholder="e.g. 50" value={stock} onChangeText={setStock} keyboardType="number-pad" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Product' : 'Add Product'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f3f4f6' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 20, textAlign: 'center' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  productImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 150, borderRadius: 8, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#d1d5db', borderStyle: 'dashed' },
  imagePlaceholderText: { color: '#6b7280', fontSize: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 5, marginTop: 10 },
  input: { height: 50, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', marginBottom: 10 },
  saveButton: { backgroundColor: '#10b981', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 40 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddEditProductScreen;
