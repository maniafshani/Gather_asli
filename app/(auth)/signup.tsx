import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, Image, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db, storage } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SignupScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission needed', 'Please grant camera roll permissions.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uid: string) => {
        if (!image) return '';
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `profilePics/${uid}.jpg`);
        await uploadBytes(imageRef, blob);
        return await getDownloadURL(imageRef);
    };

    const handleSignup = async () => {
        if (!email || !password || !name || !image) {
            Alert.alert('Missing fields', 'Please fill in all fields and select a profile image.');
            return;
        }

        try {
            setLoading(true);

            // 1. Create account
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;

            // 2. Upload profile image
            const imageUrl = await uploadImage(uid);

            // 3. Set auth profile
            await updateProfile(userCred.user, {
                displayName: name,
                photoURL: imageUrl,
            });

            // 4. Set Firestore user doc
            await setDoc(doc(db, 'users', uid), {
                uid,
                displayName: name,
                photoURL: imageUrl,
                handle: name.toLowerCase().replace(/\s+/g, ''), // simple handle fallback
                Followers: [],
                Following: [],
                bio: '',
                createdAt: new Date().toISOString(),
            });

            Alert.alert('Success', 'Account created!');
            router.replace('/');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Signup Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>Pick a Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.title}>Sign Up</Text>
            <TextInput
                placeholder="Display Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#999"
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#999"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#999"
            />

            <TouchableOpacity onPress={handleSignup} style={styles.button} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: {
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    link: { marginTop: 15, color: '#007aff', textAlign: 'center' },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        alignSelf: 'center', marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: 50,
        alignSelf: 'center', backgroundColor: '#ccc',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: { color: '#444' },
});
