import json
import warnings
warnings.filterwarnings('ignore')

from pprint import pprint

from ahocorasick import Automaton

import spacy

# Load the Spanish language model
nlp = spacy.load("es_dep_news_trf")

class OracionTraducida:
    def __init__(self, id, oracion, oracion_lematizada, palabras_traducidas, palabras_compuestas):
        self.id = id
        self.oracion = oracion
        self.oracion_lematizada = oracion_lematizada
        self.palabras_traducidas = palabras_traducidas
        self.palabras_compuestas = palabras_compuestas

class PalabraTraducida: 
    def __init__(self, palabra, pictogramas,usaLema):
        self.palabra = palabra
        self.usaLema = usaLema
        self.pictogramas = pictogramas

class Pictograma:
    def __init__(self, keyword, id, plural, synsets):
        self.keyword = keyword.lower() if keyword is not None else None
        self.id = id
        self.synsets = synsets
        self.plural = plural.lower() if plural is not None else None
        

def cargar_pictogramas():
    nombre_archivo = 'pictogramasArasaac.json'
    try:
        with open(nombre_archivo, 'r', encoding='utf-8') as archivo_json:
            # Carga el contenido del archivo JSON en un diccionario
            datos_dict = json.load(archivo_json)
            lista_pictogramas = []
            for element in datos_dict:
                keywords = element.get('keywords', [])
                for keyword in keywords:
                    lista_pictogramas.append(Pictograma(keyword.get('keyword', None) , element.get("_id", None), keyword.get('plural', None), element.get("synsets", None)))

            diccionario_pictogramas_simples = {}
            diccionario_pictogramas_compuestos = {}

            for pictograma in lista_pictogramas:
                isSimple = pictograma.keyword.strip().count(" ") == 0
                if isSimple:
                    if pictograma.keyword not in diccionario_pictogramas_simples:
                        diccionario_pictogramas_simples[pictograma.keyword] = []
                    diccionario_pictogramas_simples[pictograma.keyword].append(pictograma)
                else:
                    if pictograma.keyword not in diccionario_pictogramas_compuestos:
                        diccionario_pictogramas_compuestos[pictograma.keyword] = []
                    diccionario_pictogramas_compuestos[pictograma.keyword].append(pictograma)
            print('Diccionario cargado')
            return (diccionario_pictogramas_simples, diccionario_pictogramas_compuestos)
    except FileNotFoundError:
        print(f'El archivo {nombre_archivo} no se encuentra.')
    except json.JSONDecodeError as e:
        print(f'Error al decodificar el archivo JSON: {e}')
    except Exception as e:
        print(f'Error durante la carga del archivo JSON: {e}')


def tokenizar_lematizar_oraciones():
    try:
        with open("OracionesConsolidadoGeneral_limpio_v1.txt", 'r', encoding='utf-8') as archivo_texto:
            lineas = archivo_texto.readlines()
            lineas = [linea.strip() for linea in lineas]
            oraciones_lematizadas = []
            i = 0
            for linea in nlp.pipe(lineas):
                tokens_por_oracion = []
                lemmas = []
                for token in linea:
                    properties = { "texto" : token.text, "lema": token.lemma_, "pos": token.pos_, "tag": token.tag_}
                    if(token.pos_ == "DET"):
                        lemmas.append(token.text)
                    else:
                        lemmas.append(token.lemma_)
                    tokens_por_oracion.append(properties)
                oraciones_lematizadas.append({"oracion": lineas[i].strip(), "oracion_lematizada": " ".join(lemmas),"tokens": tokens_por_oracion})
                i = i + 1
            return oraciones_lematizadas
    except FileNotFoundError:
        print(f'El archivo no se encuentra.')
    except Exception as e:
        print(f'Error durante la tokenización: {e}')

def traducir_oraciones(oraciones_tokenizadas, dictionario_pictogramas_simples, dictionario_pictogramas_compuestos):
    print(f'Traduciendo Oraciones.')
    oraciones_traducidas = []
    i = 1
    for oracion_tokenizada in oraciones_tokenizadas:
        palabras_traducidas = []
        for token in oracion_tokenizada["tokens"]:
            pictogramas = dictionario_pictogramas_simples.get(token["texto"].lower(), {})
            if(pictogramas):
                palabras_traducidas.append(PalabraTraducida(token, pictogramas, False))
            else:
                # Tratamos de buscar en el dictionary la palabra lematizada
                pictogramas = dictionario_pictogramas_simples.get(token["lema"].lower(), {})
                palabras_traducidas.append(PalabraTraducida(token, pictogramas, len(pictogramas) != 0))
        
        palabras_compuestas = []
        frase_agregada = set()
        for end_index, (pattern_idx, found) in automaton.iter(oracion_tokenizada["oracion"]):
            frase_agregada.add(found)
            pictograma_compuesta = dictionario_pictogramas_compuestos[found]
            palabras_compuestas.append(PalabraTraducida(found, pictograma_compuesta, False))

        for end_index, (pattern_idx, found) in automaton.iter(oracion_tokenizada["oracion_lematizada"]):
            if found not in frase_agregada:
                pictograma_compuesta = dictionario_pictogramas_compuestos[found]
                palabras_compuestas.append(PalabraTraducida(found, pictograma_compuesta, True))

        oraciones_traducidas.append(OracionTraducida(id = i, oracion = oracion_tokenizada["oracion"], oracion_lematizada = oracion_tokenizada["oracion_lematizada"],palabras_traducidas = palabras_traducidas, palabras_compuestas = palabras_compuestas))
        i = i + 1
    print(f'Fin traducción.')
    return oraciones_traducidas

# Función de serialización personalizada
def custom_serializer(obj):
    if isinstance(obj, (OracionTraducida, PalabraTraducida, Pictograma)):
        return obj.__dict__
    return obj

def save_to_file(oraciones_traducidas, archivo):
    oraciones_traducidas_json = json.dumps(oraciones_traducidas, default=custom_serializer, ensure_ascii=False,indent=2)

    with open(archivo, 'w', encoding='utf-8') as file:
        file.write(oraciones_traducidas_json)

def sharding():
    shards = 2000
    total_oraciones = len(oraciones_traducidas)

    print(f"total oraciones traducidas : {total_oraciones}")

    for i in range(12):
        comienza_en = shards*i
        termina_en = shards*(i+1)
        if(termina_en > total_oraciones):
            termina_en = total_oraciones

        save_to_file(oraciones_traducidas[comienza_en:termina_en], f"resultado_traduccion_{i}.json")

def preprocesar_compuestos(dictionario_pictogramas_compuestas):
    #Usamos tries para realizar el preprocesamiento de los pictogramas compuestos
    automaton = Automaton()

    for idx, phrase in enumerate(list(dictionario_pictogramas_compuestas.keys())):
        automaton.add_word(phrase, (idx, phrase))

    automaton.make_automaton()
    return automaton

dictionario_pictogramas_simples, dictionario_pictogramas_compuestas = cargar_pictogramas()
automaton = preprocesar_compuestos(dictionario_pictogramas_compuestas)
oraciones_tokenizadas = tokenizar_lematizar_oraciones()
oraciones_traducidas = traducir_oraciones(oraciones_tokenizadas, dictionario_pictogramas_simples, dictionario_pictogramas_compuestas)

print("Guardando ... ")
sharding()
print("Finalizado ... ")