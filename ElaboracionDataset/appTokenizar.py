import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import string

nltk.download('punkt')
nltk.download('stopwords')

def tokenize_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()

    # Tokenizar palabras
    words = word_tokenize(text)

    # Filtrar palabras que no son stopwords, que son alfabéticas o numéricas
    stop_words = set(stopwords.words('spanish'))  # Puedes cambiar 'spanish' por otro idioma si es necesario
    words = {word.lower() for word in words if (word.isalpha() or word.isnumeric()) and word.lower() not in stop_words}

    return sorted(list(words))

def save_to_file(words, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        for word in words:
            file.write(word + '\n')

# Reemplaza 'ruta_del_archivo.txt' con la ruta de tu archivo de texto
file_path = 'OracionesConsolidadoGeneral_limpio_v1.txt'
output_file = 'TokensUnicosDeOraciones.txt'

tokenized_words = tokenize_text(file_path)
save_to_file(tokenized_words, output_file)