import React, { useEffect, useRef } from 'react';

const TextoComoImagen = ({ texto }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Asume que ya has ajustado el tamaño del canvas dinámicamente
        // Ejemplo: canvas.width = 200, canvas.height = 50;

        // Configuración del texto
        ctx.font = '20px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center'; // Alinea el texto horizontalmente al centro
        ctx.textBaseline = 'middle'; // Alinea el texto verticalmente al centro

        const x = canvas.width / 2; // Centro del canvas (horizontal)
        const y = canvas.height / 2; // Centro del canvas (vertical)

        ctx.fillText(texto, x, y); // Dibuja el texto en el centro del canvas

    }, [texto]); // Asegúrate de que este efecto se ejecute cada vez que el texto cambie

    return <canvas ref={canvasRef}></canvas>;
};

export default TextoComoImagen;