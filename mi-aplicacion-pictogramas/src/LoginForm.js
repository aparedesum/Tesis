import React, { useState } from 'react';
import { useAuth } from './AuthContext'; // Importa useAuth

function LoginForm() {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useAuth(); // Utiliza login desde el contexto

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // Asegura que el formulario esté verticalmente centrado en la pantalla
    };

    const inputStyle = {
        margin: '10px 0', // Añade un poco de margen arriba y abajo de cada input
    };

    const buttonStyle = {
        margin: '20px 0', // Añade un poco más de margen arriba del botón para separarlo del input
        padding: '10px 20px', // Añade un poco de padding para hacer el botón más grande
        cursor: 'pointer',
        backgroundColor: '#007bff', // Color de fondo azul
        color: 'white', // Color del texto blanco
        border: 'none', // Remueve el borde
        borderRadius: '5px', // Bordes redondeados
        fontSize: '16px', // Tamaño de letra más grande
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage(''); // Limpia errores previos antes de intentar de nuevo
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
                setErrorMessage("Usuario incorrecto");
            } 
            else
            {
                const  userResponse  = await response.json();
                login(userResponse["access_token"], userResponse["nombre"], userResponse["id"]);
            }
            
        } catch (error) {
            console.error('Error en el login:', error);
            setErrorMessage(error.message);
        }
    };

    return (
        <div style={formStyle}>
            <form onSubmit={handleSubmit}>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <div style={inputStyle}>
                    <label htmlFor="username">Nombre de usuario:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" style={buttonStyle}>Iniciar sesión</button>
            </form>
        </div>
    );
}

export default LoginForm;
