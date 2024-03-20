import React, { useState } from 'react';
import datos from './data.json';
import Pictograma from './Pictograma';
import TextoComoImagen from './TextoComoImagen';
import CompuestasViewer from './CompuestasViewer';
import './EstilosPersonalizados.css'; // Asegúrate de importar tus estilos aquí

const OracionViewer = () => {
    const [indiceOracion, setIndiceOracion] = useState(0);
    const [indicesActivos, setIndicesActivos] = useState({});
    const [pictogramasEliminados, setPictogramasEliminados] = useState(new Set());

    const oracionActual = datos[indiceOracion];
    const palabrasTraducidas = oracionActual.palabras_traducidas;

    const moverPictograma = (indexPalabra, direccion) => {
        const cantidadPictogramas = palabrasTraducidas[indexPalabra].pictogramas.length;
        const indiceActual = indicesActivos[indexPalabra] || 0;
        const nuevoIndice = (indiceActual + direccion + cantidadPictogramas) % cantidadPictogramas;
        setIndicesActivos(prev => ({ ...prev, [indexPalabra]: nuevoIndice }));
    };

    const eliminarPictograma = (indexPalabra) => {
        setPictogramasEliminados(prev => new Set(prev).add(indexPalabra));
    };

    const imprimirIdsVisibles = () => {
        const idsVisibles = palabrasTraducidas
            .map((palabra, index) => !pictogramasEliminados.has(index) ? palabra.pictogramas[0]?.id : null)
            .filter(id => id);
        alert("IDs visibles: " + idsVisibles.join(', '));
    };

    return (
        <div>
            <p>{oracionActual.oracion}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                {palabrasTraducidas.map((palabra, indexPalabra) => (
                    !pictogramasEliminados.has(indexPalabra) && (
                        <div key={indexPalabra} style={{ marginRight: '10px', marginBottom: '10px' }}>
                            {palabra.pictogramas.length > 0 ? (
                                <>
                                    <Pictograma id={palabra.pictogramas[0].id} />
                                    <div>
                                        <button onClick={() => moverPictograma(indexPalabra, -1)}>Anterior</button>
                                        <button onClick={() => moverPictograma(indexPalabra, 1)}>Siguiente</button>
                                        <button onClick={() => eliminarPictograma(indexPalabra)}>Eliminar</button>
                                    </div>
                                </>
                            ) : (
                                <TextoComoImagen texto={palabra.palabra.texto} />
                            )}
                        </div>
                    )
                ))}
            </div>
            <button onClick={() => setIndiceOracion(Math.max(0, indiceOracion - 1))} disabled={indiceOracion === 0}>Oración Anterior</button>
            <button onClick={() => setIndiceOracion(Math.min(datos.length - 1, indiceOracion + 1))} disabled={indiceOracion === datos.length - 1}>Oración Siguiente</button>
            <button onClick={imprimirIdsVisibles}>Imprimir IDs</button>
            <CompuestasViewer palabrasCompuestas={oracionActual.palabras_compuestas} />

        </div>
    );
};
export default OracionViewer;