import React, { useState } from 'react';

const TestWizard = ({ sections, onBack, onSave }) => {
  // Each section gets its own questions array
  const [sectionQuestions, setSectionQuestions] = useState(
    sections.map(section => ({
      sectionId: section.id,
      sectionName: section.name,
      questions: []
    }))
  );

  const handleAddQuestion = (sectionId) => {
    setSectionQuestions(sectionQuestions.map(sq =>
      sq.sectionId === sectionId
        ? { ...sq, questions: [...sq.questions, { question: '', answer: '' }] }
        : sq
    ));
  };

  const handleQuestionChange = (sectionId, idx, field, value) => {
    setSectionQuestions(sectionQuestions.map(sq => {
      if (sq.sectionId !== sectionId) return sq;
      const questions = sq.questions.map((q, i) =>
        i === idx ? { ...q, [field]: value } : q
      );
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
    onSave(sectionQuestions);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6">Add Questions to Sections</h2>
        {sectionQuestions.map((section, sIdx) => (
          <div key={section.sectionId} className="mb-8 border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Section: {section.sectionName}</h3>
            {section.questions.map((q, idx) => (
              <div key={idx} className="mb-4 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm mb-1">Question</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => handleQuestionChange(section.sectionId, idx, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-1"
                    placeholder="Enter question"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 text-sm mb-1">Answer</label>
                  <input
                    type="text"
                    value={q.answer}
                    onChange={e => handleQuestionChange(section.sectionId, idx, 'answer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-1"
                    placeholder="Enter answer"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(section.sectionId, idx)}
                  className="ml-2 px-2 py-1 text-red-500 hover:text-red-700"
                  title="Remove question"
                >
                  &times;
                </button>
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
