import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function ResourceListScreen() {
    const { token } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await fetch(`${API_URL}/resources`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setResources(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isAvailable = item.status === 'available';

        return (
            <View style={styles.card}>
                <View style={[styles.statusIndicator, { backgroundColor: isAvailable ? theme.dark.success : theme.dark.error }]} />
                <View style={styles.cardContent}>
                    <Text style={styles.resourceName}>{item.name}</Text>
                    <Text style={styles.resourceType}>{item.type}</Text>
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                            <Text style={[styles.badgeText, { color: isAvailable ? theme.dark.success : theme.dark.error }]}>
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>All Resources</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.dark.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={resources}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                    />
                )}
            </SafeAreaView>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f1f5f9',
        padding: 20,
        paddingBottom: 10,
    },
    list: { padding: 20 },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    statusIndicator: {
        width: 6,
        height: '100%',
    },
    cardContent: {
        padding: 16,
        flex: 1,
    },
    resourceName: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    resourceType: {
        color: '#818cf8',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    description: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
