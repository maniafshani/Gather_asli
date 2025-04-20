import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '@/lib/imageUpload'; // fixed relative path

export default function ProfileScreen() {
    const { id } = useLocalSearchParams();
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUid, setCurrentUid] = useState(null);
    const [isSelf, setIsSelf] = useState(false);
    const [events, setEvents] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(getAuth(), async (user) => {
            if (!id && user) {
                // fallback: fetch profile of logged-in user
                setCurrentUid(user.uid);
                fetchUserByUid(user.uid);
            } else if (id) {
                fetchUserByHandle(id);
            } else {
                console.warn('No ID param and no logged in user.');
                setLoading(false);
            }
        });
        return unsub;
    }, [id]);

    const fetchUserByHandle = async (handle) => {
        try {
            const snap = await getDocs(query(collection(db, 'users'), where('handle', '==', handle)));
            if (!snap.empty) {
                const docSnap = snap.docs[0];
                const userData = docSnap.data();
                const uid = docSnap.id;
                setTargetUser({ uid, ...userData });

                const authUid = getAuth().currentUser?.uid;
                if (authUid) setIsSelf(uid === authUid);

                await fetchRecentEvents(uid);
            } else {
                console.warn('User not found');
            }
        } catch (err) {
            console.error('Error loading profile by handle:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserByUid = async (uid) => {
        try {
            const docSnap = await getDoc(doc(db, 'users', uid));
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setTargetUser({ uid, ...userData });
                setIsSelf(true);
                await fetchRecentEvents(uid);
            }
        } catch (err) {
            console.error('Error loading profile by UID:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentEvents = async (uid) => {
        try {
            const eventsSnap = await getDocs(
                query(
                    collection(db, 'events'),
                    where('participants', 'array-contains', uid),
                    orderBy('date', 'desc'),
                    limit(3)
                )
            );
            const joined = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setEvents(joined);
        } catch (eventsError) {
            console.error('Events query issue:', eventsError);
        }
    };

    const changeProfilePhoto = async () => {
        const picker = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
        });

        if (!picker.canceled) {
            try {
                const uri = picker.assets[0].uri;
                const uploadedURL = await uploadImageAsync(uri, `avatars/${currentUid}`);
                await updateDoc(doc(db, 'users', currentUid), { photoURL: uploadedURL });
                setTargetUser(prev => ({ ...prev, photoURL: uploadedURL }));
            } catch (e) {
                console.error('Failed to upload image:', e);
            }
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    if (!targetUser) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text>User not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.profile}>
                <TouchableOpacity disabled={!isSelf} onPress={changeProfilePhoto}>
                    <Image source={{ uri: targetUser.photoURL }} style={styles.avatar} />
                    {isSelf && <Text style={styles.editText}>Change Photo</Text>}
                </TouchableOpacity>

                <Text style={styles.name}>{targetUser.displayName}</Text>
                <Text style={styles.handle}>@{targetUser.handle}</Text>
                {targetUser.bio && <Text style={styles.bio}>{targetUser.bio}</Text>}

                <Text style={styles.meta}>
                    {targetUser.Followers?.length || 0} followers · {targetUser.Following?.length || 0} following · {(targetUser.Followers?.length || 0) + (targetUser.Following?.length || 0)} total friends
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recently Joined</Text>
                {events.length === 0 ? (
                    <Text style={styles.meta}>No events yet</Text>
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.eventCard}
                                onPress={() => router.push(`/events/${item.id}`)}
                            >
                                <Text style={styles.eventTitle}>{item.title}</Text>
                                <Text style={styles.eventDate}>
                                    {new Date(item.date?.seconds * 1000).toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtn: {
        padding: 14,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    backText: {
        fontSize: 16,
        color: '#007aff',
    },
    profile: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ccc',
    },
    editText: {
        fontSize: 12,
        color: '#007aff',
        marginTop: 6,
        textAlign: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
    },
    handle: {
        fontSize: 14,
        color: '#666',
    },
    bio: {
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
        color: '#444',
    },
    meta: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    eventCard: {
        backgroundColor: '#f6f6f6',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    eventDate: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
});
