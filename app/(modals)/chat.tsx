import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function ChatScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState([
        { sender: 'other', text: 'Welcome to the picnic group!' },
        { sender: 'other', text: 'Bring sunscreen 😎' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { sender: 'me', text: input.trim() }]);
        setInput('');
    };

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <View style={styles.container}>
                <FlatList
                    data={messages}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.chatBubble,
                                item.sender === 'me'
                                    ? styles.bubbleRight
                                    : styles.bubbleLeft,
                            ]}
                        >
                            <Text style={styles.chatText}>{item.text}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
                <View style={styles.inputRow}>
                    <TextInput
                        placeholder="Send a message..."
                        value={input}
                        onChangeText={setInput}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                        <Text style={styles.sendText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
                </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    chatBubble: {
        maxWidth: '70%',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    bubbleLeft: {
        backgroundColor: '#f0f0f0',
        alignSelf: 'flex-start',
    },
    bubbleRight: {
        backgroundColor: '#969696',
        alignSelf: 'flex-end',
    },
    chatText: {
        color: '#000',
    },
    inputRow: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#eee',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    input: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    sendBtn: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    sendText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: '#fff',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    backText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
