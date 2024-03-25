import React, { useState, useEffect } from 'react';
import Pictogram from './Pictogram';
import TextoComoImagen from './TextoComoImagen';

function PictogramList({ id_palabra, palabrasTraducidas, palabrasCompuestas, oracionTraducida }) {
    const [droppedItems, setDroppedItems] = useState(oracionTraducida || []);

    const [tiempoVerbalPictogramasSimples, setTiempoVerbalPictogramasSimples] = useState({});
    const [tiempoVerbalPictogramasCompuestos, setTiempoVerbalPictogramasCompuestos] = useState({}); 
    const [numeroGramaticalPictogramasSimples, setNumeroGramaticalPictogramasSimples] = useState({});
    const [numeroGramaticalPictogramasCompuestos, setNumeroGramaticalPictogramasCompuestos] = useState({});

    useEffect(() => {
        // Actualiza droppedItems cada vez que oracionTraducida cambie.
        setDroppedItems(oracionTraducida || []);
        setTiempoVerbalPictogramasSimples({});
        setTiempoVerbalPictogramasCompuestos({});
        setNumeroGramaticalPictogramasSimples({});
    }, [oracionTraducida]); // Dependencias del efecto, efecto se ejecuta cuando oracionTraducida cambia.

    
    const handleDragOver = (e) => {
        e.preventDefault(); // Necesario para permitir soltar el pictograma
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

    const handleTiempoVerbalSimplesChange = (index) => (e) => {
        console.log(e.target.value);
        setTiempoVerbalPictogramasSimples(prev => ({...prev, [index]: e.target.value}));
    };

    const handleNumeroGramaticalSimplesChange = (index) => (e) => {
        console.log(e.target.value);
        setNumeroGramaticalPictogramasSimples(prev => ({...prev, [index]: e.target.value}));
    };

    const handleTiempoVerbalCompuestosChange = (index) => (e) => {
        console.log(e.target.value);
        setTiempoVerbalPictogramasCompuestos(prev => ({...prev, [index]: e.target.value}));
    };

    const handleNumeroGramaticalCompuestosChange = (index) => (e) => {
        console.log(e.target.value);
        setNumeroGramaticalPictogramasCompuestos(prev => ({...prev, [index]: e.target.value}));
    };

    const handleSave = async () => {
        // Preparación de los datos para guardar
        const savedData = droppedItems?.map(item => {
            if (item.id) {
                // Si el item tiene un id, guardamos todas las propiedades relevantes
                let tiempoVerbal = "";
                let numeroGramatical = "";
                
                if(item.isSimple)
                {
                    if(item.pos === "VERB" && item.tag ==="VERB")
                    {
                        tiempoVerbal = item.tiempoVerbal;
                    }
                    
                    if(item.pos === "NOUN" && item.tag ==="NOUN")
                    {
                        numeroGramatical = item.numeroGramatical;
                    }
                }
                else
                {
                    tiempoVerbal = item.tiempoVerbal;
                    numeroGramatical = item.numeroGramatical;
                }
                

                return {
                    id: item.id,
                    isSimple: item.isSimple,
                    keyword: item.keyword,
                    palabra: item.palabra,
                    plural: item.plural,
                    pos: item.pos,
                    tag: item.tag,
                    tiempoVerbal: tiempoVerbal,
                    numeroGramatical: numeroGramatical,
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
        if(pictograma.isSimple)
        {
            pictograma["tiempoVerbal"] = tiempoVerbalPictogramasSimples[pictograma["key"]];
            pictograma["numeroGramatical"] = numeroGramaticalPictogramasSimples[pictograma["key"]];
        }
        else
        {
            pictograma["tiempoVerbal"] = tiempoVerbalPictogramasCompuestos[pictograma["key"]];
            pictograma["numeroGramatical"] = numeroGramaticalPictogramasCompuestos[pictograma["key"]];
        }
        
        setDroppedItems(prevItems => [...(prevItems || []), pictograma]);
    };

    const handleDragStart = (index) => (e) => {
        const item = droppedItems[index];
        const itemWithTense = {
            ...item,
            tiempoVerbal: tiempoVerbalPictogramasSimples[item.key], // Asegúrate de que 'id' sea la propiedad correcta que relaciona el pictograma con su tiempo verbal seleccionado
            numeroGramatical: numeroGramaticalPictogramasSimples[item.key]
        };
        e.dataTransfer.setData('application/pictogram-index', index.toString());
        e.dataTransfer.setData('text', JSON.stringify(itemWithTense)); // Ahora también pasamos el tiempo verbal seleccionado
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'row',
            
            justifyContent: 'center',
            padding: '10px',
            border: '2px dotted #000',
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '10px',
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
            margin: '10px', // Reducido el margen vertical
            padding: '0', // Asegúrate de que no hay relleno agregando espacio innecesario
            lineHeight: '1.2', // Reduce la altura de línea para que el texto sea más compacto
            height: 'auto' // Podrías establecer una altura fija si es necesario, por ejemplo, '30px'
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
                                <h3 style={{ margin: '0'}}>{pc["palabraInfo"].texto}</h3>
                                {pc.palabraInfo.pos === 'VERB' && pc.palabraInfo.tag === 'VERB' && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div>
                                        <label><input type="radio" name={`tense-${index}`} value="Pasado" onChange={handleTiempoVerbalSimplesChange(pc.key)} /> Pasado</label>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`tense-${index}`} value="Presente" onChange={handleTiempoVerbalSimplesChange(pc.key)} /> Presente</label>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`tense-${index}`} value="Futuro" onChange={handleTiempoVerbalSimplesChange(pc.key)} /> Futuro</label>
                                    </div>
                                </div>
                                )}
                                {pc.palabraInfo.pos === 'NOUN' && pc.palabraInfo.tag === 'NOUN' && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div>
                                        <label><input type="radio" name={`numeroGramatical-${index}`} value="Plural" onChange={handleNumeroGramaticalSimplesChange(pc.key)} /> Plural</label>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`numeroGramatical-${index}`} value="Singular" onChange={handleNumeroGramaticalSimplesChange(pc.key)} /> Singular</label>
                                    </div>
                                </div>
                                )}      

                                {
                                    pc.pictogramas.map((pictograma, idx) => (
                                        <Pictogram key={`${index}-${idx}`} pictogram={pictograma} activarBotonRemover={false} tiempoVerbal={tiempoVerbalPictogramasSimples[pc.key]} numeroGramatical = {numeroGramaticalPictogramasSimples[pc.key]} />
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
            {
                palabrasCompuestas.map((pc, index) => 
                {
                    const tienePictogramas = pc.pictogramas && pc.pictogramas.length > 0;
                    if(tienePictogramas)
                    {
                        return(
                            <div key={`${index}`} style={styles.column}>
                                <h3 style={{ margin: '0'}}>{pc["palabraInfo"].texto}</h3>
        
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div><h3 style={{ margin: '0'}}>Tiempo Verbal</h3></div>
                                    <div>
                                        <label><input type="radio" name={`tense-${index}`} value="Pasado" onChange={handleTiempoVerbalCompuestosChange(pc.key)} /> Pasado</label>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`tense-${index}`} value="Presente" onChange={handleTiempoVerbalCompuestosChange(pc.key)} /> Presente</label>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`tense-${index}`} value="Futuro" onChange={handleTiempoVerbalCompuestosChange(pc.key)} /> Futuro</label>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div><h3 style={{ margin: '0'}}>Numero Gramatical</h3></div>
                                    <div>
                                        <label><input type="radio" name={`numeroGramatical-${index}`} value="Plural" onChange={handleNumeroGramaticalCompuestosChange(pc.key)} /> Plural</label>
                                    </div>
                                    <div>
                                        <label><input type="radio" name={`numeroGramatical-${index}`} value="Singular" onChange={handleNumeroGramaticalCompuestosChange(pc.key)} /> Singular</label>
                                    </div>
                                </div>
                                {
                                    pc.pictogramas.map((pictograma, idx) => (
                                        <Pictogram key={`${index}-${idx}`} pictogram={pictograma} activarBotonRemover={false} tiempoVerbal={tiempoVerbalPictogramasCompuestos[pc.key]} numeroGramatical = {numeroGramaticalPictogramasCompuestos[pc.key]} />
                                    ))
                                }  
                            </div>
                        );
                    }
                    else
                    {
                        return(<div></div>);
                    } 
                })
            }
        </div>
        <div>
            <h3 style={styles.itemStyle}>Área de Soltar Pictogramas</h3>
            <br></br>
            <div onDragOver={handleDragOver} onDrop={handleDrop} style={styles.dropArea}>
                {droppedItems?.map((item, index) => (
                    <div key={index} style={styles.itemStyle} draggable onDragStart={handleDragStart(index)}>
                        <h3 style={{ margin: '0'}}>{item.palabra}</h3>
                        <Pictogram key={`${index}`} pictogram={item} activarBotonRemover={false} tiempoVerbal={item.tiempoVerbal} numeroGramatical={item.numeroGramatical} />
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

