import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);

  const login = (token, userName, userId, start, end, current) => {
    setToken(token);
    setIsLoggedIn(true);
    setUserName(userName);
    setUserId(userId);
    setStart(start);
    setEnd(end);
    setCurrent(current);
  };

  const logout = () => {
    setToken('');
    setUserName('');
    setUserId('');
    setIsLoggedIn(false);
    setStart(-1);
    setEnd(-1);
    setCurrent(-1);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, userName, userId, start, end, current, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};