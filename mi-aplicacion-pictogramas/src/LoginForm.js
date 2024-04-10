import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Importa useAuth

function LoginForm() {
  const [username, setUsername] = useState('');
  const { login } = useAuth(); // Utiliza login desde el contexto

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Falló el login');
      }
      const { access_token } = await response.json();
      login(access_token); // Usa la función login del contexto para establecer el token y cambiar el estado a "loggeado"
    } catch (error) {
      console.error('Error en el login:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Nombre de usuario:</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <button type="submit">Iniciar sesión</button>
    </form>
  );
}

export default LoginForm;