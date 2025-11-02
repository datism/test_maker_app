
import React, { useState, useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

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

  return <div ref={editorRef} style={{ minHeight: "150px" }} />;
};

export default function ReadingQuestionWizard({ question, onSave, onClose }) {
  const [editedQuestion, setEditedQuestion] = useState(question);

  const handleSave = () => {
    onSave(editedQuestion);
    onClose();
  };

  const handleQuestionFieldChange = (field, value, subQIdx) => {
    setEditedQuestion(prevQuestion => {
      if (subQIdx !== undefined) {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) =>
          j === subQIdx ? { ...subQ, [field]: value } : subQ
        );
        return { ...prevQuestion, questions: updatedSubQuestions };
      }
      return { ...prevQuestion, [field]: value };
    });
  };

  const handleOptionChange = (subQIdx, optIdx, value) => {
    setEditedQuestion(prevQuestion => {
      const updatedSubQuestions = prevQuestion.questions.map((subQ, j) => {
        if (j !== subQIdx) return subQ;
        const options = subQ.options.map((o, oi) => oi === optIdx ? value : o);
        return { ...subQ, options };
      });
      return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleAddOption = (subQIdx) => {
    setEditedQuestion(prevQuestion => {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) => {
            if (j !== subQIdx) return subQ;
            return { ...subQ, options: [...subQ.options, ''] };
        });
        return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleRemoveOption = (subQIdx, optIdx) => {
    setEditedQuestion(prevQuestion => {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) => {
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
        return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleSetCorrect = (subQIdx, optIdx) => {
    setEditedQuestion(prevQuestion => {
        const updatedSubQuestions = prevQuestion.questions.map((subQ, j) =>
            j === subQIdx ? { ...subQ, correctAnswer: optIdx } : subQ
        );
        return { ...prevQuestion, questions: updatedSubQuestions };
    });
  };

  const handleAddSubQuestion = () => {
    setEditedQuestion(prevQuestion => ({
        ...prevQuestion,
        questions: [
            ...prevQuestion.questions,
            {
                id: Date.now() + Math.floor(Math.random() * 10000) + 1,
                text: '',
                options: ['', ''],
                correctAnswer: 0
            }
        ]
    }));
  };

  const handleRemoveSubQuestion = (subQIdx) => {
    setEditedQuestion(prevQuestion => ({
        ...prevQuestion,
        questions: prevQuestion.questions.filter((_, j) => j !== subQIdx)
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Reading Question</h3>
          <div className="mt-2 px-7 py-3">
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Title (Optional)</label>
                <input
                    type="text"
                    value={editedQuestion.title}
                    onChange={e => handleQuestionFieldChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                    placeholder="Enter reading passage title"
                />
            </div>
            <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-1 text-left">Passage</label>
                <QuillEditor
                    value={editedQuestion.passage || ''}
                    onChange={value => handleQuestionFieldChange('passage', value)}
                    placeholder="Paste the reading passage here"
                />
            </div>

            {editedQuestion.questions.map((subQ, subQIdx) => (
              <div key={subQ.id} className="mb-6 border rounded p-4 border-t">
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-1 text-left">Question</label>
                    <input
                        type="text"
                        value={subQ.text}
                        onChange={e => handleQuestionFieldChange('text', e.target.value, subQIdx)}
                        className={'w-full px-3 py-2 border rounded border-gray-300'}
                        placeholder="Enter question"
                    />
                </div>
                <div className="mb-3">
                    <label className="block text-gray-700 text-sm mb-2 text-left">Options</label>
                    <div className="space-y-2">
                    {subQ.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleSetCorrect(subQIdx, oi)}
                            className={`w-8 h-8 rounded-full border ${subQ.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-white text-gray-700'} flex items-center justify-center`}
                            title="Mark as correct"
                        >
                            {String.fromCharCode(65 + oi)}
                        </button>
                        <input
                            type="text"
                            value={opt}
                            onChange={e => handleOptionChange(subQIdx, oi, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveOption(subQIdx, oi)}
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
                        onClick={() => handleAddOption(subQIdx)}
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
                        onClick={() => handleRemoveSubQuestion(subQIdx)}
                        className="px-3 py-1 text-red-500 hover:text-red-700"
                    >
                        Remove Question
                    </button>
                    </div>
                </div>
              </div>
            ))}
            <button
                type="button"
                onClick={() => handleAddSubQuestion()}
                className="mt-2 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
                + Add Sub-Question
            </button>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
