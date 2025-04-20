import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Image } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/'); // go to home screen
        } catch (error: any) {
            Alert.alert('Login Error', error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View style={styles.container}>
            <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Login</Text>
            <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                placeholderTextColor="#999"
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.link}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
            </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    input: {
        backgroundColor: '#eee',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
    },
    logo: {
        width: 250,
        height: 250,
        alignSelf: 'center',
        marginBottom: 5,
        resizeMode: 'contain',
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#000',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    link: { marginTop: 15, color: '#007aff' },
});
