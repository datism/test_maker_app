import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import JSZip from 'jszip';
import exportTestDocx from '../utils/exportToDocx';
import { useProjectsStore } from '../store/useProjectsStore';

export default function ExportModal({ open, onClose, test }) {
  const { selectedProject } = useProjectsStore();
  const [instructions, setInstructions] = useState({});

  useEffect(() => {
    if (open) {
      // Reset instructions when modal opens
      setInstructions({});
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[720px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Export Test to .docx</h3>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900"><X /></button>
        </div>
        {(test || selectedProject?.masterTest)?.sections?.map((section, index) => (
          <div className="mb-4" key={section.sectionId || index}>
            <label className="block text-sm font-medium mb-1">
              Instruction for Section: {section.sectionName || `Section ${index + 1}`} (optional)
            </label>
            <textarea
              value={instructions[section.sectionId || index] || ''}
              onChange={(e) => {
                const newInstructions = { ...instructions };
                newInstructions[section.sectionId || index] = e.target.value;
                setInstructions(newInstructions);
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Answer all questions in this section."
            />
          </div>
        ))}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button
            onClick={async () => {
              if (test) { // Handle single test export
                const testWithInstructions = {
                  ...test,
                  sections: test.sections.map((section, index) => ({
                    ...section,
                    instruction: instructions[section.sectionId || index] || '',
                  })),
                };
                if (!Array.isArray(testWithInstructions.sections) || testWithInstructions.sections.length === 0) {
                  return alert('Selected test has no sections/questions to export.');
                }
                const projectName = (selectedProject?.name || 'project').replace(/ /g, '_');
                const testName = (test?.name || 'test').replace(/ /g, '_');
                const filename = `${projectName}_${testName}.docx`;
                await exportTestDocx({ test: testWithInstructions, filename });
              } else { // Handle "Export All"
                const allTests = selectedProject.tests || [];
                if (allTests.length === 0) {
                  return alert('No tests in this project to export.');
                }
                const zip = new JSZip();
                for (const singleTest of allTests) {
                  const testWithInstructions = {
                    ...singleTest,
                    sections: singleTest.sections.map(s => ({ ...s, instruction: instructions[s.sectionId] || '' })),
                  };
                  if (!Array.isArray(testWithInstructions.sections) || testWithInstructions.sections.length === 0) {
                    console.warn(`Skipping test "${singleTest.name}" because it has no sections.`);
                    continue;
                  }
                  const projectName = (selectedProject?.name || 'project').replace(/ /g, '_');
                  const testName = (singleTest?.name || 'test').replace(/ /g, '_');
                  const filename = `${projectName}_${testName}.docx`;
                  const blob = await exportTestDocx({ test: testWithInstructions, returnBlob: true });
                  if (blob) {
                    zip.file(filename, blob);
                  }
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                saveAs(zipBlob, `${(selectedProject?.name || 'project').replace(/ /g, '_')}_all_tests.zip`);
              }

              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          ><Download size={16} /> Export</button>
        </div>
      </div>
    </div>
  );
}
