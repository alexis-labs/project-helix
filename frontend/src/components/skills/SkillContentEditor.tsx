import Editor from "@monaco-editor/react";
import { useMemo } from "react";

type SkillContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  theme: "dark" | "light";
};

export function SkillContentEditor({
  value,
  onChange,
  theme
}: SkillContentEditorProps) {
  const editorTheme = useMemo(
    () => (theme === "light" ? "vs" : "vs-dark"),
    [theme]
  );

  return (
    <div className="skills-monaco-shell">
      <Editor
        height="100%"
        language="markdown"
        onChange={(nextValue) => onChange(nextValue ?? "")}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: { top: 12, bottom: 12 },
          automaticLayout: true
        }}
        theme={editorTheme}
        value={value}
      />
    </div>
  );
}
