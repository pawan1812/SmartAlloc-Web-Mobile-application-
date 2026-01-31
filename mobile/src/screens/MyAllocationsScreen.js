import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function MyAllocationsScreen() {
    const { token } = useContext(AuthContext);
    const [allocations, setAllocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyAllocations = async () => {
        try {
            const response = await fetch(`${API_URL}/allocations/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAllocations(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyAllocations();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyAllocations();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return theme.dark.success;
            case 'pending': return '#f59e0b';
            case 'rejected': return theme.dark.error;
            default: return theme.dark.textSecondary;
        }
    };

    const renderItem = ({ item }) => {
        const status = item.approvalStatus || 'pending';
        const color = getStatusColor(status);
        const startTime = new Date(item.startTime).toLocaleString();
        const endTime = new Date(item.endTime).toLocaleString();

        return (
            <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
                <View style={styles.headerRow}>
                    <Text style={styles.resourceName}>{item.resourceId?.name || 'Unknown Resource'}</Text>
                    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
                        <Text style={[styles.badgeText, { color }]}>{status.toUpperCase()}</Text>
                    </View>
                </View>

                <Text style={styles.purpose}>{item.purpose}</Text>

                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>Start: {startTime}</Text>
                    <Text style={styles.timeText}>End:   {endTime}</Text>
                </View>
            </View>
        );
    };

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>My Requests</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.dark.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={allocations}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>You haven't made any requests yet.</Text>
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
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    resourceName: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    purpose: {
        color: '#94a3b8',
        fontSize: 14,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    timeContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        padding: 10,
        borderRadius: 8,
    },
    timeText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontFamily: 'monospace',
        marginBottom: 2,
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});
