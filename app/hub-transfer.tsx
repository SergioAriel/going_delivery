import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeftIcon, QrCodeIcon, CameraIcon } from 'react-native-heroicons/outline';
import { useSocket } from '@/src/contexts/SocketContext';

const HubTransferScreen = () => {
    const [mode, setMode] = useState<'display' | 'scan' | 'idle'>('idle');
    const { batchId } = useLocalSearchParams<{ batchId: string }>(); // Asumimos que el batchId se pasa como parámetro
    const router = useRouter();
    const socket = useSocket();

    const handleScanSuccess = ({ data }: { data: string }) => {
        console.log(`Scanned QR with batchId: ${data}`);
        // Aquí se emitiría el evento al backend para confirmar la transferencia
        if (socket) {
            socket.emit('confirm_batch_transfer', { batchId: data });
        }
        alert(`Transferencia del lote ${data.substring(0, 6)}... confirmada.`);
        setMode('idle');
        router.back(); // Volver al dashboard
    };

    const renderIdleState = () => (
        <View className="flex-1 justify-center items-center p-8 bg-gray-100">
            <Text className="text-2xl font-bold text-center text-gray-800 mb-8">Transferencia en Hub</Text>
            <TouchableOpacity 
                className="bg-blue-600 w-full py-5 rounded-lg flex-row items-center justify-center mb-6 shadow-lg"
                onPress={() => setMode('display')}
            >
                <QrCodeIcon color="white" size={24} />
                <Text className="text-white text-lg font-bold ml-3">Entregar Lote (Mostrar QR)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                className="bg-green-600 w-full py-5 rounded-lg flex-row items-center justify-center shadow-lg"
                onPress={() => setMode('scan')}
            >
                <CameraIcon color="white" size={24} />
                <Text className="text-white text-lg font-bold ml-3">Recibir Lote (Escanear)</Text>
            </TouchableOpacity>
        </View>
    );

    const renderDisplayQR = () => (
        <View className="flex-1 justify-center items-center bg-gray-800 p-5">
            <Text className="text-2xl font-bold text-white mb-4">Entrega de Lote</Text>
            <Text className="text-base text-gray-300 mb-8">Pide al otro conductor que escanee este código.</Text>
            <View className="bg-white p-6 rounded-lg">
                <QRCode value={batchId || 'no-batch-id'} size={256} />
            </View>
            <Text className="text-white font-mono mt-4">ID: {batchId}</Text>
        </View>
    );

    const renderScanQR = () => (
        <View className="flex-1">
            <CameraView
                style={{ flex: 1 }}
                onBarcodeScanned={handleScanSuccess}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
        </View>
    );

    const renderContent = () => {
        switch (mode) {
            case 'display':
                return renderDisplayQR();
            case 'scan':
                return renderScanQR();
            case 'idle':
            default:
                return renderIdleState();
        }
    }

    return (
        <View className="flex-1">
            {mode !== 'idle' && (
                <TouchableOpacity onPress={() => setMode('idle')} className="absolute top-12 left-4 bg-white/50 p-2 rounded-full z-10">
                    <ArrowLeftIcon size={24} color="#333" />
                </TouchableOpacity>
            )}
            {renderContent()}
        </View>
    );
};

export default HubTransferScreen;
