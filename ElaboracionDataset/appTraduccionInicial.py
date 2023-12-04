import json
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
import warnings
warnings.filterwarnings('ignore')

from pprint import pprint

import string
import nltk
import spacy

# Descargar los datos necesarios para tokenización
nltk.download('punkt')

class OracionTraducida:
    def __init__(self, id, oracion, palabras_traducidas):
        self.id = id
        self.oracion = oracion
        self.palabras_traducidas = palabras_traducidas

class PalabraTraducida: 
    def __init__(self, palabra, pictogramas):
        self.palabra = palabra
        self.pictogramas = pictogramas

class Pictograma:
    def __init__(self, nombre, id, plural, synsets):
        self.nombre = nombre
        self.id = id
        self.synsets = synsets
        self.plural = plural

def lematizar_palabra_es(word): 
    # Procesar la palabra con spaCy
    doc = nlp(word)
    
    # Obtener el lema de la primera palabra (si hay palabras en el documento)
    lema_palabra = next((token.lemma_ for token in doc if token.lemma_ != '-PRON-'), word)
    
    return lema_palabra

def tokenize(text, preserve_case=True):
    #punctuation = set(string.punctuation + '"¡¿áéíóúü')
    text_words = []
    
    for word in nltk.tokenize.WordPunctTokenizer().tokenize(text):
        if preserve_case:
            text_words.append(word)
        else:
            text_words.append(word.lower())
        
    return text_words

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

            diccionario_pictogramas = {}
            for pictograma in lista_pictogramas:
                if pictograma.nombre not in diccionario_pictogramas:
                    diccionario_pictogramas[pictograma.nombre] = []
                diccionario_pictogramas[pictograma.nombre].append(pictograma)

            print('Diccionario cargado')
            return diccionario_pictogramas
    except FileNotFoundError:
        print(f'El archivo {nombre_archivo} no se encuentra.')
    except json.JSONDecodeError as e:
        print(f'Error al decodificar el archivo JSON: {e}')
    except Exception as e:
        print(f'Error durante la carga del archivo JSON: {e}')


def tokenizar_oraciones():
    try:
        with open("OracionesConsolidadoGeneral_limpio_v1.txt", 'r', encoding='utf-8') as archivo_texto:
            lineas = archivo_texto.readlines()
            tokens_por_oracion = []
            for linea in lineas:
                tokens = tokenize(linea)
                tokens_por_oracion.append(tokens)
            return tokens_por_oracion
    except FileNotFoundError:
        print(f'El archivo no se encuentra.')
    except Exception as e:
        print(f'Error durante la tokenización: {e}')

def traducir_oraciones(oraciones_tokenizadas, dictionario_pictogramas):
    print(f'Traduciendo Oraciones.')
    oraciones_traducidas = []
    i = 1
    for oracion_tokenizada in oraciones_tokenizadas:
        palabras_traducidas = []
        for palabra in oracion_tokenizada:
            pictogramas = dictionario_pictogramas.get(palabra.lower(), {})
            if(pictogramas):
                palabras_traducidas.append(PalabraTraducida(palabra, pictogramas))
            else:
                # Tratamos de buscar en el dictionary la palabra lematizada
                palabra_lematizada = lematizar_palabra_es(palabra.lower())
                pictogramas = dictionario_pictogramas.get(palabra_lematizada.lower(), {})
                palabras_traducidas.append(PalabraTraducida(palabra, pictogramas))

        oraciones_traducidas.append(OracionTraducida(id = i, oracion = ' '.join(oracion_tokenizada), palabras_traducidas = palabras_traducidas))
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

# Llama a la función para tokenizar las oraciones
# Cargar el modelo en español
ruta_modelo = r'D:\Tesis\Tesis\ElaboracionDataset\es_core_news_sm-3.7.0\es_core_news_sm\es_core_news_sm-3.7.0'
#nlp = spacy.load('es_core_news_sm')
nlp = spacy.load(ruta_modelo)

dictionario_pictogramas = cargar_pictogramas()

oraciones_tokenizadas = tokenizar_oraciones()
oraciones_traducidas = traducir_oraciones(oraciones_tokenizadas, dictionario_pictogramas)

print("Guardando ... ")

shards = 2000
total_oraciones = len(oraciones_traducidas)

print(f"total oraciones traducidas : {total_oraciones}")

for i in range(13):
    comienza_en = shards*i
    termina_en = shards*(i+1)
    if(termina_en > total_oraciones):
        termina_en = total_oraciones

    save_to_file(oraciones_traducidas[comienza_en:termina_en], f"resultado_traduccion_{i}.json")

print("Finalizado")        