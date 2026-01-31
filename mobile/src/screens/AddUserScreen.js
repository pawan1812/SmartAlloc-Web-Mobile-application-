import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function AddUserScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [department, setDepartment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Name, Email and Password are required');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                    department
                })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'User created successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Failed', data.message || 'Could not create user');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatedBackground style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.headerTitle}>Add New User</Text>

                    <View style={styles.glassCard}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="john@example.com"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="******"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Text style={styles.label}>Role</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={role}
                                onValueChange={(itemValue) => setRole(itemValue)}
                                style={{ color: '#fff' }}
                                dropdownIconColor="#fff"
                            >
                                <Picker.Item label="User" value="User" color="#000" />
                                <Picker.Item label="Super User (Admin)" value="Super User" color="#000" />
                            </Picker>
                        </View>

                        <Text style={styles.label}>Department</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={department}
                                onValueChange={(itemValue) => setDepartment(itemValue)}
                                style={{ color: '#fff' }}
                                dropdownIconColor="#fff"
                            >
                                <Picker.Item label="General" value="General" color="#000" />
                                <Picker.Item label="Engineering" value="Engineering" color="#000" />
                                <Picker.Item label="Marketing" value="Marketing" color="#000" />
                                <Picker.Item label="HR" value="HR" color="#000" />
                                <Picker.Item label="Operations" value="Operations" color="#000" />
                            </Picker>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleCreate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create User</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f1f5f9',
        marginBottom: 20,
    },
    glassCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    label: {
        color: '#f1f5f9',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    pickerContainer: {
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#818cf8',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
