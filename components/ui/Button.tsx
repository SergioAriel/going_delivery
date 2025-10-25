import React from 'react';
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';

interface ButtonProps {
    title: string;
    onPress: () => void;
}

export const Button = ({ title, onPress }: ButtonProps) => (
    <TouchableOpacity onPress={onPress}>
        <LinearGradient
            colors={['#14BFFB', '#D300E5']}
            className="py-4 px-10 rounded-lg shadow-lg"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <ThemedText type="defaultSemiBold" className="text-white text-center">{title}</ThemedText>
        </LinearGradient>
    </TouchableOpacity>
);
