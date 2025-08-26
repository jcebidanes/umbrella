import React, { useRef, useState } from "react";
import { RpgLists } from "../types/rpgTypes";

interface ListSelectionScreenProps {
  allRpgLists: RpgLists;
  onSelectList: (listName: string) => void;
  onCreateNewList: () => void;
  onImportLists: (lists: RpgLists) => void;
}

function importListsFromFile(file: File): Promise<RpgLists> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const imported = JSON.parse(result);
        if (typeof imported !== "object" || Array.isArray(imported)) {
          reject(new Error("Formato inválido de listas."));
        } else {
          resolve(imported);
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

const ListSelectionScreen: React.FC<ListSelectionScreenProps> = ({
  allRpgLists,
  onSelectList,
  onCreateNewList,
  onImportLists,
}) => {
  const listNames = Object.keys(allRpgLists).sort();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJson, setPastedJson] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importListsFromFile(file);
        onImportLists(imported);
      } catch (err) {
        alert("Erro ao importar listas: " + (err as Error).message);
      }
      e.target.value = "";
    }
  };

  const handlePasteImport = () => {
    try {
      const imported = JSON.parse(pastedJson);
      if (typeof imported !== "object" || Array.isArray(imported)) {
        alert("Formato inválido de listas.");
        return;
      }
      onImportLists(imported);
      setShowPasteModal(false);
      setPastedJson("");
    } catch (err) {
      alert("Erro ao importar listas: " + (err as Error).message);
    }
  };

  return (
    <div
      id="list-selection-screen"
      className="flex flex-col items-center justify-center p-4"
    >
      <p className="text-gray-600 mb-6 text-center">
        Selecione, crie ou importe listas para sua campanha.
      </p>
      <div id="list-buttons-container" className="w-full space-y-4 mb-6">
        {listNames.length === 0 ? (
          <p className="text-gray-500 text-center">
            Nenhuma lista criada ainda. Clique em "Criar Nova Lista" ou importe!
          </p>
        ) : (
          listNames.map((listName: string) => (
            <button
              key={listName}
              onClick={() => onSelectList(listName)}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              {listName}
            </button>
          ))
        )}
      </div>
      <button
        onClick={onCreateNewList}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-2"
      >
        Criar Nova Lista
      </button>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-2"
      >
        Importar Listas (Arquivo)
      </button>
      <button
        onClick={() => setShowPasteModal(true)}
        className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
      >
        Colar JSON
      </button>
      {showPasteModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Colar JSON de Listas
            </h3>
            <textarea
              className="w-full p-3 border-2 border-gray-300 rounded-xl mb-4"
              rows={8}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder="Cole aqui o JSON de listas..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasteImport}
                className="px-4 py-2 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSelectionScreen;
