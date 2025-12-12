
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../ThemedText';

interface HeaderProps {
    isOnline: boolean;
}

import { BlurView } from 'expo-blur';

const Header = ({ isOnline }: HeaderProps) => {
    return (
        <View className="overflow-hidden rounded-b-2xl">
            <BlurView intensity={30} tint="dark" className="pb-4 pt-12 px-4">
                <View className="flex-row justify-between items-center">
                    <ThemedText type="title" className="text-primary text-2xl tracking-wider">Dashboard</ThemedText>
                    <View className="flex-row items-center space-x-2 bg-surface/50 px-3 py-1 rounded-full border border-white/10">
                        <View className={`w-3 h-3 rounded-full shadow-sm ${isOnline ? 'bg-success shadow-success' : 'bg-text-muted'}`} />
                        <ThemedText type="defaultSemiBold" className="text-text text-sm">{isOnline ? 'Online' : 'Offline'}</ThemedText>
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

export default Header;
