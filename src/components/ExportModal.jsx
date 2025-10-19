import React, { useState, useRef } from 'react';
import { X, Download } from 'lucide-react';
import exportTestDocx from '../utils/exportToDocx';
import { useProjectsStore } from '../store/useProjectsStore';

function estimateTextWidth(text, fontSize = 12, font = "Times New Roman") {
  const avgCharWidth = 0.6;
  return text.length * fontSize * avgCharWidth;
}

function formatQuestionForDocx(questionText, answers, options = {}) {
  const font = "Times New Roman";
  const fontSize = 12;
  const pageWidth = 500;
  const labeled = answers.map((ans, i) => `${String.fromCharCode(65 + i)}. ${ans}`);
  const widths = labeled.map(ans => estimateTextWidth(ans, fontSize, font));
  const minSpaces = 16;
  const totalWidth = widths.reduce((a, b) => a + b, 0) + minSpaces * 3 * estimateTextWidth(" ", fontSize, font);
  if (totalWidth <= pageWidth) {
    const spaceWidth = estimateTextWidth(" ", fontSize, font);
    const remaining = pageWidth - widths.reduce((a, b) => a + b, 0);
    const spacesBetween = Math.floor(remaining / (3 * spaceWidth));
    const spaceStr = " ".repeat(Math.max(minSpaces, spacesBetween));
    return `${labeled.join(spaceStr)}`;
  }
  const minSpaces2 = 32;
  const line1Width = widths[0] + widths[1] + minSpaces2 * estimateTextWidth(" ", fontSize, font);
  const line2Width = widths[2] + widths[3] + minSpaces2 * estimateTextWidth(" ", fontSize, font);
  if (line1Width <= pageWidth && line2Width <= pageWidth) {
    const spaceWidth = estimateTextWidth(" ", fontSize, font);
    const rem1 = pageWidth - (widths[0] + widths[1]);
    const rem2 = pageWidth - (widths[2] + widths[3]);
    const spacesBetween1 = Math.floor(rem1 / spaceWidth);
    const spacesBetween2 = Math.floor(rem2 / spaceWidth);
    const spaceStr1 = " ".repeat(Math.max(minSpaces2, spacesBetween1));
    const spaceStr2 = " ".repeat(Math.max(minSpaces2, spacesBetween2));
    return `${labeled[0]}${spaceStr1}${labeled[1]}\n${labeled[2]}${spaceStr2}${labeled[3]}`;
  }
  return labeled.join("\n");
}

export default function ExportModal({ open, onClose, test }) {
  const { selectedProject } = useProjectsStore();
  const [headerHtml, setHeaderHtml] = useState('<div style="text-align:center"><b>Your Exam Header</b></div>');
  const editorRef = useRef(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[720px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Export Test to .docx</h3>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900"><X /></button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Header (rich text)</label>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => setHeaderHtml(e.currentTarget.innerHTML)}
            className="border rounded px-3 py-2 min-h-[80px]"
            dangerouslySetInnerHTML={{ __html: headerHtml }}
          />
          <div className="text-xs text-gray-500 mt-1">Use bold, underline, font-size via inline styles (e.g. &lt;span style=\"font-size:18px\"&gt;)</div>
        </div>
        {/* Removed font/spacing/optionsPerRow controls for simplicity */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={() => {
              const chosenTest = test || selectedProject?.masterTest;
              if (!chosenTest) return alert('No test to export');
              if (!Array.isArray(chosenTest.sections) || chosenTest.sections.length === 0) {
                return alert('Selected test has no sections/questions to export. Please add questions or choose a different test.');
              }
              exportTestDocx({ headerHtml, test: chosenTest, filename: `${selectedProject?.name || 'export'}.docx` });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          ><Download size={16} /> Export</button>
        </div>
      </div>
    </div>
  );
}
