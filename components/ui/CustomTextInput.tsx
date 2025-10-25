import React from 'react';
import { TextInput } from 'react-native';

export const CustomTextInput = (props: React.ComponentProps<typeof TextInput>) => (
    <TextInput {...props} className="bg-white border border-gray-300 text-gray-800 text-base rounded-lg p-4 mb-4 w-full" placeholderTextColor="#9CA3AF" />
);
