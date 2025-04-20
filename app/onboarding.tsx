// ✅ app/onboarding.tsx — Step-by-step onboarding with image upload
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import uuid from 'react-native-uuid';

export default function OnboardingScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [displayName, setDisplayName] = useState('');
    const [uid, setUid] = useState('');
    const [bio, setBio] = useState('');
    const [photo, setPhoto] = useState<any>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled) {
            setPhoto(result.assets[0]);
        }
    };

    const finishSetup = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            setUploading(true);
            let photoURL = '';

            if (photo) {
                const blob = await fetch(photo.uri).then((res) => res.blob());
                const fileRef = ref(storage, `profile_photos/${uuid.v4()}`);
                await uploadBytes(fileRef, blob);
                photoURL = await getDownloadURL(fileRef);
            }

            await setDoc(doc(db, 'users', user.uid), {
                displayName,
                uid,
                bio,
                photoURL,
                followers: [],
                following: [],
            });

            router.replace('/');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {step === 1 && (
                <>
                    <Text style={styles.label}>Choose your display name</Text>
                    <TextInput
                        placeholder="John Doe"
                        value={displayName}
                        onChangeText={setDisplayName}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.nextButton} onPress={() => setStep(2)}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                </>
            )}

            {step === 2 && (
                <>
                    <Text style={styles.label}>Pick your @username</Text>
                    <TextInput
                        placeholder="manithegatherer"
                        value={uid}
                        onChangeText={setUid}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.nextButton} onPress={() => setStep(3)}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                </>
            )}

            {step === 3 && (
                <>
                    <Text style={styles.label}>Tell us a bit about you</Text>
                    <TextInput
                        placeholder="Your bio..."
                        value={bio}
                        onChangeText={setBio}
                        style={styles.input}
                        multiline
                    />
                    <TouchableOpacity style={styles.nextButton} onPress={() => setStep(4)}>
                        <Text style={styles.nextText}>Next</Text>
                    </TouchableOpacity>
                </>
            )}

            {step === 4 && (
                <>
                    <Text style={styles.label}>Upload a profile picture</Text>
                    <TouchableOpacity style={styles.avatarBox} onPress={pickImage}>
                        {photo ? (
                            <Image source={{ uri: photo.uri }} style={styles.avatar} />
                        ) : (
                            <Text style={{ color: '#999' }}>Tap to select an image</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.finishButton} onPress={finishSetup} disabled={uploading}>
                        <Text style={styles.nextText}>{uploading ? 'Saving...' : 'Finish Setup'}</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
    label: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    input: {
        backgroundColor: '#eee',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
    },
    nextButton: {
        backgroundColor: '#ff385c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    finishButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    nextText: { color: '#fff', fontWeight: 'bold' },
    avatarBox: {
        backgroundColor: '#eee',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 75,
        overflow: 'hidden',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
});
