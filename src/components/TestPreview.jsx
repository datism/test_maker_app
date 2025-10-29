import React from 'react';
import { ChevronLeft, Edit, GripVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/useProjectsStore';

export default function TestPreview() {
  const navigate = useNavigate();
  const { selectedTest } = useProjectsStore();
  if (!selectedTest) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-gray-400 text-center text-lg">No test selected.</div>
    );
  }
  const sections = selectedTest.sections || [];
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-t-lg shadow-sm px-6 py-4 border-b border-gray-200">
        <h1 className="text-lg font-medium text-gray-600">Test Preview</h1>
      </div>
      <div className="bg-gray-100 rounded-b-lg shadow-lg p-6">
        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 text-sm font-medium"
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900">{selectedTest?.name || 'Untitled Test'}</h1>
                </div>
                <button
                  onClick={() => navigate('/test-wizard', { state: { editTestId: selectedTest.id } })}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                  <span className="font-medium">Edit Test</span>
                </button>
              </div>
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Test Questions</h2>
                </div>
                <div className="space-y-8">
                  {sections.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No sections or questions in this test.</div>
                  ) : (
                    sections.map((section, sectionIndex) => (
                      <div key={section.id}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Section {sectionIndex + 1}: {section.name}</h3>
                        <div className="space-y-6">
                          {(section.questions || []).map((q, index) => {
                            if (q.type === 'reading') {
                              return (
                                <div key={q.id} className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                  <div className="flex gap-3">
                                    <div className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                                      <GripVertical size={20} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}:</p>
                                      {q.title && <p className="font-semibold text-gray-900 mb-3 text-base">{q.title}</p>}
                                      {q.passage && <div className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: q.passage }}/>}
                                      {q.questions.map((subQ, subQIndex) => (
                                        <div key={subQ.id} className="mb-4">
                                          <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}.{subQIndex + 1}: {subQ.text}</p>
                                          <div className="space-y-2 ml-2">
                                            {subQ.options && subQ.options.map((opt, idx) => (
                                              <div key={idx} className={`flex items-center gap-2 text-gray-700 py-1 ${idx === subQ.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                                <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                                                <span>{opt}</span>
                                                {idx === subQ.correctAnswer && (
                                                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <div key={q.id} className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                <div className="flex gap-3">
                                  <div className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                                    <GripVertical size={20} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}: {q.text}</p>
                                    <div className="space-y-2 ml-2">
                                      {q.options && q.options.map((opt, idx) => (
                                        <div key={idx} className={`flex items-center gap-2 text-gray-700 py-1 ${idx === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}>
                                          <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                                          <span>{opt}</span>
                                          {idx === q.correctAnswer && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Correct</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* Optionally, add per-question delete here */}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
