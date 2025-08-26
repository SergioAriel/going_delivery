interface SellerAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    lat?: number;
    lng?: number;
}

export async function getCoordinatesFromAddress(address: SellerAddress): Promise<{ lat: number; lng: number } | null> {
    const fullAddress = `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    console.log(`[GEOCoding] Intentando geocodificar: ${fullAddress}`);
    console.log(`[GEOCoding] URL codificada: https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': process.env.NOMINATIM_USER_AGENT || 'GoingApp/1.0 (solis.sergioariel@google.com)' }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[GEOCoding ERROR] Error HTTP ${response.status} al geocodificar la dirección "${fullAddress}":`, errorText);
            return null;
        }

        const contentType = response.headers.get('content-type');   
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error(`[GEOCoding ERROR] Respuesta inesperada para la dirección "${fullAddress}". Se esperaba JSON, se recibió: ${contentType}. Contenido:`, responseText.substring(0, 200) + '...');
            return null;
        }

        const data = await response.json();

        if (data.length > 0 && data[0].lat && data[0].lon) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            console.log(`[GEOCoding OK] Geocodificación exitosa para "${fullAddress}": Lat ${lat}, Lng ${lng}`);
            return { lat, lng };
        } else {
            console.warn(`[GEOCoding WARN] Geocodificación fallida para la dirección: "${fullAddress}". No se encontraron resultados o datos incompletos.`);
            return null;
        }
    } catch (error) {
        console.error(`[GEOCoding ERROR] Error de red o parseo al geocodificar la dirección "${fullAddress}":`, error);
        return null;
    }
}