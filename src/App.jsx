import React, { useState } from 'react';
import ProjectsList from './components/ProjectsList';
import ProjectDetail from './components/ProjectDetail';
import TestPreview from './components/TestPreview';
import ProjectWizard from './components/ProjectWizard';
import TestWizard from './components/TestWizard';

const TestMakerApp = () => {
  const [currentScreen, setCurrentScreen] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [testType, setTestType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(138);
  const [progress, setProgress] = useState(33);
  const [testWizardSections, setTestWizardSections] = useState([]);
  const [showTestWizard, setShowTestWizard] = useState(false);
  
  const [projects, setProjects] = useState([]);
  

  const [questions, setQuestions] = useState([]);
  const [editingMasterTest, setEditingMasterTest] = useState(false);
  // Shuffle modal state
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [shuffleNumTests, setShuffleNumTests] = useState(1);
  const [shuffleSectionCounts, setShuffleSectionCounts] = useState([]);
  const [shuffleError, setShuffleError] = useState('');
  const [shuffleSuccess, setShuffleSuccess] = useState('');

  const handleEditMasterTest = (masterTest) => {
    setTestWizardSections(masterTest.sections || []);
    setEditingMasterTest(true);
    setShowTestWizard(true);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setCurrentScreen('project-detail');
  };

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setCurrentScreen('preview');
  };

  const handleEditTest = (test) => {
    if (!test) return;
    setSelectedTest(test);
    setTestWizardSections(test.sections || []);
    setEditingTestId(test.id);
    setShowTestWizard(true);
  };

  // Helper: factorial
  const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
  // Helper: nPk = n!/(n-k)!
  const nPk = (n, k) => (n >= k ? factorial(n) / factorial(n - k) : 0);

  // Validation helpers
  const getShuffleValidation = () => {
    if (!selectedProject?.masterTest) return { valid: false, perms: 0, error: 'No master test.' };
    if (shuffleNumTests < 1) return { valid: false, perms: 0, error: 'Number of tests must be at least 1.' };
    const masterSections = selectedProject.masterTest.sections;
    for (let i = 0; i < shuffleSectionCounts.length; ++i) {
      if (
        shuffleSectionCounts[i] < 1 ||
        shuffleSectionCounts[i] > (masterSections[i]?.questions.length || 0)
      ) {
        return { valid: false, perms: 0, error: `Invalid question count for section ${i + 1}` };
      }
    }
    let totalPerms = 1;
    for (let i = 0; i < masterSections.length; ++i) {
      totalPerms *= nPk(masterSections[i].questions.length, shuffleSectionCounts[i]);
    }
    if (shuffleNumTests > totalPerms) {
      return { valid: false, perms: totalPerms, error: `Only ${totalPerms} unique tests can be generated with current settings.` };
    }
    return { valid: true, perms: totalPerms, error: '' };
  };

  // Reset modal state
  const resetShuffleModal = () => {
    setShuffleError('');
    setShuffleSuccess('');
    setShowShuffleModal(false);
  };

  const handleShuffleTests = () => {
    // Open modal for shuffle options
    if (!selectedProject?.masterTest) return;
    // Default: 1 test, all sections use all questions
    setShuffleNumTests(1);
    setShuffleSectionCounts(
      (selectedProject.masterTest.sections || []).map(s => s.questions.length)
    );
  setShuffleError('');
  setShuffleSuccess('');
  setShowShuffleModal(true);
  };

  // Validate and generate tests
  const handleGenerateShuffledTests = () => {
    const { valid, error } = getShuffleValidation();
    if (!valid) {
      setShuffleError(error);
      return;
    }
    const masterSections = selectedProject.masterTest.sections;
    // Generate tests
    const generated = new Set();
    const newTests = [];
    let attempts = 0;
    while (newTests.length < shuffleNumTests && attempts < shuffleNumTests * 20) {
      const sections = masterSections.map((section, sidx) => {
        const pool = [...section.questions];
        const chosen = [];
        for (let j = 0; j < shuffleSectionCounts[sidx]; ++j) {
          const idx = Math.floor(Math.random() * pool.length);
          chosen.push(pool[idx]);
          pool.splice(idx, 1);
        }
        return {
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          questions: chosen
        };
      });
      const sig = sections.map(sec => sec.questions.map(q => q.id).join(',')).join('|');
      if (!generated.has(sig)) {
        generated.add(sig);
        newTests.push({
          id: Date.now() + Math.floor(Math.random() * 100000),
          name: `Generated Test ${selectedProject.tests.length + newTests.length + 1}`,
          createdDate: new Date().toISOString().split('T')[0],
          sections,
          questionCount: sections.reduce((sum, s) => sum + s.questions.length, 0)
        });
      }
      attempts++;
    }
    if (newTests.length < shuffleNumTests) {
      setShuffleError(`Could only generate ${newTests.length} unique tests.`);
      return;
    }
    setProjects(projects => {
      const updated = projects.map(p => {
        if (p.id !== selectedProject.id) return p;
        return {
          ...p,
          tests: [...p.tests, ...newTests],
          testCount: (p.testCount || 0) + newTests.length,
          totalQuestions: (p.totalQuestions || 0) + newTests.reduce((sum, t) => sum + t.questionCount, 0)
        };
      });
      // Update selectedProject reference so UI updates immediately
      const updatedProject = updated.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedProject);
      return updated;
    });
    setShuffleSuccess(`${newTests.length} tests generated successfully!`);
    setTimeout(() => {
      resetShuffleModal();
    }, 1200);
  };

  const handleDuplicateTest = (testId) => {
    const project = projects.find(p => p.id === selectedProject.id);
    const testToDuplicate = project.tests.find(t => t.id === testId);
    const newTest = {
      ...testToDuplicate,
      id: Date.now(),
      name: `${testToDuplicate.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setProjects(projects.map(p => 
      p.id === selectedProject.id 
        ? {...p, tests: [...p.tests, newTest], testCount: p.testCount + 1}
        : p
    ));
  };

  const handleDeleteTest = (testId) => {
    setProjects(projects.map(p => 
      p.id === selectedProject.id 
        ? {...p, tests: p.tests.filter(t => t.id !== testId), testCount: p.testCount - 1}
        : p
    ));
  };

  const handleBack = () => {
    if (currentScreen === 'preview') {
      setCurrentScreen('project-detail');
    } else if (currentScreen === 'project-detail') {
      setCurrentScreen('projects');
    } else {
      setCurrentScreen('wizard');
    }
  };

  const handleCreateProject = ({ name, description, sections }) => {
    const newProject = {
      id: Date.now(),
      name,
      description,
      createdDate: new Date().toISOString().split('T')[0],
      testCount: 0,
      totalQuestions: 0,
      sections: sections || [],
      tests: [],
      masterTest: {
        id: 'master',
        name: 'Master Test',
        createdDate: new Date().toISOString().split('T')[0],
        sections: (sections || []).map(s => ({
          sectionId: s.id ?? s.sectionId,
          sectionName: s.name ?? s.sectionName,
          questions: []
        })),
        questionCount: 0
      }
    };
    setProjects([...projects, newProject]);
    setShowProjectWizard(false);
    setCurrentScreen('projects');
  };

  const handleAddTest = (project) => {
    setTestWizardSections(project.sections || []);
    setShowTestWizard(true);
  };

  const handleSaveTest = (sectionQuestions) => {
    if (!selectedProject) return;
    const questionCount = sectionQuestions.reduce((sum, s) => sum + s.questions.length, 0);

    if (editingMasterTest) {
      // Save to masterTest
      setProjects(prevProjects => {
        const updated = prevProjects.map(p => {
          if (p.id !== selectedProject.id) return p;
          return {
            ...p,
            masterTest: {
              ...p.masterTest,
              sections: sectionQuestions,
              questionCount
            }
          };
        });
        const updatedProject = updated.find(p => p.id === selectedProject.id);
        setSelectedProject(updatedProject);
        return updated;
      });
      setEditingMasterTest(false);
      setShowTestWizard(false);
      return;
    }

    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        if (p.id !== selectedProject.id) return p;

        // if editing an existing test, replace it
        if (editingTestId) {
          const updatedTests = (p.tests || []).map(t =>
            t.id === editingTestId ? { ...t, sections: sectionQuestions, questionCount } : t
          );
          return {
            ...p,
            tests: updatedTests,
            totalQuestions: (p.totalQuestions || 0) - (selectedTest?.questionCount || 0) + questionCount
          };
        }

        // creating a new test
        const newTest = {
          id: Date.now(),
          name: `Test ${(p.tests ? p.tests.length : 0) + 1}`,
          createdDate: new Date().toISOString().split('T')[0],
          sections: sectionQuestions,
          questionCount,
        };
        return {
          ...p,
          tests: [...(p.tests || []), newTest],
          testCount: (p.testCount || 0) + 1,
          totalQuestions: (p.totalQuestions || 0) + questionCount
        };
      });

      const updatedProject = updated.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedProject);
      return updated;
    });

    // clear editing state
    setEditingTestId(null);
    setShowTestWizard(false);
    setCurrentScreen('project-detail');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Shuffle Modal */}
      {showShuffleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[350px] max-w-full">
            <h2 className="text-xl font-bold mb-4">Generate Shuffled Tests</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Number of tests to generate</label>
              <input
                type="number"
                min={1}
                value={shuffleNumTests}
                onChange={e => setShuffleNumTests(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Questions per section</label>
              {selectedProject.masterTest.sections.map((section, idx) => (
                <div key={section.sectionId} className="flex items-center gap-2 mb-1">
                  <span className="text-gray-700 text-sm w-32">{section.sectionName}</span>
                  <input
                    type="number"
                    min={1}
                    max={section.questions.length}
                    value={shuffleSectionCounts[idx]}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setShuffleSectionCounts(counts => counts.map((c, i) => i === idx ? val : c));
                    }}
                    className="w-20 px-2 py-1 border rounded"
                  />
                  <span className="text-xs text-gray-500">/ {section.questions.length} available</span>
                </div>
              ))}
            </div>
            {shuffleError && <div className="text-red-600 mb-2 text-sm">{shuffleError}</div>}
            {shuffleSuccess && <div className="text-green-600 mb-2 text-sm">{shuffleSuccess}</div>}
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={resetShuffleModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >Cancel</button>
              <button
                onClick={handleGenerateShuffledTests}
                className={`px-4 py-2 rounded text-white ${getShuffleValidation().valid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!getShuffleValidation().valid}
              >Generate</button>
            </div>
          </div>
        </div>
      )}
      {showProjectWizard ? (
        <ProjectWizard 
          onBack={() => setShowProjectWizard(false)}
          onCreate={handleCreateProject}
        />
      ) : showTestWizard ? (
        <TestWizard
          sections={testWizardSections}
          onBack={() => setShowTestWizard(false)}
          onSave={handleSaveTest}
        />
      ) : (
        <>
          {currentScreen === 'projects' && (
            <ProjectsList 
              projects={projects} 
              onProjectClick={handleProjectClick} 
              onNewProject={() => setShowProjectWizard(true)} 
            />
          )}
          {currentScreen === 'project-detail' && selectedProject && (
            <ProjectDetail
              selectedProject={selectedProject}
              onBack={handleBack}
              onShuffleTests={handleShuffleTests}
              onAddTest={() => handleAddTest(selectedProject)}
              onTestClick={handleTestClick}
              onDuplicateTest={handleDuplicateTest}
              onDeleteTest={handleDeleteTest}
              onEditMasterTest={handleEditMasterTest}
            />
          )}
          {currentScreen === 'wizard' && (
            <></>
          )}
          {currentScreen === 'preview' && (
            <TestPreview
              test={selectedTest}
              onBack={handleBack}
              onEdit={handleEditTest}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TestMakerApp;