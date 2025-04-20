import React, { useEffect, useState } from 'react';
import {
    Modal,
    Text,
    View,
    Image,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ParticipantsModal({
                                              visible,
                                              onClose,
                                              participantIds = [],
                                          }: {
    visible: boolean;
    onClose: () => void;
    participantIds: string[];
}) {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!visible || !participantIds?.length) return;
            setLoading(true);
            const results: any[] = [];

            for (const uid of participantIds) {
                if (typeof uid !== 'string' || uid.trim() === '') continue;
                try {
                    const userSnap = await getDoc(doc(db, 'users', uid));
                    if (userSnap.exists()) {
                        results.push({ uid, ...userSnap.data() });
                    }
                } catch (err) {
                    console.warn(`Could not fetch user ${uid}`, err);
                }
            }

            setParticipants(results);
            setLoading(false);
        };

        fetchParticipants();
    }, [participantIds, visible]);

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Participants</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#888" style={{ marginTop: 30 }} />
                ) : participants.length === 0 ? (
                    <Text style={styles.empty}>No participants to show.</Text>
                ) : (
                    <FlatList
                        data={participants}
                        keyExtractor={(item) => item.uid}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <View style={styles.participantRow}>
                                <Image
                                    source={{ uri: item.photoURL || 'https://placekitten.com/100/100' }}
                                    style={styles.avatar}
                                />
                                <View>
                                    <Text style={styles.name}>{item.displayName || 'Unnamed User'}</Text>
                                    <Text style={styles.handle}>@{item.handle || 'unknown'}</Text>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backArrow: {
        fontSize: 24,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    list: {
        paddingBottom: 40,
    },
    participantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 14,
        backgroundColor: '#eee',
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
    },
    handle: {
        fontSize: 14,
        color: '#666',
    },
    empty: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        marginTop: 40,
    },
});
