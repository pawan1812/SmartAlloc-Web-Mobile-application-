import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function UserListScreen({ navigation }) {
    const { token, user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchUsers);
        return unsubscribe;
    }, [navigation]);

    const toggleStatus = async (user) => {
        if (user._id === currentUser._id) {
            Alert.alert('Action Denied', 'You cannot change your own status');
            return;
        }

        const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
        Alert.alert(
            'Confirm',
            `Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'unblock'} ${user.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/users/${user._id}/status`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({ status: newStatus })
                            });
                            const data = await response.json();
                            if (data.success) fetchUsers();
                            else Alert.alert('Error', data.message);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to update status');
                        }
                    }
                }
            ]
        );
    };

    const deleteUser = async (user) => {
        if (user._id === currentUser._id) return;

        Alert.alert(
            'Delete User',
            `Permanently delete ${user.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/users/${user._id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const data = await response.json();
                            if (data.success) fetchUsers();
                            else Alert.alert('Error', data.message);
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isActive = item.status === 'active';
        const isMe = item._id === currentUser._id;

        return (
            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.name} {isMe && '(You)'}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.role}>{item.role} • {item.department}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                        <Text style={[styles.badgeText, { color: isActive ? theme.dark.success : theme.dark.error }]}>
                            {isActive ? 'ACTIVE' : 'BLOCKED'}
                        </Text>
                    </View>
                </View>

                {!isMe && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => toggleStatus(item)} style={styles.actionTextBtn}>
                            <Text style={styles.actionText}>{isActive ? '🚫 Block' : '✅ Unblock'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteUser(item)} style={styles.actionTextBtn}>
                            <Text style={[styles.actionText, { color: theme.dark.error }]}>🗑️ Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>User Management</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.dark.primary} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={users}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.list}
                        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} tintColor="#fff" />}
                    />
                )}

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('AddUser')}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
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
    list: { padding: 20, paddingBottom: 100 },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userInfo: { flex: 1 },
    userName: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userEmail: {
        color: '#cbd5e1',
        fontSize: 14,
        marginBottom: 4,
    },
    role: {
        color: '#94a3b8',
        fontSize: 12,
        textTransform: 'uppercase',
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
    actions: {
        flexDirection: 'row',
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 12,
        justifyContent: 'flex-end',
        gap: 20,
    },
    actionTextBtn: {
        padding: 4,
    },
    actionText: {
        color: '#cbd5e1',
        fontWeight: 'bold',
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: theme.dark.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#6366f1',
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        marginTop: -4,
    }
});
