import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define gradient states to cycle through
// State 1: Deep Blue -> Dark Purple
const GRADIENT_1 = ['#0f172a', '#1e1b4b'];
// State 2: Dark Blue -> Deep Indigo
const GRADIENT_2 = ['#172554', '#312e81'];

export default function AnimatedBackground({ children, style }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 5000,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 5000,
                    useNativeDriver: true,
                })
            ])
        );
        loop.start();

        return () => loop.stop();
    }, [fadeAnim]);

    return (
        <View style={[styles.container, style]}>
            {/* Base Gradient (Always visible) */}
            <LinearGradient
                colors={GRADIENT_1}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Overlay Gradient (Fades in and out) */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                <LinearGradient
                    colors={GRADIENT_2}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* Content Container */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        zIndex: 1, // Ensure content is above background
    }
});
