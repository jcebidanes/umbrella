import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./i18n";
import { containerBase, cardBase } from "./styles/commonStyles";
import ListSelectionScreen from "./components/ListSelectionScreen";
import CreateListScreen from "./components/CreateListScreen";
import EditListScreen from "./components/EditListScreen";
import RandomizerScreen from "./components/RandomizerScreen";
import CustomModal, { CustomModalProps } from "./components/CustomModal";
import { RpgLists, RpgItem } from "./types/rpgTypes";
import { defaultLists } from "./data/defaultLists";

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
    items: RpgItem[]
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
    // Filtra itens com nome vazio
    const newItemsParsed: RpgItem[] = items.filter(
      (item) => item.nome.trim() !== ""
    );
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

  const handleSaveEditedList = (editedItems: RpgItem[]) => {
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
            (item: RpgItem) => {
              if (item.nome.startsWith("LIST_REF:")) {
                const refName: string = item.nome
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

  const { t } = useTranslation();
  return (
    <div className={containerBase + " pt-4 min-h-screen"} role="main">
      <div className={cardBase}>
        <h1 className="sm:text-3xl text-2xl font-extrabold text-gray-800 mb-6 text-center">
          {t("appTitle")}
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
      {/* Modal acessível */}
      <div role="dialog" aria-modal="true">
        <CustomModal {...modalInfo} />
      </div>
    </div>
  );
};

export default App;
