import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getAverageRatings, getAllFeedback } from '../../api/feedbackApi';
import StarRating from '../../components/common/StarRating';

const FeedbackWallScreen = () => {
  const [filter, setFilter] = useState('All');
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRatings, setAverageRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const filters = ['All', 'Vet', 'Grooming', 'Boarding', 'PetShop'];

  const fetchAverages = async () => {
    try {
      const data = await getAverageRatings();
      setAverageRatings(data);
    } catch (error) {
      console.log('Error fetching averages', error);
    }
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const serviceType = filter === 'All' ? null : filter;
      const data = await getAllFeedback(serviceType);
      setFeedbacks(Array.isArray(data) ? data : data.feedbacks || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAverages();
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      fetchFeedbacks();
    }
  }, [isFocused, filter]);

  const renderFeedback = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceTag}>{item.serviceType}</Text>
        <StarRating rating={item.rating} />
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.userName}>- {item.user?.name || 'Anonymous'}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
    </View>
  );

  const getOverallAvg = () => {
    if (!Array.isArray(averageRatings) || averageRatings.length === 0) {
      return "0.0";
    }

    if (filter === 'All') {
      let totalRatingSum = 0;
      let totalCount = 0;
      averageRatings.forEach(item => {
        totalRatingSum += (item.averageRating * item.totalFeedbacks);
        totalCount += item.totalFeedbacks;
      });
      if (totalCount === 0) return "0.0";
      return (totalRatingSum / totalCount).toFixed(1);
    } else {
      const categoryAvg = averageRatings.find(item => item._id === filter);
      if (categoryAvg) {
        return Number(categoryAvg.averageRating).toFixed(1);
      }
      return "0.0";
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Averages Section */}
      <View style={styles.avgContainer}>
        <Text style={styles.avgTitle}>Overall Rating</Text>
        <Text style={styles.avgValue}>{getOverallAvg()}</Text>
        <StarRating rating={Math.round(Number(getOverallAvg()))} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterButton, filter === item && styles.filterButtonActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Feedbacks List */}
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      ) : feedbacks.length === 0 ? (
        <Text style={styles.emptyText}>No reviews found for this category.</Text>
      ) : (
        <FlatList
          data={feedbacks}
          keyExtractor={(item, index) => item._id?.toString() || index.toString()}
          renderItem={renderFeedback}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Leave Review Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('SubmitFeedback')}
      >
        <Text style={styles.fabText}>Leave a Review</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  avgContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avgTitle: {
    fontSize: 18,
    color: '#4b5563',
    fontWeight: 'bold',
  },
  avgValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginVertical: 5,
  },
  filtersContainer: {
    paddingVertical: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  loader: {
    marginTop: 50,
  },
  list: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceTag: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  comment: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 10,
  },
  userName: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6b7280',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default FeedbackWallScreen;
