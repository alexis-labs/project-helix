import { useEffect, useMemo, useRef, useState } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import { ChevronRight, FileText, Folder, GripVertical } from "lucide-react";
import { uiText } from "../../content/uiText";
import type { AdventureSkills } from "../../types";
import {
  buildFilteredSkillsTree,
  type SkillTreeNode,
  type SkillSelection
} from "../../game/skillsTree";
import { moveFolderToParent, moveSkillToFolder } from "../../game/adventureSkills";
import { SkillsQuickAdd } from "./SkillsQuickAdd";

type SkillsTreeSidebarProps = {
  draftSkills: AdventureSkills;
  searchQuery: string;
  selection: SkillSelection;
  onDraftChange: (nextSkills: AdventureSkills) => void;
  onSelect: (selection: SkillSelection) => void;
};

function SkillTreeNodeRow({
  node,
  style,
  dragHandle
}: NodeRendererProps<SkillTreeNode>) {
  const data = node.data;
  const Icon = data.type === "folder" ? Folder : FileText;

  return (
    <div
      className={[
        "skills-tree-row",
        node.isSelected ? "is-selected" : "",
        node.isFocused ? "is-focused" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <span
        aria-label="Arrastar"
        className="skills-tree-drag-handle"
        ref={dragHandle}
        role="button"
        tabIndex={-1}
      >
        <GripVertical size={14} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <button
        aria-label={node.isOpen ? "Colapsar" : "Expandir"}
        className={[
          "skills-tree-toggle",
          data.type === "folder" ? "" : "is-hidden"
        ].join(" ")}
        onClick={(event) => {
          event.stopPropagation();
          node.toggle();
        }}
        type="button"
      >
        <ChevronRight
          className={node.isOpen ? "is-open" : ""}
          size={14}
          strokeWidth={1.8}
        />
      </button>
      <button
        className="skills-tree-select-button"
        onClick={() => node.select()}
        type="button"
      >
        <Icon aria-hidden="true" className="skills-tree-icon" size={15} strokeWidth={1.7} />
        <span className="skills-tree-label">{data.name}</span>
      </button>
    </div>
  );
}

export function SkillsTreeSidebar({
  draftSkills,
  searchQuery,
  selection,
  onDraftChange,
  onSelect
}: SkillsTreeSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [treeHeight, setTreeHeight] = useState(320);

  const treeData = useMemo(
    () => buildFilteredSkillsTree(draftSkills, searchQuery),
    [draftSkills, searchQuery]
  );

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const quickAddHeight = 148;
      setTreeHeight(Math.max(160, Math.floor(entry.contentRect.height) - quickAddHeight));
    });

    observer.observe(element);
    const quickAddHeight = 148;
    setTreeHeight(Math.max(160, element.clientHeight - quickAddHeight));

    return () => observer.disconnect();
  }, []);

  function handleMove(args: {
    dragIds: string[];
    parentId: string | null;
  }) {
    let next = draftSkills;

    for (const dragId of args.dragIds) {
      if (draftSkills.skills[dragId]) {
        next = moveSkillToFolder(next, dragId, args.parentId);
      } else if (draftSkills.folders[dragId]) {
        next = moveFolderToParent(next, dragId, args.parentId);
      }
    }

    onDraftChange(next);
  }

  return (
    <div className="skills-tree-panel" ref={containerRef}>
      <div className="skills-tree-scroll">
        {treeData.length === 0 ? (
          <p className="settings-empty-note skills-tree-empty">
            {searchQuery.trim()
              ? "Nenhuma skill corresponde a pesquisa."
              : uiText.skillsTreeEmptyHint}
          </p>
        ) : (
          <Tree<SkillTreeNode>
            data={treeData}
            disableDrop={({ parentNode }) => {
              const parent = parentNode?.data;
              return parent?.type === "skill";
            }}
            height={treeHeight}
            idAccessor="id"
            indent={18}
            onActivate={(node) => {
              onSelect({
                type: node.data.type,
                id: node.data.id
              });
            }}
            onMove={handleMove}
            openByDefault
            rowHeight={36}
            selection={selection?.id}
            width="100%"
          >
            {SkillTreeNodeRow}
          </Tree>
        )}
      </div>

      <SkillsQuickAdd
        draftSkills={draftSkills}
        onDraftChange={onDraftChange}
        onSelect={onSelect}
        selection={selection}
      />
    </div>
  );
}
