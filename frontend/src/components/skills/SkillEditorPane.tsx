import { lazy, Suspense, useMemo } from "react";
import { Copy, FileText, Folder, Trash2 } from "lucide-react";
import { uiText } from "../../content/uiText";
import type { AdventureSkills, SkillSource } from "../../types";
import {
  countSkillsInFolder,
  getFolderPathLabel,
  type SkillSelection
} from "../../game/skillsTree";
import {
  deleteFolder,
  deleteSkillFromState,
  duplicateSkill,
  renameFolder,
  upsertSkillInState
} from "../../game/adventureSkills";

const SkillContentEditor = lazy(() =>
  import("./SkillContentEditor").then((module) => ({
    default: module.SkillContentEditor
  }))
);

type SkillEditorPaneProps = {
  draftSkills: AdventureSkills;
  selection: SkillSelection;
  theme: "dark" | "light";
  onDraftChange: (nextSkills: AdventureSkills) => void;
  onSelect: (selection: SkillSelection) => void;
  onCreateSkill: (folderId: string | null) => void;
};

const sourceTags: Record<SkillSource, string> = {
  jogador: uiText.diaryTagPlayer,
  externo: uiText.diaryTagExternal,
  descoberta: uiText.diaryTagDiscovery
};

function normalizeSkillDraft(skill: AdventureSkills["skills"][string]) {
  return {
    ...skill,
    title: skill.title.slice(0, 80),
    description: skill.description.slice(0, 240),
    content: skill.content.slice(0, 2000)
  };
}

export function SkillEditorPane({
  draftSkills,
  selection,
  theme,
  onDraftChange,
  onSelect,
  onCreateSkill
}: SkillEditorPaneProps) {
  const selectedSkill = selection?.type === "skill" ? draftSkills.skills[selection.id] : null;
  const selectedFolder =
    selection?.type === "folder" ? draftSkills.folders[selection.id] : null;

  const breadcrumb = useMemo(() => {
    if (selectedSkill) {
      return getFolderPathLabel(draftSkills, selectedSkill.folderId);
    }

    if (selectedFolder) {
      return getFolderPathLabel(draftSkills, selectedFolder.id);
    }

    return "";
  }, [draftSkills, selectedFolder, selectedSkill]);

  function updateSkill(skillId: string, patch: Partial<typeof selectedSkill>) {
    const current = draftSkills.skills[skillId];

    if (!current) {
      return;
    }

    onDraftChange(
      upsertSkillInState(draftSkills, normalizeSkillDraft({ ...current, ...patch }))
    );
  }

  if (!selection) {
    return (
      <div className="skills-editor-panel skills-editor-empty">
        <FileText aria-hidden="true" size={28} strokeWidth={1.5} />
        <h3>{uiText.skillsEditorEmptyTitle}</h3>
        <p>{uiText.skillsEditorEmptyHint}</p>
        <button
          className="settings-add-button"
          onClick={() => onCreateSkill(null)}
          type="button"
        >
          {uiText.skillsNewSkill}
        </button>
      </div>
    );
  }

  if (selectedFolder) {
    const skillCount = countSkillsInFolder(draftSkills, selectedFolder.id);

    return (
      <div className="skills-editor-panel">
        <header className="skills-editor-header">
          <div>
            <p className="skills-editor-eyebrow">{uiText.skillsFolderLabel}</p>
            <h3>{selectedFolder.name}</h3>
            <span className="skills-editor-breadcrumb">{breadcrumb}</span>
          </div>
          <div className="skills-editor-actions">
            <button
              className="settings-add-button"
              onClick={() => onCreateSkill(selectedFolder.id)}
              type="button"
            >
              {uiText.skillsNewInFolder}
            </button>
            <button
              aria-label={uiText.skillsDeleteFolderAriaLabel(selectedFolder.name)}
              className="settings-icon-button"
              onClick={() => {
                if (
                  window.confirm(
                    uiText.skillsDeleteFolderConfirm(selectedFolder.name)
                  )
                ) {
                  onDraftChange(deleteFolder(draftSkills, selectedFolder.id));
                  onSelect(null);
                }
              }}
              type="button"
            >
              <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </header>

        <label className="settings-field">
          <span>{uiText.skillsFolderNameLabel}</span>
          <input
            onChange={(event) =>
              onDraftChange(renameFolder(draftSkills, selectedFolder.id, event.target.value))
            }
            value={selectedFolder.name}
          />
        </label>

        <p className="skills-editor-meta">
          {uiText.skillsFolderSkillCount(skillCount)}
        </p>
      </div>
    );
  }

  if (!selectedSkill) {
    return (
      <div className="skills-editor-panel skills-editor-empty">
        <p>{uiText.skillsMissingSelection}</p>
      </div>
    );
  }

  return (
    <div className="skills-editor-panel">
      <header className="skills-editor-header skills-editor-header--compact">
        <div className="skills-editor-header-copy">
          <p className="skills-editor-eyebrow">{uiText.skillsSkillLabel}</p>
          {breadcrumb ? (
            <span className="skills-editor-breadcrumb">{breadcrumb}</span>
          ) : null}
        </div>
        <div className="skills-editor-actions">
          <span className={`diary-tag diary-tag-${selectedSkill.source}`}>
            {sourceTags[selectedSkill.source]}
          </span>
          <button
            aria-label={uiText.skillsDuplicateAriaLabel(selectedSkill.title)}
            className="settings-icon-button"
            onClick={() => {
              const result = duplicateSkill(draftSkills, selectedSkill.id);

              if (result) {
                onDraftChange(result.state);
                onSelect({ type: "skill", id: result.skill.id });
              }
            }}
            type="button"
          >
            <Copy size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button
            aria-label={uiText.skillsDeleteAriaLabel(selectedSkill.title)}
            className="settings-icon-button"
            onClick={() => {
              onDraftChange(deleteSkillFromState(draftSkills, selectedSkill.id));
              onSelect(null);
            }}
            type="button"
          >
            <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="skills-editor-form">
        <div className="skills-editor-meta-row">
          <label className="settings-field settings-field--compact skills-editor-id-field">
            <span>{uiText.skillsIdLabel}</span>
            <input readOnly value={selectedSkill.id} />
          </label>
          <label className="settings-field skills-editor-title-field">
            <span>{uiText.skillsTitleLabel}</span>
            <input
              onChange={(event) => updateSkill(selectedSkill.id, { title: event.target.value })}
              value={selectedSkill.title}
            />
          </label>
        </div>
        <label className="settings-field skills-editor-description-field">
          <span>{uiText.skillsDescriptionLabel}</span>
          <textarea
            onChange={(event) =>
              updateSkill(selectedSkill.id, { description: event.target.value })
            }
            rows={2}
            value={selectedSkill.description}
          />
        </label>
      </div>

      <div className="skills-editor-content">
        <span className="skills-editor-content-label">{uiText.skillsContentLabel}</span>
        <Suspense fallback={<p className="skills-editor-loading">{uiText.skillsEditorLoading}</p>}>
          <SkillContentEditor
            onChange={(content) => updateSkill(selectedSkill.id, { content })}
            theme={theme}
            value={selectedSkill.content}
          />
        </Suspense>
      </div>
    </div>
  );
}
