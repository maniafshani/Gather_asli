// ✅ app/events/[id]/contributions.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { auth, db } from '@/lib/firebase';

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
} from 'firebase/firestore';

export default function ContributionsScreen() {
    const { id } = useLocalSearchParams();
    const user = auth.currentUser;
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [contributions, setContributions] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'events', id, 'contributions'));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setContributions(data);
        });
        return unsub;
    }, [id]);

    const handleAdd = async () => {
        if (!item || !amount) return Alert.alert('Missing info');
        try {
            await addDoc(collection(db, 'events', id, 'contributions'), {
                userId: user?.uid,
                item,
                amount: parseFloat(amount),
                createdAt: serverTimestamp(),
            });
            setItem('');
            setAmount('');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const total = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const members = [...new Set(contributions.map((c) => c.userId))];
    const share = members.length > 0 ? total / members.length : 0;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>What You Brought</Text>
            <View style={styles.row}>
                <TextInput
                    placeholder="Item"
                    value={item}
                    onChangeText={setItem}
                    style={styles.input}
                />
                <TextInput
                    placeholder="$ Amount"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
            <TouchableOpacity onPress={handleAdd} style={styles.button}>
                <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Group Contributions</Text>
            <FlatList
                data={contributions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.contribution}>
                        <Text>{item.item}</Text>
                        <Text>${item.amount.toFixed(2)}</Text>
                    </View>
                )}
            />

            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
            <Text style={styles.share}>Each pays: ${share.toFixed(2)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
    input: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    row: { flexDirection: 'row', marginBottom: 10 },
    button: {
        backgroundColor: '#ff385c',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    contribution: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    total: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 15,
    },
    share: {
        color: '#555',
        fontStyle: 'italic',
        marginTop: 5,
    },
});
