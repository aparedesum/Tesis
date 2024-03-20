import React, { useState, useEffect } from 'react';
import Pictogram from './Pictogram';
import TextoComoImagen from './TextoComoImagen';

function PictogramList({ id_palabra, palabrasTraducidas, palabrasCompuestas, oracionTraducida }) {
    const [droppedItems, setDroppedItems] = useState(oracionTraducida || []);

    useEffect(() => {
        // Actualiza droppedItems cada vez que oracionTraducida cambie.
        setDroppedItems(oracionTraducida || []);
    }, [oracionTraducida]); // Dependencias del efecto, efecto se ejecuta cuando oracionTraducida cambia.

    
    const handleDragOver = (e) => {
        e.preventDefault(); // Necesario para permitir soltar el pictograma
      };
    
      const handleDrop = (e) => {
        e.preventDefault();
        const index = e.dataTransfer.getData('application/pictogram-index');
        // Verificar si se está reordenando un pictograma existente
        if(index) {
            const itemToMove = droppedItems[index];
            const newItems = [...droppedItems];
            newItems.splice(index, 1); // Remover el item de su posición original
            newItems.push(itemToMove); // Agregar el item al final
            setDroppedItems(newItems);
            return;
        }
        // Si no, procesar el pictograma arrastrado como nuevo
        const data = e.dataTransfer.getData('text');
        const pictograma = JSON.parse(data);
        setDroppedItems(prevItems => [...(prevItems || []), pictograma]);
    };
    
    const handleRemovePictograma = (index) => () => {
        setDroppedItems((prevItems) => prevItems.filter((_, idx) => idx !== index));
    };

    const handleShowValues = () => {
        console.log('Dropped Items:', droppedItems);
    };

    const cleanDroppedPictogramas = () => {
        setDroppedItems([]);
    };

    const handleSave = async () => {
        // Preparación de los datos para guardar
        const savedData = droppedItems?.map(item => {
            if (item.id) {
                // Si el item tiene un id, guardamos todas las propiedades relevantes
                return {
                    id: item.id,
                    isSimple: item.isSimple,
                    keyword: item.keyword,
                    palabra: item.palabra,
                    plural: item.plural,
                    pos: item.pos,
                    tag: item.tag,
                    synsets: item.synsets // Asumiendo que synsets ya es un array de strings
                };
            } else {
                // Si no tiene id, solo guardamos keyword y tipo
                return {
                    keyword: item.keyword,
                    tipo: item.tipo // Asegúrate de que 'tipo' esté disponible en tus items
                };
            }
        });
    
        // Creando un objeto para representar la oración traducida y los items
        const dataToSave = {
            "id": id_palabra + 1,
            "oracion_traducida": savedData
        };
    
        console.log('Datos preparados para guardar:', JSON.stringify(dataToSave));
        // Aquí podrías usar algo como localStorage para "guardar" los datos temporalmente o enviarlos a un servidor

        try {
            const response = await fetch('http://localhost:5000/api/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSave),
            });
    
            if (response.ok) {
                console.log("Datos guardados con éxito");
                const responseData = await response.json();
                console.log(responseData.message);
            } else {
                console.error("Error al guardar los datos");
            }
        } catch (error) {
            console.error("Error al guardar los datos", error);
        }

    };

    const handleDragStart = (index) => (e) => {
        e.dataTransfer.setData('application/pictogram-index', index.toString());
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            padding: '10px',
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '10px'
        },
        dropArea: {
            marginTop: '10px',
            border: '2px dashed grey',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            flexWrap: 'wrap',
        },
        itemStyle: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '10px',
        },
        buttonStyle: {
            margin: '0 10px', // Ajuste para tener un espaciado uniforme alrededor de los botones
            padding: '5px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        buttonContainer: {
            width: '100%', // Full width to align the button inside it
            display: 'flex',
            justifyContent: 'center', // Center the button
            padding: '20px 0', // Some padding for spacing
        },
        buttonsContainer: {
            display: 'flex',
            justifyContent: 'center', // Asegura que el contenedor de botones esté centrado
            alignItems: 'center', // Alinea los botones verticalmente al centro
            padding: '20px 0', // Espaciado arriba y abajo para separación visual
        }
    };

    return (
    <div>
        <div style={styles.container}>
            <button onClick={handleShowValues} style={styles.buttonStyle} >Mostrar Valores</button>
        </div>
        <h3 style={styles.itemStyle}>Pictogramas Simples</h3>
        <div style={styles.container}>
            {
            
                palabrasTraducidas.map((pc, index) => 
                {
                    const tienePictogramas = pc.pictogramas && pc.pictogramas.length > 0;
                    if(tienePictogramas)
                    {
                        return (
                            <div key={`${index}`} style={styles.column}>
                            <h3>{pc["palabraInfo"].texto}</h3>
                            {
                                pc.pictogramas.map((pictograma, idx) => (
                                    <Pictogram key={`${index}-${idx}`} pictogram={pictograma} activarBotonRemover={false} />
                                ))
                            }
                            </div>
                        );
                    }
                    else
                    {
                        return (<TextoComoImagen key={`${index}-${pc.palabraInfo.texto}`} texto={pc.palabraInfo.texto} />);
                    }  
                })
            }
        </div>

        <h3 style={styles.itemStyle}>Pictogramas Compuestos</h3>
        <div style={styles.container}>
            {palabrasCompuestas.map((pc, index) => pc.pictogramas && pc.pictogramas.map((pictograma, idx) => (
                <div>
                    <h3>{pc["palabraInfo"].palabra}</h3>
                    <Pictogram key={`${index}-${idx}`} pictogram={pictograma} activarBotonRemover = {false}/>
                </div>
            )))}
        </div>
        <div>
            <h3 style={styles.itemStyle}>Área de Soltar Pictogramas</h3>
            <br></br>
            <div onDragOver={handleDragOver} onDrop={handleDrop} style={styles.dropArea}>
                {droppedItems?.map((item, index) => (
                    <div key={index} style={styles.itemStyle} draggable onDragStart={handleDragStart(index)}>
                        <h3>{item.palabra}</h3>
                        <Pictogram key={`${index}`} pictogram={item} activarBotonRemover={false}  />
                        <button onClick={handleRemovePictograma(index)}>X</button>
                    </div>
                ))}
            </div>
        </div>
        <div style={styles.buttonsContainer}>
            <button onClick={cleanDroppedPictogramas} style={styles.buttonStyle}>Limpiar Pictogramas</button>
            <button onClick={handleSave} style={styles.buttonStyle}>Guardar</button>
        </div>
    </div>
  );
}

export default PictogramList;

