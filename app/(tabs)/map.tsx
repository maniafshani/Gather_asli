// app/map.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Removed PROVIDER_GOOGLE
import * as Location from 'expo-location';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'expo-router';

// Define interfaces for type safety
interface LocationCoords {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
}

interface EventData {
    id: string;
    title: string;
    location: string;
    locationCoords: {
        latitude: number;
        longitude: number;
    };
    date: string;
    image?: string;
}

export default function MapScreen() {
    const [location, setLocation] = useState<LocationCoords | null>(null);
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Location permission was denied');
                    setLoading(false);
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(loc.coords);
            } catch (error) {
                console.error('Error getting location:', error);
                setErrorMsg('Failed to get your location');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        const eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'));
        const unsub = onSnapshot(eventsQuery, (snap) => {
            const data = snap.docs
                .map((doc) => ({ id: doc.id, ...doc.data() } as EventData))
                .filter((e) => e.locationCoords && e.locationCoords.latitude && e.locationCoords.longitude);
            setEvents(data);
        }, (error) => {
            console.error('Error fetching events:', error);
        });

        return unsub;
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#ff385c" />
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        setLoading(true);
                        setErrorMsg(null);
                        // Re-trigger location fetch
                        (async () => {
                            try {
                                const loc = await Location.getCurrentPositionAsync({});
                                setLocation(loc.coords);
                            } catch (error) {
                                setErrorMsg('Failed to get your location');
                            } finally {
                                setLoading(false);
                            }
                        })();
                    }}
                >
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={styles.centered}>
                <Text>Waiting for location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
            >
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        coordinate={event.locationCoords}
                        title={event.title}
                        description={event.location}
                        onPress={() => router.push(`/events/${event.id}`)}
                        pinColor="#ff385c"
                    />
                ))}
            </MapView>
            <View style={styles.eventsCounter}>
                <Text style={styles.counterText}>
                    {events.length} event{events.length !== 1 ? 's' : ''} nearby
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#ff385c',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: '#ff385c',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: 'white',
        fontWeight: '600',
    },
    eventsCounter: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    counterText: {
        fontWeight: '600',
    },
});
