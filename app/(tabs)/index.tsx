import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, TextInput,
    TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
    collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
    const [events, setEvents] = useState([]);
    const [location, setLocation] = useState(null);
    const [userId, setUserId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);
    const [following, setFollowing] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(getAuth(), (user) => {
            setUserId(user?.uid ?? null);
        });
        return unsub;
    }, []);

    useEffect(() => {
        const fetchFollowing = async () => {
            const snapshot = await getDocs(collection(db, 'users'));
            const me = snapshot.docs.find((doc) => doc.data().uid === userId);
            if (me) {
                const data = me.data();
                setFollowing(data.Following || []);
            }
        };
        if (userId) fetchFollowing();
    }, [userId]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const pos = await Location.getCurrentPositionAsync({});
            setLocation(pos.coords);
        })();
    }, []);

    useEffect(() => {
        if (userId && location) fetchEvents();
    }, [userId, location]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const snapshot = await getDocs(collection(db, 'events'));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const enrichedEvents = await Promise.all(
                data.map(async (event) => {
                    const hostRef = doc(db, 'users', event.createdBy?.uid);
                    const hostSnap = await getDoc(hostRef);
                    const hostData = hostSnap.exists() ? hostSnap.data() : {};
                    return {
                        ...event,
                        host: {
                            uid: hostData.uid,
                            displayName: hostData.displayName,
                            photoURL: hostData.photoURL
                        },
                        distance: getDistance(
                            location.latitude,
                            location.longitude,
                            event.locationCoords.latitude,
                            event.locationCoords.longitude
                        )
                    };
                })
            );

            setEvents(enrichedEvents.sort((a, b) => a.distance - b.distance));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            0.5 -
            Math.cos(dLat) / 2 +
            (Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                (1 - Math.cos(dLon))) /
            2;
        return R * 2 * Math.asin(Math.sqrt(a));
    };


    const searchUsers = async () => {
        const term = search.trim().toLowerCase();
        if (!term) {
            setUsers([]);
            return;
        }

        const snapshot = await getDocs(collection(db, 'users'));
        const results = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((u) => {
                const handle = typeof u.handle === 'string' ? u.handle.toLowerCase() : '';
                const name = typeof u.displayName === 'string' ? u.displayName.toLowerCase() : '';
                return handle.includes(term) || name.includes(term);
            });

        setUsers(results);
    };

    const handleFollow = async (targetId) => {
        const targetRef = doc(db, 'users', targetId);
        const alreadyFollowing = following.includes(targetId);
        await updateDoc(targetRef, {
            Followers: alreadyFollowing
                ? arrayRemove(userId)
                : arrayUnion(userId),
        });
        setFollowing(prev =>
            alreadyFollowing
                ? prev.filter(id => id !== targetId)
                : [...prev, targetId]
        );
    };

    const renderUser = ({ item }) => (
        <TouchableOpacity
            onPress={() => router.push(`/profile/${item.handle}`)}
            style={styles.userRow}
        >
            <Image source={{ uri: item.photoURL }} style={styles.userAvatar} />
            <View>
                <Text style={styles.userHandle}>@{item.hanle}</Text>
                <Text style={styles.userName}>{item.displayName}</Text>
            </View>
            <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(item.id)}>
                <Text style={{ color: '#fff' }}>
                    {following.includes(item.id) ? 'Remove Friend' : 'Follow'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/events/${item.id}`)}
        >
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.image} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.noImageText}>No image</Text>
                </View>
            )}
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{item.locationText}</Text>
                <Text style={styles.meta}>
                    {item.date?.seconds
                        ? new Date(item.date.seconds * 1000).toDateString()
                        : 'No date'}
                </Text>                <Text style={styles.distance}>{item.distance?.toFixed(1)} km away</Text>

                {item.createdBy?.handle && (
                    <TouchableOpacity
                        style={styles.hostRow}
                        onPress={() => router.push(`/profile/${item.createdBy.handle}`)}
                    >
                        <Image source={{ uri: item.createdBy.photoURL }} style={styles.hostAvatar} />
                        <Text style={styles.hostText}>Hosted by @{item.createdBy.handle}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.searchInput}>
            <TextInput
                placeholder="Search users by @id"
                placeholderTextColor={'#222'}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={searchUsers}
                style={styles.searchInput}
            />
            </View>
            {users.length > 0 && (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.uid}
                    renderItem={renderUser}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            )}

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />
                    }
                    contentContainerStyle={{ padding: 16 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    searchInput: {
        margin: 20,
        padding: 2,
        backgroundColor: '#DDD',
        nrRadius: 16,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fafafa',
        borderRadius: 10,
        marginRight: 10,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
    },
    userHandle: {
        fontWeight: '600',
        fontSize: 14,
    },
    userName: {
        color: '#777',
        fontSize: 13,
    },
    followBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 'auto',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 180,
    },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#888',
        fontSize: 14,
    },
    cardContent: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    meta: {
        color: '#666',
        marginTop: 2,
    },
    distance: {
        marginTop: 6,
        fontSize: 12,
        color: '#999',
    },
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 8,
    },
    hostAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    hostText: {
        fontSize: 13,
        color: '#333',
    },
});
