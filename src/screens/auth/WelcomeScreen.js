import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      
      {/* Top Section / Hero */}
      <View style={styles.topSection}>
        {/* Background Image/Pattern */}
        <Image 
          source={{ uri: 'https://lh3.googleusercontent.com/aida/ADBb0ug2mWPS4U0_iJFmKADNcTl25l7jeQvBvxsyDHrka764940E7p13R6pwo0YphB2N6xCUWIaZAwNIeXD_kQ0K7jZTd9TMBpekmnvQbkuP8TneZdUKWRvGgxIqgDdkmj-AaNoj3Z3hc9BKR2KmaAXehK7TwqEZKe5JgK42a5Wdy02Et1uWwYycJ9albCyA8tVu13SX6vV41zBVO76xb4vayX2oY4rl8VZjU7uik-Bck6jG953D1Rt25eSUtxRlZWPAM9fUKXNmpxVpsw' }}
          style={styles.backgroundImage}
          resizeMode='cover'
        />
        {/* Hero Subject Image */}
        <Image 
          source={{ uri: 'https://lh3.googleusercontent.com/aida/ADBb0uhQHL8vUALmYSsEkSavVVUcqx26Qb5YOyjTYY3glimrz9eCxuut4QPaimOz2O5v2JE434jcioYizaYciQR--rzLD35nUFNgOaCOZTnfR5dkn5gkSIY5MHWOhwoLsv1OgEQ9C6l5C_vVvJs6yPVMDnmZcQZLku9kIGAHW8_ez2uWynpMYkpQjQ-0hp92VO8CdvCYRwBl3L0lYXrsZo3sn9j0iVkUYoSjjHRnKrW7KdK9yxKWpqtLzrS8VI5WPcZWe2DPL2NhXuXgsw' }}
          style={styles.heroImage}
          resizeMode='cover'
        />
      </View>

      {/* Bottom Content Section */}
      <View style={styles.bottomSection}>
        
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Start Your Journey as a Thoughtful Pet Parent</Text>
          <Text style={styles.subtitle}>Begin a meaningful journey of care, connection, and responsibility.</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <View style={styles.iconWrapper}>
            <Ionicons name='paw' size={24} color="#f9b256" />
          </View>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topSection: {
    height: height * 0.55,
    backgroundColor: '#f6ab49',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.1 }, { translateY: 20 }], // Slight zoom and shift down matching the HTML
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -30, // Overlap the top section smoothly
    borderTopLeftRadius: 30, // Emulates the top arch/overlay without importing SVGs
    borderTopRightRadius: 30,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotInactive: {
    width: 10,
    backgroundColor: '#fed7aa', // orange-200
  },
  dotActive: {
    width: 24,
    backgroundColor: '#f6ab49',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937', // gray-800
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280', // gray-500
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#f9b256',
    width: '100%',
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 6,
    shadowColor: '#f9b256',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WelcomeScreen;
