import axios from "axios";
import {getCookie} from "../lib/cookies";

export const API_URL = "http://127.0.0.1:8000";

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Send cookies with requests
});

// Set auth token from cookie if available
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        // Try to get token from cookie
        const cookieToken = getCookie('access');
        if (cookieToken) {
            api.defaults.headers.common["Authorization"] = `Bearer ${cookieToken}`;
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
    }
}

// Initialize auth token from cookie on load
const cookieToken = getCookie('access');
if (cookieToken) {
    setAuthToken(cookieToken);
}
