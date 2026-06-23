/**
 * Centralized API utility for communicating with the backend.
 * Automatically handles the Base URL (important for mobile devices) and attaches JWT tokens.
 */

const getBaseUrl = () => {
    // If we're building with Vite, we can inject VITE_API_URL
    if (import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Check if we are running inside Capacitor/Mobile (or just a regular browser)
    // If we are on mobile, localhost refers to the phone itself.
    // Replace '192.168.1.X' with your actual PC IP address when building for Android!
    const isMobile = window.Capacitor && window.Capacitor.isNative;
    
    if (isMobile) {
        // Fallback IP. For testing on emulator use 10.0.2.2. For real device on WiFi, use your PC's IP.
        return 'http://10.0.2.2:8000'; 
    }
    
    // Default for local web development
    return 'http://localhost:8000';
};

export const API_BASE_URL = getBaseUrl();

/**
 * Standardized fetch function that attaches the Auth Token
 */
export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Ensure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${formattedEndpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Handle 401 Unauthorized globally if needed
            if (response.status === 401) {
                console.warn('Unauthorized request. Token may be expired.');
                // Optional: localStorage.removeItem('authToken'); window.location.href = '/login';
            }
            
            let errorMsg = 'API Error';
            try {
                const errData = await response.json();
                errorMsg = errData.detail || errData.message || errorMsg;
            } catch (e) {
                // If it's not JSON
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
