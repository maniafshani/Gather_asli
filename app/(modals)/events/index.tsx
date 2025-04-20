import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function EventListScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(data);
            setLoading(false);
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

    const formatDate = (timestamp: any): string => {
        if (timestamp?.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString();
        }
        return 'Date TBA';
    };

    return (
        <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => router.push(`/events/${item.id}`)}
                    style={styles.card}
                >
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>{item.location}</Text>
                    <Text style={styles.meta}>Hosted by: {item.hostId}</Text>
                    <Text style={styles.meta}>{formatDate(item.date)}</Text>
                    <Text style={styles.meta}>{item.description?.slice(0, 80)}...</Text>
                </TouchableOpacity>
            )}
        />
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    meta: {
        color: '#777',
        marginBottom: 4,
    },
});
