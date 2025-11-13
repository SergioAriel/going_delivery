import { useSocket } from '@/src/contexts/SocketContext';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { CollectingBatchView } from '../components/tasks/CollectingBatchView';
import { DeliveringBatchView } from '../components/tasks/DeliveringBatchView';
import { RoutingToHubView } from '../components/tasks/RoutingToHubView';
import { DirectRouteView } from '../components/tasks/DirectRouteView';
import { useDriverTask } from '../context/DriverTaskContext';
import { DriverTask, Batch } from '@/interfaces'; // Import Batch
import { LinearGradient } from 'expo-linear-gradient';


// --- MOCK DATA ---
// Creamos una tarea de prueba para forzar la vista de recolección
const mockBatch: Batch = {
    _id: 'batch_123',
    type: 'HUB_AND_SPOKE',
    status: 'assigned',
    assignedCollectorId: 'driver_456',
    createdAt: new Date(),
    shipments: [
        {
            _id: 'shipment_abc',
            orderId: 'order_001',
            sellerId: 'seller_789',
            buyerId: 'buyer_101',
            shippingType: 'going_network',
            status: 'ready_to_ship', // Para probar el botón de "Escanear QR" en la pantalla de recolección
            // status: 'in_transit',    // Para probar el flujo normal
            createdAt: new Date(),
            updatedAt: new Date(),
            pickupAddress: {
                name: 'Tienda de Ropa "La Moda"',
                street: 'Av. Corrientes 1234',
                city: 'Buenos Aires',
                state: 'CABA',
                zipCode: 'C1043AAS',
                country: 'Argentina',
                phone: '11-5555-1234',
                email: 'ventas@lamoda.com',
                lat: -34.6037,
                lon: -58.3816,
            },
            deliveryAddress: {
                name: 'Juan Pérez',
                street: 'Calle Falsa 567',
                city: 'Buenos Aires',
                state: 'CABA',
                zipCode: 'C1425BJH',
                country: 'Argentina',
                phone: '11-5555-5678',
                email: 'juan.perez@email.com',
                lat: -34.58,
                lon: -58.42,
            },
            items: [{ _id: 'prod_xyz', name: 'Camisa Azul', price: 50, quantity: 1, mainImage: '', seller: '', addressWallet: '', currency: 'USD', shippingType: 'going_network', pickupAddress: {} as any }],
        },
        {
            _id: 'shipment_def',
            orderId: 'order_002',
            sellerId: 'seller_007',
            buyerId: 'buyer_102',
            shippingType: 'going_network',
            status: 'in_transit',
            createdAt: new Date(),
            updatedAt: new Date(),
            pickupAddress: {
                name: 'Librería "El Saber"',
                street: 'Av. Santa Fe 2345',
                city: 'Buenos Aires',
                state: 'CABA',
                zipCode: 'C1123AAS',
                country: 'Argentina',
                phone: '11-5555-4321',
                email: 'contacto@elsaber.com',
                lat: -34.595,
                lon: -58.39,
            },
            deliveryAddress: {
                name: 'Ana Gómez',
                street: 'Av. del Libertador 4567',
                city: 'Buenos Aires',
                state: 'CABA',
                zipCode: 'C1426BJH',
                country: 'Argentina',
                phone: '11-5555-8765',
                email: 'ana.gomez@email.com',
                lat: -34.57,
                lon: -58.43,
            },
            items: [{ _id: 'prod_uvw', name: 'Libro de Ciencia Ficción', price: 30, quantity: 1, mainImage: '', seller: '', addressWallet: '', currency: 'USD', shippingType: 'going_network', pickupAddress: {} as any }],
        },
        {
            _id: 'shipment_ghi',
            orderId: 'order_003',
            sellerId: 'seller_008',
            buyerId: 'buyer_103',
            shippingType: 'going_network',
            status: 'ready_to_ship', // Correct status for pickup
            createdAt: new Date(),
            updatedAt: new Date(),
            pickupAddress: {
                name: 'Kiosco "El Sol"',
                street: 'Av. Pueyrredón 800',
                city: 'Buenos Aires',
                state: 'CABA',
                zipCode: 'C1032AAS',
                country: 'Argentina',
                phone: '11-5555-9999',
                email: 'contacto@kioscoelsol.com',
                lat: -34.601,
                lon: -58.40,
            },
            deliveryAddress: { name: 'Test User', street: 'Test Street', city: 'Test City', state: 'TS', zipCode: '12345', country: 'Test Country', phone: '123', email: 'test@test.com', lat: 0, lon: 0 },
            items: [{ _id: 'prod_abc', name: 'Alfajor de Maicena', price: 5, quantity: 2, mainImage: '', seller: '', addressWallet: '', currency: 'USD', shippingType: 'going_network', pickupAddress: {} as any }],
        }
    ]
};

const mockTask: DriverTask = {
    status: 'COLLECTING_BATCH',
    batch: mockBatch,
};
// --- END MOCK DATA ---


import Header from '../components/ui/Header';

// --- Main Dashboard Component (Development Mode) ---

const DashboardScreen = () => {
    // Forzamos el estado para desarrollo y diseño
    const { activeTask, setActiveTask } = useDriverTask();
    const [isOnline, setIsOnline] = useState(true); // FORZADO A TRUE

    // Seteamos la tarea de prueba en el contexto al iniciar
    useEffect(() => {
        setActiveTask(mockTask);
    }, []);


    // La lógica de conexión y sockets queda desactivada temporalmente
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    // const socket = useSocket();
    // const { getAccessToken } = usePrivy();
    // const goOnline = async () => { ... };
    // useEffect(() => { ... });

    const renderContent = () => {
        if (!activeTask) {
             return (
                <View className="flex-1 justify-center items-center p-4">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="mt-2">Loading Task...</Text>
                </View>
             );
        }

        switch (activeTask.status) {
            case 'COLLECTING_BATCH':
                return <CollectingBatchView />;
            case 'ROUTING_TO_HUB':
                return <RoutingToHubView />;
            case 'DELIVERING_BATCH':
                return <DeliveringBatchView />;
            case 'PERFORMING_DIRECT_ROUTE':
                return <DirectRouteView />;
            default:
                 return (
                    <View className="flex-1 justify-center items-center p-6">
                        <Text>Unknown Task Status</Text>
                    </View>
                 );
        }
    };

    return (
        <LinearGradient
            colors={['#7CDFFF', '#14BFFB']}
            style={{ flex: 1 }}
        >
            <Header isOnline={isOnline} />
            <View className="flex-1">
                {renderContent()}
            </View>
        </LinearGradient>
    );
};

export default DashboardScreen;