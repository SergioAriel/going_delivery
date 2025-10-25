import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View className="mb-6">
        <ThemedText type="subtitle" className="text-xl font-semibold mb-4 text-gray-700">{title}</ThemedText>
        {children}
    </View>
);
