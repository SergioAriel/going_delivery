
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../ThemedText';

interface HeaderProps {
    isOnline: boolean;
}

const Header = ({ isOnline }: HeaderProps) => {
    return (
        <SafeAreaView style={{ backgroundColor: 'transparent' }}>
            <View className="p-4">
                <View className="flex-row justify-between items-center">
                    <ThemedText type="title">Dashboard</ThemedText>
                    <View className="flex-row items-center space-x-2">
                        <View className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
                        <ThemedText type="defaultSemiBold">{isOnline ? 'Online' : 'Offline'}</ThemedText>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Header;
