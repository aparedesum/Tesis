import React, { useState, useEffect } from 'react';
import PictogramList from './PictogramList';
import LoginForm from './LoginForm';
import { useAuth } from './AuthContext';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elementoActual, setElementoActual] = useState(null); // Estado para almacenar el elemento actual
  const [indexBusqueda, setIndexBusqueda] = useState(""); // Estado para almacenar el valor del input de búsqueda
  const { token, userName, userId, logout, isLoggedIn } = useAuth();

  // Estilos en línea para botones
  const buttonStyle = {
    margin: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  // Estilo para el contenedor
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const buttonContainerStyle = {
    display: 'flex', // Alinea los botones en la misma fila
    justifyContent: 'center', // Centra los botones horizontalmente
    width: '100%', // Opcional, asegura que el contenedor se extienda a lo ancho del contenedor padre si es necesario
    marginTop: '20px', // Espaciado superior para separarlos del contenido anterior
  };

  // Fetch elemento actualizado desde el backend cuando currentIndex cambia
  useEffect(() => {
    const fetchElemento = async () => {
      if (!isLoggedIn) return; // No intenta cargar si no está logueado

      try {
        const response = await fetch(`http://localhost:5000/api/getElemento?id=${currentIndex}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluye el token en la petición
          },
        });
        if (!response.ok) {
          if (response.status == 401) {
            logout();
          }
          throw new Error('Respuesta del servidor no fue OK');
        }
        const data = await response.json();
        setElementoActual(data); // Actualiza el estado con los datos recibidos
      } catch (error) {
        console.error('Error al obtener el elemento:', error);

      }
      setIndexBusqueda("");
    };

    fetchElemento();
  }, [currentIndex, isLoggedIn, token]);


  const navigate = (direction) => {
    const newIndex = currentIndex + direction;
    console.log(newIndex);

    if (newIndex < 0 || newIndex >= 21997) return;
    setCurrentIndex(newIndex);
  };

  // Maneja la actualización del índice basado en la búsqueda
  const handleBuscarClick = () => {
    const indexInt = parseInt(indexBusqueda, 10);
    if (!isNaN(indexInt)) {
      setCurrentIndex(indexInt - 1); // Ajusta según sea necesario
    }
  };

  if (!isLoggedIn) {
    return <LoginForm />; // Si no está loggeado, muestra LoginForm
  }

  return (
    <div style={containerStyle} key={currentIndex}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {/* Alinea la imagen y el texto */}
        <img src={`${process.env.PUBLIC_URL}/hola.png`} alt="Hola" style={{ width: '30px', height: '30px', marginRight: '5px' }} />
        <h3>Hola {userName} - Muchas gracias por ayudar</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {/* Alinea la imagen y el texto */}
      <h2 style={{ marginRight: '20px' }}>Oración: {currentIndex + 1}</h2>
        <div >
          <input
            type="text"
            value={indexBusqueda}
            onChange={(e) => setIndexBusqueda(e.target.value)}
            placeholder="Ingresa un índice"
            style={{ marginRight: '10px', width: '115px' }} // Ajusta el ancho aquí
            />
          <button onClick={handleBuscarClick}>Buscar Oración</button>
        </div>
      </div>

      <h2>{elementoActual ? elementoActual.oracion : 'Cargando...'}</h2>
      <div style={buttonContainerStyle}>
        <button onClick={() => navigate(-1)} style={buttonStyle}>Anterior</button>
        <button onClick={() => navigate(1)} style={buttonStyle}>Siguiente</button>
      </div>

      <PictogramList key={currentIndex}
        id_palabra={currentIndex}
        // Asume que PictogramList puede manejar el nuevo estado "elementoActual"
        palabrasTraducidas={elementoActual ? elementoActual.palabras_traducidas : []}
        palabrasCompuestas={elementoActual ? elementoActual.palabras_compuestas : []}
        oracionTraducida={elementoActual ? elementoActual.oracion_traducida : []}
      />

    </div>
  );
}

export default App;