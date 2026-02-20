import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';


export default function AddResourceScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [type, setType] = useState('Room'); // Default
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!name || !type) {
            Alert.alert('Error', 'Name and Type are required');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/resources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    type,
                    description,
                    capacity: capacity ? parseInt(capacity) : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'Resource added successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Failed', data.message || 'Could not add resource');
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
                    <Text style={styles.headerTitle}>Add New Resource</Text>

                    <View style={styles.glassCard}>
                        <Text style={styles.label}>Resource Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Conference Room A"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />

                        <Text style={styles.label}>Resource Type</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={type}
                                onValueChange={(itemValue) => setType(itemValue)}
                                style={{ color: '#fff' }}
                                dropdownIconColor="#fff"
                            >
                                <Picker.Item label="Room" value="Room" color="#000" />
                                <Picker.Item label="Equipment" value="Equipment" color="#000" />
                                <Picker.Item label="Vehicle" value="Vehicle" color="#000" />
                            </Picker>
                        </View>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Optional description..."
                            placeholderTextColor={theme.dark.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        <Text style={styles.label}>Capacity</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 10"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={capacity}
                            onChangeText={setCapacity}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleCreate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Resource</Text>
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
        // marginTop set dynamically/via flex
        marginTop: 24,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
