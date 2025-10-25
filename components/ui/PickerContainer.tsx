import React from 'react';
import { View } from 'react-native';

export const PickerContainer = ({ children }: { children: React.ReactNode }) => (
    <View className="bg-white border border-gray-300 rounded-lg mb-4">
        {children}
    </View>
);
