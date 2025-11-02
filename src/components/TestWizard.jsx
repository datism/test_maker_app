
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useProjectsStore } from '../store/useProjectsStore';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import ReadingQuestionWizard from './ReadingQuestionWizard';
import MCQQuestionWizard from './MCQQuestionWizard';

const makeEmptyQuestion = () => ({
  id: Date.now() + Math.floor(Math.random() * 10000),
  type: 'mcq',
  text: '',
  options: ['', ''],
  correctAnswer: 0
});

const makeEmptyReadingQuestion = () => ({
  id: Date.now() + Math.floor(Math.random() * 10000),
  type: 'reading',
  title: '',
  passage: '',
  questions: [
    {
      id: Date.now() + Math.floor(Math.random() * 10000) + 1,
      text: '',
      options: ['', ''],
      correctAnswer: 0
    }
  ]
});

const QuillEditor = ({ value = "", onChange, placeholder }) => {
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
    });

    quillRef.current = quill;

    // Initialize with existing value
    if (value) quill.root.innerHTML = value;

    // Handle change properly
    quill.on("text-change", () => {
      const plainText = quill.getText().trim();
      const html = quill.root.innerHTML;
      // Send empty string if only whitespace or <p><br></p>
      onChange?.(plainText.length === 0 ? "" : html);
    });
  }, []);

  // Sync external changes
  useEffect(() => {
    const quill = quillRef.current;
    if (quill && value !== quill.root.innerHTML) {
      quill.root.innerHTML = value || "";
    }
  }, [value]);

  return <div ref={editorRef} style={{ minHeight: "150px" }} />;
};

export default function TestWizard() {
  const { selectedProject, updateProject } = useProjectsStore();
  const navigate = useNavigate();
  const location = useLocation();
  const editingMasterTest = location.state && location.state.editingMasterTest;
  const editTestId = location.state && location.state.editTestId;
  const testToEdit = editTestId ? selectedProject?.tests?.find(t => t.id === editTestId) : null;

  const [testName, setTestName] = useState(() => {
    if (testToEdit) return testToEdit.name;
    if (editingMasterTest) return 'Master Test';
    return `Test ${(selectedProject?.tests?.length || 0) + 1}`;
  });
  const [nameError, setNameError] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});
  const [collapsedQuestions, setCollapsedQuestions] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingQuestionType, setEditingQuestionType] = useState(null);

  const handleEditQuestion = (question, type) => {
    setEditingQuestion(question);
    setEditingQuestionType(type);
  };

  const handleSaveQuestion = (editedQuestion) => {
    setSectionQuestions(prevSections =>
      prevSections.map(section => ({
        ...section,
        questions: section.questions.map(q =>
          q.id === editedQuestion.id ? editedQuestion : q
        ),
      }))
    );
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleQuestion = (questionId) => {
    setCollapsedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  useEffect(() => {
    if (editingMasterTest) return;

    const isDuplicate = selectedProject?.tests?.some(test =>
      test.name === testName && test.id !== editTestId
    );

    if (isDuplicate) {
      setNameError('A test with this name already exists.');
    } else {
      setNameError('');
    }
  }, [testName, selectedProject, editTestId, editingMasterTest]);

  let sections = [];
  if (editingMasterTest) {
    sections = selectedProject?.masterTest?.sections || [];
  } else if (editTestId) {
    const test = selectedProject?.tests?.find(t => t.id === editTestId);
    sections = test?.sections || [];
  } else {
    sections = selectedProject?.sections || [];
  }

  const [sectionQuestions, setSectionQuestions] = useState(
    Array.isArray(sections)
      ? sections.map(section => ({
          sectionId: section.sectionId ?? section.id,
          sectionName: section.sectionName ?? section.name,
          questions: section.questions ?? []
        }))
      : []
  );

  useEffect(() => {
    const newErrors = {};
    sectionQuestions.forEach(section => {
      section.questions.forEach(q => {
        if (q.type === 'mcq') {
          if (!q.text.trim()) {
            newErrors[q.id] = { ...newErrors[q.id], text: 'Question text cannot be empty.' };
          }
          if (q.options.length === 0) {
            newErrors[q.id] = { ...newErrors[q.id], options: 'At least one option is required.' };
          } else if (q.options.some(opt => !opt.trim())) {
            newErrors[q.id] = { ...newErrors[q.id], options: 'All options must have text.' };
          }
        } else if (q.type === 'reading') {
          if (!q.passage.trim()) {
            newErrors[q.id] = { ...newErrors[q.id], passage: 'Passage cannot be empty.' };
          }
          if (q.questions.length === 0) {
            newErrors[q.id] = { ...newErrors[q.id], questions: 'At least one question is required for a reading passage.' };
          } else {
            q.questions.forEach(subQ => {
              if (!subQ.text.trim()) {
                newErrors[subQ.id] = { ...newErrors[subQ.id], text: 'Question text cannot be empty.' };
              }
              if (subQ.options.length === 0) {
                newErrors[subQ.id] = { ...newErrors[subQ.id], options: 'At least one option is required.' };
              } else if (subQ.options.some(opt => !opt.trim())) {
                newErrors[subQ.id] = { ...newErrors[subQ.id], options: 'All options must have text.' };
              }
            });
          }
        }
      });
    });
    setErrors(newErrors);
  }, [sectionQuestions]);

  const handleAddMcqQuestion = (sectionId) => {
    setSectionQuestions(sectionQuestions.map(sq =>
      sq.sectionId === sectionId
        ? { ...sq, questions: [...sq.questions, makeEmptyQuestion()] }
        : sq
    ));
  };

  const handleAddReadingQuestion = (sectionId) => {
    setSectionQuestions(sectionQuestions.map(sq =>
      sq.sectionId === sectionId
        ? { ...sq, questions: [...sq.questions, makeEmptyReadingQuestion()] }
        : sq
    ));
  };

  const handleAddSubQuestion = (sectionId, qIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;

      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;

        return {
          ...q,
          questions: [
            ...q.questions,
            {
              id: Date.now() + Math.floor(Math.random() * 10000) + 1,
              text: '',
              options: ['', ''],
              correctAnswer: 0
            }
          ]
        };
      });

      return { ...sq, questions };
    }));
  };

  const handleQuestionFieldChange = (sectionId, qIdx, field, value, subQIdx) => {
    setSectionQuestions(prevSections => 
      prevSections.map(sq => {
        if (sq.sectionId !== sectionId) return sq;

        const questions = sq.questions.map((q, i) => {
          if (i !== qIdx) return q;

          if (q.type === 'reading' && subQIdx !== undefined) {
            const updatedSubQuestions = q.questions.map((subQ, j) =>
              j === subQIdx ? { ...subQ, [field]: value } : subQ
            );
            return { ...q, questions: updatedSubQuestions };
          }

          return { ...q, [field]: value };
        });

        return { ...sq, questions };
      })
    );
  };


  const handleOptionChange = (sectionId, qIdx, optIdx, value, subQIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;

        if (q.type === 'reading' && subQIdx !== undefined) {
          const updatedSubQuestions = q.questions.map((subQ, j) => {
            if (j !== subQIdx) return subQ;
            const options = subQ.options.map((o, oi) => oi === optIdx ? value : o);
            return { ...subQ, options };
          });
          return { ...q, questions: updatedSubQuestions };
        }

        const options = q.options.map((o, oi) => oi === optIdx ? value : o);
        return { ...q, options };
      });
      return { ...sq, questions };
    }));
  };

  const handleAddOption = (sectionId, qIdx, subQIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;

        if (q.type === 'reading' && subQIdx !== undefined) {
          const updatedSubQuestions = q.questions.map((subQ, j) => {
            if (j !== subQIdx) return subQ;
            return { ...subQ, options: [...subQ.options, ''] };
          });
          return { ...q, questions: updatedSubQuestions };
        }

        return { ...q, options: [...q.options, ''] };
      });
      return { ...sq, questions };
    }));
  };

  const handleRemoveOption = (sectionId, qIdx, optIdx, subQIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;

        if (q.type === 'reading' && subQIdx !== undefined) {
          const updatedSubQuestions = q.questions.map((subQ, j) => {
            if (j !== subQIdx) return subQ;
            const options = subQ.options.filter((_, oi) => oi !== optIdx);
            let correctAnswer = subQ.correctAnswer;
            if (options.length === 0) {
              options.push('');
              correctAnswer = 0;
            } else if (correctAnswer >= options.length) {
              correctAnswer = options.length - 1;
            }
            return { ...subQ, options, correctAnswer };
          });
          return { ...q, questions: updatedSubQuestions };
        }

        const options = q.options.filter((_, oi) => oi !== optIdx);
        let correctAnswer = q.correctAnswer;
        if (options.length === 0) {
          options.push('');
          correctAnswer = 0;
        } else if (correctAnswer >= options.length) {
          correctAnswer = options.length - 1;
        }
        return { ...q, options, correctAnswer };
      });
      return { ...sq, questions };
    }));
  };

  const handleSetCorrect = (sectionId, qIdx, optIdx, subQIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;

        if (q.type === 'reading' && subQIdx !== undefined) {
          const updatedSubQuestions = q.questions.map((subQ, j) =>
            j === subQIdx ? { ...subQ, correctAnswer: optIdx } : subQ
          );
          return { ...q, questions: updatedSubQuestions };
        }

        return { ...q, correctAnswer: optIdx };
      });
      return { ...sq, questions };
    }));
  };

  const handleRemoveQuestion = (sectionId, qIdx, subQIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;

      if (subQIdx !== undefined) {
        // Removing a sub-question from a reading question
        const questions = sq.questions.map((q, i) => {
          if (i !== qIdx) return q;
          const updatedSubQuestions = q.questions.filter((_, j) => j !== subQIdx);
          return { ...q, questions: updatedSubQuestions };
        });
        return { ...sq, questions };
      }

      // Removing a whole question (MCQ or reading)
      const questions = sq.questions.filter((_, i) => i !== qIdx);
      return { ...sq, questions };
    }));
  };


  function handleSave() {
    // Clean up questions
    const cleaned = sectionQuestions.map(sq => ({
      ...sq,
      questions: sq.questions.map(q => {
        if (q.type === 'reading') {
          return {
            ...q,
            title: q.title.trim(),
            passage: q.passage.trim(),
            questions: q.questions.map(subQ => ({
              ...subQ,
              text: subQ.text.trim(),
              options: subQ.options.map(o => o.trim())
            }))
          };
        }
        return {
          ...q,
          text: q.text.trim(),
          options: q.options.map(o => o.trim())
        };
      })
    }));

    if (!selectedProject) return;

    if (editingMasterTest) {
      // Save to masterTest
      const updatedProject = {
        ...selectedProject,
        masterTest: {
          ...selectedProject.masterTest,
          sections: cleaned.map(({ sectionId, sectionName, questions }) => ({ sectionId, sectionName, questions })),
          questionCount: cleaned.reduce((sum, s) => sum + s.questions.length, 0)
        }
      };
      updateProject(updatedProject);
      navigate(`/project/${selectedProject.id}`);
      return;
    }

    if (editTestId) {
      // Update existing test
      const updatedProject = {
        ...selectedProject,
        tests: selectedProject.tests.map(t =>
          t.id === editTestId
            ? {
                ...t, name: testName,
                sections: cleaned,
                questionCount: cleaned.reduce((sum, s) => sum + s.questions.length, 0)
              }
            : t
        )
      };
      updateProject(updatedProject);
      navigate(`/project/${selectedProject.id}`);
      return;
    }

    // Save as a new test
    const updatedProject = {
      ...selectedProject,
      tests: [
        ...(selectedProject.tests || []),
        {
          id: Date.now(),
          name: testName,
          createdDate: new Date().toISOString().split('T')[0],
          sections: cleaned,
          questionCount: cleaned.reduce((sum, s) => sum + s.questions.length, 0)
        }
      ]
    };
    updateProject(updatedProject);
    navigate(`/project/${selectedProject.id}`);
  }

  if (!Array.isArray(sectionQuestions) || sectionQuestions.length === 0) {
    return <div className="p-6 text-gray-500">No sections available for this test.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6">{editTestId ? 'Edit Test' : (editingMasterTest ? 'Edit Master Test' : 'Create New Test')}</h2>
        {!editingMasterTest && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testName">
              Test Name
            </label>
            <input
              id="testName"
              type="text"
              value={testName}
              onChange={e => setTestName(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${nameError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {nameError && <p className="text-red-500 text-xs italic mt-1">{nameError}</p>}
          </div>)}
        {sectionQuestions.map((section) => (
          <div key={section.sectionId} className="mb-8 border-b pb-6">
            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection(section.sectionId)}>
              <h3 className="text-lg font-semibold">Section: {section.sectionName}</h3>
              <button onClick={() => toggleSection(section.sectionId)} className="text-sm text-blue-500 hover:underline">
                {collapsedSections[section.sectionId] ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>
            {!collapsedSections[section.sectionId] && (
              <>
                {section.questions.map((q, idx) => {
                  const isQuestionCollapsed = collapsedQuestions[q.id];

                  const getQuestionSummary = (question) => {
                    if (question.type === 'mcq') {
                      return question.text || 'MCQ Question';
                    }
                    if (question.type === 'reading') {
                      return question.title || question.passage.substring(0, 50) + '...' || 'Reading Question';
                    }
                    return 'Question';
                  };

                  if (q.type === 'reading') {
                    return (
                      <div key={q.id} className="mb-6 border rounded">
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer"
                          onClick={() => toggleQuestion(q.id)}
                        >
                          <h4 className="font-semibold">{getQuestionSummary(q)}</h4>
                          <div>
                            <button
                                type="button"
                                onClick={() => handleEditQuestion(q, 'reading')}
                                className="px-3 py-1 text-blue-500 hover:text-blue-700"
                            >
                                Edit
                            </button>
                            {isQuestionCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                          </div>
                        </div>
                        {!isQuestionCollapsed && (
                          <div className="p-4 border-t">
                            <div className="flex justify-between items-center mb-3">
                              <label className="block text-gray-700 text-sm mb-1">Title (Optional)</label>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(section.sectionId, idx)}
                                className="px-3 py-1 text-red-500 hover:text-red-700"
                              >
                                Remove Reading Question
                              </button>
                            </div>
                            <input
                              type="text"
                              value={q.title}
                              onChange={e => handleQuestionFieldChange(section.sectionId, idx, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                              placeholder="Enter reading passage title"
                            />
                            <div className="mb-3">
                              <label className="block text-gray-700 text-sm mb-1">Passage</label>
                              <QuillEditor
                                value={q.passage || ''}
                                onChange={value => handleQuestionFieldChange(section.sectionId, idx, 'passage', value)}
                                placeholder="Paste the reading passage here"
                              />
                              {errors[q.id]?.passage && <p className="text-red-500 text-xs italic mt-1">{errors[q.id].passage}</p>}
                            </div>
                            {errors[q.id]?.questions && <p className="text-red-500 text-xs italic mt-1">{errors[q.id].questions}</p>}
                            {q.questions.map((subQ, subQIdx) => {
                              const isSubQuestionCollapsed = collapsedQuestions[subQ.id];
                              return (
                                <div key={subQ.id} className="mb-6 border rounded">
                                  <div
                                    className="flex justify-between items-center p-4 cursor-pointer"
                                    onClick={() => toggleQuestion(subQ.id)}
                                  >
                                    <h5 className="font-semibold">{subQ.text || 'Sub-question'}</h5>
                                    {isSubQuestionCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                  </div>
                                  {!isSubQuestionCollapsed && (
                                    <div className="p-4 border-t">
                                      <div className="mb-3">
                                        <label className="block text-gray-700 text-sm mb-1">Question</label>
                                        <input
                                          type="text"
                                          value={subQ.text}
                                          onChange={e => handleQuestionFieldChange(section.sectionId, idx, 'text', e.target.value, subQIdx)}
                                          className={`w-full px-3 py-2 border rounded ${errors[subQ.id]?.text ? 'border-red-500' : 'border-gray-300'}`}
                                          placeholder="Enter question"
                                        />
                                        {errors[subQ.id]?.text && <p className="text-red-500 text-xs italic mt-1">{errors[subQ.id].text}</p>}
                                      </div>
                                      <div className="mb-3">
                                        <label className="block text-gray-700 text-sm mb-2">Options</label>
                                        {errors[subQ.id]?.options && <p className="text-red-500 text-xs italic mt-1">{errors[subQ.id].options}</p>}
                                        <div className="space-y-2">
                                          {subQ.options.map((opt, oi) => (
                                            <div key={oi} className="flex items-center gap-2">
                                              <button
                                                type="button"
                                                onClick={() => handleSetCorrect(section.sectionId, idx, oi, subQIdx)}
                                                className={`w-8 h-8 rounded-full border ${subQ.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-white text-gray-700'} flex items-center justify-center`}
                                                title="Mark as correct"
                                              >
                                                {String.fromCharCode(65 + oi)}
                                              </button>
                                              <input
                                                type="text"
                                                value={opt}
                                                onChange={e => handleOptionChange(section.sectionId, idx, oi, e.target.value, subQIdx)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                              />
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveOption(section.sectionId, idx, oi, subQIdx)}
                                                className="px-2 py-1 text-red-500 hover:text-red-700"
                                                title="Remove option"
                                              >
                                                &times;
                                              </button>
                                            </div>
                                          ))}
                                          <div>
                                            <button
                                              type="button"
                                              onClick={() => handleAddOption(section.sectionId, idx, subQIdx)}
                                              className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                            >
                                              + Add Option
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">Correct: {String.fromCharCode(65 + subQ.correctAnswer)}</div>
                                        <div>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(section.sectionId, idx, subQIdx)}
                                            className="px-3 py-1 text-red-500 hover:text-red-700"
                                          >
                                            Remove Question
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                            <button
                              type="button"
                              onClick={() => handleAddSubQuestion(section.sectionId, idx)}
                              className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              + Add Sub-Question
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <div key={q.id} className="mb-6 border rounded">
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer"
                        onClick={() => toggleQuestion(q.id)}
                      >
                        <h4 className="font-semibold">{getQuestionSummary(q)}</h4>
                        <div>
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(q, 'mcq')}
                            className="px-3 py-1 text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          {isQuestionCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </div>
                      </div>
                      {!isQuestionCollapsed && (
                        <div className="p-4 border-t">
                          <div className="mb-3">
                            <label className="block text-gray-700 text-sm mb-1">Question</label>
                            <input
                              type="text"
                              value={q.text}
                              onChange={e => handleQuestionFieldChange(section.sectionId, idx, 'text', e.target.value)}
                              className={`w-full px-3 py-2 border rounded ${errors[q.id]?.text ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Enter question"
                            />
                            {errors[q.id]?.text && <p className="text-red-500 text-xs italic mt-1">{errors[q.id].text}</p>}
                          </div>
                          <div className="mb-3">
                            <label className="block text-gray-700 text-sm mb-2">Options</label>
                            {errors[q.id]?.options && <p className="text-red-500 text-xs italic mt-1">{errors[q.id].options}</p>}
                            <div className="space-y-2">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSetCorrect(section.sectionId, idx, oi)}
                                    className={`w-8 h-8 rounded-full border ${q.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-white text-gray-700'} flex items-center justify-center`}
                                    title="Mark as correct"
                                  >
                                    {String.fromCharCode(65 + oi)}
                                  </button>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => handleOptionChange(section.sectionId, idx, oi, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(section.sectionId, idx, oi)}
                                    className="px-2 py-1 text-red-500 hover:text-red-700"
                                    title="Remove option"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(section.sectionId, idx)}
                                  className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  + Add Option
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">Correct: {String.fromCharCode(65 + q.correctAnswer)}</div>
                            <div>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(section.sectionId, idx)}
                                className="px-3 py-1 text-red-500 hover:text-red-700"
                              >
                                Remove Question
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="relative inline-block text-left mt-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === section.sectionId ? null : section.sectionId)}
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      + Add Question
                      <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {openDropdown === section.sectionId && (
                    <div className="origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                          onClick={() => { handleAddMcqQuestion(section.sectionId); setOpenDropdown(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          MCQ
                        </button>
                        <button
                          onClick={() => { handleAddReadingQuestion(section.sectionId); setOpenDropdown(null); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          Reading Question
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {editingQuestion && editingQuestionType === 'reading' && (
            <ReadingQuestionWizard
                question={editingQuestion}
                onSave={handleSaveQuestion}
                onClose={() => setEditingQuestion(null)}
            />
        )}
        {editingQuestion && editingQuestionType === 'mcq' && (
            <MCQQuestionWizard
                question={editingQuestion}
                onSave={handleSaveQuestion}
                onClose={() => setEditingQuestion(null)}
            />
        )}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={!!nameError || Object.keys(errors).length > 0 || (!editingMasterTest && !testName.trim())}
            className="px-8 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
          >
            Save Test
          </button>
        </div>
      </div>
    </div>
  );
}
