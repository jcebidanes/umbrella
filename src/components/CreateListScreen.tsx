import React, { useState } from "react";

interface CreateListScreenProps {
  onSaveNewList: (name: string, items: string) => Promise<void>;
  onCancel: () => void;
}

const CreateListScreen: React.FC<CreateListScreenProps> = ({
  onSaveNewList,
  onCancel,
}) => {
  const [newListName, setNewListName] = useState<string>("");
  const [newListItems, setNewListItems] = useState<string>("");

  const handleSave = async () => {
    await onSaveNewList(newListName, newListItems);
    setNewListName("");
    setNewListItems("");
  };

  return (
    <div id="create-list-screen" className="flex flex-col items-center p-4">
      <p className="text-gray-600 mb-4 text-center">
        Crie sua nova lista de elementos. O nome é obrigatório.
      </p>
      <input
        type="text"
        id="newListNameInput"
        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 mb-4 transition-all duration-200"
        placeholder="Nome da nova lista (ex: Monstros, Tesouros)"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
      />
      <textarea
        id="newListItemsTextarea"
        className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 h-64 resize-y mb-6 transition-all duration-200"
        placeholder="Itens da nova lista (um por linha, opcional)&#10;Ex:&#10;Goblin&#10;Orc&#10;Dragão"
        value={newListItems}
        onChange={(e) => setNewListItems(e.target.value)}
      ></textarea>
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
