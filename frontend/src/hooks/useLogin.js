// In hooks/useLogin.js

import { useState } from 'react';
import { useAuthContext } from './useAuthContext';

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState(null);
    const [error, setError] = useState(null);
    const { dispatch } = useAuthContext();

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const jsonData = await response.json();

        if (!response.ok) {
            setError(jsonData.error);
            setIsLoading(false);
        }

        if (response.ok) {
            // Save the full user data including username and token
            localStorage.setItem('user', JSON.stringify(jsonData));
            dispatch({ type: 'LOGIN', payload: jsonData });
            setIsLoading(false);
        }
    };

    const googleLogin = () => {
        window.open("http://localhost:4000/auth/google", "_self");
    };

    return { login, googleLogin, error, isLoading };
};
