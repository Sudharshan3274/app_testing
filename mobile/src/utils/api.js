import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

/**
 * Dynamically resolves the host PC's IP address from Metro scriptURL or Expo Constants.
 * This guarantees that no matter what Wi-Fi network, mobile hotspot, or IP change occurs
 * on the host PC, the mobile app ALWAYS connects to port 8000 on the PC automatically!
 */
export const getDynamicHostIp = () => {
    try {
        const scriptURL = NativeModules.SourceCode?.scriptURL;
        if (scriptURL) {
            // e.g. "http://192.168.137.1:8081/node_modules/expo/AppEntry.bundle?..."
            const match = scriptURL.match(/^https?:\/\/([^:\/]+)/);
            if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
                return match[1];
            }
        }
    } catch (e) {}

    try {
        const Constants = require('expo-constants').default;
        const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri || Constants.manifest2?.extra?.expoGo?.developer?.tool;
        if (hostUri) {
            const ip = hostUri.split(':')[0];
            if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
                return ip;
            }
        }
    } catch (e) {}

    return null;
};

const getBaseUrl = async () => {
    const savedUrl = await AsyncStorage.getItem('apiBaseUrl');
    // Clear out outdated hardcoded IPs if saved previously
    if (savedUrl && !savedUrl.includes('10.247.112.15')) {
        return savedUrl;
    }

    // Always prefer dynamic Metro host IP (works across all Wi-Fi & Hotspots seamlessly)
    const hostIp = getDynamicHostIp();
    if (hostIp) {
        return `http://${hostIp}:8000`;
    }

    // Fallback for Android emulator loopback
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000';
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
        throw error;
    }
}
