import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const C = {
  primary: '#006850', surfaceHigh: '#e9e8e7', onSurface: '#1a1c1c', outline: '#6e7a74',
};

const UserBoardingUpdatesScreen = ({ route }) => {
  const { booking } = route.params;
  const updates = booking.updates || [];

  const renderUpdate = ({ item }) => (
    <View style={styles.updateCard}>
      <Text style={styles.updateDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.updateMessage}>{item.message}</Text>
      {item.photoUrl && (
        <Image source={{ uri: item.photoUrl }} style={styles.updateImage} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={updates}
        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
        renderItem={renderUpdate}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No Pawtocasts yet! Your sitter will post updates here.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surfaceHigh },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', color: C.outline, marginTop: 40, fontSize: 16 },
  updateCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  updateDate: { fontSize: 12, color: C.outline, marginBottom: 8 },
  updateMessage: { fontSize: 16, color: C.onSurface, marginBottom: 12 },
  updateImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
});

export default UserBoardingUpdatesScreen;
