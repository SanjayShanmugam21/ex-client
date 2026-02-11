import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const checkAuth = async () => {
            const token = sessionStorage.getItem('accessToken');
            const storedUser = sessionStorage.getItem('user');

            if (token) {
                try {
                    // check if token is expired? jwtDecode can tell us.
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        // Token expired
                        throw new Error("Token expired");
                    }

                    setAuth({
                        user: storedUser ? JSON.parse(storedUser) : { id: decoded.id },
                        token: token,
                        isAuthenticated: true,
                        loading: false
                    });
                } catch (error) {
                    console.error("Invalid token", error);
                    logout();
                }
            } else {
                // ... existing refresh logic or just stop loading
                setAuth(prev => ({ ...prev, loading: false }));
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('user', JSON.stringify(data));
            setAuth({
                user: data,
                token: data.accessToken,
                isAuthenticated: true,
                loading: false,
            });
            toast.success("Login Successful");
            return data;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Login Failed");
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('user', JSON.stringify(data));
            setAuth({
                user: data,
                token: data.accessToken,
                isAuthenticated: true,
                loading: false,
            });
            toast.success("Registration Successful");
            return data;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration Failed");
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
            setAuth({
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            });
            toast.info("Logged Out");
            window.location.href = '/login';
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ auth, login, register, logout, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
