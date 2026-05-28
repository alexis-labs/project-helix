import { uiText } from "../content/uiText";

export function GameHeader() {
  const titleSplitIndex = 5;
  const titleStart = uiText.title.slice(0, titleSplitIndex);
  const titleEnd = uiText.title.slice(titleSplitIndex);

  return (
    <header className="title-block">
      <div>
        <h1 aria-label={uiText.title}>
          <span aria-hidden="true" className="title-word">
            <span className="title-word-start">{titleStart}</span>
            <span className="title-word-end">{titleEnd}</span>
          </span>
        </h1>
        <p>{uiText.subtitle}</p>
      </div>
    </header>
  );
}
