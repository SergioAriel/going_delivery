import { usePrivy } from '@privy-io/expo';
import { useLogin } from '@privy-io/expo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
                <Text className="text-primary font-bold">Cargando...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#7CDFFF', '#14BFFB']}
            className="flex-1 justify-center items-center p-5"
        >
            <Text className="text-5xl font-bold mb-2.5 text-primary shadow-lg">GOING</Text>
            <Text className="text-lg text-center mb-10 text-primary">
                Entregas a la velocidad del ahora.
            </Text>

            <TouchableOpacity onPress={() => handlerLogin()}>
                <LinearGradient
                    colors={['#14BFFB', '#D300E5']}
                    className="py-4 px-10 rounded-lg shadow-lg"
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text className="text-white text-lg font-bold">Iniciar Sesión</Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
};

export default LoginScreen;
