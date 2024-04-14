import React, { useState, useEffect } from 'react';
import Pictogram from './Pictogram';

function PictogramSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);

    const [tiempoVerbalPictogramasBuscados, setTiempoVerbalPictogramasBuscados] = useState({});
    const [numeroGramaticalPictogramasBuscados, setNumeroGramaticalPictogramasBuscados] = useState({});

    const handleTiempoVerbalBuscadosChange = (index) => (e) => {
        setTiempoVerbalPictogramasBuscados(prev => ({...prev, [index]: e.target.value}));
    };

    const handleNumeroGramaticalBuscadosChange = (index) => (e) => {
        setNumeroGramaticalPictogramasBuscados(prev => ({...prev, [index]: e.target.value}));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) return;
        setResults([]); // Limpia los resultados anteriores antes de la nueva búsqueda
        const url = `https://api.arasaac.org/api/pictograms/es/bestsearch/${encodeURIComponent(searchTerm.trim())}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Error fetching data");
            }
            const data = await response.json();

            const pictogramResults = data.flatMap(p => p.keywords.map( (keyword, index) => ({
                key: index,
                id: p._id,
                synsets: p.synsets,
                isSimple: keyword.keyword.split(' ').length == 1,
                keyword: keyword.keyword,
                palabra: keyword.keyword,
                plural: keyword.plural,
                isSearch: true
            })));

            setResults(pictogramResults);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const searchContainerStyle = {
        display: 'flex',
        justifyContent: 'center', // Centra los elementos horizontalmente en el contenedor
        alignItems: 'center', // Centra los elementos verticalmente en el contenedor
        margin: '20px 0', // Añade un poco de margen arriba y abajo para separarlo del resto del contenido
    };

    const pictogramContainerStyle = {
        border: '2px dotted #000', // Borde punteado
        padding: '10px', // Espaciado interno alrededor del contenido
        margin: '5px', // Espaciado externo alrededor de cada pictograma
        display: 'inline-block', // Hace que cada contenedor sea en línea para fluir con flexbox
        textAlign: 'center', // Centra el texto (y cualquier contenido interno) horizontalmente
    };

    const resultsContainerStyle = {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
    };

    return (
        <div>
            <div style={searchContainerStyle}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Buscar más pictogramas..."
                />
                <button onClick={handleSearchClick}>Buscar</button>
            </div>
            <div style={resultsContainerStyle}>
                {results.map((pictogram, index) => (
                    <div key={`search-${index}`} style={pictogramContainerStyle}>
                        <h3 style={{ margin: '0' }}>{pictogram.palabra}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div><h3 style={{ margin: '0' }}>Tiempo Verbal</h3></div>
                            <div>
                                <label><input type="radio" name={`search-tense-${index}`} value="Pasado" onChange={handleTiempoVerbalBuscadosChange(index)}/> Pasado</label>
                            </div>
                            <div>
                                <label><input type="radio" name={`search-tense-${index}`} value="Presente" onChange={handleTiempoVerbalBuscadosChange(index)} /> Presente</label>
                            </div>
                            <div>
                                <label><input type="radio" name={`search-tense-${index}`} value="Futuro" onChange={handleTiempoVerbalBuscadosChange(index)} /> Futuro</label>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div><h3 style={{ margin: '0' }}>Numero Gramatical</h3></div>
                            <div>
                                <label><input type="radio" name={`search-numeroGramatical-${index}`} value="Plural" onChange={handleNumeroGramaticalBuscadosChange(index)}/> Plural</label>
                            </div>
                            <div>
                                <label><input type="radio" name={`search-numeroGramatical-${index}`} value="Singular" onChange={handleNumeroGramaticalBuscadosChange(index)}/> Singular</label>
                            </div>
                        </div>
                        <Pictogram pictogram={pictogram} activarBotonRemover={false} tiempoVerbal={tiempoVerbalPictogramasBuscados[index]} numeroGramatical = {numeroGramaticalPictogramasBuscados[index]}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PictogramSearch;