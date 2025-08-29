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

  // Fecha modal helper com ESC
  useEffect(() => {
    if (!showHelper) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHelper(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHelper]);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } relative transition-colors duration-300`}
    >
      {/* Menu no topo (não fixo) */}
      <nav
        className={`w-full flex items-center justify-between px-3 py-1 ${
          darkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-sm"
        } transition-colors duration-300`}
      >
        <div className="flex items-center space-x-4">
          <span
            className={`font-bold text-lg ${
              darkMode ? "text-yellow-100" : "text-black-700"
            }`}
          >
            {t("appTitle")}
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
            className={`text-3xl bg-transparent shadow-none p-0 m-0 ${
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
            className="text-3xl bg-transparent shadow-none p-0 m-0 "
            aria-label={t("helper.open")}
          >
            <span role="img" aria-label="Helper">
              🆘
            </span>
          </button>
        </div>
      </nav>
      {/* Modal Helper */}
      {showHelper && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center ${
            darkMode ? "bg-gray-900 bg-opacity-80" : "bg-gray-700 bg-opacity-60"
          }`}
        >
          <div
            className={`rounded-xl px-2 py-2 w-full max-w-lg shadow-xl border flex flex-col items-center relative ${
              darkMode
                ? "bg-gray-800 text-yellow-100 border-yellow-100"
                : "bg-gray-100 text-gray-800 border-gray-300"
            }`}
            role="dialog"
            aria-modal="true"
            style={{
              maxHeight: "95vh",
              minHeight: "180px",
              height: "auto",
              overflow: "hidden",
              margin: "0 0.5rem",
              boxSizing: "border-box",
              justifyContent: "center",
            }}
          >
            <h2
              className={`text-2xl font-bold mb-2 text-center ${
                darkMode ? "text-yellow-200" : "text-indigo-700"
              }`}
            >
              {t("helper.title")}
            </h2>
            <div
              className={`text-base whitespace-pre-line mb-2 w-full`}
              style={{
                wordBreak: "break-word",
                paddingBottom: "0.5rem",
                maxHeight: "60vh",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {t("helper.body")}
            </div>
            <button
              onClick={() => setShowHelper(false)}
              className={`w-full max-w-xs px-4 py-2 rounded-lg font-bold ${
                darkMode
                  ? "bg-yellow-100 text-gray-800"
                  : "bg-gray-800 text-yellow-100"
              }`}
              style={{ marginBottom: 0 }}
              aria-label={t("helper.close")}
            >
              {t("helper.close")}
            </button>
          </div>
        </div>
      )}
      {/* Conteúdo Principal */}
      <div className="p-4">
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
      </div>
      {/* Modal Customizado */}
      <CustomModal
        title={modalInfo.title}
        message={modalInfo.message}
        isConfirm={modalInfo.isConfirm}
        onConfirm={modalInfo.onConfirm}
        onCancel={modalInfo.onCancel}
      />
    </div>
  );
};

export default App;
