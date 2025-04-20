import React, { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-get-random-values';

export default function ProtectedTabsLayout() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), (firebaseUser) => {
            setUser(firebaseUser);
            setChecking(false);

            if (!firebaseUser) {
                router.replace('/(auth)/login'); // ✅ fixed path to your actual login
            }
        });

        return () => unsubscribe();
    }, []);

    if (checking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="joined"
                options={{
                    title: 'Events',
                    tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
                }}
            />

            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="create-event"
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
