import { useEffect, useRef, useState } from "react";
import { LogOut, Play, RotateCcw } from "lucide-react";
import { uiText } from "../content/uiText";

type MainMenuProps = {
  canContinue: boolean;
  onNewGame: () => void;
  onContinue: () => void;
};

export function MainMenu({ canContinue, onNewGame, onContinue }: MainMenuProps) {
  const [exitHint, setExitHint] = useState("");
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const confirmDialogRef = useRef<HTMLDialogElement>(null);
  const titleSplitIndex = 5;
  const titleStart = uiText.title.slice(0, titleSplitIndex);
  const titleEnd = uiText.title.slice(titleSplitIndex);

  useEffect(() => {
    const dialog = confirmDialogRef.current;

    if (!dialog) {
      return;
    }

    if (showNewGameConfirm) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
  }, [showNewGameConfirm]);

  function handleNewGameClick() {
    if (canContinue) {
      setShowNewGameConfirm(true);
      return;
    }

    onNewGame();
  }

  function confirmNewGame() {
    setShowNewGameConfirm(false);
    onNewGame();
  }

  function cancelNewGame() {
    setShowNewGameConfirm(false);
  }

  function handleExit() {
    window.close();
    setExitHint(uiText.menuExitHint);
  }

  return (
    <main className="main-menu" aria-label={uiText.menuAriaLabel}>
      <div className="main-menu-vignette" aria-hidden="true" />

      <div className="main-menu-inner">
        <header className="main-menu-title">
          <h1 aria-label={uiText.title}>
            <span aria-hidden="true" className="title-word">
              <span className="title-word-start">{titleStart}</span>
              <span className="title-word-end">{titleEnd}</span>
            </span>
          </h1>
          <p className="main-menu-subtitle">{uiText.subtitle}</p>
        </header>

        <nav className="main-menu-actions" aria-label={uiText.menuActionsAriaLabel}>
          <button
            type="button"
            className="main-menu-button main-menu-button--primary"
            onClick={handleNewGameClick}
          >
            <Play aria-hidden="true" size={18} strokeWidth={2.25} />
            <span>{uiText.menuNewGame}</span>
          </button>

          <button
            type="button"
            className="main-menu-button"
            disabled={!canContinue}
            title={canContinue ? undefined : uiText.menuContinueDisabledHint}
            onClick={onContinue}
          >
            <RotateCcw aria-hidden="true" size={18} strokeWidth={2.25} />
            <span>{uiText.menuContinue}</span>
          </button>

          <button
            type="button"
            className="main-menu-button main-menu-button--muted"
            onClick={handleExit}
          >
            <LogOut aria-hidden="true" size={18} strokeWidth={2.25} />
            <span>{uiText.menuExit}</span>
          </button>
        </nav>

        {!canContinue ? (
          <p className="main-menu-note">{uiText.menuContinueDisabledHint}</p>
        ) : null}

        {exitHint ? <p className="main-menu-note">{exitHint}</p> : null}
      </div>

      <dialog
        ref={confirmDialogRef}
        className="main-menu-dialog"
        aria-labelledby="new-game-confirm-title"
        aria-describedby="new-game-confirm-message"
        onCancel={cancelNewGame}
        onClose={cancelNewGame}
      >
        <div className="main-menu-dialog-panel">
          <h2 id="new-game-confirm-title">{uiText.menuNewGameConfirmTitle}</h2>
          <p id="new-game-confirm-message">{uiText.menuNewGameConfirmMessage}</p>
          <div className="main-menu-dialog-actions">
            <button
              type="button"
              className="main-menu-button"
              onClick={cancelNewGame}
            >
              {uiText.menuNewGameConfirmNo}
            </button>
            <button
              type="button"
              className="main-menu-button main-menu-button--primary"
              onClick={confirmNewGame}
            >
              {uiText.menuNewGameConfirmYes}
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
