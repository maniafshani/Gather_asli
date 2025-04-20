import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Step1() {
  const router = useRouter();
  const [title, setTitle] = useState('');

  const handleNext = () => {
    if (title.trim().length > 0) {
      router.push({ pathname: '/create/step2', params: { title } });
    }
  };

  const goHome = () => {
    router.replace('/(tabs)');
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={100}
        >
          <View style={styles.header}>
            <View />
            <TouchableOpacity onPress={goHome}>
              <Text style={styles.homeButton}>Home</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inner}>
            <Text style={styles.heading}>Now, let's give your event a title</Text>
            <Text style={styles.subheading}>Short and fun titles work best. You can always change it later.</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Picnic in the Park"
                value={title}
                onChangeText={setTitle}
                maxLength={32}
            />
            <Text style={styles.charCount}>{title.length}/32</Text>

            <View style={styles.footer}>
              <View />
              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  homeButton: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    paddingLeft: 100,
  },
  inner: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '600', marginBottom: 10 },
  subheading: { fontSize: 16, color: '#666', marginBottom: 20 },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#999',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#222',
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
