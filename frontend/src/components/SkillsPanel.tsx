import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { uiText } from "../content/uiText";
import { listSkills } from "../game/adventureSkills";
import { getFolderPathLabel } from "../game/skillsTree";
import type { AdventureSkills, SkillSource } from "../types";

type SkillsPanelProps = {
  skills: AdventureSkills;
  onAddSkill: (input: { title: string; description: string; content: string }) => void;
};

const sourceTags: Record<SkillSource, string> = {
  jogador: uiText.diaryTagPlayer,
  externo: uiText.diaryTagExternal,
  descoberta: uiText.diaryTagDiscovery
};

export function SkillsPanel({ skills, onAddSkill }: SkillsPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const notes = useMemo(
    () =>
      listSkills(skills).sort((left, right) =>
        left.title.localeCompare(right.title, "pt")
      ),
    [skills]
  );

  function addSkill() {
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    const nextContent = content.trim();

    if (!nextTitle || !nextDescription || !nextContent) {
      return;
    }

    onAddSkill({
      title: nextTitle,
      description: nextDescription,
      content: nextContent
    });
    setTitle("");
    setDescription("");
    setContent("");
  }

  return (
    <section aria-label={uiText.skillsAriaLabel} className="diary-view">
      <h2 className="diary-view-title">{uiText.skillsTitle}</h2>
      <div className="diary-add-row skills-add-grid">
        <label className="diary-add-field">
          <span>{uiText.skillsTitleLabel}</span>
          <input
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
        </label>
        <label className="diary-add-field">
          <span>{uiText.skillsDescriptionLabel}</span>
          <input
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>
        <label className="diary-add-field">
          <span>{uiText.skillsContentLabel}</span>
          <input
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addSkill();
              }
            }}
            value={content}
          />
        </label>
        <button
          aria-label={uiText.skillsAddAriaLabel}
          className="diary-add-button"
          onClick={addSkill}
          type="button"
        >
          <Plus size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="diary-view-empty">{uiText.skillsEmpty}</p>
      ) : (
        <ul className="diary-view-list">
          {notes.map((skill) => (
            <li className="diary-note" key={skill.id}>
              <p className="diary-note-title">{skill.title}</p>
              <p className="diary-note-breadcrumb">
                {getFolderPathLabel(skills, skill.folderId)}
              </p>
              <p className="diary-note-text">{skill.description}</p>
              <p className="diary-note-content">{skill.content}</p>
              <span className={`diary-tag diary-tag-${skill.source}`}>
                {sourceTags[skill.source]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
