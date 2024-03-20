import React, { useState, useEffect } from 'react';
import PictogramList from './PictogramList';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elementoActual, setElementoActual] = useState(null); // Estado para almacenar el elemento actual
  const [indexBusqueda, setIndexBusqueda] = useState(""); // Estado para almacenar el valor del input de búsqueda

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
      try {
        const response = await fetch(`http://localhost:5000/api/getElemento?id=${currentIndex}`);
        if (!response.ok) {
          throw new Error('Respuesta del servidor no fue OK');
        }
        const data = await response.json();
        setElementoActual(data); // Actualiza el estado con los datos recibidos
      } catch (error) {
        console.error('Error al obtener el elemento:', error);
      }
    };

    fetchElemento();
  }, [currentIndex]);


  const navigate = (direction) => {
    const newIndex = currentIndex + direction;
    console.log(newIndex);

    if (newIndex < 0 || newIndex >= 22071) return;
    setCurrentIndex(newIndex);
  };

  // Maneja la actualización del índice basado en la búsqueda
  const handleBuscarClick = () => {
    const indexInt = parseInt(indexBusqueda, 10);
    if (!isNaN(indexInt)) {
      setCurrentIndex(indexInt - 1); // Ajusta según sea necesario
    }
  };

  return (
    <div style={containerStyle} key={currentIndex}>
      <h2>Oración: {currentIndex + 1}</h2>
      {/* Puedes utilizar elementoActual para mostrar información específica del elemento aquí */}
      <p>{elementoActual ? elementoActual.oracion : 'Cargando...'}</p>
      <PictogramList key={currentIndex}
        id_palabra={currentIndex}
        // Asume que PictogramList puede manejar el nuevo estado "elementoActual"
        palabrasTraducidas={elementoActual ? elementoActual.palabras_traducidas : []}
        palabrasCompuestas={elementoActual ? elementoActual.palabras_compuestas : []}
        oracionTraducida={elementoActual ? elementoActual.oracion_traducida : []}
      />
      <div>
        <input 
          type="text" 
          value={indexBusqueda}
          onChange={(e) => setIndexBusqueda(e.target.value)}
          placeholder="Ingresa un índice"
        />
        <button onClick={handleBuscarClick}>Buscar</button>
      </div>
      <div style={buttonContainerStyle}>
        <button onClick={() => navigate(-1)} style={buttonStyle}>Anterior</button>
        <button onClick={() => navigate(1)} style={buttonStyle}>Siguiente</button>
      </div>
    </div>
  );
}

export default App;