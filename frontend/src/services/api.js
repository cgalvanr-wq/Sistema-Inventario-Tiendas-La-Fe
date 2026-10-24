const API_URL = "http://localhost:8081";

export const fetchConToken = (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...options.headers
        }
    });
};