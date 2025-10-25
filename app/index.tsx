import { usePrivy } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';

const LoginScreen = () => {
    const router = useRouter();
    const { isReady, user } = usePrivy();
    const { login } = useLogin()

    useEffect(() => {
        if (user) {
            router.replace('/dashboard');
        }
    }, [user, router]);


    const handlerLogin = async () => {
        const result = await login({ loginMethods: ['google'] })
        .then((res) => {
            console.log('Login result:', res)
        })
        .catch((error) => {
            console.error('Login error:', error)
        })
    }

    if (!isReady) {
        return (
            <View className="flex-1 justify-center items-center bg-accent">
                <ThemedText type="defaultSemiBold">Cargando...</ThemedText>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1">
            <LinearGradient
                colors={['#7CDFFF', '#14BFFB']}
                className="flex-1 justify-center items-center p-5"
            >
                <ThemedText type="title" className="mb-2.5 text-primary shadow-lg">GOING</ThemedText>
                <ThemedText type="subtitle" className="text-center mb-10 text-primary">
                    Entregas a la velocidad del ahora.
                </ThemedText>

                <Button title="Iniciar SesiÃ³n" onPress={handlerLogin} />
            </LinearGradient>
        </SafeAreaView>
    );
};

export default LoginScreen;
