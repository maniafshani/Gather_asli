import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DetailsScreen() {
    const router = useRouter();

    return (
        <>
            {/* 🔙 Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.container}>
                {/* 📄 Expandable Section */}
                <ShowMoreSection
                    title="About this place"
                    bullets={[
                        'We will be going to a picnic place',
                        'We will play volleyball and have some snacks',
                        'Music session by the fire',
                    ]}
                />

                {/* 🗺️ Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Where you'll be</Text>
                    <Text style={styles.location}>
                        Duisburg, Germany
                    </Text>
                    <View style={styles.mapPlaceholder}>
                        <Text style={{ color: '#777' }}>🗺️ Map placeholder</Text>
                    </View>
                    <TouchableOpacity style={styles.showMoreInline}>
                        <Text style={styles.showMoreText}>Show more {'>'}</Text>
                    </TouchableOpacity>
                </View>

                {/* 🗨️ Chat Button */}
                <TouchableOpacity
                    style={styles.openChatButton}
                    onPress={() => router.push('/chat')}
                >
                    <Text style={styles.openChatText}>Group Chat</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ⬇️ Footer */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.price}>
                        $8 <Text style={{ fontWeight: 'normal' }}>per peson</Text>
                    </Text>
                    <Text style={styles.dates}>15:00 - May 17</Text>
                </View>
                <TouchableOpacity style={styles.reserveButton}>
                    <Text style={styles.reserveText}>Join</Text>
                </TouchableOpacity>
            </View>
        </>
    );
}

// 🔁 Reusable expandable section
function ShowMoreSection({ title, bullets }: { title: string; bullets: string[] }) {
    const [expanded, setExpanded] = useState(false);
    const visibleBullets = expanded ? bullets : bullets.slice(0, 2);

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {visibleBullets.map((text, index) => (
                <Text key={index} style={styles.bullet}>• {text}</Text>
            ))}
            <TouchableOpacity
                style={styles.showMore}
                onPress={() => setExpanded(!expanded)}
            >
                <Text style={styles.showMoreText}>
                    {expanded ? 'Show less' : 'Show more'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 120,
        paddingBottom: 160,
        backgroundColor: '#fff',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bullet: {
        marginBottom: 6,
    },
    showMore: {
        marginTop: 10,
    },
    showMoreInline: {
        marginTop: 6,
    },
    showMoreText: {
        fontWeight: 'bold',
        color: '#000',
    },
    location: {
        marginBottom: 10,
        color: '#777',
    },
    mapPlaceholder: {
        backgroundColor: '#e6f0f8',
        height: 180,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    openChatButton: {
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 12,
        backgroundColor: '#000',
        borderRadius: 10,
        alignItems: 'center',
    },
    openChatText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    dates: {
        color: '#777',
        marginTop: 4,
    },
    reserveButton: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    reserveText: {
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
