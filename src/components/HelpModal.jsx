import React, { useEffect } from 'react';
import { ListChecks, Edit3, BookOpen, FileText } from 'lucide-react';

export default function HelpModal({ show, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (show) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[80vh] overflow-auto ring-1 ring-gray-100 text-left">
        <header className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Quick Start</h3>
            <p className="text-sm text-gray-600 mt-1">Create projects, add questions, generate shuffled tests, preview and export.</p>
          </div>
        </header>

        <div className="text-sm text-gray-700 space-y-6">
          {/* Glossary as cards */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Glossary</div>
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Project</div>
                  <div className="text-sm text-gray-600 mt-1">Container for related assessments: name, description, sections, Master Test, and Tests.</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Master Test</div>
                  <div className="text-sm text-gray-600 mt-1">Canonical template (question pool by section) used to generate Tests.</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Test</div>
                  <div className="text-sm text-gray-600 mt-1">An assembled assessment (manual or generated); previewable and exportable.</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Section</div>
                  <div className="text-sm text-gray-600 mt-1">Named group in a project that holds related questions.</div>
                </div>
                <div className="sm:col-span-2 bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Question</div>
                  <div className="text-sm text-gray-600 mt-1">Single item in a section: MCQ, Fill‑in‑the‑Blank, Reading, or Writing.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Create project/test */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Create a Project</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Click <em>New Project</em>.</li>
                  <li>Enter name, optional description, and add sections.</li>
                  <li>Click <em>Create Project</em>. A Master Test is created automatically.</li>
                </ol>
              </div>
            </div>
            <div className="mt-3 grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Create a Test</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Open the project.</li>
                  <li>Click <em>Add Test</em> to create a blank test instance.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Add/Edit Questions (kept improved layout) */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Add / Edit Questions</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <h5 className="text-sm font-medium text-gray-800">Quick steps</h5>
                    <ol className="list-decimal list-inside mt-2 text-sm text-gray-700 space-y-1">
                      <li>Open the <em>Test</em> you want to edit.</li>
                      <li>Click <em>Add Question</em> or the <em>edit</em> icon to open the wizard.</li>
                      <li>Fill fields in the wizard and click <em>Save</em>.</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-green-600"><ListChecks size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">MCQ (Multiple Choice)</div>
                          <div className="text-sm text-gray-600 mt-1">Enter question text, add options, mark correct option. Options can be added or removed.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600"><Edit3 size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">Fill‑in‑the‑Blank</div>
                          <div className="text-sm text-gray-600 mt-1">Write a passage and use <code>{'{blank}'}</code> for blanks. Each blank becomes a sub-question with options.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-indigo-600"><BookOpen size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">Reading</div>
                          <div className="text-sm text-gray-600 mt-1">Add a passage, then create one or more MCQ-style sub-questions tied to the passage.</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="text-yellow-600"><FileText size={20} /></div>
                        <div>
                          <div className="font-medium text-gray-800">Writing</div>
                          <div className="text-sm text-gray-600 mt-1">Open-response prompts. Expected answers are stored for export but not auto-graded.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Export */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Export</div>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2 text-sm text-gray-700">
                <div>Use the <em>download</em> icon on a test or <em>Export All</em> in Project Detail.</div>
                <div><strong>DOCX:</strong> Print-ready test document. You can add section instructions in the export popup.</div>
                <div><strong>Excel (XLSX):</strong> When exporting all, check <em>Export answers to Excel</em> to include an answers file in the ZIP. Each column = test; each row = answer index.</div>
              </div>
            </div>
          </section>

          {/* Shuffle */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Shuffle</div>
                </div>
              </div>
              <div className="md:col-span-2 text-sm text-gray-700">
                Open <em>Shuffle Tests</em>, choose how many questions per section and how many tests to generate. The app validates permutations and shuffles options while preserving correct answers.
              </div>
            </div>
          </section>

          {/* Tips */}
          <section>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="bg-gray-50 p-3 rounded border border-gray-100">
                  <div className="font-medium text-gray-800">Tips</div>
                </div>
              </div>
              <div className="md:col-span-2">
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                  <li>Complete the Master Test first to increase shuffle variety.</li>
                  <li>Preview before exporting to confirm formatting.</li>
                  <li>If export fails, ensure tests have sections and questions.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
