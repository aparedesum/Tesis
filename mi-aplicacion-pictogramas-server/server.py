import json
import os

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

def find_element_by_id(id):
    # Calcula el nombre del archivo basado en el ID
    
    file_index = id // 2000  # Esto asume que cada archivo tiene 2000 elementos, excepto el último
    filename = f"resultado_traduccion_{file_index}.json"
    
    # Asegúrate de que el archivo exista
    if not os.path.exists(filename):
        return None

    # Lee el archivo
    with open(filename, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Busca el elemento por su ID
    id = id + 1
    for item in data:
        if item['id'] == id:
            return item
    
    return None


def find_and_update_oracion(id, oracion_traducida):
    # Calcula el nombre del archivo basado en el ID
    file_index = (id-1)  // 2000  # Esto asume que cada archivo tiene 2000 elementos, excepto el último
    filename = f"resultado_traduccion_{file_index}.json"

    # Asegúrate de que el archivo exista
    if not os.path.exists(filename):
        return False

    # Lee el archivo
    with open(filename, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Busca y actualiza la oración
    for item in data:
        if item['id'] == id:
            item['oracion_traducida'] = oracion_traducida
            break
    else:
        return False  # Si no se encontró el ID

    # Guarda el archivo con la oración actualizada
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

    return True

@app.route('/api/save', methods=['POST'])
def save_pictogram_data():
    data = request.json

    # Asegúrate de que los datos enviados contienen 'id' y 'oracion_traducida'
    if 'id' not in data or 'oracion_traducida' not in data:
        return jsonify({"message": "Datos incompletos"}), 400

    success = find_and_update_oracion(data['id'], data['oracion_traducida'])

    if not success:
        return jsonify({"message": "Error al guardar los datos"}), 500

    return jsonify({"message": "Datos guardados con éxito"}), 200

@app.route('/api/getElemento', methods=['GET'])
def get_elemento():
    id = request.args.get('id', default=None, type=int)
    
    if id is None:
        return jsonify({"error": "Falta el parámetro id"}), 400
    
    elemento = find_element_by_id(id)
    
    if elemento is None:
        return jsonify({"error": "Elemento no encontrado"}), 404
    
    return jsonify(elemento), 200

if __name__ == '__main__':
    app.run(debug=True)

if __name__ == '__main__':
    app.run(debug=True)