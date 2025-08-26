import React, { useState, useEffect, useCallback } from "react";
import { defaultLists, RpgLists } from "./data/defaultLists";

// Função utilitária para importar listas de um arquivo JSON
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

// Interfaces para tipagem dos dados

interface CustomModalProps {
  title: string;
  message: string;
  isConfirm?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ListSelectionScreenProps {
  allRpgLists: RpgLists;
  onSelectList: (listName: string) => void;
  onCreateNewList: () => void;
}

interface CreateListScreenProps {
  onSaveNewList: (name: string, items: string) => Promise<void>;
  onCancel: () => void;
}

interface RandomizerScreenProps {
  currentListName: string;
  allRpgLists: RpgLists;
  onEditList: () => void;
  onBackToLists: () => void;
  showModal: (
    title: string,
    message: string,
    isConfirm?: boolean
  ) => Promise<boolean>;
}

interface EditListScreenProps {
  currentListName: string;
  allRpgLists: RpgLists;
  onSaveList: (editedItems: string[]) => void;
  onDeleteList: (listToDeleteName: string, referencingLists: string[]) => void;
  onCancelEdit: () => void;
  showModal: (
    title: string,
    message: string,
    isConfirm?: boolean
  ) => Promise<boolean>;
}

// Componente para o Modal Customizado
const CustomModal: React.FC<CustomModalProps> = ({
  title,
  message,
  isConfirm = false,
  onConfirm,
  onCancel,
}) => {
  if (!title) return null; // Não renderiza se não houver título (modal oculto)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            OK
          </button>
          {isConfirm && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente da Tela de Seleção de Lista
const ListSelectionScreen: React.FC<
  ListSelectionScreenProps & {
    onImportLists: (lists: RpgLists) => void;
  }
> = ({ allRpgLists, onSelectList, onCreateNewList, onImportLists }) => {
  const listNames = Object.keys(allRpgLists).sort();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [showPasteModal, setShowPasteModal] = React.useState(false);
  const [pastedJson, setPastedJson] = React.useState("");

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

// Componente da Tela de Criação de Nova Lista
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

// Componente da Tela Principal do Randomizador
const RandomizerScreen: React.FC<RandomizerScreenProps> = ({
  currentListName,
  allRpgLists,
  onEditList,
  onBackToLists,
  showModal,
}) => {
  const [resultText, setResultText] = useState<string>(
    `Clique para sortear de "${currentListName}"!`
  );
  const [resultDisplayClass, setResultDisplayClass] = useState<string>(
    "mt-4 p-6 bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
  );

  const randomizeItem = useCallback(async () => {
    let currentPath: string[] = [currentListName];
    let currentItems: string[] = allRpgLists[currentListName]
      ? allRpgLists[currentListName].filter((item) => item.trim() !== "")
      : [];
    let finalItem: string = "";
    let foundFinalItem: boolean = false;
    let maxDepth: number = 10;

    while (!foundFinalItem && maxDepth > 0) {
      maxDepth--;
      if (currentItems.length === 0) {
        await showModal(
          "Erro",
          `A lista "${
            currentPath[currentPath.length - 1]
          }" está vazia ou não existe. Não é possível sortear.`
        );
        setResultText(
          `Erro: Lista vazia em "${currentPath[currentPath.length - 1]}"`
        );
        setResultDisplayClass(
          "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
        );
        return;
      }

      const randomIndex: number = Math.floor(
        Math.random() * currentItems.length
      );
      const selectedItem: string = currentItems[randomIndex];

      if (selectedItem.startsWith("LIST_REF:")) {
        const nextListName: string = selectedItem
          .substring("LIST_REF:".length)
          .trim();
        if (allRpgLists[nextListName]) {
          if (currentPath.includes(nextListName)) {
            await showModal(
              "Erro",
              `Loop de referência detectado com a lista "${nextListName}". Não é possível sortear.`
            );
            setResultText(`Erro: Loop de referência em "${nextListName}"`);
            setResultDisplayClass(
              "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
            );
            return;
          }
          currentPath.push(nextListName);
          currentItems = allRpgLists[nextListName].filter(
            (item) => item.trim() !== ""
          );
        } else {
          await showModal(
            "Erro",
            `Lista aninhada "${nextListName}" não encontrada. Não é possível sortear.`
          );
          setResultText(
            `Erro: Lista aninhada "${nextListName}" não encontrada.`
          );
          setResultDisplayClass(
            "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
          );
          return;
        }
      } else {
        finalItem = selectedItem;
        foundFinalItem = true;
      }
    }

    if (!foundFinalItem) {
      await showModal(
        "Erro",
        "Profundidade máxima de referência atingida. Possível loop ou lista muito complexa."
      );
      setResultText("Erro: Profundidade máxima de referência atingida.");
      setResultDisplayClass(
        "mt-4 p-6 bg-red-400 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
      );
      return;
    }

    setResultText(`${currentPath.join(" -> ")} -> ${finalItem}`);
    setResultDisplayClass(
      "mt-4 p-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-center rounded-xl shadow-lg transform scale-100 opacity-100 flex items-center justify-center min-h-[80px] w-full"
    );
  }, [currentListName, allRpgLists, showModal]);

  return (
    <div id="randomizer-screen" className="flex flex-col items-center p-4">
      <h2
        id="currentListNameTitle"
        className="text-2xl font-bold text-gray-700 mb-4 text-center"
      >
        {currentListName}
      </h2>
      <p className="text-gray-600 mb-4 text-center">
        Clique para sortear um item ou edite a lista.
      </p>
      <button
        onClick={randomizeItem}
        className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mb-4"
      >
        Sortear Item!
      </button>
      <div id="resultDisplay" className={resultDisplayClass}>
        <p className="text-2xl font-extrabold" id="resultText">
          {resultText}
        </p>
      </div>
      <button
        onClick={onEditList}
        className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mt-6"
      >
        Editar Lista
      </button>
      <button
        onClick={onBackToLists}
        className="w-full bg-gray-400 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 mt-4"
      >
        Voltar para Listas
      </button>
    </div>
  );
};

// Componente da Tela de Edição de Lista
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
            placeholder="Ex:&#10;Espada longa&#10;LIST_REF:Monstros Comuns&#10;Dragão"
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

// Componente Principal da Aplicação
const App: React.FC = () => {
  const localStorageKey: string = "rpgAllListsData";

  const [allRpgLists, setAllRpgLists] = useState<RpgLists>({});
  const [currentListName, setCurrentListName] = useState<string>("");
  const [currentScreen, setCurrentScreen] = useState<string>("list-selection"); // 'list-selection', 'create-list', 'randomizer', 'edit-list'

  const [modalInfo, setModalInfo] = useState<
    CustomModalProps & {
      title: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }
  >({
    title: "",
    message: "",
    isConfirm: false,
    onConfirm: () => {},
    onCancel: undefined,
  });

  // Função para exibir o modal customizado
  const showModal = useCallback(
    (
      title: string,
      message: string,
      isConfirm: boolean = false
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        setModalInfo({
          title,
          message,
          isConfirm,
          onConfirm: () => {
            setModalInfo({
              title: "",
              message: "",
              isConfirm: false,
              onConfirm: () => {},
              onCancel: undefined,
            });
            resolve(true);
          },
          onCancel: () => {
            setModalInfo({
              title: "",
              message: "",
              isConfirm: false,
              onConfirm: () => {},
              onCancel: undefined,
            });
            resolve(false);
          },
        });
      });
    },
    []
  );

  // Carrega as listas do localStorage ao iniciar
  useEffect(() => {
    const storedData: string | null = localStorage.getItem(localStorageKey);
    let loadedLists: RpgLists = {};
    if (storedData) {
      try {
        loadedLists = JSON.parse(storedData) as RpgLists;
      } catch (e) {
        console.error(
          "Erro ao carregar dados do localStorage, usando listas padrão:",
          e
        );
      }
    }

    // Garante que as listas padrão existam e sejam adicionadas/mantidas
    Object.keys(defaultLists).forEach((key: string) => {
      if (!loadedLists[key]) {
        loadedLists[key] = defaultLists[key];
      }
    });
    setAllRpgLists(loadedLists);
  }, []); // Removido defaultLists da dependência

  // Salva as listas no localStorage sempre que 'allRpgLists' for alterado
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(allRpgLists));
  }, [allRpgLists]);

  // Handlers para navegação e operações
  const handleSelectList = (listName: string) => {
    setCurrentListName(listName);
    setCurrentScreen("randomizer");
  };

  const handleCreateNewList = () => {
    setCurrentScreen("create-list");
  };

  const handleSaveNewList = async (
    name: string,
    items: string
  ): Promise<void> => {
    if (!name.trim()) {
      await showModal("Erro", "O nome da lista é obrigatório!");
      return;
    }
    if (allRpgLists[name.trim()]) {
      await showModal(
        "Erro",
        `Já existe uma lista com o nome "${name.trim()}". Escolha um nome diferente.`
      );
      return;
    }

    const newItemsParsed: string[] = items
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setAllRpgLists((prev: RpgLists) => ({
      ...prev,
      [name.trim()]: newItemsParsed,
    }));
    setCurrentScreen("list-selection");
  };

  const handleCancelCreateNewList = () => {
    setCurrentScreen("list-selection");
  };

  const handleEditList = () => {
    setCurrentScreen("edit-list");
  };

  const handleSaveEditedList = (editedItems: string[]) => {
    setAllRpgLists((prev: RpgLists) => ({
      ...prev,
      [currentListName]: editedItems,
    }));
    setCurrentScreen("randomizer");
  };

  const handleDeleteList = (
    listToDeleteName: string,
    referencingLists: string[]
  ) => {
    setAllRpgLists((prev: RpgLists) => {
      const newLists: RpgLists = { ...prev };
      // Remove referências em outras listas antes de excluir a lista atual
      referencingLists.forEach((referencingListName: string) => {
        if (newLists[referencingListName]) {
          // Garante que a lista referenciadora ainda exista
          newLists[referencingListName] = newLists[referencingListName].filter(
            (item: string) => {
              if (item.startsWith("LIST_REF:")) {
                const refName: string = item
                  .substring("LIST_REF:".length)
                  .trim();
                return refName !== listToDeleteName;
              }
              return true;
            }
          );
        }
      });
      delete newLists[listToDeleteName];
      return newLists;
    });
    setCurrentListName(""); // Limpa a lista selecionada
    setCurrentScreen("list-selection");
  };

  const handleCancelEdit = () => {
    setCurrentScreen("randomizer");
  };

  const handleBackToLists = () => {
    setCurrentScreen("list-selection");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          🎲 Gerador de Elementos de Campanha RPG
        </h1>

        {currentScreen === "list-selection" && (
          <ListSelectionScreen
            allRpgLists={allRpgLists}
            onSelectList={handleSelectList}
            onCreateNewList={handleCreateNewList}
            onImportLists={(imported) =>
              setAllRpgLists((prev) => ({ ...prev, ...imported }))
            }
          />
        )}
        {currentScreen === "create-list" && (
          <CreateListScreen
            onSaveNewList={handleSaveNewList}
            onCancel={handleCancelCreateNewList}
          />
        )}
        {currentScreen === "randomizer" && (
          <RandomizerScreen
            currentListName={currentListName}
            allRpgLists={allRpgLists}
            onEditList={handleEditList}
            onBackToLists={handleBackToLists}
            showModal={showModal}
          />
        )}
        {currentScreen === "edit-list" && (
          <EditListScreen
            currentListName={currentListName}
            allRpgLists={allRpgLists}
            onSaveList={handleSaveEditedList}
            onDeleteList={handleDeleteList}
            onCancelEdit={handleCancelEdit}
            showModal={showModal}
          />
        )}
      </div>
      <CustomModal {...modalInfo} />
    </div>
  );
};

export default App;
