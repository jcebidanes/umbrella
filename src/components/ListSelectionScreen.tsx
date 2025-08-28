import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  darkMode: boolean;
};

function importListsFromFile(
  file: File,
  t: (key: string, options?: any) => string
): Promise<RpgLists> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const imported = JSON.parse(result);
        if (typeof imported !== "object" || Array.isArray(imported)) {
          reject(new Error(t("listSelection.invalidFormatError")));
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
  darkMode,
}) => {
  const listNames = Object.keys(allRpgLists).sort();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJson, setPastedJson] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importListsFromFile(file, t);
        onImportLists(imported);
      } catch (err) {
        alert(
          t("listSelection.importError", { error: (err as Error).message })
        );
      }
      e.target.value = "";
    }
  };

  const handlePasteImport = () => {
    try {
      const imported = JSON.parse(pastedJson);
      // Aceita objeto de arrays (múltiplas tabelas)
      if (
        typeof imported !== "object" ||
        imported === null ||
        Array.isArray(imported)
      ) {
        alert(t("listSelection.invalidFormatError"));
        return;
      }
      // Valida que cada propriedade é um array
      const invalidTables = Object.entries(imported).filter(
        ([, value]) => !Array.isArray(value)
      );
      if (invalidTables.length > 0) {
        alert(t("listSelection.invalidFormatError"));
        return;
      }
      onImportLists(imported);
      setShowPasteModal(false);
      setPastedJson("");
    } catch (err) {
      alert(t("listSelection.importError", { error: (err as Error).message }));
    }
  };

  const { t } = useTranslation();
  return (
    <div
      id="list-selection-screen"
      className={containerBase + " justify-center"}
    >
      <p
        className={`mb-6 text-center text-base sm:text-lg ${
          darkMode ? "text-yellow-100" : "text-gray-600"
        }`}
      >
        {t("listSelection.instruction")}
      </p>
      <div id="list-buttons-container" className="w-full space-y-4 mb-6">
        {listNames.length === 0 ? (
          <p className="text-gray-500 text-center text-base sm:text-lg">
            {t("listSelection.noLists")}
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
        {t("listSelection.createNew")}
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
        {t("listSelection.importFile")}
      </button>
      <button
        onClick={() => setShowPasteModal(true)}
        className={buttonWarning + " text-base sm:text-lg"}
      >
        {t("listSelection.pasteJson")}
      </button>
      {showPasteModal && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${
            darkMode ? "bg-gray-900 bg-opacity-80" : "bg-gray-700 bg-opacity-60"
          }`}
        >
          <div
            className={
              cardBase +
              ` max-w-md w-full overflow-y-auto ${
                darkMode
                  ? "bg-gray-800 border border-yellow-100 text-yellow-100"
                  : ""
              }`
            }
            role="dialog"
            aria-modal="true"
          >
            <h3
              className={`text-xl font-bold mb-4 text-center ${
                darkMode ? "text-yellow-100" : "text-gray-800"
              }`}
            >
              {t("listSelection.pasteTitle")}
            </h3>
            <textarea
              className={
                inputBase +
                ` mb-4 text-base sm:text-lg ${
                  darkMode
                    ? "bg-gray-900 text-yellow-100 border-yellow-300"
                    : ""
                }`
              }
              rows={8}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder={t("listSelection.pastePlaceholder")}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handlePasteImport}
                className={
                  buttonSuccess + " px-4 py-2 rounded-md font-semibold"
                }
              >
                {t("listSelection.import")}
              </button>
              <button
                onClick={() => setShowPasteModal(false)}
                className={`px-4 py-2 rounded-md font-semibold ${
                  darkMode
                    ? "text-yellow-100 bg-gray-700 hover:bg-gray-600"
                    : "text-gray-700 bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label={t("listSelection.closeModal")}
              >
                <span className="sr-only">{t("listSelection.closeModal")}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${darkMode ? "text-yellow-100" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>{t("listSelection.closeModal")}</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSelectionScreen;
