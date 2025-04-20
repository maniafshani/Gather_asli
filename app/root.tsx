// app/root.tsx
import { Redirect } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Root() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setChecking(false);
        });

        return () => unsubscribe();
    }, []);

    if (checking) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/login" />;
    }

    return <Redirect href="/index" />;
}
