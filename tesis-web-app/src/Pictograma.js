// src/Pictograma.js
import React, { useEffect, useState } from 'react';

const Pictograma = ({ id }) => {
    const [imagenUrl, setImagenUrl] = useState('');

    useEffect(() => {
        const fetchImagen = async () => {
            try {
                const url = `https://api.arasaac.org/api/pictograms/${id}?download=false`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Respuesta de la API no fue exitosa');
                }
                // Asumiendo que la API devuelve directamente la URL de la imagen
                setImagenUrl(response.url); // response.url debería ser la URL de la imagen
            } catch (error) {
                console.error("Error al obtener el pictograma:", error);
            }
        };

        if (id) fetchImagen();
    }, [id]);

    // Agregar estilos para controlar el tamaño de la imagen
    const estiloImagen = {
        maxWidth: '100px', // Limita el ancho máximo de la imagen
        maxHeight: '100px', // Limita la altura máxima de la imagen
        objectFit: 'cover' // Ajusta la imagen para cubrir el contenedor de forma que se mantenga su aspecto
    };

    return imagenUrl ? <img src={imagenUrl} alt="Pictograma" style={estiloImagen} /> : null;
}

export default Pictograma;