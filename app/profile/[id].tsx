import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
    limit,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { id } = useLocalSearchParams();
    const [targetUser, setTargetUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUid, setCurrentUid] = useState(null);
    const [isFriend, setIsFriend] = useState(false);
    const [events, setEvents] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(getAuth(), (user) => {
            if (user) setCurrentUid(user.uid);
        });
        return unsub;
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const snap = await getDocs(query(collection(db, 'users'), where('handle', '==', id)));
                if (!snap.empty) {
                    const docSnap = snap.docs[0];
                    const userData = docSnap.data();
                    const uid = docSnap.id;

                    setTargetUser({ uid, ...userData });

                    const currentDoc = await getDoc(doc(db, 'users', getAuth().currentUser?.uid));
                    const following = currentDoc.data()?.Following || [];
                    setIsFriend(following.includes(uid));

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
                } else {
                    console.warn('User not found');
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    const toggleFriend = async () => {
        if (!currentUid || !targetUser) return;

        const myRef = doc(db, 'users', currentUid);
        const targetRef = doc(db, 'users', targetUser.uid);

        if (isFriend) {
            await updateDoc(myRef, { Following: arrayRemove(targetUser.uid) });
            await updateDoc(targetRef, { Followers: arrayRemove(currentUid) });
            setIsFriend(false);
        } else {
            await updateDoc(myRef, { Following: arrayUnion(targetUser.uid) });
            await updateDoc(targetRef, { Followers: arrayUnion(currentUid) });
            setIsFriend(true);
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
                <Image source={{ uri: targetUser.photoURL }} style={styles.avatar} />
                <Text style={styles.name}>{targetUser.displayName}</Text>
                <Text style={styles.handle}>@{targetUser.handle}</Text>

                <Text style={styles.meta}>
                    {targetUser.Followers?.length || 0} followers · {targetUser.Following?.length || 0} following
                </Text>

                <TouchableOpacity onPress={toggleFriend} style={styles.friendBtn}>
                    <Text style={styles.friendBtnText}>{isFriend ? 'Remove Friend' : 'Add Friend'}</Text>
                </TouchableOpacity>
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
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 12,
        backgroundColor: '#ddd',
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
    },
    handle: {
        fontSize: 14,
        color: '#666',
    },
    meta: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    friendBtn: {
        marginTop: 12,
        backgroundColor: '#222',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    friendBtnText: {
        color: 'white',
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
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
