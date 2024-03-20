import React, { useEffect, useRef } from 'react';

const TextoComoImagen = ({ texto, onDragStart }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Configuración del canvas y del texto
        canvas.width = 100; // Tamaño de ejemplo, ajusta según sea necesario
        canvas.height = 50; // Tamaño de ejemplo, ajusta según sea necesario
        ctx.font = '15px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
    }, [texto]);

    const handleDragStart = (e) => {
        // Transferimos el texto como parte de la información arrastrada
        e.dataTransfer.setData('text/plain', JSON.stringify({ keyword: texto, tipo: 'texto' }));
        if (onDragStart) onDragStart(e);
    };

    return (
        <div draggable="true" onDragStart={handleDragStart} style={{ display: 'inline-block', textAlign: 'center', margin: '5px', width: '100px' }}>
            <canvas ref={canvasRef} style={{ width: '100px', height: '50px' }}></canvas>
            <div>{texto}</div>
        </div>
    );
};

export default TextoComoImagen;