import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Dimensions, Animated, Easing, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/* ───── animated floating paw ───── */
const FloatingPaw = ({ x, y, size, baseOpacity, delay }) => {
  const float = useRef(new Animated.Value(0)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 2600 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 2600 + delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const ty = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const op = float.interpolate({ inputRange: [0, 0.5, 1], outputRange: [baseOpacity, baseOpacity * 1.6, baseOpacity] });

  return (
    <Animated.View style={{ position: 'absolute', left: x, top: y, opacity: Animated.multiply(fade, op), transform: [{ translateY: ty }] }}>
      <Ionicons name="paw" size={size} color="#fff" />
    </Animated.View>
  );
};

/* ───── main screen ───── */
const WelcomeScreen = () => {
  const navigation = useNavigation();

  // cat float
  const catY = useRef(new Animated.Value(0)).current;
  // title
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  // sub
  const subY = useRef(new Animated.Value(24)).current;
  const subOp = useRef(new Animated.Value(0)).current;
  // dots
  const dotsOp = useRef(new Animated.Value(0)).current;
  // button
  const btnScale = useRef(new Animated.Value(0.92)).current;
  const btnOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // cat bob
    Animated.loop(
      Animated.sequence([
        Animated.timing(catY, { toValue: -10, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(catY, { toValue: 0,   duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // entrance stagger
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(dotsOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleY,  { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(subOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(subY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(btnOp,    { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      ]),
    ]).start();

    // button breathe
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(btnScale, { toValue: 1.04, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(btnScale, { toValue: 1,    duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, 1800);
  }, []);

  return (
    <View style={styles.container}>

      {/* ─── ORANGE TOP ─── */}
      <View style={styles.top}>
        {/* Floating paws */}
        <FloatingPaw x={16}         y={38}          size={48} baseOpacity={0.2}  delay={0}   />
        <FloatingPaw x={width-72}   y={28}          size={40} baseOpacity={0.18} delay={300} />
        <FloatingPaw x={40}         y={height*0.28} size={56} baseOpacity={0.14} delay={600} />
        <FloatingPaw x={width-90}   y={height*0.24} size={44} baseOpacity={0.16} delay={150} />
        <FloatingPaw x={width*0.42} y={16}          size={32} baseOpacity={0.13} delay={450} />
        <FloatingPaw x={width-55}   y={height*0.4}  size={36} baseOpacity={0.15} delay={850} />
        <FloatingPaw x={12}         y={height*0.42} size={42} baseOpacity={0.12} delay={700} />

        {/* Hero cat — gently bobs up and down */}
        <Animated.Image
          source={require('../../../assets/images/hero_cat.png')}
          style={[styles.catImage, { transform: [{ translateY: catY }] }]}
          resizeMode="contain"
        />
      </View>

      {/* ─── WHITE BOTTOM ─── */}
      <View style={styles.bottom}>

        {/* Dots */}
        <Animated.View style={[styles.dotsRow, { opacity: dotsOp }]}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
          Start Your Journey as a{'\n'}Thoughtful Pet Parent
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: subOp, transform: [{ translateY: subY }] }]}>
          Begin a meaningful journey of care,{'\n'}connection, and responsibility.
        </Animated.Text>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Animated.View style={{ width: '100%', opacity: btnOp, transform: [{ scale: btnScale }] }}>
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
        </Animated.View>
      </View>
    </View>
  );
};

/* ─────────── styles ─────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* orange hero */
  top: {
    height: height * 0.57,
    backgroundColor: '#f6ab49',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  catImage: {
    width: width * 0.92,
    height: height * 0.5,
    position: 'absolute',
    bottom: 0,
  },

  /* white section */
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
  btnPaw:  {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
});

export default WelcomeScreen;
