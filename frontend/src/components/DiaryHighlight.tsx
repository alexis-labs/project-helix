import { Fragment } from "react";
import { escapeRegExp } from "../game/diaryEntries";

type DiaryHighlightProps = {
  query: string;
  text: string;
};

export function DiaryHighlight({ query, text }: DiaryHighlightProps) {
  const trimmed = query.trim();

  if (!trimmed) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${escapeRegExp(trimmed)})`, "gi");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark className="diary-mark" key={`${index}-${part.slice(0, 8)}`}>
            {part}
          </mark>
        ) : (
          <Fragment key={`${index}-plain`}>{part}</Fragment>
        )
      )}
    </>
  );
}
