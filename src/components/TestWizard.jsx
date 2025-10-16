import React, { useState } from 'react';

const makeEmptyQuestion = () => ({
  id: Date.now() + Math.floor(Math.random() * 10000),
  text: '',
  options: ['', ''],
  correctAnswer: 0
});

const TestWizard = ({ sections, onBack, onSave }) => {
  // Each section gets its own questions array (MCQ shape: id, text, options, correctAnswer)
  const [sectionQuestions, setSectionQuestions] = useState(
    sections.map(section => ({
      sectionId: section.id ?? section.sectionId,
      sectionName: section.name ?? section.sectionName,
      questions: section.questions ?? []
    }))
  );

  const handleAddQuestion = (sectionId) => {
    setSectionQuestions(sectionQuestions.map(sq =>
      sq.sectionId === sectionId
        ? { ...sq, questions: [...sq.questions, makeEmptyQuestion()] }
        : sq
    ));
  };

  const handleQuestionFieldChange = (sectionId, qIdx, field, value) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) =>
        i === qIdx ? { ...q, [field]: value } : q
      );
      return { ...sq, questions };
    }));
  };

  const handleOptionChange = (sectionId, qIdx, optIdx, value) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const options = q.options.map((o, oi) => oi === optIdx ? value : o);
        return { ...q, options };
      });
      return { ...sq, questions };
    }));
  };

  const handleAddOption = (sectionId, qIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, options: [...q.options, ''] };
      });
      return { ...sq, questions };
    }));
  };

  const handleRemoveOption = (sectionId, qIdx, optIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => {
        if (i !== qIdx) return q;
        const options = q.options.filter((_, oi) => oi !== optIdx);
        let correctAnswer = q.correctAnswer;
        if (options.length === 0) {
          // ensure at least one option
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

  const handleSetCorrect = (sectionId, qIdx, optIdx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) => i === qIdx ? { ...q, correctAnswer: optIdx } : q);
      return { ...sq, questions };
    }));
  };

  const handleRemoveQuestion = (sectionId, idx) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.filter((_, i) => i !== idx);
      return { ...sq, questions };
    }));
  };

  const handleSave = () => {
    // Ensure minimal validation: trim question text and options
    const cleaned = sectionQuestions.map(sq => ({
      ...sq,
      questions: sq.questions.map(q => ({
        ...q,
        text: q.text.trim(),
        options: q.options.map(o => o.trim())
      }))
    }));
    onSave(cleaned);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6">Add Questions to Sections</h2>
  {sectionQuestions.map((section) => (
          <div key={section.sectionId} className="mb-8 border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Section: {section.sectionName}</h3>
            {section.questions.map((q, idx) => (
              <div key={q.id} className="mb-6 p-4 border rounded">
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-1">Question</label>
                  <input
                    type="text"
                    value={q.text}
                    onChange={e => handleQuestionFieldChange(section.sectionId, idx, 'text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Enter question"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-2">Options</label>
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
            ))}
            <button
              type="button"
              onClick={() => handleAddQuestion(section.sectionId)}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Add Question
            </button>
          </div>
        ))}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Save Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestWizard;
