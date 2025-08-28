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

  const [darkMode, setDarkMode] = useState(false);

  // Handler para alternar idioma
  const handleToggleLocale = () => {
    i18n.changeLanguage(i18n.language === "pt-BR" ? "en" : "pt-BR");
  };

  // Handler para alternar tema
  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

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

  const { t, i18n } = useTranslation();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } relative transition-colors duration-300`}
    >
      {/* Menu fixo no topo */}
      <nav
        className={`w-full flex items-center justify-between px-6 py-3 ${
          darkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-sm"
        } fixed top-0 left-0 z-40 transition-colors duration-300`}
      >
        <div className="flex items-center space-x-4">
          <span
            className={`font-bold text-lg ${
              darkMode ? "text-yellow-300" : "text-indigo-700"
            }`}
          >
            RPG App
          </span>
          {/* Adicione outros itens de menu aqui se desejar */}
        </div>
        <div className="flex items-center space-x-2">
          {/* Ícone de troca de idioma */}
          <button
            onClick={handleToggleLocale}
            className="text-3xl bg-transparent shadow-none p-0 m-0"
            aria-label={
              i18n.language === "pt-BR"
                ? "Switch to English"
                : "Mudar para Português"
            }
          >
            {i18n.language === "pt-BR" ? (
              <span role="img" aria-label="Bandeira do Reino Unido">
                🇬🇧
              </span>
            ) : (
              <span role="img" aria-label="Bandeira do Brasil">
                🇧🇷
              </span>
            )}
          </button>
          {/* Ícone de alternância de tema (lua) */}
          <button
            onClick={handleToggleTheme}
            className={`text-2xl bg-transparent shadow-none p-0 m-0 ${
              darkMode ? "text-yellow-300" : "text-indigo-700"
            }`}
            aria-label={darkMode ? t("theme.light") : t("theme.dark")}
          >
            <span role="img" aria-label="Alternar tema">
              🌙
            </span>
          </button>
          {/* Helper como item do menu, alinhado à direita e centralizado */}
          <button
            onClick={() => setShowHelper(true)}
            className="grid place-items-center p-4 rounded-full bg-indigo-500 hover:bg-indigo-600 shadow"
            aria-label={t("helper.open")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="white"
              viewBox="15 20 60 60"
              stroke="currentColor"
            >
              <title>{t("helper.open")}</title>
              <path d="M46.1,20.5A26.4,26.4,0,0,0,19.8,46.9,27.2,27.2,0,0,0,23.2,60L15.4,72.9a2.9,2.9,0,0,0,.2,3.2,2.9,2.9,0,0,0,2.2,1.1l1-.2,16.6-6A26.4,26.4,0,1,0,46.1,20.5Zm0,47.1a19.8,19.8,0,0,1-9.2-2.2,3,3,0,0,0-2.3-.1L24.4,69l4.5-7.6a2.7,2.7,0,0,0,0-3,20.5,20.5,0,0,1-3.5-11.5A20.8,20.8,0,1,1,46.1,67.6Z" />
              <circle cx="46.1" cy="46.9" r="3.4" />
              <circle cx="57.3" cy="46.9" r="3.4" />
              <circle cx="35" cy="46.9" r="3.4" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Modal Helper */}
      {showHelper && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-60 flex items-center justify-center z-50">
          <div
            className={cardBase + " max-w-lg w-full p-6 relative"}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">
              {t("helper.title")}
            </h2>
            <div className="text-gray-800 text-base whitespace-pre-line mb-4">
              {t("helper.body")}
            </div>
            <button
              onClick={() => setShowHelper(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              aria-label={t("helper.close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>{t("helper.close")}</title>
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
      )}
      {/* Espaço para o conteúdo principal abaixo do menu */}
      <div
        className={`flex flex-col items-center justify-center min-h-screen pt-20 ${
          darkMode ? "bg-gray-900" : ""
        }`}
      >
        <div
          className={containerBase + ` pt-4 min-h-screen ${darkMode ? "" : ""}`}
          role="main"
        >
          <div
            className={
              cardBase + (darkMode ? " bg-gray-800 text-yellow-100" : "")
            }
          >
            <h1
              className={`sm:text-3xl text-2xl font-extrabold mb-6 text-center ${
                darkMode ? "text-yellow-100" : "text-gray-800"
              }`}
            >
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
                darkMode={darkMode}
              />
            )}
            {currentScreen === "create-list" && (
              <CreateListScreen
                onSaveNewList={handleSaveNewList}
                onCancel={handleCancelCreateNewList}
                darkMode={darkMode}
              />
            )}
            {currentScreen === "randomizer" && (
              <RandomizerScreen
                currentListName={currentListName}
                allRpgLists={allRpgLists}
                onEditList={handleEditList}
                onBackToLists={handleBackToLists}
                showModal={showModal}
                darkMode={darkMode}
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
                darkMode={darkMode}
              />
            )}
          </div>
          {/* Modal acessível */}
          <div role="dialog" aria-modal="true">
            <CustomModal {...modalInfo} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
