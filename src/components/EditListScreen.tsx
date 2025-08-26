import React, { useState, useEffect, useCallback } from "react";

interface EditListScreenProps {
  currentListName: string;
  allRpgLists: { [key: string]: string[] };
  onSaveList: (editedItems: string[]) => void;
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
  const [activeTab, setActiveTab] = useState<"text" | "json">("text");
  const [editorContent, setEditorContent] = useState<string>("");
  const [jsonContent, setJsonContent] = useState<string>("");
  const [singleAddItemInput, setSingleAddItemInput] = useState<string>("");
  const [listReferenceSelect, setListReferenceSelect] = useState<string>("");

  useEffect(() => {
    if (activeTab === "json") {
      // Atualiza JSON ao mudar para aba JSON
      try {
        const arr = editorContent
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item !== "");
        setJsonContent(JSON.stringify(arr, null, 2));
      } catch {
        setJsonContent("[]");
      }
    } else {
      // Atualiza texto ao mudar para aba texto
      try {
        const arr = JSON.parse(jsonContent);
        if (Array.isArray(arr)) {
          setEditorContent(arr.join("\n"));
        }
      } catch {
        // ignora erro
      }
    }
  }, [activeTab]);

  useEffect(() => {
    // Preenche o editor de texto com a lista atual ao carregar a tela de edição
    setEditorContent(
      allRpgLists[currentListName]
        ? allRpgLists[currentListName].join("\n")
        : ""
    );
  }, [currentListName, allRpgLists]);

  // Preenche o dropdown de referências de lista
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
      setEditorContent(
        (prev) => (prev ? prev + "\n" : "") + singleAddItemInput.trim()
      );
      setSingleAddItemInput("");
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
    setEditorContent(
      (prev) => (prev ? prev + "\n" : "") + `LIST_REF:${listReferenceSelect}`
    );
    setListReferenceSelect("");
  };

  const handleSave = async () => {
    let editedItems: string[] = [];
    if (activeTab === "json") {
      try {
        const arr = JSON.parse(jsonContent);
        if (!Array.isArray(arr)) throw new Error();
        editedItems = arr.map((item: string) => String(item));
      } catch {
        await showModal(
          "Erro",
          "O JSON não é válido ou não é um array de strings."
        );
        return;
      }
    } else {
      editedItems = editorContent
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }

    // Validação de LIST_REF
    for (const item of editedItems) {
      if (item.startsWith("LIST_REF:")) {
        const referencedListName: string = item
          .substring("LIST_REF:".length)
          .trim();
        // Verifica se a lista referenciada existe E não é uma auto-referência
        if (
          !allRpgLists[referencedListName] &&
          referencedListName !== currentListName
        ) {
          await showModal(
            "Erro de Validação",
            `A referência de lista "${referencedListName}" não existe. Por favor, corrija ou crie esta lista.`
          );
          return; // Impede que a lista seja salva
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
            (item) => item === `LIST_REF:${currentListName}`
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
    <div id="edit-list-screen" className="flex flex-col items-center p-4">
      <h2
        id="editListNameTitle"
        className="text-2xl font-bold text-gray-700 mb-4 text-center"
      >
        {currentListName}
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        Edite os itens da lista (um item por linha) ou use as opções de adição
        abaixo.
      </p>

      <div className="w-full bg-gray-50 p-4 rounded-xl shadow-inner mb-6 space-y-4">
        <div className="flex flex-col">
          <label
            htmlFor="singleAddItemInput"
            className="text-gray-700 text-sm font-semibold mb-2"
          >
            Adicionar Item Simples:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="singleAddItemInput"
              className="flex-grow p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-200"
              placeholder="Nome do novo item"
              value={singleAddItemInput}
              onChange={(e) => setSingleAddItemInput(e.target.value)}
            />
            <button
              onClick={handleAddSingleItem}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
            >
              Adicionar
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
              className="flex-grow p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white transition-all duration-200"
              value={listReferenceSelect}
              onChange={(e) => setListReferenceSelect(e.target.value)}
            >
              {populateListReferenceSelectOptions()}
            </select>
            <button
              onClick={handleAddListReference}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200"
            >
              Adicionar REF
            </button>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-2 text-center text-sm">
        Edição em massa: um item por linha. (
        <code className="bg-gray-200 p-1 rounded-md text-xs">
          LIST_REF:Nome da Outra Lista
        </code>{" "}
        para referências)
      </p>
      <div className="w-full flex mb-4">
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 py-2 font-bold rounded-tl-xl rounded-bl-xl ${
            activeTab === "text"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Itens (Texto)
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
      {activeTab === "text" ? (
        <>
          {/* ...editor tradicional... */}
          <textarea
            id="itemListEditor"
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 h-64 resize-y mb-6 transition-all duration-200"
            placeholder="Ex:\nEspada longa\nLIST_REF:Monstros Comuns\nDragão"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
          ></textarea>
        </>
      ) : (
        <>
          <textarea
            className="w-full p-4 border-2 border-gray-300 rounded-xl font-mono h-64 resize-y mb-6 transition-all duration-200"
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            placeholder="Cole ou edite o JSON da lista aqui..."
          ></textarea>
        </>
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
