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
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [testType, setTestType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(138);
  const [progress, setProgress] = useState(33);
  const [testWizardSections, setTestWizardSections] = useState([]);
  const [showTestWizard, setShowTestWizard] = useState(false);
  
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Midterm Mathematics",
      description: "Algebra and Geometry Assessment",
      createdDate: "2025-09-15",
      testCount: 3,
      totalQuestions: 45,
      tests: [
        {
          id: 1,
          name: "Algebra Test A",
          type: "multiple-choice",
          difficulty: "medium",
          questionCount: 15,
          createdDate: "2025-09-16"
        },
        {
          id: 2,
          name: "Algebra Test B",
          type: "multiple-choice",
          difficulty: "hard",
          questionCount: 15,
          createdDate: "2025-09-17"
        },
        {
          id: 3,
          name: "Geometry Test",
          type: "fill-in-blank",
          difficulty: "medium",
          questionCount: 15,
          createdDate: "2025-09-18"
        }
      ]
    },
    {
      id: 2,
      name: "Final History Exam",
      description: "World War II and Cold War Era",
      createdDate: "2025-09-20",
      testCount: 2,
      totalQuestions: 30,
      tests: [
        {
          id: 4,
          name: "WWII Test",
          type: "multiple-choice",
          difficulty: "easy",
          questionCount: 15,
          createdDate: "2025-09-21"
        },
        {
          id: 5,
          name: "Cold War Test",
          type: "true-false",
          difficulty: "medium",
          questionCount: 15,
          createdDate: "2025-09-22"
        }
      ]
    },
    {
      id: 3,
      name: "Science Quiz Series",
      description: "Biology and Chemistry Topics",
      createdDate: "2025-09-25",
      testCount: 4,
      totalQuestions: 60,
      tests: [
        {
          id: 6,
          name: "Cell Biology",
          type: "multiple-choice",
          difficulty: "medium",
          questionCount: 15,
          createdDate: "2025-09-26"
        },
        {
          id: 7,
          name: "Organic Chemistry",
          type: "multiple-choice",
          difficulty: "hard",
          questionCount: 15,
          createdDate: "2025-09-27"
        },
        {
          id: 8,
          name: "Genetics",
          type: "fill-in-blank",
          difficulty: "medium",
          questionCount: 15,
          createdDate: "2025-09-28"
        },
        {
          id: 9,
          name: "Chemical Reactions",
          type: "true-false",
          difficulty: "easy",
          questionCount: 15,
          createdDate: "2025-09-29"
        }
      ]
    }
  ]);
  
  const [questions, setQuestions] = useState([
    {
      id: 1,
      text: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris"],
      correctAnswer: 2
    },
    {
      id: 2,
      text: "Who wrote '1984'?",
      options: ["Aldous Huxley", "George Orwell", "J.K. Rowling"],
      correctAnswer: 1
    },
    {
      id: 3,
      text: "What is the boiling point of water?",
      options: ["100°C", "90°C", "80°C"],
      correctAnswer: 0
    }
  ]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setCurrentScreen('project-detail');
  };

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setCurrentScreen('preview');
  };

  const handleShuffleTests = () => {
    const project = projects.find(p => p.id === selectedProject.id);
    const shuffled = [...project.tests].sort(() => Math.random() - 0.5);
    setProjects(projects.map(p => 
      p.id === selectedProject.id ? {...p, tests: shuffled} : p
    ));
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
      tests: []
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
    const newTest = {
      id: Date.now(),
      name: `Test ${(selectedProject.tests ? selectedProject.tests.length : 0) + 1}`,
      createdDate: new Date().toISOString().split('T')[0],
      sections: sectionQuestions,
      questionCount: sectionQuestions.reduce((sum, s) => sum + s.questions.length, 0),
    };
    setProjects(projects => {
      const updated = projects.map(p => {
        if (p.id === selectedProject.id) {
          const updatedTests = [...(p.tests || []), newTest];
          return {
            ...p,
            tests: updatedTests,
            testCount: (p.testCount || 0) + 1,
            totalQuestions: (p.totalQuestions || 0) + newTest.questionCount
          };
        }
        return p;
      });
      // update selectedProject reference to the new object
      const updatedProject = updated.find(p => p.id === selectedProject.id);
      setSelectedProject(updatedProject);
      return updated;
    });
    setShowTestWizard(false);
    setCurrentScreen('project-detail');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            />
          )}
          {currentScreen === 'wizard' && (
            <></>
          )}
          {currentScreen === 'preview' && (
            <TestPreview
              testType={testType}
              difficulty={difficulty}
              questions={questions}
              onBack={handleBack}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TestMakerApp;