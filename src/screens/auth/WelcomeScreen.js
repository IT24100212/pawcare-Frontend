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
        {/* New unified Hero Subject Image (includes background and cat) */}
        <Image 
          source={require('../../../assets/images/hero_cat.jpg')}
          style={styles.heroImage}
          resizeMode='cover'
        />
      </View>

      {/* Bottom Content Section */}
      <View style={styles.bottomSection}>
        
        {/* Removed Pagination Dots as there is no swipe functionality */}

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
  heroImage: {
    width: '100%',
    height: '100%',
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
