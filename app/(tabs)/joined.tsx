//joined.tsx

import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity,
    StyleSheet, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    collection, getDocs, query, where, orderBy, limit
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { useRouter } from 'expo-router';

export default function JoinedScreen() {
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const user = getAuth().currentUser;

    useEffect(() => {
        if (user) fetchJoinedEvents();
    }, []);

    const fetchJoinedEvents = async () => {
        try {
            const snap = await getDocs(collection(db, 'events'));
            const events = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(ev => ev.participants?.includes(user.uid));

            const enriched = await Promise.all(
                events.map(async (ev) => {
                    const msgSnap = await getDocs(
                        query(
                            collection(db, 'events', ev.id, 'messages'),
                            orderBy('createdAt', 'desc'),
                            limit(1)
                        )
                    );
                    const lastMsg = msgSnap.docs[0]?.data()?.text || '';
                    return { ...ev, lastMsg };
                })
            );

            setJoinedEvents(enriched);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/events/${item.id}/chat`)}
        >
            <Image
                source={{ uri: item.image || 'https://placekitten.com/300/300' }}
                style={styles.avatar}
            />
            <View style={styles.textArea}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                    {item.lastMsg || 'No messages yet'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Text style={styles.heading}>My Joined Events</Text>
            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={joinedEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    heading: {
        fontSize: 22,
        fontWeight: '700',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 10,
        marginRight: 12,
    },
    textArea: {
        flex: 1,
    },
    title: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 2,
    },
    preview: {
        color: '#777',
        fontSize: 14,
    },
});
