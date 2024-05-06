from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import json
import os
import secrets
import threading

clave_secreta = secrets.token_hex(16)
print(clave_secreta)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Configura la clave secreta JWT y el tiempo de expiración
app.config['JWT_SECRET_KEY'] = clave_secreta
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hora
jwt = JWTManager(app)


# Simula una base de datos de usuarios
USUARIOS = {"usuario1": {"nombre": "Chili",   "id": "usuario1", "start" : 0,    "end": 999,  "current": 0}, 
            "usuario2": {"nombre": "Mamayo",  "id": "usuario2", "start" : 1000, "end": 1999, "current": 1000}, 
            "usuario3": {"nombre": "Hermano", "id": "usuario3", "start" : 2000, "end": 2999, "current": 2000}, 
            "usuario4": {"nombre": "Mori",    "id": "usuario4", "start" : 3000, "end": 3999, "current": 3000}, 
            "usuario5": {"nombre": "Buitre",  "id": "usuario5", "start" : 4000, "end": 4999, "current": 4000}, 
            }


@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    if username in USUARIOS:
        user = USUARIOS[username]
        # Si el usuario existe, crea un token JWT
        access_token = create_access_token(identity=user["id"])
        userResponse = { "access_token": access_token, "nombre": user["nombre"], "id": user["id"], "start": user["start"], "end": user["end"], "current": user["current"]}
        return jsonify(userResponse), 200
    else:
        return jsonify({"msg": "Nombre de usuario no encontrado"}), 401



def find_element_by_id(id):
    # Calcula el nombre del archivo basado en el ID
    
    file_index = id // 50  # Esto asume que cada archivo tiene 50 elementos, excepto el último
    filename = f"resultados/resultado_traduccion_{file_index}.json"
    
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
            if item["palabras_traducidas"]:
                for palabra_traducida in item["palabras_traducidas"]:
                    if palabra_traducida["pictogramas"]:
                        for pictograma in palabra_traducida["pictogramas"]:
                            pictograma["key"] = palabra_traducida["key"]
            return item
    
    return None


def find_and_update_oracion(id, oracion_traducida, usuario, comentario, traduccionCompleja):
    # Calcula el nombre del archivo basado en el ID
    file_index = (id-1)  // 50  # Esto asume que cada archivo tiene 50 elementos, excepto el último
    filename = f"resultados/resultado_traduccion_{file_index}.json"

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
            item['usuario'] = usuario
            item['comentario'] = comentario if comentario else ""
            item['traduccionCompleja'] = traduccionCompleja if traduccionCompleja else False
            break
    else:
        return False  # Si no se encontró el ID

    # Guarda el archivo con la oración actualizada
    with open(filename, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

    return True

@app.route('/api/save', methods=['POST'])
@jwt_required()  # Requiere que el usuario esté autenticado
def save_pictogram_data():
    data = request.json

    # Asegúrate de que los datos enviados contienen 'id' y 'oracion_traducida'
    if 'id' not in data or 'oracion_traducida' not in data:
        return jsonify({"message": "Datos incompletos"}), 400

    success = find_and_update_oracion(data['id'], data['oracion_traducida'], data['usuario'], data['comentarios'], data['traduccionCompleja'])

    if not success:
        return jsonify({"message": "Error al guardar los datos"}), 500

    return jsonify({"message": "Datos guardados con éxito"}), 200



@app.route('/api/getElemento', methods=['GET'])
@jwt_required()  # Requiere que el usuario esté autenticado
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