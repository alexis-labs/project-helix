import { useState } from "react";
import { Search } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { uiText } from "../../content/uiText";
import type { AdventureSkills } from "../../types";
import { createDraftSkill, upsertSkillInState } from "../../game/adventureSkills";
import type { SkillSelection } from "../../game/skillsTree";
import { SkillEditorPane } from "./SkillEditorPane";
import { SkillsTreeSidebar } from "./SkillsTreeSidebar";

type SkillsWorkbenchProps = {
  draftSkills: AdventureSkills;
  theme: "dark" | "light";
  onDraftChange: (nextSkills: AdventureSkills) => void;
};

export function SkillsWorkbench({
  draftSkills,
  theme,
  onDraftChange
}: SkillsWorkbenchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selection, setSelection] = useState<SkillSelection>(null);

  function createSkillInFolder(folderId: string | null) {
    const skill = createDraftSkill(draftSkills, folderId);

    if (!skill) {
      return;
    }

    onDraftChange(upsertSkillInState(draftSkills, skill));
    setSelection({ type: "skill", id: skill.id });
  }

  return (
    <section
      aria-label={uiText.skillsSettingsLabel}
      className="settings-section skills-workbench-section"
    >
      <div className="skills-workbench-toolbar">
        <label className="skills-workbench-search">
          <Search aria-hidden="true" size={16} strokeWidth={1.8} />
          <input
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={uiText.skillsSearchPlaceholder}
            value={searchQuery}
          />
        </label>
        <p className="skills-workbench-hint">{uiText.skillsWorkbenchHint}</p>
      </div>

      <Group className="skills-workbench" orientation="horizontal">
        <Panel className="skills-workbench-tree-wrap" defaultSize={34} minSize={28}>
          <SkillsTreeSidebar
            draftSkills={draftSkills}
            onDraftChange={onDraftChange}
            onSelect={setSelection}
            searchQuery={searchQuery}
            selection={selection}
          />
        </Panel>
        <Separator className="skills-workbench-resize-handle" />
        <Panel className="skills-workbench-editor-wrap" defaultSize={66} minSize={40}>
          <SkillEditorPane
            draftSkills={draftSkills}
            onCreateSkill={createSkillInFolder}
            onDraftChange={onDraftChange}
            onSelect={setSelection}
            selection={selection}
            theme={theme}
          />
        </Panel>
      </Group>
    </section>
  );
}
