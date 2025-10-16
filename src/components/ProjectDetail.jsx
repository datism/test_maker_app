import React from 'react';
import { ChevronLeft, Shuffle, Plus, Calendar, FileText, Clock, Copy, Trash2, Edit } from 'lucide-react';

const ProjectDetail = ({ selectedProject, onBack, onShuffleTests, onAddTest, onTestClick, onDuplicateTest, onDeleteTest, onEditMasterTest }) => (
  <div className="max-w-7xl mx-auto">
  <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ChevronLeft size={20} />
        <span>Back to Projects</span>
      </button>
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        {/* Master Test Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-blue-800 mb-1">Master Test</h2>
            <div className="text-sm text-gray-700">
              {selectedProject.masterTest && selectedProject.masterTest.sections && selectedProject.masterTest.sections.length > 0
                ? `${selectedProject.masterTest.sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0)} questions in ${selectedProject.masterTest.sections.length} sections`
                : 'No questions yet'}
            </div>
          </div>
          <button
            onClick={() => onEditMasterTest && onEditMasterTest(selectedProject.masterTest)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Edit size={18} />
            <span>Edit Master Test</span>
          </button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{selectedProject.name}</h1>
            <p className="text-gray-600 mb-4">{selectedProject.description}</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Created: {new Date(selectedProject.createdDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>{selectedProject.testCount} Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{selectedProject.totalQuestions} Questions</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onShuffleTests}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Shuffle size={18} />
              <span>Shuffle Tests</span>
            </button>
            <button 
              onClick={onAddTest}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus size={18} />
              <span>Add Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tests in this Project</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {selectedProject.tests.map((test, index) => (
          <div 
            key={test.id}
            className="group border border-gray-200 rounded-lg p-5 hover:border-green-500 hover:shadow-md transition-all cursor-pointer bg-gray-50"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3 flex-1" onClick={() => onTestClick(test)}>
                <div className="bg-green-100 text-green-700 font-bold rounded-full w-10 h-10 flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{test.name}</h3>
                  {test.sections ? (
                    <div className="text-xs text-gray-500 mb-1">
                      {test.sections.map((section, sidx) => (
                        <div key={section.sectionId}>
                          <span className="font-semibold">Section: {section.sectionName}</span> ({section.questions.length} questions)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-3 text-sm text-gray-500">
                      <span className="capitalize">{test.type && test.type.replace('-', ' ')}</span>
                      <span>•</span>
                      <span className="capitalize">{test.difficulty}</span>
                      <span>•</span>
                      <span>{test.questionCount} Questions</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onDuplicateTest(test.id)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Duplicate test"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={() => onDeleteTest(test.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete test"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={14} className="mr-1" />
              <span>Created: {new Date(test.createdDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProjectDetail;
