import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBackground from '../components/AnimatedBackground';
import { Picker } from '@react-native-picker/picker'; // You might need to install this if not available, using simple text input for now or modal if picker not available
// Actually standard simple picker is depracted. I will use a simple list selection or standard TextInput for Date for MVP or just 
// For now, I'll use standard TextInputs for date to keep it simple without extra libs, in format YYYY-MM-DD HH:MM
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { theme } from '../styles/theme';

export default function AssignResourceScreen({ navigation }) {
    const { token, user } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                const resourceList = data.data || [];
                setResources(resourceList);
                if (resourceList.length > 0) {
                    setSelectedResource(resourceList[0]._id);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAssign = async () => {
        if (!selectedResource || !startTime || !endTime || !purpose) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/allocations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    resourceId: selectedResource,
                    assignedTo: user.name, // Auto-assign to self or input name? Web calls it "assignedTo"
                    startTime,
                    endTime,
                    purpose
                })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert('Success', 'Resource allocated successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Failed', data.message || 'Allocation failed');
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
                    <Text style={styles.headerTitle}>Assign Resource</Text>

                    <View style={styles.glassCard}>
                        <Text style={styles.label}>Select Resource</Text>
                        <View style={styles.pickerContainer}>
                            {/* Simple implementation of a picker using map for now or better explicit Picker if installed */}
                            <Picker
                                selectedValue={selectedResource}
                                onValueChange={(itemValue) => setSelectedResource(itemValue)}
                                style={{ color: '#fff' }}
                                dropdownIconColor="#fff"
                            >
                                {resources.map(res => (
                                    <Picker.Item key={res._id} label={`${res.name} (${res.type})`} value={res._id} color="#000" />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Start Time (YYYY-MM-DD HH:MM)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="2024-02-01 09:00"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={startTime}
                            onChangeText={setStartTime}
                        />

                        <Text style={styles.label}>End Time (YYYY-MM-DD HH:MM)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="2024-02-01 11:00"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={endTime}
                            onChangeText={setEndTime}
                        />

                        <Text style={styles.label}>Purpose</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Meeting / Project X"
                            placeholderTextColor={theme.dark.textSecondary}
                            value={purpose}
                            onChangeText={setPurpose}
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAssign}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Allocate Resource</Text>
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
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
