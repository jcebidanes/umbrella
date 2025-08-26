// src/data/defaultLists.ts

export interface RpgLists {
    [key: string]: string[];
}

export const defaultLists: RpgLists = {
    "Armas RPG": [
        "LIST_REF:Armas de Corpo a Corpo",
        "LIST_REF:Armas de Distância",
        "Escudo",
        "Alabarda",
    ],
    "Armas de Corpo a Corpo": [
        "Espada longa",
        "Machado",
        "Adaga",
        "Maça",
        "Mangual",
        "Cimitarra",
        "Facão",
        "Foice",
        "Estrela da manhã",
        "Cajado",
    ],
    "Armas de Distância": ["Arco e Flecha", "Besta", "Lança"],
    "Monstros Iniciais": ["Goblin", "Orc", "Slime", "Rato Gigante"],
    "Tesouros Comuns": [
        "5 moedas de ouro",
        "Pote de cura",
        "Mapa rasgado",
        "Chave enferrujada",
    ],
};
