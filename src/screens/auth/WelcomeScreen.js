import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Creates a jagged "torn paper" edge using pure CSS rotated squares
// so we don't need react-native-svg which can crash Expo Go.
const TornEdge = () => {
  const pieces = [];
  const count = 30;
  const pieceWidth = width / count;
  for (let i = 0; i < count + 2; i++) {
    const size = 15 + Math.random() * 12;
    const yOffset = -size / 2 + Math.random() * 6;
    pieces.push(
      <View
        key={i}
        style={{
          position: 'absolute',
          left: (i - 1) * pieceWidth,
          top: yOffset,
          width: size,
          height: size,
          backgroundColor: '#fff',
          transform: [{ rotate: `${Math.random() * 90}deg` }],
        }}
      />
    );
  }
  return <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 10, zIndex: 10 }}>{pieces}</View>;
};

const FloatingPaw = ({ x, y, size, baseOpacity, delay }) => {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 2500 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 2500 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  const ty = float.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const op = float.interpolate({ inputRange: [0, 0.5, 1], outputRange: [baseOpacity, baseOpacity * 1.5, baseOpacity] });

  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, opacity: op, transform: [{ translateY: ty }] }}>
      <Ionicons name="paw" size={size} color="#fff" />
    </Animated.View>
  );
};

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      
      {/* ─── ORANGE TOP ─── */}
      <View style={styles.top}>
        {/* Floating paw prints */}
        <FloatingPaw x={30}         y={50}          size={42} baseOpacity={0.2}  delay={0}   />
        <FloatingPaw x={width - 80} y={40}          size={36} baseOpacity={0.15} delay={400} />
        <FloatingPaw x={50}         y={height*0.28} size={50} baseOpacity={0.15} delay={800} />
        <FloatingPaw x={width - 60} y={height*0.25} size={40} baseOpacity={0.18} delay={200} />
        <FloatingPaw x={15}         y={height*0.42} size={36} baseOpacity={0.12} delay={900} />

        <Image
          source={require('../../../assets/images/hero_cat.png')}
          style={styles.catImage}
          resizeMode="contain"
        />
      </View>

      {/* ─── WHITE BOTTOM ─── */}
      <View style={styles.bottom}>
        <TornEdge />

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        <Text style={styles.title}>
          Start Your Journey as a{'\n'}Thoughtful Pet Parent
        </Text>

        <Text style={styles.subtitle}>
          Begin a meaningful journey of care,{'\n'}connection, and responsibility.
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <View style={styles.btnContent}>
            <Text style={styles.btnText}>Get Started</Text>
          </View>
          <View style={styles.btnPawWrapper}>
            <View style={styles.btnPaw}>
              <Ionicons name="paw" size={24} color="#f9b256" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  top: {
    height: height * 0.58,
    backgroundColor: '#D66D2C', // Matches new cat image background perfectly
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  catImage: {
    width: width,
    height: height * 0.5,
    position: 'absolute',
    bottom: -15, // Sit just above the edge
  },

  bottom: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },

  dotsRow: { flexDirection: 'row', gap: 7, marginBottom: 26 },
  dot:     { height: 8, borderRadius: 4 },
  dotActive:   { width: 20, backgroundColor: '#f9b256' },
  dotInactive: { width: 8, backgroundColor: '#fed7aa' },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
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
    justifyContent: 'flex-end',
    paddingRight: 6,
    paddingLeft: 20,
    shadowColor: '#f9b256',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnContent: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 24, // offset for the paw icon taking right space
  },
  btnText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '800', 
    letterSpacing: 0.3 
  },
  btnPawWrapper: {
    alignItems: 'flex-end',
  },
  btnPaw: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
});

export default WelcomeScreen;
