import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Static paw print positions scattered in the orange hero zone
const PAW_POSITIONS = [
  { x: 18,         y: 40,          size: 52, opacity: 0.18, delay: 0    },
  { x: width-80,   y: 30,          size: 44, opacity: 0.15, delay: 300  },
  { x: 46,         y: height*0.26, size: 60, opacity: 0.13, delay: 600  },
  { x: width-100,  y: height*0.22, size: 50, opacity: 0.16, delay: 150  },
  { x: width*0.4,  y: 20,          size: 36, opacity: 0.12, delay: 450  },
  { x: width-60,   y: height*0.38, size: 40, opacity: 0.14, delay: 750  },
  { x: 10,         y: height*0.38, size: 48, opacity: 0.11, delay: 900  },
];

const AnimatedPaw = ({ x, y, size, opacity, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1, duration: 2800 + delay * 0.3,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0, duration: 2800 + delay * 0.3,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const opacityAnim = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [opacity, opacity * 1.5, opacity] });

  return (
    <Animated.Text
      style={{
        position: 'absolute', left: x, top: y,
        fontSize: size, opacity: opacityAnim,
        transform: [{ translateY }],
      }}
    >
      🐾
    </Animated.Text>
  );
};

const WelcomeScreen = () => {
  const navigation = useNavigation();

  // Cat image — gentle float
  const catFloat = useRef(new Animated.Value(0)).current;
  // Text slide up
  const textY    = useRef(new Animated.Value(32)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  // Sub text
  const subY     = useRef(new Animated.Value(24)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;
  // Button breath
  const btnScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Cat float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(catFloat, {
          toValue: -12, duration: 2400,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
        Animated.timing(catFloat, {
          toValue: 0, duration: 2400,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true,
        }),
      ])
    ).start();

    // Text entrance chain
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(textY,        { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(subOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(subY,       { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Button breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnScale, { toValue: 1,    duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(btnScale, { toValue: 0.95, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* ── ORANGE HERO ── */}
      <View style={styles.topSection}>

        {/* Floating paw prints */}
        {PAW_POSITIONS.map((p, i) => (
          <AnimatedPaw key={i} {...p} />
        ))}

        {/* Cat image floats gently */}
        <Animated.Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida/ADBb0uhQHL8vUALmYSsEkSavVVUcqx26Qb5YOyjTYY3glimrz9eCxuut4QPaimOz2O5v2JE434jcioYizaYciQR--rzLD35nUFNgOaCOZTnfR5dkn5gkSIY5MHWOhwoLsv1OgEQ9C6l5C_vVvJs6yPVMDnmZcQZLku9kIGAHW8_ez2uWynpMYkpQjQ-0hp92VO8CdvCYRwBl3L0lYXrsZo3sn9j0iVkUYoSjjHRnKrW7KdK9yxKWpqtLzrS8VI5WPcZWe2DPL2NhXuXgsw' }}
          style={[styles.heroImage, { transform: [{ translateY: catFloat }] }]}
          resizeMode="cover"
        />
      </View>

      {/* ── WHITE BOTTOM ── */}
      <View style={styles.bottomSection}>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: textOpacity, transform: [{ translateY: textY }] }]}>
          Start Your Journey as a Thoughtful Pet Parent
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: subOpacity, transform: [{ translateY: subY }] }]}>
          Begin a meaningful journey of care, connection, and responsibility.
        </Animated.Text>

        {/* CTA Button */}
        <Animated.View style={{ width: '100%', transform: [{ scale: btnScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <View style={styles.iconWrapper}>
              <Ionicons name="paw" size={24} color="#f9b256" />
            </View>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },

  topSection: {
    height: height * 0.57,
    backgroundColor: '#f6ab49',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
  },

  bottomSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#f6ab49',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#fed7aa',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  button: {
    flexDirection: 'row',
    backgroundColor: '#f9b256',
    width: '100%',
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 28,
    paddingRight: 6,
    shadowColor: '#f9b256',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconWrapper: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center',
  },
});

export default WelcomeScreen;
