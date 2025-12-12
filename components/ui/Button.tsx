import React from 'react';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';

interface ButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}

export const Button = ({ title, onPress, disabled }: ButtonProps) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={{ opacity: disabled ? 0.5 : 1 }}>
        <LinearGradient
            colors={['#14BFFB', '#D300E5']}
            className="py-4 px-10 rounded-xl shadow-lg shadow-primary/50"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ThemedText type="defaultSemiBold" className="text-white text-center text-lg font-bold tracking-wide">{title}</ThemedText>
        </LinearGradient>
    </TouchableOpacity>
);
