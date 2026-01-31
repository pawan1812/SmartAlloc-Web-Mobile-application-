import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../styles/theme';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LoginScreen() {
    const [email, setEmail] = useState('alice@smartalloc.com');
    const [password, setPassword] = useState('123456');
    const { login } = useContext(AuthContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setIsSubmitting(true);
        const result = await login(email, password);
        setIsSubmitting(false);
        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
    };

    return (
        <LinearGradient colors={theme.dark.background} style={styles.container}>
            <View style={styles.glassCard}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoEmoji}>🚀</Text>
                    <Text style={styles.title}>SmartAlloc</Text>
                    <Text style={styles.subtitle}>Allocate Smart. Operate Efficiently.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={theme.dark.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={theme.dark.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleLogin}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.demoCreds}>
                        <Text style={styles.demoText}>Demo: alice@smartalloc.com / 123456</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    glassCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoEmoji: {
        fontSize: 40,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f1f5f9',
    },
    subtitle: {
        color: '#94a3b8',
        marginTop: 5,
    },
    form: {
        // Removed gap for compatibility
    },
    label: {
        color: '#f1f5f9',
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 10, // Added marginTop to simulate gap
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
    button: {
        backgroundColor: '#818cf8',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24, // Increased margin
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    demoCreds: {
        marginTop: 20,
        alignItems: 'center',
    },
    demoText: {
        color: '#94a3b8',
        fontSize: 12,
    }
});
