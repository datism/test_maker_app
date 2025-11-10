import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor = ({ value = "", onChange, placeholder, minHeight = 50 }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current || !editorRef.current) return;

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: [["bold", "italic", "underline"]],
      },
      formats: ["bold", "italic", "underline"],
    });

    quillRef.current = quill;

    if (value) quill.root.innerHTML = value;

    quill.on("text-change", () => {
      const plainText = quill.getText().trim();
      const html = quill.root.innerHTML;
      onChange?.(plainText.length === 0 ? "" : html);
    });
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || "";
    }
  }, [value]);

  return <div ref={editorRef} style={{ minHeight: `${minHeight}px` }} />;
};

export default QuillEditor;