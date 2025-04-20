import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';

export const uploadImageAsync = async (uri: string, path: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], {
        type: 'image/jpeg',
    });

    const storage = getStorage();
    const imageRef = ref(storage, path);

    await uploadBytes(imageRef, blob);
    const downloadURL = await getDownloadURL(imageRef);

    return downloadURL;
};
