# Use a pipeline as a high-level helper
from transformers import pipeline
import json
import random

pipe = pipeline("text-classification", model="lmvasque/readability-es-benchmark-mbert-es-paragraphs-2class")

with open('OracionesConsolidadoGeneral_limpio_v2.txt', 'r', encoding='utf-8') as archivo:
    lineas = archivo.readlines()


tamaño_lote = 1000 

# Función para procesar los lotes
def procesar_en_lotes(oraciones, tamaño_lote):
    resultados = []
    for i in range(0, len(oraciones), tamaño_lote):
        lote = oraciones[i:i + tamaño_lote]
        resultados.extend(pipe(lote))
    return resultados

def procesar_complejidad_oraciones():
    resultados = procesar_en_lotes(lineas, tamaño_lote)
    i = 0
    for resultado in resultados:
        resultado["oracion"] = lineas[i].strip()  # Agregamos strip para remover espacios adicionales o saltos de línea
        i += 1

    label0_list = list(filter(lambda x: (x["label"] == 'LABEL_0'), resultados))  
    label1_list = list(filter(lambda x: (x["label"] == 'LABEL_1'), resultados))

    print(len(label0_list))
    print(len(label1_list))

    with open('resultados_label0.txt', 'w', encoding='utf-8') as archivo00:
        for resultado in label0_list:
            archivo00.write(json.dumps(resultado, ensure_ascii=False) + '\n')

    with open('resultados_label1.txt', 'w', encoding='utf-8') as archivo01:
        for resultado in label1_list:
            archivo01.write(json.dumps(resultado, ensure_ascii=False) + '\n')

def leer_y_ordenar(archivo_entrada, archivo_salida, cantidad_random, orden_ascendente=False):
    try:
        # Leer el archivo de entrada
        with open(archivo_entrada, 'r', encoding='utf-8') as archivo:
            colecciones = [json.loads(linea.strip()) for linea in archivo if linea.strip()]

   
        # Ordenar las colecciones por score
        colecciones_ordenadas = sorted(colecciones, key=lambda x: x['score'], reverse=not orden_ascendente)

        limite = len(colecciones_ordenadas)
        indices_random_unicos = sorted(random.sample(range(limite + 1), cantidad_random))
        
        coleccion_random = []

        for x in indices_random_unicos:
            coleccion_random.append(colecciones_ordenadas[x])

        colecciones_ordenadas_filtradas = [colecciones_ordenadas[i] for i in range(len(colecciones_ordenadas)) if i not in indices_random_unicos]

                # Escribir las colecciones ordenadas al archivo de salida
        with open(archivo_salida, 'w', encoding='utf-8') as archivo:
            for coleccion in colecciones_ordenadas_filtradas:
                archivo.write(json.dumps(coleccion, ensure_ascii=False) + '\n')

        # Escribir las colecciones random al archivo de salida
        with open(f"random_{archivo_salida}", 'w', encoding='utf-8') as archivo:
            for coleccion in coleccion_random:
                archivo.write(json.dumps(coleccion, ensure_ascii=False) + '\n')

        print(f"Archivo '{archivo_entrada}' procesado y guardado en '{archivo_salida}'.")
    except Exception as e:
        print(f"Error al procesar el archivo {archivo_entrada}: {e}")

def guardar_oraciones(archivo_entrada, archivo_salida):
    try:
        with open(archivo_entrada, 'r', encoding='utf-8') as archivo:
            # Leer cada línea, cargar como JSON y extraer la "oracion"
            oraciones = [json.loads(linea.strip())['oracion'] for linea in archivo if linea.strip()]

        # Guardar cada oración en un nuevo archivo, una por línea
        with open(archivo_salida, 'w', encoding='utf-8') as archivo:
            for oracion in oraciones:
                archivo.write(oracion + '\n')

        print(f"Oraciones extraídas de '{archivo_entrada}' y guardadas en '{archivo_salida}'.")
    except Exception as e:
        print(f"Error al procesar el archivo {archivo_entrada}: {e}")

# Llamada a la función para ambos archivos de resultados


procesar_complejidad_oraciones()
leer_y_ordenar('resultados_label0.txt', 'resultados_ordenados_label0.txt', 40)
leer_y_ordenar('resultados_label1.txt', 'resultados_ordenados_label1.txt', 10, orden_ascendente=True)
guardar_oraciones('resultados_ordenados_label0.txt', 'OracionesOrdenadas_Simples.txt')
guardar_oraciones('resultados_ordenados_label1.txt', 'OracionesOrdenadas_Complejas.txt')
guardar_oraciones('random_resultados_ordenados_label0.txt', 'OracionesOrdenadasRandom_Simples.txt')
guardar_oraciones('random_resultados_ordenados_label1.txt', 'OracionesOrdenadasRandom_Complejas.txt')

print(f"Fin")