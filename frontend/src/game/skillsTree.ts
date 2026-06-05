import type { AdventureSkills, SkillFolder } from "../types";
import {
  listFolders,
  listSkills,
  moveFolderToParent,
  moveSkillToFolder
} from "./adventureSkills";

export type SkillTreeNodeType = "folder" | "skill";

export type SkillTreeNode = {
  id: string;
  name: string;
  type: SkillTreeNodeType;
  folderId: string | null;
  parentId: string | null;
  children?: SkillTreeNode[];
};

export type SkillSelection =
  | { type: "folder"; id: string }
  | { type: "skill"; id: string }
  | null;

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, "pt")
  );
}

export function getFolderPath(
  state: AdventureSkills,
  folderId: string | null
): SkillFolder[] {
  if (!folderId) {
    return [];
  }

  const path: SkillFolder[] = [];
  let current: SkillFolder | null = state.folders[folderId] ?? null;

  while (current) {
    path.unshift(current);
    current = current.parentId ? state.folders[current.parentId] ?? null : null;
  }

  return path;
}

export function getFolderPathLabel(state: AdventureSkills, folderId: string | null) {
  const path = getFolderPath(state, folderId);

  if (path.length === 0) {
    return "Raiz";
  }

  return path.map((folder) => folder.name).join(" / ");
}

export function countSkillsInFolder(state: AdventureSkills, folderId: string) {
  const descendants = new Set<string>([folderId]);

  for (const folder of listFolders(state)) {
    if (folder.parentId && descendants.has(folder.parentId)) {
      descendants.add(folder.id);
    }
  }

  let changed = true;

  while (changed) {
    changed = false;

    for (const folder of listFolders(state)) {
      if (folder.parentId && descendants.has(folder.parentId) && !descendants.has(folder.id)) {
        descendants.add(folder.id);
        changed = true;
      }
    }
  }

  return listSkills(state).filter(
    (skill) => skill.folderId && descendants.has(skill.folderId)
  ).length;
}

function buildFolderBranch(
  state: AdventureSkills,
  folder: SkillFolder
): SkillTreeNode {
  const childFolders = sortByName(
    listFolders(state).filter((entry) => entry.parentId === folder.id)
  );
  const childSkills = sortByName(
    listSkills(state)
      .filter((skill) => skill.folderId === folder.id)
      .map((skill) => ({
        name: skill.title || skill.id,
        node: {
          id: skill.id,
          name: skill.title || skill.id,
          type: "skill" as const,
          folderId: skill.folderId,
          parentId: folder.id
        }
      }))
  ).map((entry) => entry.node);

  return {
    id: folder.id,
    name: folder.name,
    type: "folder",
    folderId: folder.id,
    parentId: folder.parentId,
    children: [
      ...childFolders.map((child) => buildFolderBranch(state, child)),
      ...childSkills
    ]
  };
}

export function buildSkillsTreeNodes(state: AdventureSkills): SkillTreeNode[] {
  const rootFolders = sortByName(
    listFolders(state).filter((folder) => folder.parentId === null)
  );
  const rootSkills = sortByName(
    listSkills(state)
      .filter((skill) => !skill.folderId)
      .map((skill) => ({
        name: skill.title || skill.id,
        node: {
          id: skill.id,
          name: skill.title || skill.id,
          type: "skill" as const,
          folderId: null,
          parentId: null
        }
      }))
  ).map((entry) => entry.node);

  return [
    ...rootFolders.map((folder) => buildFolderBranch(state, folder)),
    ...rootSkills
  ];
}

function flattenTree(nodes: SkillTreeNode[]): SkillTreeNode[] {
  const flat: SkillTreeNode[] = [];

  for (const node of nodes) {
    flat.push(node);

    if (node.children?.length) {
      flat.push(...flattenTree(node.children));
    }
  }

  return flat;
}

function nodeMatchesQuery(node: SkillTreeNode, query: string) {
  const haystack = node.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const tokens = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  return tokens.every((token) => haystack.includes(token));
}

function filterTreeNodes(nodes: SkillTreeNode[], query: string): SkillTreeNode[] {
  if (!query.trim()) {
    return nodes;
  }

  const filtered: SkillTreeNode[] = [];

  for (const node of nodes) {
    const children = node.children ? filterTreeNodes(node.children, query) : [];
    const matches = nodeMatchesQuery(node, query);

    if (matches || children.length > 0) {
      filtered.push({
        ...node,
        children
      });
    }
  }

  return filtered;
}

export function buildFilteredSkillsTree(
  state: AdventureSkills,
  query: string
): SkillTreeNode[] {
  return filterTreeNodes(buildSkillsTreeNodes(state), query.trim());
}

export function findTreeNode(
  nodes: SkillTreeNode[],
  id: string
): SkillTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children?.length) {
      const match = findTreeNode(node.children, id);

      if (match) {
        return match;
      }
    }
  }

  return null;
}

export function resolveDropTarget(
  state: AdventureSkills,
  draggedId: string,
  draggedType: SkillTreeNodeType,
  targetId: string,
  targetType: SkillTreeNodeType
): AdventureSkills {
  if (draggedId === targetId) {
    return state;
  }

  if (draggedType === "skill") {
    if (targetType === "folder") {
      return moveSkillToFolder(state, draggedId, targetId);
    }

    if (targetType === "skill") {
      const targetSkill = state.skills[targetId];
      return moveSkillToFolder(state, draggedId, targetSkill?.folderId ?? null);
    }

    return state;
  }

  if (draggedType === "folder" && targetType === "folder") {
    return moveFolderToParent(state, draggedId, targetId);
  }

  if (draggedType === "folder" && targetType === "skill") {
    const targetSkill = state.skills[targetId];
    return moveFolderToParent(state, draggedId, targetSkill?.folderId ?? null);
  }

  return state;
}

export function getAllTreeNodeIds(nodes: SkillTreeNode[]): string[] {
  return flattenTree(nodes).map((node) => node.id);
}
