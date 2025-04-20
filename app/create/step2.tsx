import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Step2() {
  const router = useRouter();
  const { title } = useLocalSearchParams();
  const [desc, setDesc] = useState('');

  const handleNext = () => {
    router.push({ pathname: '/create/step3', params: { title, desc } });
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
          keyboardVerticalOffset={100}
      >
        <View style={styles.inner}>
          <Text style={styles.heading}>Create your description</Text>
          <Text style={styles.subheading}>Share what makes your event special.</Text>
          <TextInput
              style={styles.input}
              multiline
              numberOfLines={6}
              placeholder="Tell us what’s happening..."
              value={desc}
              onChangeText={setDesc}
              maxLength={500}
          />
          <Text style={styles.charCount}>{desc.length}/500</Text>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingHorizontal: 24, paddingTop: 60 },
  inner: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '600', marginBottom: 10 },
  subheading: { fontSize: 16, color: '#666', marginBottom: 20 },
  input: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  charCount: { alignSelf: 'flex-end', color: '#999', marginTop: 4 },
  footer: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 30 },
  back: { fontSize: 16, color: '#222', textDecorationLine: 'underline' },
  nextButton: { backgroundColor: '#222', paddingHorizontal: 26, paddingVertical: 12, borderRadius: 8 },
  nextText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
