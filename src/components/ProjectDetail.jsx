import React, { useState } from 'react';
import { useShuffleTests } from '../hooks/useShuffleTests';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shuffle, Plus, Calendar, FileText, HelpCircle, Trash2, Edit, Download } from 'lucide-react';
import ExportModal from './ExportModal';
import { useProjectsStore } from '../store/useProjectsStore';

export default function ProjectDetail() {
  const { selectedProject, selectTest, updateProject, deleteTest } = useProjectsStore();
  const navigate = useNavigate();
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const { validateShuffle, generateTests } = useShuffleTests();
  // Shuffle modal state
  const [numTests, setNumTests] = useState(1);
  const [sectionCounts, setSectionCounts] = useState([]);
  const [shuffleError, setShuffleError] = useState('');
  const [shuffleValid, setShuffleValid] = useState(true);
  const [maxPerms, setMaxPerms] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTest, setExportTest] = useState(null);

  React.useEffect(() => {
    if (showShuffleModal && selectedProject?.masterTest?.sections) {
      setSectionCounts(selectedProject.masterTest.sections.map(s => Math.min(3, s.questions.length)));
      setNumTests(1);
      setShuffleError('');
      setShuffleValid(true);
      setMaxPerms(0);
    }
  }, [showShuffleModal, selectedProject]);

  if (!selectedProject) return <div className="p-6 text-gray-500">No project selected.</div>;

  const handleBack = () => navigate('/');
  const handleAddTest = () => navigate('/test-wizard');
  const handleTestClick = (test) => {
    selectTest(test);
    navigate(`/project/${selectedProject.id}/test/${test.id}`);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
      {/* Shuffle Modal */}
      {showShuffleModal && selectedProject.masterTest && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-full">
            <h2 className="text-xl font-bold mb-4">Generate Shuffled Tests</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const result = validateShuffle(numTests, sectionCounts);
                setShuffleError(result.error);
                setShuffleValid(result.valid);
                setMaxPerms(result.perms);
                if (result.valid) {
                  // Generate tests and update project
                  const newTests = generateTests(numTests, sectionCounts);
                  const updatedProject = {
                    ...selectedProject,
                    tests: [...(selectedProject.tests || []), ...newTests],
                    testCount: (selectedProject.testCount || 0) + newTests.length,
                    totalQuestions: (selectedProject.totalQuestions || 0) + newTests.reduce((sum, t) => sum + t.questionCount, 0)
                  };
                  updateProject(updatedProject);
                  setShowShuffleModal(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block font-medium mb-1">Number of tests to generate</label>
                <input
                  type="number"
                  min={1}
                  value={numTests}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10) || 1;
                    setNumTests(v);
                    const result = validateShuffle(v, sectionCounts);
                    setShuffleError(result.error);
                    setShuffleValid(result.valid);
                    setMaxPerms(result.perms);
                  }}
                  className="w-full border rounded px-3 py-2 mb-2"
                />
              </div>
              {selectedProject.masterTest.sections.map((section, idx) => (
                <div className="mb-3" key={section.sectionId}>
                  <label className="block font-medium mb-1">
                    Section {idx + 1}: {section.sectionName} (max {section.questions.length} questions)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={section.questions.length}
                    value={sectionCounts[idx] || 1}
                    onChange={e => {
                      const v = Math.max(1, Math.min(section.questions.length, parseInt(e.target.value, 10) || 1));
                      const newCounts = [...sectionCounts];
                      newCounts[idx] = v;
                      setSectionCounts(newCounts);
                      const result = validateShuffle(numTests, newCounts);
                      setShuffleError(result.error);
                      setShuffleValid(result.valid);
                      setMaxPerms(result.perms);
                    }}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              ))}
              {shuffleError && (
                <div className="text-red-600 text-sm mb-2">{shuffleError}</div>
              )}
              {shuffleValid && maxPerms > 0 && (
                <div className="text-green-700 text-xs mb-2">Up to {maxPerms} unique tests possible.</div>
              )}
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowShuffleModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >Cancel</button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded text-white ${shuffleValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  disabled={!shuffleValid}
                >Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="mb-6">
        <button
          onClick={handleBack}
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
              onClick={() => {
                navigate('/test-wizard', { state: { editingMasterTest: true } });
              }}
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
                  <span>{selectedProject.tests.length} Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} />
                  <span>{selectedProject.tests.reduce((sum, t) => sum + t.questionCount, 0)} Questions</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowShuffleModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Shuffle size={18} />
                <span>Shuffle Tests</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download size={18} />
                <span>Export All</span>
              </button>
              <button
                onClick={handleAddTest}
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
          {selectedProject.tests && selectedProject.tests.length > 0 ? (
            selectedProject.tests.map((test, index) => (
              <div
                key={test.id}
                className="group border border-gray-200 rounded-lg p-5 hover:border-green-500 hover:shadow-md transition-all cursor-pointer bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1" onClick={() => handleTestClick(test)}>
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
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setExportTest(test);
                        setShowExportModal(true);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Export test"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm('Delete this test?')) deleteTest(test.id);
                      }}
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
            ))
          ) : (
            <div className="col-span-2 text-center text-gray-400 py-8">No tests found.</div>
          )}
        </div>
      </div>
      </div>
      <ExportModal open={showExportModal} test={exportTest} onClose={() => { setShowExportModal(false); setExportTest(null); }} />
    </>
  );
}
