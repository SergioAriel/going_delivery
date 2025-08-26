import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

export default function ScanQR() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const response = await fetch(`https://going-git-delivery-sergioariels-projects.vercel.app/api/orders/${data}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'in_transit' }),
        });

      if (response.ok) {
        Alert.alert('Success', 'Order picked up successfully.', [
          { text: 'OK', onPress: () => router.replace(`/delivery/${data}`) },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to update order");
        setScanned(false);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert("Error", "An unexpected error occurred.");
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="flex-1 flex-col justify-center">
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        className="absolute inset-0"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
    </View>
  );
}
