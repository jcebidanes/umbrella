import React, { useState } from "react";
import { RpgItem } from "../types/rpgTypes";

interface CreateListScreenProps {
  onSaveNewList: (name: string, items: RpgItem[]) => Promise<void>;
  onCancel: () => void;
}

const CreateListScreen: React.FC<CreateListScreenProps> = ({
  onSaveNewList,
  onCancel,
}) => {
  const [newListName, setNewListName] = useState<string>("");
  const [items, setItems] = useState<RpgItem[]>([
    { nome: "", peso: undefined },
  ]);

  const handleItemChange = (
    index: number,
    field: "nome" | "peso",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "peso"
                  ? value === ""
                    ? undefined
                    : Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { nome: "", peso: undefined }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await onSaveNewList(newListName, items);
    setNewListName("");
    setItems([{ nome: "", peso: undefined }]);
  };

  return (
    <div id="create-list-screen" className="flex flex-col items-center p-4">
      <p className="text-gray-600 mb-4 text-center">
        Crie sua nova lista de elementos. O nome é obrigatório.
        <br />
        Você pode definir o peso de cada item para sorteio ponderado (opcional).
      </p>
      <input
        type="text"
        id="newListNameInput"
        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 mb-4 transition-all duration-200"
        placeholder="Nome da nova lista (ex: Monstros, Tesouros)"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
      />
      <div className="w-full mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center mb-2 gap-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-lg"
              placeholder={`Item ${idx + 1}`}
              value={item.nome}
              onChange={(e) => handleItemChange(idx, "nome", e.target.value)}
            />
            <input
              type="number"
              min="1"
              className="w-20 p-2 border rounded-lg"
              placeholder="Peso"
              value={item.peso === undefined ? "" : item.peso}
              onChange={(e) => handleItemChange(idx, "peso", e.target.value)}
            />
            <button
              type="button"
              className="bg-red-400 text-white px-2 py-1 rounded-lg hover:bg-red-600"
              onClick={() => handleRemoveItem(idx)}
              disabled={items.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          onClick={handleAddItem}
        >
          + Adicionar Item
        </button>
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-4"
      >
        Salvar Nova Lista
      </button>
      <button
        onClick={onCancel}
        className="w-full bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      >
        Cancelar
      </button>
    </div>
  );
};

export default CreateListScreen;
