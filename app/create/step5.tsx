import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Step5() {
  const router = useRouter();
  const [image, setImage] = useState<any>(null);
  const params = useLocalSearchParams();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleNext = () => {
    router.push({
      pathname: '/create/step6',
      params: { ...params, imageUri: image?.uri },
    });
  };

  return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.heading}>Add a photo</Text>
          <Text style={styles.subheading}>It helps people know what your event looks like.</Text>

          {image && <Image source={{ uri: image.uri }} style={styles.preview} />}
          <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Choose Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 24, paddingTop: 60 },
  inner: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '600', marginBottom: 10 },
  subheading: { fontSize: 16, color: '#666', marginBottom: 20 },
  preview: { height: 200, width: '100%', borderRadius: 10, marginBottom: 20 },
  uploadBtn: {
    backgroundColor: '#eee',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: { fontSize: 16 },
  nextButton: { backgroundColor: '#222', padding: 14, borderRadius: 8, alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  back: { marginTop: 20, color: '#222', textDecorationLine: 'underline' },
});
