import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseUrl = async () => {
    const savedUrl = await AsyncStorage.getItem('apiBaseUrl');
    if (savedUrl) return savedUrl;

    // 10.0.2.2 = Android emulator loopback to host PC.
    // For a real physical device on the same WiFi, use the PC's LAN IP.
    // Current PC LAN IP: 172.23.20.52
    if (Platform.OS === 'android') {
        return 'http://172.23.20.52:8000';
    }
    return 'http://localhost:8000';
};

export const getApiBaseUrl = getBaseUrl;

export async function fetchApi(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('authToken');
    const baseUrl = await getBaseUrl();
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${formattedEndpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMsg = 'API Error';
            try {
                const errData = await response.json();
                errorMsg = errData.detail || errData.message || errorMsg;
            } catch (e) {
                errorMsg = await response.text();
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Error] ${endpoint}:`, error);
        throw error;
    }
}
