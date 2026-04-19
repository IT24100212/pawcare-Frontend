import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const C = {
  emerald: '#006850',
  emeraldLight: '#148367',
  emeraldDark: '#052E25',
  emeraldPale: '#effff6',
  orange: '#F97316',
  orangeLight: '#FFAB69',
  orangePale: '#FFF7ED',
  white: '#FFFFFF',
  dark: '#1a1c1c',
};

// Floating paw element
const FloatingPaw = ({ x, delay, size, opacity, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startDelay = setTimeout(() => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -18,
              duration: 2200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 2200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotate, {
              toValue: 1,
              duration: 4400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 0,
              duration: 4400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(startDelay);
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '12deg'],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: height * 0.1,
        opacity: Animated.multiply(fadeAnim, opacity),
        transform: [{ translateY }, { rotate: spin }],
      }}
    >
      <Ionicons name="paw" size={size} color={color} />
    </Animated.View>
  );
};

const WelcomeScreen = () => {
  const navigation = useNavigation();

  // Hero scale pulse
  const heroPulse = useRef(new Animated.Value(1)).current;
  // Text slide up
  const textSlide = useRef(new Animated.Value(40)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  // Button glow pulse
  const btnGlow = useRef(new Animated.Value(0.85)).current;
  // Blob morph
  const blobScale = useRef(new Animated.Value(1)).current;
  // Title word animation
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  // Subtitle
  const subFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hero pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroPulse, { toValue: 1.06, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(heroPulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Blob
    Animated.loop(
      Animated.sequence([
        Animated.timing(blobScale, { toValue: 1.08, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(blobScale, { toValue: 0.96, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Button glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(btnGlow, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(btnGlow, { toValue: 0.85, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    // Text entrance
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(titleFade, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(subFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(textFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* === TOP HERO SECTION === */}
      <View style={styles.hero}>
        {/* Animated background blob */}
        <Animated.View style={[styles.blob1, { transform: [{ scale: blobScale }] }]} />
        <Animated.View style={[styles.blob2, { transform: [{ scale: Animated.multiply(blobScale, 0.95) }] }]} />

        {/* Floating paw prints */}
        <FloatingPaw x={20}  delay={0}    size={28} opacity={0.25} color={C.orange} />
        <FloatingPaw x={width * 0.7} delay={400}  size={20} opacity={0.2}  color={C.white} />
        <FloatingPaw x={width * 0.45} delay={800}  size={16} opacity={0.18} color={C.orangeLight} />
        <FloatingPaw x={width * 0.15} delay={600}  size={22} opacity={0.15} color={C.white} />
        <FloatingPaw x={width * 0.82} delay={200}  size={32} opacity={0.1}  color={C.orange} />

        {/* Big hero emoji / icon cluster */}
        <Animated.View style={[styles.heroIconCluster, { transform: [{ scale: heroPulse }] }]}>
          <View style={styles.heroRing}>
            <View style={styles.heroCenter}>
              <Text style={styles.heroPaw}>🐾</Text>
            </View>
          </View>
          {/* Orbiting icons */}
          <View style={[styles.orbitIcon, { top: -8, right: 4 }]}>
            <Text style={{ fontSize: 22 }}>🐕</Text>
          </View>
          <View style={[styles.orbitIcon, { bottom: -8, left: 4 }]}>
            <Text style={{ fontSize: 22 }}>🐈</Text>
          </View>
          <View style={[styles.orbitIcon, { top: 28, left: -20 }]}>
            <Text style={{ fontSize: 18 }}>🐇</Text>
          </View>
        </Animated.View>

        {/* Service chips floating */}
        <View style={styles.chipRow}>
          {['🏥 Vet Care', '✂️ Grooming', '🏠 Boarding'].map((chip, i) => (
            <Animated.View
              key={chip}
              style={[
                styles.chip,
                {
                  opacity: titleFade,
                  transform: [{ translateY: Animated.multiply(titleSlide, 1 + i * 0.3) }],
                }
              ]}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* === BOTTOM CONTENT === */}
      <View style={styles.bottom}>
        {/* Brand mark */}
        <Animated.View style={{ opacity: titleFade, transform: [{ translateY: titleSlide }], alignItems: 'center' }}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandTag}>PawCare</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.title}>
            Start Your Journey as a{' '}
            <Text style={styles.titleAccent}>Thoughtful</Text>
            {'\n'}Pet Parent
          </Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: subFade, transform: [{ translateY: textSlide }] }]}>
          Vet appointments, grooming, boarding — all in one place. Your pet deserves the best.
        </Animated.Text>

        {/* Stats row */}
        <Animated.View style={[styles.statsRow, { opacity: subFade, transform: [{ translateY: textSlide }] }]}>
          {[
            { icon: '🐾', label: 'Happy Pets', val: '1K+' },
            { icon: '🏥', label: 'Vet Partners', val: '50+' },
            { icon: '⭐', label: 'Reviews', val: '4.9' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* CTA Button */}
        <Animated.View style={[styles.btnWrap, { opacity: subFade, transform: [{ scale: btnGlow }] }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.88}
          >
            <View style={styles.btnInner}>
              <Ionicons name="paw" size={22} color={C.white} />
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
            <View style={styles.btnArrow}>
              <Ionicons name="arrow-forward" size={20} color={C.orange} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signInLink}>
          <Text style={styles.signInText}>Already have an account? <Text style={styles.signInAccent}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },

  // ─── HERO ───
  hero: {
    height: height * 0.48,
    backgroundColor: C.emeraldDark,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob1: {
    position: 'absolute', width: width * 1.4, height: width * 1.4,
    borderRadius: width * 0.7, backgroundColor: C.emerald,
    top: -width * 0.5, left: -width * 0.2,
  },
  blob2: {
    position: 'absolute', width: width * 0.9, height: width * 0.9,
    borderRadius: width * 0.45, backgroundColor: C.orange + '28',
    bottom: -width * 0.35, right: -width * 0.15,
  },

  heroIconCluster: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroRing: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(120,216,184,0.15)',
    borderWidth: 2, borderColor: 'rgba(120,216,184,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroCenter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(120,216,184,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroPaw: { fontSize: 48 },
  orbitIcon: {
    position: 'absolute', width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  chipRow: {
    flexDirection: 'row', gap: 8, marginTop: 20, flexWrap: 'wrap',
    justifyContent: 'center', paddingHorizontal: 12,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  chipText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },

  // ─── BOTTOM ───
  bottom: {
    flex: 1, backgroundColor: C.white,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    marginTop: -28, paddingHorizontal: 26, paddingTop: 30,
    paddingBottom: 24,
  },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'center' },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.orange },
  brandTag: { fontSize: 11, fontWeight: '800', color: C.orange, letterSpacing: 2, textTransform: 'uppercase' },

  title: {
    fontSize: 28, fontWeight: '800', color: C.dark,
    textAlign: 'center', lineHeight: 36, marginBottom: 12,
  },
  titleAccent: { color: C.emerald },

  subtitle: {
    fontSize: 14, color: '#6b7280', textAlign: 'center',
    lineHeight: 22, marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: C.emeraldPale, borderRadius: 20,
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 24,
  },
  statCard: { alignItems: 'center', flex: 1 },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: '800', color: C.emerald },
  statLabel: { fontSize: 10, color: '#6b7280', fontWeight: '600', marginTop: 2 },

  btnWrap: {
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  button: {
    backgroundColor: C.emerald, height: 62, borderRadius: 99,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingLeft: 24, paddingRight: 8,
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buttonText: { fontSize: 18, fontWeight: '800', color: C.white },
  btnArrow: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
  },

  signInLink: { alignItems: 'center', marginTop: 18 },
  signInText: { fontSize: 13, color: '#9ca3af' },
  signInAccent: { color: C.emerald, fontWeight: '800' },
});

export default WelcomeScreen;
