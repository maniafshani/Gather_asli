import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const EventDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [joined, setJoined] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchEvent = async () => {
            const ref = doc(db, 'events', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                setEvent(data);

                const userId = getAuth().currentUser?.uid;
                if (data.joined?.includes(userId)) {
                    setJoined(true);
                }
            }
        };
        fetchEvent();
    }, [id]);

    const handleJoin = async () => {
        const userId = getAuth().currentUser?.uid;
        if (!userId) return;

        const ref = doc(db, 'events', id);
        await updateDoc(ref, {
            joined: arrayUnion(userId),
        });

        setJoined(true);
        router.push(`/groupchat/${id}`);
    };

    const fetchMemberNames = async () => {
        const userIds = event.joined || [];
        const fetchProfiles = await Promise.all(
            userIds.map(async (uid) => {
                try {
                    const userSnap = await getDoc(doc(db, 'users', uid));
                    if (userSnap.exists()) {
                        const u = userSnap.data();
                        return {
                            name: u.name || 'Unnamed',
                            avatar: u.avatar || null,
                        };
                    }
                } catch {}
                return { name: 'Unknown', avatar: null };
            })
        );
        setMembers(fetchProfiles);
        setShowMembers(true);
    };

    if (!event) return <Text>Loading...</Text>;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Image source={{ uri: event.image }} style={{ width: '100%', height: 280 }} />

            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{event.title}</Text>
                <Text style={{ color: '#666', marginTop: 4 }}>{event.locationText}</Text>
                <Text style={{ marginTop: 6 }}>{new Date(event.date).toDateString()}</Text>
                <Text style={{ marginTop: 6, fontSize: 16, color: '#333' }}>
                    {event.price > 0 ? `$${event.price}` : 'Free'}
                </Text>
                {event.joined && (
                    <Text style={{ marginTop: 8, fontSize: 14, color: '#777' }}>{event.joined.length} people joined</Text>
                )}

                <Text style={{ marginTop: 16 }}>{event.description}</Text>

                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 24 }}>Where you'll be</Text>
                <MapView
                    style={{ height: 200, marginTop: 12, borderRadius: 10 }}
                    region={{
                        latitude: event.locationCoords.lat,
                        longitude: event.locationCoords.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                >
                    <Marker
                        coordinate={{
                            latitude: event.locationCoords.lat,
                            longitude: event.locationCoords.lng,
                        }}
                    />
                </MapView>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                    <TouchableOpacity
                        onPress={handleJoin}
                        style={{
                            backgroundColor: joined ? '#ccc' : '#ff385c',
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            flex: 1,
                            marginRight: 8,
                        }}
                        disabled={joined}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{joined ? 'Joined' : 'Join Event & Chat'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={fetchMemberNames}
                        style={{
                            backgroundColor: '#333',
                            padding: 16,
                            borderRadius: 12,
                            alignItems: 'center',
                            flex: 1,
                            marginLeft: 8,
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>See Members</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal visible={showMembers} animationType="slide">
                <View style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Joined Members</Text>
                    <FlatList
                        data={members}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
                                {item.avatar ? (
                                    <Image source={{ uri: item.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                                ) : (
                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc', marginRight: 12 }} />
                                )}
                                <Text style={{ fontSize: 16 }}>{item.name}</Text>
                            </View>
                        )}
                    />
                    <TouchableOpacity onPress={() => setShowMembers(false)} style={{ marginTop: 24 }}>
                        <Text style={{ color: '#ff385c', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default EventDetailScreen;
