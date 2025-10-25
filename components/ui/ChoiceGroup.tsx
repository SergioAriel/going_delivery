import React from 'react';
import { View } from 'react-native';

export const ChoiceGroup = ({ children }: { children: React.ReactNode }) => (
    <View className="flex-row justify-around mb-4">{children}</View>
);
