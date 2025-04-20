import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const auth = getAuth();
    const currentUid = auth.currentUser?.uid;

    useEffect(() => {
        if (!id) return;
        const fetch = async () => {
            const ref = doc(db, 'users', id);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                setProfile(data);
                setIsFollowing(data.Followers?.includes(currentUid));
            } else {
                Alert.alert('User not found');
            }
            setLoading(false);
        };
        fetch();
    }, [id]);

    const toggleFollow = async () => {
        if (!currentUid || !id) return;
        const ref = doc(db, 'users', id);
        await updateDoc(ref, {
            Followers: isFollowing ? arrayRemove(currentUid) : arrayUnion(currentUid),
        });
        setIsFollowing(!isFollowing);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.center}>
                <Text>User not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: profile.photoURL || 'https://placekitten.com/200/200' }}
                style={styles.avatar}
            />
            <Text style={styles.handle}>@{profile.uid}</Text>
            <Text style={styles.name}>{profile.displayName}</Text>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

            {currentUid !== id && (
                <TouchableOpacity style={styles.followBtn} onPress={toggleFollow}>
                    <Text style={styles.followText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24, backgroundColor: '#fff', flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 16,
    },
    handle: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
        color: '#444',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 6,
    },
    bio: {
        fontSize: 15,
        color: '#666',
        marginTop: 12,
        textAlign: 'center',
    },
    followBtn: {
        marginTop: 24,
        backgroundColor: '#000',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    followText: {
        color: '#fff',
        fontWeight: '600',
    },
});
