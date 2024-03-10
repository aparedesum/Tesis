import React, { useEffect, useState } from 'react';
import Pictograma from './Pictograma';

const CompuestasViewer = ({ palabrasCompuestas }) => {
    const [indicePalabra, setIndicePalabra] = useState(0);

    useEffect(() => {
        // Restablecer el índice de palabras compuestas al recibir nuevas props
        setIndicePalabra(0);
    }, [palabrasCompuestas]);

    if (!palabrasCompuestas || palabrasCompuestas.length === 0) {
        return null; // No hay palabras compuestas para mostrar
    }

    const pictogramaId = palabrasCompuestas[indicePalabra]?.pictogramas?.[0]?.id;

    return (
        <div>
            {pictogramaId ? (
                <>
                    <h3>Palabras Compuestas</h3>
                    <Pictograma id={pictogramaId} />
                    {palabrasCompuestas.length > 1 && (
                        <>
                            <button onClick={() => setIndicePalabra(Math.max(0, indicePalabra - 1))} disabled={indicePalabra <= 0}>
                                Anterior
                            </button>
                            <button onClick={() => setIndicePalabra(Math.min(palabrasCompuestas.length - 1, indicePalabra + 1))} disabled={indicePalabra >= palabrasCompuestas.length - 1}>
                                Siguiente
                            </button>
                        </>
                    )}
                </>
            ) : (
                <div>No hay pictogramas para mostrar.</div>
            )}
        </div>
    );
};

export default CompuestasViewer;