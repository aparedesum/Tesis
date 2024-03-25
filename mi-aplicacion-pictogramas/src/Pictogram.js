import React, { useState } from 'react';

function Pictogram({ pictogram, activarBotonRemover, tiempoVerbal, numeroGramatical, onDragStart }) {

  // Esta función maneja el inicio del arrastre
  const handleDragStartCustom = (e) => {
    // Incluimos la información del pictograma como una cadena JSON
    e.dataTransfer.setData('text/plain', JSON.stringify(pictogram));
    // Si se proporciona una función onDragStart desde el padre, la ejecutamos también
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const [isVisible, setIsVisible] = useState(true);

  const handleRemove = () => {
    setIsVisible(false);
  };

  if (!pictogram) return null;

  if (!isVisible) return null;
   
  const imageUrl = `https://api.arasaac.org/api/pictograms/${pictogram.id}?download=false`;
  const containerStyle = {
    position: 'relative', // Posición relativa para el contenedor
    display: 'inline-block',
    textAlign: 'center',
    margin: '5px'
  };

  const arrowStyle = {
    position: 'absolute', // Posición absoluta para las flechas
    width: '20px',
    height: '20px',
    top: '0',
    zIndex: 2 // Asegura que la flecha esté sobre la imagen
  };

  const imageStyle = {
    width: '50px', 
    height: '50px',
    marginTop: '20px' // Espacio para la flecha
  };


  return (
    <div style={containerStyle} draggable="true" onDragStart={handleDragStartCustom}>
      
      {tiempoVerbal === 'Pasado' && <img src="/left_arrow.jpg" alt="Pasado" style={{ ...arrowStyle, left: '0' }} />}
      {tiempoVerbal === 'Futuro' && <img src="/right_arrow.jpg" alt="Futuro" style={{ ...arrowStyle, right: '0' }} />}
      {numeroGramatical === 'Plural' && <img src="/plural.jpg" alt="Plural" style={{ ...arrowStyle, right: '-20px' }} />}
      {pictogram.id ? (
        <img src={imageUrl} alt={pictogram.keyword}  style={imageStyle} />
      ) : (
        <div style={{ width: '100px', height: '50px', border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pictogram.keyword}</div>
      )}
      {
        activarBotonRemover ? (<button onClick={handleRemove}>X</button>) : (<div></div>)
      }
    </div>
  );
}
export default Pictogram;