import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Step4() {
  const router = useRouter();
  const { title, desc, locationText, lat, lng } = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const handleNext = () => {
    router.push({
      pathname: '/create/step5',
      params: {
        title,
        desc,
        locationText,
        lat,
        lng,
        date: date.toISOString(),
      },
    });
  };

  const showPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'datetime',
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (selectedDate) setDate(selectedDate);
        },
      });
    } else {
      setShow(true);
    }
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
      >
        <View style={styles.inner}>
          <Text style={styles.heading}>When is your event?</Text>

          <TouchableOpacity onPress={showPicker} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {date.toDateString()} at {date.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && show && (
              <DateTimePicker
                  value={date}
                  mode="datetime"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setDate(selectedDate);
                  }}
              />
          )}

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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  inner: { flex: 1 },
  heading: { fontSize: 26, fontWeight: '600', marginBottom: 20 },
  dateButton: {
    backgroundColor: '#f2f2f2',
    padding: 18,
    borderRadius: 10,
    marginBottom: 24,
  },
  dateText: { fontSize: 16 },
  nextButton: {
    backgroundColor: '#222',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  nextText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  back: { marginTop: 20, color: '#222', textDecorationLine: 'underline' },
});
