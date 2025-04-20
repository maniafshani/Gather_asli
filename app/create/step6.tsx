import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

export default function Step6() {
  const router = useRouter();
  const {
    title, desc, locationText, lat, lng, date, imageUri
  } = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const users = collection(db, 'users');
  const uploadImage = async (uri: string) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(`data:image/jpeg;base64,${base64}`);
    const blob = await response.blob();

    const imageRef = ref(storage, `events/${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  const handlePublish = async () => {
    if (!title || !desc || !locationText || !lat || !lng || !date || !imageUri) {
      Alert.alert('Missing Info', 'Please complete all steps before publishing.');
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImage(imageUri);
      const user = getAuth().currentUser;

      let userData = {handle: '', photoURL: ''};

      if (user?.uid) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userData = userSnap.data() as { handle: string; photoURL: string };
        }
      }

      const newEvent = {
        title,
        desc,
        locationText,
        locationCoords: {
          latitude: Number(lat),
          longitude: Number(lng),
        },
        date: new Date(date),
        image: imageUrl,
        createdBy: {
          uid: user?.uid ?? 'anon',
          handle: userData.handle,
          photoURL: userData.photoURL,
        },
        participants: [user?.uid],
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'events'), newEvent);
      router.replace('/');
    } catch (err) {
      console.error('Publish error:', err);
      Alert.alert('Error', 'Something went wrong while creating your event.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.inner}>
            <Text style={styles.heading}>Review your event</Text>

            <View style={styles.summaryBox}>
              <Text style={styles.label}>Title</Text>
              <Text style={styles.value}>{title}</Text>

              <Text style={styles.label}>Description</Text>
              <Text style={styles.value}>{desc}</Text>

              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{locationText}</Text>

              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{new Date(date).toLocaleString()}</Text>
            </View>

            <TouchableOpacity
                style={styles.publishButton}
                onPress={handlePublish}
                disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.publishText}>Publish</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inner: { paddingHorizontal: 24, paddingVertical: 32 },
  heading: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    padding: 16,
    marginBottom: 24,
  },
  label: { fontSize: 16, fontWeight: '600', color: '#444', marginTop: 12 },
  value: { fontSize: 16, color: '#333', marginTop: 4 },
  publishButton: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  publishText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  back: {
    marginTop: 24,
    textAlign: 'center',
    color: '#222',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
