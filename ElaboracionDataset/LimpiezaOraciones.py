def process_and_sort_sentences(input_file_path, output_file_path):
    # Characters to remove if found at the end of a sentence
    chars_to_remove = {'.', ',', ';', ':'}
    unique_sentences = set()
    
    with open(input_file_path, 'r', encoding='utf-8') as file:
        for line in file:
            sentence = line.rstrip()
            if sentence and sentence[-1] in chars_to_remove:
                sentence = sentence[:-1]
            # Add the processed sentence to the set to remove duplicates
            unique_sentences.add(sentence)
    
    # Sort the sentences alphabetically and write them to the output file
    with open(output_file_path, 'w', encoding='utf-8') as file:
        for sentence in sorted(unique_sentences):
            file.write(sentence + '\n')

# Example usage
input_file_path = 'OracionesConsolidadoGeneral_limpio_v1.txt'  # Update this path to your input file
output_file_path = 'OracionesConsolidadoGeneral_limpio_v2.txt'  # Update this path to where you want the output

process_and_sort_sentences(input_file_path, output_file_path)