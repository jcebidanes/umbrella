/**
 * RPG List Helper
 *
 * Como funciona a aplicação:
 *
 * 1. Sorteio de itens:
 *    - Você pode criar listas de elementos (personagens, aventuras, etc).
 *    - Para sortear, basta clicar no botão de sorteio na tela da lista.
 *    - O sorteio é PONDERADO: itens com peso maior têm mais chance de serem sorteados.
 *
 * 2. Pesos ponderados:
 *    - Cada item da lista tem um campo "peso" (número inteiro).
 *    - O cálculo é feito somando todos os pesos da lista.
 *    - Cada item tem chance proporcional ao seu peso. Exemplo:
 *      Aragorn (peso 10), Gandalf (peso 5), Frodo (peso 2):
 *      - Total de pesos: 17
 *      - Probabilidade de cada um:
 *        Aragorn: 10/17 ≈ 59%
 *        Gandalf: 5/17 ≈ 29%
 *        Frodo: 2/17 ≈ 12%
 *
 * 3. Referências entre listas:
 *    - Você pode criar itens que referenciam outras listas usando o formato:
 *      "nome": "LIST_REF:NomeDaLista"
 *    - Ao sortear, o app busca o resultado na lista referenciada.
 *
 * 4. Exemplos de JSON para upload:
 *
 * // Exemplo para upload por arquivo ou colar direto:
 * {
 *   "Personagens": [
 *     { "nome": "Aragorn", "peso": 10 },
 *     { "nome": "Gandalf", "peso": 5 },
 *     { "nome": "Frodo", "peso": 2 }
 *   ],
 *   "Aventuras": [
 *     { "nome": "LIST_REF:Personagens", "peso": 1 },
 *     { "nome": "Missão Secreta", "peso": 3 }
 *   ]
 * }
 *
 * // Exemplo de lista única (apenas para upload por colar):
 * [
 *   { "nome": "Aragorn", "peso": 10 },
 *   { "nome": "Gandalf", "peso": 5 },
 *   { "nome": "Frodo", "peso": 2 }
 * ]
 */
