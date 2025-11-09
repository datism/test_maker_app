import React, { useState, useEffect } from 'react';
import { ChevronLeft, Edit, GripVertical, Trash2, Plus, ChevronDown, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/useProjectsStore';
import MCQQuestionWizard from './MCQQuestionWizard';
import ReadingQuestionWizard from './ReadingQuestionWizard';
import WritingQuestionWizard from './WritingQuestionWizard';

export default function TestPreview() {
  const navigate = useNavigate();
  const { selectedTest, deleteQuestion, updateQuestion, updateTestName } = useProjectsStore();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [wizard, setWizard] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (sectionId) => {
    setCollapsedSections(prevState => ({
      ...prevState,
      [sectionId]: !prevState[sectionId]
    }));
  };

  useEffect(() => {
    if (selectedTest) {
      setNewTestName(selectedTest.name);
    }
  }, [selectedTest]);

  if (!selectedTest) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-gray-400 text-center text-lg">No test selected.</div>
    );
  }
  const sections = selectedTest.sections || [];

  const openWizard = (type, sectionId, question = null) => {
    setWizard({ type, sectionId, question });
    setActiveDropdown(null);
  }

  const handleNameChange = (e) => {
    setNewTestName(e.target.value);
  };

  const handleNameSave = () => {
    if (newTestName.trim() && newTestName.trim() !== selectedTest.name) {
      updateTestName(selectedTest.id, newTestName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setNewTestName(selectedTest.name);
    setIsEditingName(false);
  };

  if (wizard?.type === 'mcq') {
    return <MCQQuestionWizard onClose={() => setWizard(null)} sectionId={wizard.sectionId} question={wizard.question} />;
  }

  if (wizard?.type === 'reading') {
    return <ReadingQuestionWizard onClose={() => setWizard(null)} sectionId={wizard.sectionId} question={wizard.question} />;
  }

  if (wizard?.type === 'writing') {
    return <WritingQuestionWizard onClose={() => setWizard(null)} sectionId={wizard.sectionId} question={wizard.question} />;
  }

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
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTestName}
                        onChange={handleNameChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleNameSave();
                          if (e.key === 'Escape') handleNameCancel();
                        }}
                        className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                        autoFocus
                      />
                      <button onClick={handleNameSave} className="p-1 text-green-600 hover:text-green-700"><Check size={22} /></button>
                      <button onClick={handleNameCancel} className="p-1 text-red-600 hover:text-red-700"><X size={22} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-gray-900">{selectedTest?.name || 'Untitled Test'}</h1>
                      {selectedTest.name !== 'Master Test' && (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          title="Edit test name"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                      <div key={section.id} className="border-t border-gray-200 pt-6 first:border-t-0">
                        <button onClick={() => toggleSection(section.id)} className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 mb-4">
                          <span>Section {sectionIndex + 1}: {section.name}</span>
                          <ChevronDown className={`transition-transform duration-200 ${collapsedSections[section.id] ? '-rotate-90' : ''}`} size={24} />
                        </button>
                        {!collapsedSections[section.id] && (
                          <>
                            <div className="space-y-6">
                              {(section.questions || []).length === 0 ? <div className="text-gray-400 text-center py-4">This section is empty.</div> : (section.questions || []).map((q, index) => {
                                if (q.type === 'writing') {
                                  return (
                                    <div key={q.id} className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                      <div className="flex gap-3">
                                        <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-move">
                                          <GripVertical size={20} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}: <span dangerouslySetInnerHTML={{ __html: q.text }} /></p>
                                          <div className="space-y-2 ml-2">
                                              <p className="text-green-700">{q.answer}</p>
                                          </div>
                                        </div>
                                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openWizard('writing', section.id, q)}
                                                className="p-1 text-gray-500 hover:text-blue-600"
                                                title="Edit question"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this question?')) {
                                                        deleteQuestion(section.id, q.id);
                                                    }
                                                }}
                                                className="p-1 text-gray-500 hover:text-red-600"
                                                title="Delete question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                if (q.type === 'reading') {
                                  return (
                                    <div key={q.id} className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                      <div className="flex gap-3">
                                        <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-move">
                                          <GripVertical size={20} />
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}:</p>
                                          {q.title && <p className="font-semibold text-gray-900 mb-3 text-base">{q.title}</p>}
                                          {q.passage && <div className="text-gray-700 mb-4" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: q.passage }} />}
                                          {q.questions.map((subQ, subQIndex) => (
                                            <div key={subQ.id} className="mb-4 relative group">
                                              <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}.{subQIndex + 1}: <span dangerouslySetInnerHTML={{ __html: subQ.text }} /></p>
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
                                        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openWizard('reading', section.id, q)}
                                                className="p-1 text-gray-500 hover:text-blue-600"
                                                title="Edit question"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this entire reading question?')) {
                                                        deleteQuestion(section.id, q.id);
                                                    }
                                                }}
                                                className="p-1 text-gray-500 hover:text-red-600"
                                                title="Delete question"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }
                                return (
                                  <div key={q.id} className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                    <div className="flex gap-3">
                                      <div className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-move">
                                        <GripVertical size={20} />
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900 mb-3 text-base">Question {index + 1}: <span dangerouslySetInnerHTML={{ __html: q.text }} /></p>
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
                                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => openWizard('mcq', section.id, q)}
                                          className="p-1 text-gray-500 hover:text-blue-600"
                                          title="Edit question"
                                        >
                                          <Edit size={18} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this question?')) {
                                              deleteQuestion(section.id, q.id);
                                            }
                                          }}
                                          className="p-1 text-gray-500 hover:text-red-600"
                                          title="Delete question"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>

                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="relative mt-6">
                              <button
                                onClick={() => setActiveDropdown(activeDropdown === section.id ? null : section.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Plus size={18} />
                                <span>Add Question</span>
                                <ChevronDown size={16} />
                              </button>
                              {activeDropdown === section.id && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <button
                                    onClick={() => openWizard('mcq', section.id)}
                                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                  >
                                    Multi Choice
                                  </button>
                                  <button
                                    onClick={() => openWizard('reading', section.id)}
                                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                  >
                                    Reading Question
                                  </button>
                                  <button
                                    onClick={() => openWizard('writing', section.id)}
                                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                                  >
                                    Writing Question
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
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
