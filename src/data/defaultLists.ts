// src/data/defaultLists.ts


import { RpgLists, RpgItem } from "../types/rpgTypes";

export const defaultLists: RpgLists = {
    "Armas RPG": [
        { nome: "LIST_REF:Armas de Corpo a Corpo" },
        { nome: "LIST_REF:Armas de Distância" },
        { nome: "Escudo" },
        { nome: "Alabarda" },
    ],
    "Armas de Corpo a Corpo": [
        { nome: "Espada longa" },
        { nome: "Machado" },
        { nome: "Adaga" },
        { nome: "Maça" },
        { nome: "Mangual" },
        { nome: "Cimitarra" },
        { nome: "Facão" },
        { nome: "Foice" },
        { nome: "Estrela da manhã" },
        { nome: "Cajado" },
    ],
    "Armas de Distância": [
        { nome: "Arco e Flecha" },
        { nome: "Besta" },
        { nome: "Lança" },
    ],
    "Monstros Iniciais": [
        { nome: "Goblin" },
        { nome: "Orc" },
        { nome: "Slime" },
        { nome: "Rato Gigante" },
    ],
    "Tesouros Comuns": [
        { nome: "5 moedas de ouro" },
        { nome: "Pote de cura" },
        { nome: "Mapa rasgado" },
        { nome: "Chave enferrujada" },
    ],
};
