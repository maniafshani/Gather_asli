// app/create/step3.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';

export default function Step3() {
  const router = useRouter();
  const { title, desc } = useLocalSearchParams();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationText, setLocationText] = useState('');

  const handleUseMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Enable location services to autofill your location.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
    });
    setLocationText('Current Location');
  };

  const goNext = () => {
    router.push({
      pathname: '/create/step4',
      params: {
        title,
        desc,
        lat: coords?.lat.toString(),
        lng: coords?.lng.toString(),
        locationText,
      },
    });
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
        >
          <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.heading}>Where will the event be?</Text>

            <GooglePlacesAutocomplete
                placeholder="Search for a location"
                fetchDetails
                onPress={(data, details = null) => {
                  setLocationText(data.description);
                  if (details?.geometry?.location) {
                    setCoords({
                      lat: details.geometry.location.lat,
                      lng: details.geometry.location.lng,
                    });
                  }
                }}
                query={{
                  key: 'AIzaSyCvI2ZOcm5Llopp4Ft5QhvS02a4bXd_m4c', // 🔑 Replace with your API key
                  language: 'en',
                }}
                styles={{
                  container: { marginBottom: 12 },
                  textInput: {
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: '#fafafa',
                  },
                  listView: {
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    marginTop: 4,
                  },
                }}
                enablePoweredByContainer={false}
                debounce={200}
                nearbyPlacesAPI="GooglePlacesSearch"
            />

            <TouchableOpacity onPress={handleUseMyLocation} style={styles.locBtn}>
              <Text style={styles.locText}>📍 Use my current location</Text>
            </TouchableOpacity>

            {coords && (
                <MapView
                    style={styles.map}
                    region={{
                      latitude: coords.lat,
                      longitude: coords.lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                >
                  <Marker coordinate={{ latitude: coords.lat, longitude: coords.lng }} />
                </MapView>
            )}

            <View style={styles.navRow}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.nextBtn, !coords && { backgroundColor: '#ccc' }]}
                  disabled={!coords}
                  onPress={goNext}
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fefefe' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 32, paddingVertical: 24 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  locBtn: { marginBottom: 16 },
  locText: { color: '#007AFF', fontWeight: '600', fontSize: 16 },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  backText: { fontSize: 16, color: '#007AFF' },
  nextBtn: {
    backgroundColor: '#222',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
