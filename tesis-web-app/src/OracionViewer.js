import React, { useState } from 'react';
import datos from './data.json'; // Asume esta es la ruta de tu archivo JSON
import Pictograma from './Pictograma'; // Asegúrate de implementar este componente
import TextoComoImagen from './TextoComoImagen'; 
import CompuestasViewer from './CompuestasViewer'; 

const OracionViewer = () => {
    const [indice, setIndice] = useState(0); // Para navegar entre oraciones

    const oracionActual = datos[indice];

    return (
        <div>
            <p>{oracionActual.oracion}</p>
            <div>
            {oracionActual.palabras_traducidas.map((palabra, index) => (
                palabra.pictogramas && palabra.pictogramas.length > 0 ? (
                    <Pictograma key={index} id={palabra.pictogramas[0].id} />
                ) : (
                    // Usar el nuevo componente para mostrar el texto como imagen
                    <TextoComoImagen key={index} texto={palabra.palabra.texto} />
                )
            ))}

            </div>
            <button onClick={() => setIndice(indice - 1)} disabled={indice <= 0}>Anterior</button>
            <button onClick={() => setIndice(indice + 1)} disabled={indice >= datos.length - 1}>Siguiente</button>
            <CompuestasViewer palabrasCompuestas={oracionActual.palabras_compuestas} />
        </div>
    );
}

export default OracionViewer;