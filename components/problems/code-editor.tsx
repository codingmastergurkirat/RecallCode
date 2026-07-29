"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((module) => module.default),
  {
    ssr: false,
    loading: () => (
      <div className="editor-loading">
        <span />
        Loading editor…
      </div>
    ),
  },
);

export function CodeEditor({
  language,
  value,
  onChange,
}: {
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () =>
      setDark(document.documentElement.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      theme={dark ? "vs-dark" : "light"}
      options={{
        minimap: { enabled: false },
        fontFamily: "var(--font-geist-mono), monospace",
        fontSize: 14,
        lineHeight: 23,
        padding: { top: 18, bottom: 18 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 2,
        renderLineHighlight: "line",
        bracketPairColorization: { enabled: false },
      }}
    />
  );
}
