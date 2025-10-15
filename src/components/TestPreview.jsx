import React from 'react';
import { ChevronLeft, Download, Edit, Plus, GripVertical, Trash2 } from 'lucide-react';

const TestPreview = ({ testType, difficulty, questions, onBack }) => (
  <div className="max-w-7xl mx-auto">
    <div className="bg-white rounded-t-lg shadow-sm px-6 py-4 border-b border-gray-200">
      <h1 className="text-lg font-medium text-gray-600">Test Preview Screen</h1>
    </div>
    <div className="bg-gray-100 rounded-b-lg shadow-lg p-6">
      <div className="flex gap-6">
        <div className="w-64 flex-shrink-0 space-y-3">
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            <span>Back to Project</span>
          </button>
          <button 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
          >
            <Download size={18} />
            <span>Download Test</span>
          </button>
          <div className="bg-white rounded-lg p-4 mt-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-800 capitalize">{testType.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium text-gray-800 capitalize">{difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium text-gray-800">{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Test Preview</h1>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit size={18} />
                <span className="font-medium">Edit Test</span>
              </button>
            </div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Test Questions</h2>
                <button className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200">
                  <Plus size={18} />
                  <span className="font-medium">Add Question</span>
                </button>
              </div>
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div 
                    key={q.id} 
                    className="group relative pb-6 border-b border-gray-200 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 cursor-move text-gray-400 hover:text-gray-600">
                        <GripVertical size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-3 text-base">
                          Question {index + 1}: {q.text}
                        </p>
                        <div className="space-y-2 ml-2">
                          {q.options.map((opt, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center gap-2 text-gray-700 py-1 ${idx === q.correctAnswer ? 'text-green-600 font-medium' : ''}`}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                              <span>{opt}</span>
                              {idx === q.correctAnswer && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="w-full py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
            >
              Generate Test
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TestPreview;
