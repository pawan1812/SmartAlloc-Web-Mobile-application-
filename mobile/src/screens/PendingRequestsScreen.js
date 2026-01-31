import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function PendingRequestsScreen() {
    const { token } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchPendingRequests = async () => {
        try {
            const response = await fetch(`${API_URL}/allocations/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const handleAction = async (id, status) => {
        setProcessingId(id);
        try {
            const response = await fetch(`${API_URL}/allocations/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', `Request ${status}`);
                fetchPendingRequests(); // Refresh list
            } else {
                Alert.alert('Error', data.message || 'Action failed');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Network error');
        } finally {
            setProcessingId(null);
        }
    };

    const renderItem = ({ item }) => {
        const startTime = new Date(item.startTime).toLocaleString();
        const endTime = new Date(item.endTime).toLocaleString();
        const isProcessing = processingId === item._id;

        return (
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <Text style={styles.resourceName}>{item.resourceId?.name || 'Unknown'}</Text>
                    <Text style={styles.userName}>by {item.requestedBy?.name || 'User'}</Text>
                </View>

                <Text style={styles.purpose}>{item.purpose}</Text>

                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>Start: {startTime}</Text>
                    <Text style={styles.timeText}>End:   {endTime}</Text>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleAction(item._id, 'rejected')}
                        disabled={isProcessing}
                    >
                        <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleAction(item._id, 'approved')}
                        disabled={isProcessing}
                    >
                        {isProcessing ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.btnTextDark}>Approve</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Pending Requests</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.dark.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={requests}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPendingRequests} tintColor="#fff" />}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No pending requests.</Text>
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
        color: '#f59e0b',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        color: '#94a3b8',
        fontSize: 14,
    },
    purpose: {
        color: '#f1f5f9',
        fontSize: 16,
        marginBottom: 12,
    },
    timeContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    timeText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontFamily: 'monospace',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    approveBtn: {
        backgroundColor: theme.dark.success,
    },
    rejectBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderWidth: 1,
        borderColor: theme.dark.error,
    },
    btnText: {
        color: theme.dark.error,
        fontWeight: 'bold',
    },
    btnTextDark: {
        color: '#000',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#94a3b8',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});
