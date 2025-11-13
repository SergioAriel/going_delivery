import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Linking, Alert, Share, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Shipment } from '../../interfaces';
import { ChevronRightIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { useDriverTask } from '../../context/DriverTaskContext';
import { Camera, LineLayer, MapView, ShapeSource, SymbolLayer, CircleLayer } from '@maplibre/maplibre-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { Feature, FeatureCollection, Point } from 'geojson';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.40;

// --- Helper to decode OSRM polyline
function decodePolyline(encoded: string): [number, number][] {
    if (!encoded) return [];
    let poly = [], index = 0, len = encoded.length, lat = 0, lng = 0;
    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        poly.push([lng / 1e5, lat / 1e5]);
    }
    return poly;
}

const DeliveryStopCard = ({ shipment, onPress, stopNumber, isActive }: { shipment: Shipment & { _id: string }, onPress: () => void, stopNumber: number, isActive: boolean }) => {
    const cardClasses = isActive ? "bg-gray-700 opacity-100" : "bg-gray-800 opacity-50";
    const circleClasses = isActive ? "bg-green-500" : "bg-gray-600";

    return (
        <TouchableOpacity onPress={onPress} disabled={!isActive} className={`p-4 rounded-2xl shadow-md border border-gray-700 mb-4 mx-4 ${cardClasses}`}>
            <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${circleClasses}`}>
                    <Text className="text-lg font-bold text-white">{stopNumber}</Text>
                </View>
                <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-white" numberOfLines={1}>{shipment.deliveryAddress.name}</Text>
                    <Text className="text-base text-gray-400" numberOfLines={1}>{shipment.deliveryAddress.street}</Text>
                </View>
                <ChevronRightIcon size={24} color={isActive ? "#9CA3AF" : "#4B5563"} />
            </View>
        </TouchableOpacity>
    );
};

export const DeliveringBatchView = () => {
    const router = useRouter();
    const { activeTask } = useDriverTask();
    const cameraRef = useRef<any>(null);
    const [routeShape, setRouteShape] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
    const [pointFeatures, setPointFeatures] = useState<FeatureCollection<Point> | null>(null);

    const MAPTILER_API_KEY = Constants.expoConfig?.extra?.MAPTILER_API_KEY;

    useEffect(() => {
        if (activeTask?.batch?.shipments) {
            const activeIndex = activeTask.batch.shipments.findIndex(s => s.status === 'in_transit');
            const features: Feature<Point>[] = activeTask.batch.shipments
                .filter(s => s.deliveryAddress.lon != null && s.deliveryAddress.lat != null)
                .map((s, index) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [s.deliveryAddress.lon!, s.deliveryAddress.lat!],
                    },
                    properties: {
                        id: s._id,
                        label: `${index + 1}`,
                        isActive: index === activeIndex,
                    },
                }));
            
            setPointFeatures({
                type: 'FeatureCollection',
                features: features,
            });
        }
    }, [activeTask]);

    useEffect(() => {
        if (pointFeatures && pointFeatures.features.length > 1) {
            const coords = pointFeatures.features.map(f => f.geometry.coordinates.join(',')).join(';');
            const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline`;

            fetch(osrmUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.routes && data.routes.length > 0) {
                        setRouteShape({
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: decodePolyline(data.routes[0].geometry),
                            },
                            properties: {}
                        });
                    }
                })
                .catch(e => console.error("Error fetching route from OSRM:", e));
        }
    }, [pointFeatures]);

    useEffect(() => {
        if (pointFeatures && pointFeatures.features.length > 0) {
            const coordinates = pointFeatures.features.map(f => f.geometry.coordinates);
            
            const timer = setTimeout(() => {
                cameraRef.current?.fitBounds?.(
                    [Math.min(...coordinates.map(c => c[0])), Math.min(...coordinates.map(c => c[1]))],
                    [Math.max(...coordinates.map(c => c[0])), Math.max(...coordinates.map(c => c[1]))],
                    [120, 70, 20, 70],
                    300
                );
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [pointFeatures, routeShape]);

    const handleStartNavigation = () => { /* ... */ };

    if (!activeTask || !activeTask.batch) {
        return <ActivityIndicator />;
    }

    const { batch } = activeTask;
    const activeShipmentIndex = batch.shipments.findIndex(s => s.status === 'in_transit');

    const handleItemPress = (shipmentId: string) => {
        router.push(`/delivery/${shipmentId}`);
    };

    const handleAllDelivered = () => { console.log("All packages delivered. Route finished.") };

    return (
        <View style={styles.container}>
            <MapView style={styles.map} mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${MAPTILER_API_KEY}`}>
                <Camera ref={cameraRef} />
                
                {routeShape && (
                    <ShapeSource id="routeSource" shape={routeShape}>
                        <LineLayer
                            id="routeLine"
                            belowLayerID="pointCircles"
                            style={{
                                lineColor: '#10B981', // Green for delivery
                                lineWidth: 5,
                                lineOpacity: 0.8,
                            }}
                        />
                    </ShapeSource>
                )}

                {pointFeatures && (
                    <ShapeSource id="pointsSource" shape={pointFeatures}>
                        <CircleLayer
                            id="pointCircles"
                            style={{
                                circleRadius: 16,
                                circleColor: [
                                    'case',
                                    ['get', 'isActive'],
                                    '#10B981', // Green for active
                                    '#4B5563'  // Gray for inactive
                                ],
                                circleStrokeWidth: 2,
                                circleStrokeColor: 'white',
                            }}
                        />
                        <SymbolLayer
                            id="pointSymbols"
                            aboveLayerID="pointCircles"
                            style={{
                                textField: ['get', 'label'],
                                textSize: 16,
                                textColor: 'white',
                                iconAllowOverlap: true,
                                textAllowOverlap: true,
                            }}
                        />
                    </ShapeSource>
                )}
            </MapView>
            
            <TouchableOpacity onPress={handleStartNavigation} style={styles.navigationButton}>
                <MapPinIcon size={24} color="white" />
                <Text style={styles.navigationButtonText}>Start Navigation</Text>
            </TouchableOpacity>

            <View style={styles.bottomSheet}>
                <Text className="text-xl font-bold text-white mb-2 px-4 pt-4">Delivery Route</Text>
                <ScrollView style={{ flex: 1 }}>
                    {batch.shipments.map((item, index) => (
                        <DeliveryStopCard
                            key={item._id}
                            shipment={item}
                            onPress={() => handleItemPress(item._id)}
                            stopNumber={index + 1}
                            isActive={index === activeShipmentIndex}
                        />
                    ))}
                </ScrollView>
                <View className="p-4 bg-transparent mb-4">
                    <TouchableOpacity onPress={handleAllDelivered}>
                        <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="py-3 rounded-full shadow-lg">
                            <Text className="text-white text-lg font-bold text-center">Finalizar Ruta</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    map: {
        flex: 1,
    },
    navigationButton: {
        position: 'absolute',
        top: 60,
        right: 15,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderColor: '#14BFFB',
        borderWidth: 1,
    },
    navigationButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: PANEL_HEIGHT,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        flexDirection: 'column',
    },
});
