import { useState } from "react";
import { FolderPlus, Plus } from "lucide-react";
import { uiText } from "../../content/uiText";
import type { AdventureSkills } from "../../types";
import {
  createDraftSkill,
  createFolderWithName,
  upsertSkillInState
} from "../../game/adventureSkills";
import { getFolderPathLabel, type SkillSelection } from "../../game/skillsTree";

type QuickAddMode = "skill" | "folder";

type SkillsQuickAddProps = {
  draftSkills: AdventureSkills;
  selection: SkillSelection;
  onDraftChange: (nextSkills: AdventureSkills) => void;
  onSelect: (selection: SkillSelection) => void;
};

export function SkillsQuickAdd({
  draftSkills,
  selection,
  onDraftChange,
  onSelect
}: SkillsQuickAddProps) {
  const [mode, setMode] = useState<QuickAddMode>("skill");
  const [name, setName] = useState("");

  const parentFolderId = selection?.type === "folder" ? selection.id : null;
  const contextLabel =
    selection?.type === "folder"
      ? getFolderPathLabel(draftSkills, selection.id)
      : uiText.skillsCreateAtRoot;

  function resetName() {
    setName("");
  }

  function handleCreate() {
    if (mode === "folder") {
      const result = createFolderWithName(draftSkills, name, parentFolderId);

      if (!result) {
        return;
      }

      onDraftChange(result.state);
      onSelect({ type: "folder", id: result.folder.id });
      resetName();
      return;
    }

    const trimmed = name.trim();
    const skill = createDraftSkill(draftSkills, parentFolderId, trimmed
      ? {
          title: trimmed,
          description: `Skill sobre ${trimmed}`
        }
      : undefined);

    if (!skill) {
      return;
    }

    onDraftChange(upsertSkillInState(draftSkills, skill));
    onSelect({ type: "skill", id: skill.id });
    resetName();
  }

  return (
    <div className="skills-quick-add">
      <p className="skills-quick-add-context">
        {uiText.skillsCreateInsideLabel}: <strong>{contextLabel}</strong>
      </p>

      <div className="skills-quick-add-modes" role="tablist" aria-label={uiText.skillsQuickAddLabel}>
        <button
          aria-pressed={mode === "skill"}
          className={["skills-quick-add-mode", mode === "skill" ? "is-active" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setMode("skill")}
          type="button"
        >
          <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
          {uiText.skillsNewSkill}
        </button>
        <button
          aria-pressed={mode === "folder"}
          className={["skills-quick-add-mode", mode === "folder" ? "is-active" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setMode("folder")}
          type="button"
        >
          <FolderPlus size={14} strokeWidth={1.8} aria-hidden="true" />
          {uiText.skillsNewFolder}
        </button>
      </div>

      <div className="skills-quick-add-row">
        <input
          aria-label={
            mode === "folder" ? uiText.skillsFolderNameLabel : uiText.skillsTitleLabel
          }
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCreate();
            }
          }}
          placeholder={
            mode === "folder"
              ? uiText.skillsFolderNamePlaceholder
              : uiText.skillsSkillNamePlaceholder
          }
          value={name}
        />
        <button className="settings-add-button" onClick={handleCreate} type="button">
          {mode === "folder" ? uiText.skillsCreateFolder : uiText.skillsCreateSkill}
        </button>
      </div>
    </div>
  );
}
