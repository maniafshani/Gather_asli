import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// Secure store for Clerk session caching
const tokenCache = {
    async getToken(key: string) {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (err) {
            return null;
        }
    },
    async saveToken(key: string, value: string) {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (err) {
            // handle errors silently
        }
    },
};

export default function RootLayout() {
    useEffect(() => {
        console.log('Layout mounted');
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ClerkProvider
                publishableKey="pk_test_Y29tcG9zZWQtbXV0dC01NC5jbGVyay5hY2NvdW50cy5kZXYk"
                tokenCache={tokenCache}
            >
                <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'light'} />
                <Slot />
            </ClerkProvider>
        </GestureHandlerRootView>
    );
}
