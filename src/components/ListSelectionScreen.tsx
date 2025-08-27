import React, { useRef, useState } from "react";
import {
  buttonPrimary,
  buttonSuccess,
  buttonIndigo,
  buttonWarning,
  containerBase,
  inputBase,
  cardBase,
} from "../styles/commonStyles";
import { RpgLists } from "../types/rpgTypes";

type ListSelectionScreenProps = {
  allRpgLists: RpgLists;
  onSelectList: (listName: string) => void;
  onCreateNewList: () => void;
  onImportLists: (lists: RpgLists) => void;
};

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
      className={containerBase + " justify-center"}
    >
      <p className="text-gray-600 mb-6 text-center text-base sm:text-lg">
        Selecione, crie ou importe listas para sua campanha.
      </p>
      <div id="list-buttons-container" className="w-full space-y-4 mb-6">
        {listNames.length === 0 ? (
          <p className="text-gray-500 text-center text-base sm:text-lg">
            Nenhuma lista criada ainda. Clique em "Criar Nova Lista" ou importe!
          </p>
        ) : (
          listNames.map((listName: string) => (
            <button
              key={listName}
              onClick={() => onSelectList(listName)}
              className={buttonPrimary + " text-base sm:text-lg"}
            >
              {listName}
            </button>
          ))
        )}
      </div>
      <button
        onClick={onCreateNewList}
        className={buttonIndigo + " mb-2 text-base sm:text-lg"}
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
        className={buttonSuccess + " mb-2 text-base sm:text-lg"}
      >
        Importar Listas (Arquivo)
      </button>
      <button
        onClick={() => setShowPasteModal(true)}
        className={buttonWarning + " text-base sm:text-lg"}
      >
        Colar JSON
      </button>
      {showPasteModal && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50">
          <div
            className={cardBase + " max-w-md w-full overflow-y-auto"}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Colar JSON de Listas
            </h3>
            <textarea
              className={inputBase + " mb-4 text-base sm:text-lg"}
              rows={8}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder="Cole aqui o JSON de listas..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 active:scale-95"
                aria-label="Fechar modal"
              >
                <span className="sr-only">Fechar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Fechar</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button
                onClick={handlePasteImport}
                className={
                  buttonSuccess + " px-4 py-2 rounded-md font-semibold"
                }
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
