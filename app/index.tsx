import { usePrivy } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useRootNavigationState } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
// import { Image } from 'expo-image';
const logo = require('../assets/images/logo.png');

const LoginScreen = () => {
    const router = useRouter();
    const { isReady, user } = usePrivy();
    const { login } = useLogin();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        // Do not navigate until the navigation state is ready
        if (!navigationState?.key) return;

        if (user) {
            router.replace('/dashboard');
        }
    }, [user, navigationState?.key, router]);


    const handlerLogin = async () => {
        try {
            const result = await login({ loginMethods: ['google'] });
            console.log('Login result:', result);
        } catch (error) {
            console.error('Login error:', error);
        }
    }

    if (!isReady) {
        return (
            <View className="flex-1 bg-background">
                <LinearGradient
                    colors={['#0F172A', '#1E293B']}
                    className="flex-1 justify-center items-center"
                >
                    <Image
                        source={logo}
                        className="w-48 h-48 mb-8"
                        resizeMode="contain"
                    />
                    <ThemedText type="subtitle" className="text-primary">
                        Cargando...
                    </ThemedText>
                </LinearGradient>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <LinearGradient
                colors={['#0F172A', '#1E293B']}
                className="flex-1 justify-center items-center p-5"
            >
                <View className="items-center mb-12">
                    <ThemedText type="title" className="text-5xl font-bold text-primary tracking-widest mb-2">GOING</ThemedText>
                    <ThemedText type="subtitle" className="text-center text-text-muted text-lg tracking-wide">
                        DELIVERY
                    </ThemedText>
                </View>

                <View className="w-full max-w-xs space-y-6">
                    <ThemedText className="text-center text-text-muted mb-8">
                        Entregas a la velocidad del ahora.
                    </ThemedText>

                    <Button title="Iniciar Sesión" onPress={handlerLogin} />
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};

export default LoginScreen;
