import React, { useState, useEffect } from 'react';
import Pictogram from './Pictogram';
import TextoComoImagen from './TextoComoImagen';
import PictogramSearch from './PictogramSearch';
import Swal from 'sweetalert2';

import { useAuth } from './AuthContext';

function PictogramList({ id_palabra, palabrasTraducidas, palabrasCompuestas, oracionTraducida }) {
    const [droppedItems, setDroppedItems] = useState(oracionTraducida || []);

    const [tiempoVerbalPictogramasSimples, setTiempoVerbalPictogramasSimples] = useState({});
    const [tiempoVerbalPictogramasCompuestos, setTiempoVerbalPictogramasCompuestos] = useState({});
    const [numeroGramaticalPictogramasSimples, setNumeroGramaticalPictogramasSimples] = useState({});
    const [numeroGramaticalPictogramasCompuestos, setNumeroGramaticalPictogramasCompuestos] = useState({});
    const { token, userName, userId, logout, isLoggedIn } = useAuth();

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

    const cleanDroppedPictogramas = () => {
        setDroppedItems([]);
    };

    const handleTiempoVerbalSimplesChange = (index) => (e) => {
        console.log(e.target.value);
        setTiempoVerbalPictogramasSimples(prev => ({ ...prev, [index]: e.target.value }));
    };

    const handleNumeroGramaticalSimplesChange = (index) => (e) => {
        console.log(e.target.value);
        setNumeroGramaticalPictogramasSimples(prev => ({ ...prev, [index]: e.target.value }));
    };

    const handleTiempoVerbalCompuestosChange = (index) => (e) => {
        console.log(e.target.value);
        setTiempoVerbalPictogramasCompuestos(prev => ({ ...prev, [index]: e.target.value }));
    };

    const handleNumeroGramaticalCompuestosChange = (index) => (e) => {
        console.log(e.target.value);
        setNumeroGramaticalPictogramasCompuestos(prev => ({ ...prev, [index]: e.target.value }));
    };

    const handleSave = async () => {
        // Preparación de los datos para guardar

        const { value: formValues } = await Swal.fire({
            title: 'Detalles adicionales',
            html:
                '<div style="text-align: left;">' + // Alinea el texto de los inputs a la izquierda
                '<textarea id="swal-input1" class="swal2-input" placeholder="Ingrese sus comentarios" rows="8" style="width: 90%; margin-bottom: 10px;"></textarea>' + // Se utiliza un <textarea> para los comentarios
                '<label style="display: block; margin-bottom: 10px;"><input type="checkbox" id="swal-input2" style="margin-right: 5px;">La traducción es compleja</label>' + // Encerrar el checkbox y el texto en un <label> para mejorar la accesibilidad
                '</div>',
            focusConfirm: false,
            showCancelButton: true, // Opción para mostrar un botón de cancelar
            confirmButtonText: 'Guardar', // Personaliza el texto del botón de confirmación
            cancelButtonText: 'Cancelar', // Texto para el botón de cancelar
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').checked
                ];
            },
            width: '800px', // Aumenta el ancho del cuadro de diálogo
            customClass: {
                confirmButton: 'btn-left', // Clase para estilizar el botón confirmar si es necesario
                cancelButton: 'btn-left'  // Clase para estilizar el botón cancelar si es necesario
            }
        });

        if (formValues) {

            const [comentarios, traduccionCompleja] = formValues;

            const savedData = droppedItems?.map(item => {
                if (item.id) {
                    // Si el item tiene un id, guardamos todas las propiedades relevantes
                    let tiempoVerbal = item.tiempoVerbal;
                    let numeroGramatical = item.numeroGramatical;

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
                        palabra: item.palabra ?? item.keyword,
                        tipo: item.tipo ?? "texto" // Asegúrate de que 'tipo' esté disponible en tus items
                    };
                }
            });

            // Creando un objeto para representar la oración traducida y los items
            const dataToSave = {
                "id": id_palabra + 1,
                "oracion_traducida": savedData,
                "usuario": userId,
                "comentarios": comentarios,
                "traduccionCompleja": traduccionCompleja ?? false,
            };

            try {
                Swal.fire({
                    title: 'Esperando respuesta...',
                    html: 'Por favor, espera un momento.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading(); // Muestra el indicador de carga
                    },
                });

                const response = await fetch('http://localhost:5000/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Incluye el token en la petición
                    },
                    body: JSON.stringify(dataToSave),
                });

                Swal.close();

                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData.message);

                    Swal.fire({
                        title: 'Éxito!',
                        text: 'Datos guardados con éxito.',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    });

                } else {
                    console.error("Error al guardar los datos", response);

                    Swal.fire({
                        title: 'Error!',
                        text: 'Error al guardar los datos.',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    });

                    if (response.status == 401) {
                        logout();
                    }
                }
            } catch (error) {
                console.error("Error al guardar los datos", error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Error al conectar con el servidor.',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }

    };

    const handleDrop = (e) => {
        e.preventDefault();
        const index = e.dataTransfer.getData('application/pictogram-index');
        // Verificar si se está reordenando un pictograma existente
        if (index) {
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

    const handleDragStart = (index) => (e) => {
        const item = droppedItems[index];

        if (item.isSimple) {
            item["tiempoVerbal"] = tiempoVerbalPictogramasSimples[item["key"]];
            item["numeroGramatical"] = numeroGramaticalPictogramasSimples[item["key"]];
        }
        else {
            item["tiempoVerbal"] = tiempoVerbalPictogramasCompuestos[item["key"]];
            item["numeroGramatical"] = numeroGramaticalPictogramasCompuestos[item["key"]];
        }

        e.dataTransfer.setData('application/pictogram-index', index.toString());
        e.dataTransfer.setData('text', JSON.stringify(item)); // Ahora también pasamos el tiempo verbal seleccionado
    };

    // Añade un nuevo handler para actualizar el texto de un pictograma específico
    const handleUpdateItemPalabra = (index, newPalabra) => {
        setDroppedItems(currentItems =>
            currentItems.map((item, idx) => {
                if (idx === index) {
                    return { ...item, palabra: newPalabra };
                }
                return item;
            })
        );
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap', // Permite que los bloques se ajusten en filas según el ancho disponible
            justifyContent: 'center',
            gap: '20px', // Espacio entre bloques
            padding: '10px',
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '10px',
            padding: '10px',
            border: '2px dotted #000', // Borde sólido alrededor de cada bloque de pictogramas
            borderRadius: '5px', // Opcional: bordes redondeados
            backgroundColor: '#fff', // Opcional: fondo blanco para cada bloque
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
            backgroundColor: '#007bff',
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
            <h3 key={`pictogramas-simples-${id_palabra}`} style={styles.itemStyle}>Pictogramas Simples</h3>
            <div style={styles.container}>
                {

                    palabrasTraducidas.map((pc, index) => {
                        const tienePictogramas = pc.pictogramas && pc.pictogramas.length > 0;
                        if (tienePictogramas) {
                            return (
                                <div key={`simple-${index}`} style={styles.column}>
                                    <h3 style={{ margin: '0' }}>{pc["palabraInfo"].texto}</h3>
                                    {pc.palabraInfo.pos === 'VERB' && pc.palabraInfo.tag === 'VERB' && (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div>
                                                <label><input type="radio" name={`simple-tense-${index}`} value="Pasado" onChange={handleTiempoVerbalSimplesChange(pc.key)} /> Pasado</label>
                                            </div>
                                            <div>
                                                <label><input type="radio" name={`simple-tense-${index}`} value="Presente" onChange={handleTiempoVerbalSimplesChange(pc.key)} /> Presente</label>
                                            </div>
                                            <div>
                                                <label><input type="radio" name={`simple-tense-${index}`} value="Futuro" onChange={handleTiempoVerbalSimplesChange(pc.key)} /> Futuro</label>
                                            </div>
                                        </div>
                                    )}
                                    {pc.palabraInfo.pos === 'NOUN' && pc.palabraInfo.tag === 'NOUN' && (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div>
                                                <label><input type="radio" name={`simple-numeroGramatical-${index}`} value="Plural" onChange={handleNumeroGramaticalSimplesChange(pc.key)} /> Plural</label>
                                            </div>
                                            <div>
                                                <label><input type="radio" name={`simple-numeroGramatical-${index}`} value="Singular" onChange={handleNumeroGramaticalSimplesChange(pc.key)} /> Singular</label>
                                            </div>
                                        </div>
                                    )}

                                    {
                                        pc.pictogramas.map((pictograma, idx) => (
                                            <Pictogram key={`simple-${index}-${idx}`} pictogram={pictograma} activarBotonRemover={false} tiempoVerbal={tiempoVerbalPictogramasSimples[pc.key]} numeroGramatical={numeroGramaticalPictogramasSimples[pc.key]} />
                                        ))
                                    }
                                </div>
                            );
                        }
                        else {
                            return (
                                <div style={styles.column}>
                                    <TextoComoImagen key={`texto-${index}-${pc.palabraInfo.texto}`} texto={pc.palabraInfo.texto} />
                                </div>
                            );
                        }
                    })
                }
            </div>

            {palabrasCompuestas && palabrasCompuestas.length > 0 && (
                <h3 style={styles.itemStyle}>Pictogramas Compuestos</h3>
            )}

            <div style={styles.container}>
                {
                    palabrasCompuestas.map((pc, index) => {
                        const tienePictogramas = pc.pictogramas && pc.pictogramas.length > 0;
                        if (tienePictogramas) {
                            return (
                                <div key={`compuesta-${index}`} style={styles.column}>
                                    <h3 style={{ margin: '0' }}>{pc["palabraInfo"].texto}</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div><h3 style={{ margin: '0' }}>Tiempo Verbal</h3></div>
                                        <div>
                                            <label><input type="radio" name={`compuesta-tense-${index}`} value="Pasado" onChange={handleTiempoVerbalCompuestosChange(pc.key)} /> Pasado</label>
                                        </div>
                                        <div>
                                            <label><input type="radio" name={`compuesta-tense-${index}`} value="Presente" onChange={handleTiempoVerbalCompuestosChange(pc.key)} /> Presente</label>
                                        </div>
                                        <div>
                                            <label><input type="radio" name={`compuesta-tense-${index}`} value="Futuro" onChange={handleTiempoVerbalCompuestosChange(pc.key)} /> Futuro</label>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div><h3 style={{ margin: '0' }}>Numero Gramatical</h3></div>
                                        <div>
                                            <label><input type="radio" name={`compuesta-numeroGramatical-${index}`} value="Plural" onChange={handleNumeroGramaticalCompuestosChange(pc.key)} /> Plural</label>
                                        </div>
                                        <div>
                                            <label><input type="radio" name={`compuesta-numeroGramatical-${index}`} value="Singular" onChange={handleNumeroGramaticalCompuestosChange(pc.key)} /> Singular</label>
                                        </div>
                                    </div>
                                    {
                                        pc.pictogramas.map((pictograma, idx) => (
                                            <Pictogram key={`compuesta-${index}-${idx}`} pictogram={pictograma} activarBotonRemover={false} tiempoVerbal={tiempoVerbalPictogramasCompuestos[pc.key]} numeroGramatical={numeroGramaticalPictogramasCompuestos[pc.key]} />
                                        ))
                                    }
                                </div>
                            );
                        }
                        else {
                            return (<div></div>);
                        }
                    })
                }
            </div>
            <div>
                <h3 style={styles.itemStyle}>Área de Soltar Pictogramas</h3>
                <br></br>
                <div onDragOver={handleDragOver} onDrop={handleDrop} style={styles.dropArea}>
                    {droppedItems?.map((item, index) => (
                        <div key={index} style={styles.column} draggable onDragStart={handleDragStart(index)}>
                            <input
                                style={{ margin: '0', padding: '5px' }} // Ajusta estilos según necesidad
                                value={item.palabra}
                                onChange={(e) => handleUpdateItemPalabra(index, e.target.value)}
                            />

                            <Pictogram key={`drag-${index}`} pictogram={item} activarBotonRemover={false} tiempoVerbal={item.tiempoVerbal} numeroGramatical={item.numeroGramatical} />
                            <button onClick={handleRemovePictograma(index)}>X</button>
                        </div>
                    ))}
                </div>
            </div>
            <div style={styles.buttonsContainer}>
                <button onClick={cleanDroppedPictogramas} style={styles.buttonStyle}>Limpiar Pictogramas</button>
                <button onClick={handleSave} style={styles.buttonStyle}>Guardar</button>
            </div>
            <div style={styles.container}>
                <PictogramSearch />
            </div>
        </div>
    );
}

export default PictogramList;

