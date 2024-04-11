import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (token, userName, userId) => {
    setToken(token);
    setIsLoggedIn(true);
    setUserName(userName);
    setUserId(userId);
  };

  const logout = () => {
    setToken('');
    setUserName('');
    setUserId('');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, userName, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};