import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient'; // Removed unused import if not used elsewhere inside
// import { LinearGradient } from 'expo-linear-gradient'; // Keeping it if used elsewhere or just for safety, but mostly we replace it.
import AnimatedBackground from '../components/AnimatedBackground';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function DashboardScreen({ navigation }) {
    const { token, logout, user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.data); // Backend returns data in 'data' field, not 'stats'
            }
        } catch (error) {
            console.error(error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    const StatCard = ({ label, value, color }) => (
        <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <Text style={styles.cardValue}>{value}</Text>
            <Text style={styles.cardLabel}>{label}</Text>
        </View>
    );

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcome}>Welcome back,</Text>
                        <Text style={styles.username}>{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                >
                    <Text style={styles.sectionTitle}>Overview</Text>

                    <View style={styles.grid}>
                        <TouchableOpacity
                            style={[styles.card, { borderLeftColor: theme.dark.primary, borderLeftWidth: 4 }]}
                            onPress={() => navigation.navigate('Resources')}
                        >
                            <Text style={styles.cardValue}>{stats?.totalResources || 0}</Text>
                            <Text style={styles.cardLabel}>All Resources</Text>
                        </TouchableOpacity>

                        {user?.role === 'Super User' ? (
                            <TouchableOpacity
                                style={[styles.card, { borderLeftColor: '#f59e0b', borderLeftWidth: 4 }]}
                                onPress={() => navigation.navigate('PendingRequests')}
                            >
                                <Text style={styles.cardValue}>{stats?.upcomingAllocations || 0}</Text>
                                <Text style={styles.cardLabel}>Pending Requests</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.card, { borderLeftColor: '#f59e0b', borderLeftWidth: 4 }]}>
                                <Text style={styles.cardValue}>{stats?.upcomingAllocations || 0}</Text>
                                <Text style={styles.cardLabel}>Upcoming</Text>
                            </View>
                        )}

                        <View style={[styles.card, { borderLeftColor: theme.dark.success, borderLeftWidth: 4 }]}>
                            <Text style={styles.cardValue}>{stats?.activeAllocations || 0}</Text>
                            <Text style={styles.cardLabel}>Active Now</Text>
                        </View>

                        {user?.role === 'Super User' && (
                            <TouchableOpacity
                                style={[styles.card, { borderLeftColor: '#ec4899', borderLeftWidth: 4 }]}
                                onPress={() => navigation.navigate('Users')}
                            >
                                <Text style={styles.cardValue}>Manage</Text>
                                <Text style={styles.cardLabel}>Users</Text>
                            </TouchableOpacity>
                        )}
                    </View>


                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.grid}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('MyAllocations')}
                        >
                            <Text style={styles.actionEmoji}>📂</Text>
                            <Text style={styles.actionTitle}>My Requests</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('Allocations')}
                        >
                            <Text style={styles.actionEmoji}>📅</Text>
                            <Text style={styles.actionTitle}>Schedule</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate('AssignResource')}
                        >
                            <Text style={styles.actionEmoji}>➕</Text>
                            <Text style={styles.actionTitle}>Assign New</Text>
                        </TouchableOpacity>

                        {user?.role === 'Super User' && (
                            <TouchableOpacity
                                style={[styles.actionCard, { borderColor: '#f59e0b' }]}
                                onPress={() => navigation.navigate('AddResource')}
                            >
                                <Text style={styles.actionEmoji}>🛠️</Text>
                                <Text style={styles.actionTitle}>Add Resource</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginBottom: 10,
    },
    welcome: { color: '#94a3b8', fontSize: 14 },
    username: { color: '#f1f5f9', fontSize: 20, fontWeight: 'bold' },
    logoutBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    logoutText: { color: '#ef4444', fontWeight: 'bold' },
    content: { padding: 20 },
    sectionTitle: { color: '#f1f5f9', fontSize: 18, fontWeight: 'bold', marginBottom: 16, marginTop: 10 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 16,
        padding: 20,
        width: '47%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    fullCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardValue: { fontSize: 28, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 4 },
    cardLabel: { fontSize: 12, color: '#94a3b8' },
    actionCard: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderRadius: 16,
        padding: 20,
        width: '47%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(129, 140, 248, 0.3)',
    },
    actionEmoji: { fontSize: 32, marginBottom: 8 },
    actionTitle: { color: '#f1f5f9', fontWeight: 'bold' }
});
