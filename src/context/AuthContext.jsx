import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('session')) ?? { user: null, token: null });



    const login = (userData, authToken) => {
        setUser({ user: userData, token: authToken });
        localStorage.setItem('session', JSON.stringify({ user: userData, token: authToken }));


    };

    const logout = () => {
        setUser({ user: null, token: null });
        localStorage.removeItem('session');
    };

    return (
        <AuthContext.Provider value={{ user: user.user, token: user.token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}; 