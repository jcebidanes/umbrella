
export interface RpgItem {
    nome: string;
    peso?: number;
}

export interface RpgLists {
    [key: string]: RpgItem[];
}
