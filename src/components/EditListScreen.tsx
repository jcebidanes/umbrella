import React, { useState, useEffect, useCallback } from "react";
import {
  buttonPrimary,
  buttonDanger,
  buttonSuccess,
  inputBase,
  inputSmall,
  containerBase,
  cardBase,
} from "../styles/commonStyles";
import { RpgLists, RpgItem } from "../types/rpgTypes";

interface EditListScreenProps {
  currentListName: string;
  allRpgLists: RpgLists;
  onSaveList: (editedItems: RpgItem[]) => void;
  onDeleteList: (listToDeleteName: string, referencingLists: string[]) => void;
  onCancelEdit: () => void;
  showModal: (
    title: string,
    message: string,
    isConfirm?: boolean
  ) => Promise<boolean>;
}

const EditListScreen: React.FC<EditListScreenProps> = ({
  currentListName,
  allRpgLists,
  onSaveList,
  onDeleteList,
  onCancelEdit,
  showModal,
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "json">("visual");
  const [items, setItems] = useState<RpgItem[]>([]);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [singleAddItemInput, setSingleAddItemInput] = useState<string>("");
  const [singleAddItemPeso, setSingleAddItemPeso] = useState<string>("");
  const [listReferenceSelect, setListReferenceSelect] = useState<string>("");

  useEffect(() => {
    if (activeTab === "json") {
      setJsonContent(JSON.stringify(items, null, 2));
    }
  }, [activeTab, items]);

  useEffect(() => {
    setItems(
      allRpgLists[currentListName] ? [...allRpgLists[currentListName]] : []
    );
    // Removido setEditorContent, não há mais aba texto
    setJsonContent(
      allRpgLists[currentListName]
        ? JSON.stringify(allRpgLists[currentListName], null, 2)
        : "[]"
    );
  }, [currentListName, allRpgLists]);

  const populateListReferenceSelectOptions = useCallback(() => {
    const otherListNames = Object.keys(allRpgLists)
      .filter((name) => name !== currentListName)
      .sort();
    return (
      <>
        <option value="">-- Selecione uma lista --</option>
        {otherListNames.map((listName: string) => (
          <option key={listName} value={listName}>
            {listName}
          </option>
        ))}
      </>
    );
  }, [allRpgLists, currentListName]);

  const handleAddSingleItem = () => {
    if (singleAddItemInput.trim()) {
      setItems((prev: RpgItem[]) => [
        ...prev,
        {
          nome: singleAddItemInput.trim(),
          peso: singleAddItemPeso ? Number(singleAddItemPeso) : undefined,
        },
      ]);
      setSingleAddItemInput("");
      setSingleAddItemPeso("");
    }
  };

  const handleAddListReference = async () => {
    if (!listReferenceSelect) {
      await showModal(
        "Erro",
        "Por favor, selecione uma lista para adicionar como referência."
      );
      return;
    }
    setItems((prev: RpgItem[]) => [
      ...prev,
      { nome: `LIST_REF:${listReferenceSelect}` },
    ]);
    setListReferenceSelect("");
  };

  const handleSave = async () => {
    let editedItems: RpgItem[] = [];
    if (activeTab === "json") {
      try {
        const arr = JSON.parse(jsonContent);
        if (!Array.isArray(arr)) throw new Error();
        editedItems = arr.map((item: any) => ({
          nome: String(item.nome),
          peso: item.peso !== undefined ? Number(item.peso) : undefined,
        }));
      } catch {
        await showModal(
          "Erro",
          "O JSON não é válido ou não é um array de objetos com nome/peso."
        );
        return;
      }
    } else {
      editedItems = items;
    }

    // Validação de LIST_REF
    for (const item of editedItems) {
      if (item.nome.startsWith("LIST_REF:")) {
        const referencedListName: string = item.nome
          .substring("LIST_REF:".length)
          .trim();
        if (
          !allRpgLists[referencedListName] &&
          referencedListName !== currentListName
        ) {
          await showModal(
            "Erro de Validação",
            `A referência de lista "${referencedListName}" não existe. Por favor, corrija ou crie esta lista.`
          );
          return;
        }
      }
    }
    onSaveList(editedItems);
  };

  const handleDelete = async () => {
    const referencingLists: string[] = [];
    for (const otherListName in allRpgLists) {
      if (otherListName === currentListName) continue;
      const itemsInOtherList = allRpgLists[otherListName];
      if (Array.isArray(itemsInOtherList)) {
        if (
          itemsInOtherList.some(
            (item: RpgItem) => item.nome === `LIST_REF:${currentListName}`
          )
        ) {
          referencingLists.push(otherListName);
        }
      }
    }

    let confirmMessage: string = `Tem certeza que deseja excluir a lista "${currentListName}"?`;
    if (referencingLists.length > 0) {
      confirmMessage += `\n\nATENÇÃO: Esta lista está sendo referenciada por ${
        referencingLists.length
      } outra(s) lista(s): ${referencingLists.join(", ")}.`;
      confirmMessage += `\n\nSe você continuar, estas referências serão REMOVIDAS AUTOMATICAMENTE. Deseja prosseguir?`;
    }

    const confirmed = await showModal(
      "Confirmação de Exclusão",
      confirmMessage,
      true
    );
    if (confirmed) {
      onDeleteList(currentListName, referencingLists);
    }
  };

  return (
    <div id="edit-list-screen" className={containerBase}>
      <h2
        id="editListNameTitle"
        className="text-2xl font-bold text-gray-700 mb-4 text-center"
      >
        {currentListName}
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        Edite os itens da lista, incluindo o peso para sorteio ponderado.
      </p>

      <div className={cardBase + " mb-6 space-y-4 bg-gray-50 shadow-inner"}>
        <div className="flex flex-col">
          <label
            htmlFor="singleAddItemInput"
            className="text-gray-700 text-sm font-semibold mb-2"
          >
            Adicionar Item:
          </label>
          <div className="flex items-center mb-2 gap-2">
            <input
              type="text"
              id="singleAddItemInput"
              className={
                "flex-grow p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200 text-base sm:text-lg"
              }
              placeholder="Nome do novo item"
              value={singleAddItemInput}
              onChange={(e) => setSingleAddItemInput(e.target.value)}
            />
            <input
              type="number"
              min="1"
              className="w-20 p-3 border-2 border-gray-300 rounded-xl text-base sm:text-lg"
              placeholder="Peso"
              value={singleAddItemPeso}
              onChange={(e) => setSingleAddItemPeso(e.target.value)}
            />
            <button
              onClick={handleAddSingleItem}
              className="ml-2 flex items-center justify-center bg-blue-600 text-white rounded-xl p-2 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
              style={{ width: 40, height: 40 }}
              aria-label="Adicionar item"
            >
              <span className="sr-only">Adicionar</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>Adicionar</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="listReferenceSelect"
            className="text-gray-700 text-sm font-semibold mb-2"
          >
            Adicionar Referência de Lista:
          </label>
          <div className="flex space-x-2">
            <select
              id="listReferenceSelect"
              className={`flex-grow ${inputBase} bg-white`}
              value={listReferenceSelect}
              onChange={(e) => setListReferenceSelect(e.target.value)}
            >
              {populateListReferenceSelectOptions()}
            </select>
            <button
              onClick={handleAddListReference}
              className={buttonPrimary + " px-4"}
            >
              Adicionar REF
            </button>
          </div>
        </div>
      </div>

      <div className="w-full flex mb-4">
        <button
          onClick={() => setActiveTab("visual")}
          className={`flex-1 py-2 font-bold rounded-tl-xl rounded-bl-xl ${
            activeTab === "visual"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Editor Visual
        </button>
        <button
          onClick={() => setActiveTab("json")}
          className={`flex-1 py-2 font-bold rounded-tr-xl rounded-br-xl ${
            activeTab === "json"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          JSON
        </button>
      </div>

      {activeTab === "visual" && (
        <div className="w-full mb-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[320px] max-w-full">
            <thead>
              <tr>
                <th className="p-2 border-b text-base sm:text-lg">Nome</th>
                <th className="p-2 border-b text-base sm:text-lg">Peso</th>
                <th className="p-2 border-b text-base sm:text-lg">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: RpgItem, idx: number) => (
                <tr key={idx}>
                  <td className="p-2 border-b">
                    <input
                      type="text"
                      className="w-full p-3 min-h-[44px] border rounded-lg text-base sm:text-lg"
                      value={item.nome}
                      onChange={(e) => {
                        const value = e.target.value;
                        setItems((prev: RpgItem[]) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, nome: value } : it
                          )
                        );
                      }}
                    />
                  </td>
                  <td className="p-2 border-b">
                    <input
                      type="number"
                      min="1"
                      className="w-20 p-3 min-h-[44px] border rounded-lg text-base sm:text-lg"
                      value={item.peso === undefined ? "" : item.peso}
                      onChange={(e) => {
                        const value = e.target.value;
                        setItems((prev: RpgItem[]) =>
                          prev.map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  peso:
                                    value === "" ? undefined : Number(value),
                                }
                              : it
                          )
                        );
                      }}
                    />
                  </td>
                  <td className="p-2 border-b">
                    <button
                      type="button"
                      className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 min-h-[44px]"
                      onClick={() =>
                        setItems((prev: RpgItem[]) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      disabled={items.length === 1}
                      aria-label="Remover item"
                    >
                      <span className="sr-only">Remover</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>Remover</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Aba texto removida */}
      {activeTab === "json" && (
        <textarea
          className="w-full p-4 border-2 border-gray-300 rounded-xl font-mono h-64 resize-y mb-6 transition-all duration-200"
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          placeholder="Cole ou edite o JSON da lista aqui..."
        ></textarea>
      )}

      <button
        onClick={handleSave}
        className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-4"
      >
        Salvar Edições e Voltar
      </button>
      <button
        onClick={handleDelete}
        className="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-4"
      >
        Excluir Esta Lista
      </button>
      <button
        onClick={onCancelEdit}
        className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 shadow-md hover:-translate-y-1"
      >
        Cancelar
      </button>
    </div>
  );
};

export default EditListScreen;
