import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function AllocationsScreen() {
    const { token } = useContext(AuthContext);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllocations();
    }, []);

    const fetchAllocations = async () => {
        try {
            const response = await fetch(`${API_URL}/allocations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAllocations(data.data || []);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch allocations');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return theme.dark.success;
            case 'pending': return '#f59e0b'; // warning
            case 'rejected': return theme.dark.error;
            default: return theme.dark.textSecondary;
        }
    };

    const renderItem = ({ item }) => {
        const statusColor = getStatusColor(item.status || item.approvalStatus);
        const startTime = new Date(item.startTime).toLocaleString();
        const endTime = new Date(item.endTime).toLocaleString();

        return (
            <View style={styles.card}>
                <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
                <View style={styles.cardContent}>
                    <Text style={styles.resourceName}>{item.resourceId?.name || 'Unknown Resource'}</Text>
                    <Text style={styles.purpose}>{item.purpose}</Text>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeLabel}>From: {startTime}</Text>
                        <Text style={styles.timeLabel}>To:   {endTime}</Text>
                    </View>
                    <View style={[styles.badge, { borderColor: statusColor }]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                            {(item.status || item.approvalStatus || 'UNKNOWN').toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Allocations</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.dark.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={allocations}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No allocations found.</Text>
                        }
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
    statusStrip: {
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
    purpose: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    timeContainer: {
        marginBottom: 12,
    },
    timeLabel: {
        color: '#cbd5e1',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    badge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});
