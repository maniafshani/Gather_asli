import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    doc,
    onSnapshot,
    addDoc,
    collection,
    query,
    orderBy,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ParticipantsModal from '@/app/events/[id]/ParticipantsModal';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [event, setEvent] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    // Fetch event & messages in real-time
    useEffect(() => {
        if (!id) return;

        const eventRef = doc(db, 'events', id as string);
        const unsubEvent = onSnapshot(eventRef, (snap) => {
            setEvent(snap.data());
        });

        const msgQuery = query(
            collection(db, 'events', id as string, 'messages'),
            orderBy('timestamp')
        );
        const unsubMsgs = onSnapshot(msgQuery, (snap) => {
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMessages(data);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });

        return () => {
            unsubEvent();
            unsubMsgs();
        };
    }, [id]);

    const handleSend = async () => {
        if (!message.trim() || !currentUser) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            const user = userDoc.data();

            await addDoc(collection(db, 'events', id as string, 'messages'), {
                text: message.trim(),
                senderId: currentUser.uid,
                senderName: user?.handle || user?.displayName || 'User',
                senderPhoto: user?.photoURL || '',
                timestamp: serverTimestamp(),
            });

            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const isCurrentUser = (uid: string) => uid === currentUser?.uid;
    const latestUserMsgId = [...messages].reverse().find((m) => m.senderId === currentUser?.uid)?.id;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <TouchableOpacity style={styles.topBar} onPress={() => setShowModal(true)}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                {event?.image && <Image source={{ uri: event.image }} style={styles.eventImage} />}
                <View style={styles.titleArea}>
                    <Text style={styles.eventTitle}>{event?.title || 'Chat'}</Text>
                    <Text style={styles.memberCount}>{event?.participants?.length || 0} Members</Text>
                </View>
            </TouchableOpacity>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
                renderItem={({ item }) => {
                    const isMine = isCurrentUser(item.senderId);
                    return (
                        <View style={[styles.messageRow, isMine ? styles.messageRight : styles.messageLeft]}>
                            {!isMine && item.senderPhoto && (
                                <Image source={{ uri: item.senderPhoto }} style={styles.avatar} />
                            )}
                            <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                                <Text style={styles.senderName}>{item.senderName}</Text>
                                <Text>{item.text}</Text>
                                <Text style={styles.timestamp}>
                                    {item.timestamp?.seconds
                                        ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString()
                                        : '...'}
                                    {isMine && item.id === latestUserMsgId && ' • Seen'}
                                </Text>
                            </View>
                            {isMine && currentUser?.photoURL && (
                                <Image source={{ uri: currentUser.photoURL }} style={styles.avatar} />
                            )}
                        </View>
                    );
                }}
            />

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="Type a message..."
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity onPress={handleSend}>
                        <Text style={styles.send}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Participants */}
            <ParticipantsModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                participantIds={event?.participants || []}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    eventImage: { width: 32, height: 32, borderRadius: 16 },
    titleArea: { flexDirection: 'column' },
    eventTitle: { fontSize: 16, fontWeight: 'bold' },
    memberCount: { fontSize: 12, color: '#888' },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
    messageLeft: { justifyContent: 'flex-start' },
    messageRight: { justifyContent: 'flex-end', alignSelf: 'flex-end' },
    avatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 8 },
    bubble: { maxWidth: '70%', padding: 10, borderRadius: 10 },
    myBubble: { backgroundColor: '#d1f2ff' },
    theirBubble: { backgroundColor: '#f1f1f1' },
    senderName: { fontWeight: '600', marginBottom: 2 },
    timestamp: { fontSize: 10, color: '#666', marginTop: 4, textAlign: 'right' },
    inputRow: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
    },
    send: { color: '#007aff', fontWeight: 'bold' },
});
