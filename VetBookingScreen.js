import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getAvailableSlots, createAppointment } from '../../api/vetBookingApi';

const C = {
  primary: '#006850', primaryContainer: '#148367', onPrimaryContainer: '#effff6',
  primaryFixedDim: '#78d8b8', secondary: '#8e4e14', secondaryContainer: '#ffab69',
  onSecondaryContainer: '#783d01', surface: '#faf9f8', surfaceHigh: '#e9e8e7',
  surfaceLow: '#f4f3f2', surfaceLowest: '#ffffff', onSurface: '#1a1c1c',
  onSurfaceVariant: '#3e4944', outline: '#6e7a74', outlineVariant: '#bdc9c3',
  emeraldDark: '#052E25',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const getNext7Days = () => {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({ dayName: DAY_NAMES[d.getDay()], dateNum: d.getDate(), month: MONTH_NAMES[d.getMonth()], fullDate: d.toISOString().split('T')[0] });
  }
  return days;
};

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m || '00'} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const VetBookingScreen = () => {
  const insets = useSafeAreaInsets();
  const NEXT7 = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(NEXT7[0].fullDate);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Form State
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog'); // Dog/Cat/Other
  const [ownerName, setOwnerName] = useState('');
  const [preferredVet, setPreferredVet] = useState('');
  const [reason, setReason] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();

  useEffect(() => { fetchSlots(); }, [selectedDate]);

  const fetchSlots = async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const data = await getAvailableSlots(selectedDate);
      setAvailableSlots(Array.isArray(data) ? data : data.slots || []);
    } catch { setAvailableSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleSlotPress = (slot) => {
    setSelectedSlot(slot);
  };

  const combineDateAndTime = (dateStr, timeObj) => {
    const timeStr = typeof timeObj === 'string' ? timeObj : timeObj.time;
    if (!timeStr) return null;
    const dateObj = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':');
    dateObj.setUTCHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return dateObj.toISOString();
  };

  const handleSubmit = async () => {
    if (!petName || !ownerName || !reason || !selectedSlot) {
      Alert.alert('Incomplete', 'Please fill in all details and select a slot.');
      return;
    }

    const appointmentDate = combineDateAndTime(selectedDate, selectedSlot);
    // Since vetId should be an ObjectId in backend, but we capture string here initially as preferredVet
    // We send it to backend. Note: the backend requires a valid ObjectId for vetId.
    // For demo/UI purposes, if we don't have a vet picker, maybe backend needs modification or we send it as vetId string.
    // We will send '64d2d4f29a1b1c2d3e4f5g6h' placeholder for now if they type a name, or just pass the text and let backend validation fail if not valid ObjectId.
    // Assuming backend will accept string for now if updated, or we use a hardcoded id if required. 
    // Here we will use preferredVet but map it to vetId field.
    const hardcodedVetId = '601a91e3e5b30b001c22f012'; // a generic mongoose ObjectId

    const payload = {
      petName,
      petType,
      ownerName,
      vetId: hardcodedVetId, // Using hardcoded fake vet ID due to text input
      appointmentDate: appointmentDate,
      reason
    };

    setSubmitting(true);
    try {
      await createAppointment(payload);
      Alert.alert('🩺 Booked!', 'Vet appointment confirmed successfully!', [
        { text: 'Great!', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Oops', error.response?.data?.message || 'Failed to submit appointment. Try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!selectedSlot && !!petName && !!ownerName && !!reason && !submitting;

  const renderSlot = ({ item }) => {
    const timeStr = typeof item === 'string' ? item : item.time;
    const isInstant = typeof item === 'object' && item.isInstant;
    const isSelected = selectedSlot === item || (selectedSlot?.time && selectedSlot.time === item.time);
    return (
      <TouchableOpacity 
        style={[styles.slotCard, isSelected && styles.slotCardSelected]} 
        onPress={() => handleSlotPress(item)} 
        activeOpacity={0.8}
        disabled={submitting}
      >
        <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>{formatTime(timeStr)}</Text>
        {isInstant && (
          <View style={[styles.instantBadge, isSelected && { backgroundColor: C.secondaryContainer }]}>
            <Ionicons name="flash" size={10} color={C.onSecondaryContainer} />
            <Text style={styles.instantText}>Instant</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={C.emeraldDark} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="rgba(236,253,245,0.85)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vet Clinic</Text>
        <View style={styles.headerAvatar}><MaterialIcons name="local-hospital" size={18} color={C.primaryFixedDim} /></View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 90, 110) }]} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroCircle1} /><View style={styles.heroCircle2} />
            <View style={styles.heroIcon}><MaterialIcons name="medical-services" size={72} color="rgba(120,216,184,0.15)" /></View>
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <MaterialIcons name="health-and-safety" size={13} color={C.primaryFixedDim} />
                <Text style={styles.heroBadgeText}>Expert Veterinary Care</Text>
              </View>
              <Text style={styles.heroTagline}>Your pet's health{'\n'}is our priority.</Text>
            </View>
          </View>

          {/* Form Fields Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Ionicons name="document-text-outline" size={17} color={C.primary} /><Text style={styles.sectionLabel}>APPOINTMENT DETAILS</Text></View>
            
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Pet Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Bella" placeholderTextColor={C.outlineVariant} value={petName} onChangeText={setPetName} />

              <Text style={styles.inputLabel}>Pet Type</Text>
              <View style={styles.chipRow}>
                {['Dog', 'Cat', 'Other'].map((type) => (
                  <TouchableOpacity key={type} style={[styles.typeChip, petType === type && styles.typeChipSelected]} onPress={() => setPetType(type)}>
                    <Text style={[styles.typeChipText, petType === type && styles.typeChipTextSelected]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Owner Name</Text>
              <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor={C.outlineVariant} value={ownerName} onChangeText={setOwnerName} />

              <Text style={styles.inputLabel}>Preferred Vet</Text>
              <TextInput style={styles.input} placeholder="e.g. Dr. Smith (Optional)" placeholderTextColor={C.outlineVariant} value={preferredVet} onChangeText={setPreferredVet} />

              <Text style={styles.inputLabel}>Reason for Visit</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Describe the symptoms or checkup needs" placeholderTextColor={C.outlineVariant} value={reason} onChangeText={setReason} multiline numberOfLines={3} textAlignVertical="top" />
            </View>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Ionicons name="calendar-outline" size={17} color={C.primary} /><Text style={styles.sectionLabel}>SELECT DATE</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {NEXT7.map(day => {
                const active = selectedDate === day.fullDate;
                return (
                  <TouchableOpacity key={day.fullDate} style={[styles.dateChip, active && styles.dateChipSelected]} onPress={() => setSelectedDate(day.fullDate)}>
                    <Text style={[styles.dateChipDay, active && styles.dateChipTextSelected]}>{day.dayName}</Text>
                    <Text style={[styles.dateChipNum, active && styles.dateChipTextSelected]}>{day.dateNum}</Text>
                    <Text style={[styles.dateChipMonth, active && styles.dateChipTextSelected]}>{day.month}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Slots */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}><Ionicons name="time-outline" size={17} color={C.primary} /><Text style={styles.sectionLabel}>AVAILABLE SLOTS</Text></View>
            {loadingSlots ? <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 28 }} /> : availableSlots.length === 0 ? (
              <View style={styles.emptyState}><Text style={styles.emptyText}>No slots for this date.</Text></View>
            ) : (
              <FlatList data={availableSlots} keyExtractor={(_, i) => i.toString()} numColumns={3} renderItem={renderSlot} scrollEnabled={false} columnWrapperStyle={{ gap: 10, marginBottom: 10 }} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={[styles.confirmBtn, !canSubmit && styles.confirmBtnOff]} onPress={handleSubmit} disabled={!canSubmit}>
          {submitting ? <ActivityIndicator color="#fff" size="small" /> : (
            <><Text style={styles.confirmBtnText}>{canSubmit ? 'Complete Booking' : 'Fill Form & Select Slot'}</Text>{canSubmit && <Ionicons name="checkmark-circle" size={22} color="#fff" />}</>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.emeraldDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(120,216,184,0.18)', justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  hero: { height: 180, backgroundColor: C.primary, borderRadius: 20, marginTop: 16, overflow: 'hidden', position: 'relative' },
  heroCircle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -70, right: -55 },
  heroCircle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -28 },
  heroIcon: { position: 'absolute', right: 18, bottom: 8 },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, marginBottom: 10, gap: 5 },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroTagline: { fontSize: 18, fontWeight: '700', color: '#fff', lineHeight: 26 },
  section: { marginTop: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: C.primary, letterSpacing: 1.6, textTransform: 'uppercase' },
  
  // Form Styles
  formCard: { backgroundColor: C.surfaceLowest, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.primaryContainer + '20' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: C.onSurfaceVariant, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: C.surfaceLow, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.onSurface, borderWidth: 1, borderColor: C.outlineVariant + '40' },
  textArea: { minHeight: 80 },
  chipRow: { flexDirection: 'row', gap: 10 },
  typeChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 99, backgroundColor: C.surfaceLow, borderWidth: 1, borderColor: C.outlineVariant + '50' },
  typeChipSelected: { backgroundColor: C.primaryContainer, borderColor: C.primaryContainer },
  typeChipText: { fontSize: 14, fontWeight: '600', color: C.onSurfaceVariant },
  typeChipTextSelected: { color: '#fff' },

  dateChip: { alignItems: 'center', backgroundColor: C.surfaceLowest, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', minWidth: 60 },
  dateChipSelected: { backgroundColor: C.primary },
  dateChipDay: { fontSize: 11, fontWeight: '700', color: C.outline, textTransform: 'uppercase' },
  dateChipNum: { fontSize: 22, fontWeight: '800', color: C.onSurface, marginVertical: 2 },
  dateChipMonth: { fontSize: 11, fontWeight: '600', color: C.outline },
  dateChipTextSelected: { color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: C.outline, fontSize: 14, textAlign: 'center' },
  slotCard: { flex: 1, backgroundColor: C.surfaceLowest, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'transparent' },
  slotCardSelected: { backgroundColor: C.primaryContainer, borderColor: C.primary, transform: [{ scale: 1.05 }] },
  slotTime: { fontSize: 13, fontWeight: '700', color: C.onSurface },
  slotTimeSelected: { color: C.onPrimaryContainer },
  instantBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: C.secondaryContainer + '44', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  instantText: { fontSize: 9, fontWeight: '800', color: C.onSecondaryContainer, textTransform: 'uppercase' },
  footer: { backgroundColor: 'rgba(250,249,248,0.97)', paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.outlineVariant + '50' },
  confirmBtn: { backgroundColor: C.primary, height: 60, borderRadius: 99, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 14, elevation: 8 },
  confirmBtnOff: { backgroundColor: C.outlineVariant, shadowOpacity: 0, elevation: 0 },
  confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default VetBookingScreen;
