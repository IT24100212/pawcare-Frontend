import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StarRating from '../../components/common/StarRating';
import { submitFeedback } from '../../api/feedbackApi';

const SubmitFeedbackScreen = () => {
  const [serviceType, setServiceType] = useState('Vet');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigation = useNavigation();

  const services = ['Vet', 'Grooming', 'Boarding', 'PetShop'];

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Validation Error', 'Please enter a comment for your feedback.');
      return;
    }

    setSubmitting(true);
    try {
      await submitFeedback({ serviceType, rating, comment });
      Alert.alert('Success', 'Thank you for your feedback!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Leave Your Feedback</Text>
        
        <Text style={styles.label}>Service Received</Text>
        <View style={styles.servicesContainer}>
          {services.map((svc) => (
            <TouchableOpacity
              key={svc}
              style={[styles.serviceOption, serviceType === svc && styles.serviceOptionSelected]}
              onPress={() => setServiceType(svc)}
            >
              <Text style={[styles.serviceText, serviceType === svc && styles.serviceTextSelected]}>
                {svc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Your Rating</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={rating} onRatingChange={setRating} />
        </View>

        <Text style={styles.label}>Comment / Review</Text>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience with us..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#374151',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 5,
  },
  serviceOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  serviceText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  serviceTextSelected: {
    color: '#fff',
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default SubmitFeedbackScreen;
