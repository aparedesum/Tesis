import React, { useState } from 'react';

function Pictogram({ pictogram, activarBotonRemover, onDragStart }) {

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

  return (
    <div style={{ display: 'inline-block', textAlign: 'center', margin: '5px' }}  draggable="true" onDragStart={handleDragStartCustom}>
      {pictogram.id ? (
        <img src={imageUrl} alt={pictogram.keyword} style={{ width: '50px', height: '50px' }} />
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