import React, { useEffect, useState } from 'react';
import {
    View, Text, Image, TouchableOpacity,
    ScrollView, StyleSheet, Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
type Event = {
    id: string;
    title: string;
    date: string;
    image?: string;
    locationText: string;
    locationCoords: { latitude: number; longitude: number };
    createdBy: { Handle: string;uid:string;PhotoURL:string };

    distance?: number;
};

export default function EventDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const user = getAuth().currentUser;
    const [event, setEvent] = useState(null);
    const [joined, setJoined] = useState(false);
    const host = event?.createdBy;

    useEffect(() => {
        fetchEvent();
    }, []);

    const fetchEvent = async () => {
        const ref = doc(db, 'events', id as string);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const eventData = snap.data();
        setEvent(eventData);
        setJoined(eventData.participants?.includes(user?.uid));
    };

    const handleJoin = async () => {
        if (!user) return Alert.alert('Login required');
        await updateDoc(doc(db, 'events', id), {
            participants: arrayUnion(user.uid),
        });
        setJoined(true);
        Alert.alert('Joined!', 'You are now part of this event.');
    };

    if (!event) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>Loading event...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                {event.image && (
                    <Image source={{ uri: event.image }} style={styles.image} />
                )}

                <View style={styles.content}>
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.subtitle}>{event.locationText}</Text>
                    <Text style={styles.subtitle}>
                        {new Date(event.date?.seconds * 1000).toLocaleString()}
                    </Text>

                    {event.locationCoords && (
                        <>
                            <Text style={styles.section}>Location</Text>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: event.locationCoords.latitude,
                                    longitude: event.locationCoords.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: event.locationCoords.latitude,
                                        longitude: event.locationCoords.longitude,
                                    }}
                                />
                            </MapView>
                        </>
                    )}

                    <Text style={styles.section}>Description</Text>
                    <Text style={styles.description}>{event.desc}</Text>

                    <Text style={styles.section}>Hosted by</Text>
                    <TouchableOpacity
                        style={styles.hostRow}
                        onPress={() => router.push(`/profile/${host?.handle}`)}
                    >
                        <Image
                            source={{ uri: host?.photoURL || 'https://placekitten.com/200/200' }}
                            style={styles.avatar}
                        />
                        <Text style={styles.hostName}>@{host?.handle}</Text>
                    </TouchableOpacity>

                    {!joined ? (
                        <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
                            <Text style={styles.btnText}>Join Event</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.chatBtn}
                            onPress={() => router.push(`/events/${id}/chat`)}
                        >
                            <Text style={styles.btnText}>Go to Group Chat</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    center: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    backBtn: {
        padding: 14,
        backgroundColor: '#f8f8f8',
    },
    backText: {
        fontSize: 16,
        color: '#007aff',
    },
    image: {
        width: '100%',
        height: 220,
    },
    content: { padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 4 },
    section: { marginTop: 20, fontSize: 18, fontWeight: '600' },
    description: { marginTop: 6, color: '#444', fontSize: 15 },
    map: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginTop: 12,
    },
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
        backgroundColor: '#eee',
    },
    hostName: {
        fontSize: 16,
        fontWeight: '500',
    },
    joinBtn: {
        marginTop: 24,
        backgroundColor: '#222',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    chatBtn: {
        marginTop: 24,
        backgroundColor: '#007aff',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
