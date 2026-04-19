import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/* ───── Animated floating paw (ONLY animation on screen) ───── */
const FloatingPaw = ({ x, y, size, baseOpacity, delay }) => {
  const float = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 2800 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 2800 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const ty = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const op = float.interpolate({ inputRange: [0, 0.5, 1], outputRange: [baseOpacity, baseOpacity * 1.5, baseOpacity] });

  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, opacity: Animated.multiply(fade, op), transform: [{ translateY: ty }] }}>
      <Ionicons name="paw" size={size} color="#fff" />
    </Animated.View>
  );
};

/* ───── Main Screen ───── */
const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      {/* ─── ORANGE TOP ─── */}
      <View style={styles.top}>
        {/* Floating paw prints — only animated elements */}
        <FloatingPaw x={16}         y={38}          size={48} baseOpacity={0.2}  delay={0}   />
        <FloatingPaw x={width - 72} y={28}          size={40} baseOpacity={0.18} delay={400} />
        <FloatingPaw x={40}         y={height*0.28} size={56} baseOpacity={0.14} delay={800} />
        <FloatingPaw x={width - 90} y={height*0.24} size={44} baseOpacity={0.16} delay={200} />
        <FloatingPaw x={width*0.42} y={16}          size={32} baseOpacity={0.13} delay={600} />
        <FloatingPaw x={width - 55} y={height*0.4}  size={36} baseOpacity={0.15} delay={1000} />
        <FloatingPaw x={12}         y={height*0.42} size={42} baseOpacity={0.12} delay={900} />

        {/* Hero cat — static, blended with background */}
        <Image
          source={require('../../../assets/images/hero_cat.png')}
          style={styles.catImage}
          resizeMode="contain"
        />
      </View>

      {/* ─── WHITE BOTTOM ─── */}
      <View style={styles.bottom}>

        {/* Dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Start Your Journey as a{'\n'}Thoughtful Pet Parent
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Begin a meaningful journey of care,{'\n'}connection, and responsibility.
        </Text>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Get Started</Text>
          <View style={styles.btnPaw}>
            <Ionicons name="paw" size={24} color="#f9b256" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ─────────── styles ─────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  top: {
    height: height * 0.57,
    backgroundColor: '#f6ab49',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  catImage: {
    width: width,
    height: height * 0.52,
    position: 'absolute',
    bottom: 0,
  },

  bottom: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -28,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },

  dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot:     { height: 10, borderRadius: 5 },
  dotActive:   { width: 24, backgroundColor: '#f6ab49' },
  dotInactive: { width: 10, backgroundColor: '#fed7aa' },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
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
  btnText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  btnPaw: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
});

export default WelcomeScreen;
