// Zustand store for projects, selectedProject, selectedTest
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useProjectsStore = create(persist((set, get) => ({
  projects: [],
  selectedProject: null,
  selectedTest: null,
  setProjects: (projects) => set({ projects }),
  selectProject: (project) => set({ selectedProject: project }),
  selectTest: (test) => set({ selectedTest: test }),
  addProject: (project) => set(state => ({ projects: [...state.projects, project] })),
  updateProject: (updatedProject) => set(state => ({
    projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p),
    selectedProject: state.selectedProject && state.selectedProject.id === updatedProject.id ? updatedProject : state.selectedProject
  })),
  deleteTest: (testId) => set(state => {
    const testToDelete = state.projects.flatMap(p => p.tests || []).find(t => t.id === testId);
    if (!testToDelete) return state; // Test not found

    const updatedProjects = state.projects.map(p => {
      if (p.tests?.some(t => t.id === testId)) {
        const newTests = p.tests.filter(t => t.id !== testId);
        return {
          ...p,
          tests: newTests,
          testCount: newTests.length,
          totalQuestions: newTests.reduce((sum, t) => sum + t.questionCount, 0)
        };
      }
      return p;
    });

    const updatedSelectedProject = state.selectedProject
      ? updatedProjects.find(p => p.id === state.selectedProject.id) || null
      : null;

    return {
      projects: updatedProjects,
      selectedProject: updatedSelectedProject,
      selectedTest: state.selectedTest && state.selectedTest.id === testId ? null : state.selectedTest
    };
  }),
  addTest: (projectId, test) => set(state => {
    const testWithId = {
      ...test,
      id: test.id || Date.now(),
      sections: test.sections || [],
      questionCount:
        (test.sections || []).reduce((sum, s) => sum + (s.questions?.length || 0), 0)
    };

    const newProjects = state.projects.map(p => {
      if (p.id !== projectId) return p;

      const newTests = [...(p.tests || []), testWithId];

      return {
        ...p,
        tests: newTests,
        testCount: newTests.length,
        totalQuestions: newTests.reduce((sum, t) => sum + (t.questionCount || 0), 0)
      };
    });

    const newSelectedProject = newProjects.find(p => p.id === projectId);

    return {
      projects: newProjects,
      selectedProject: newSelectedProject,
      selectedTest: testWithId   // optional: auto-select test vừa thêm
    };
  }),
  addQuestion: (sectionId, question) => set(state => {
    const { projects, selectedTest, selectedProject } = state;
    if (!selectedTest) return state;

    if (selectedTest.id === 'master') {
      const newMasterTest = {
        ...selectedTest,
        sections: selectedTest.sections.map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            questions: [...(s.questions || []), { ...question, id: Date.now() }]
          };
        })
      };
      newMasterTest.questionCount = newMasterTest.sections.reduce((sum, s) => sum + s.questions.length, 0);

      const newProjects = projects.map(p => {
        if (p.id !== selectedProject.id) return p;
        return { ...p, masterTest: newMasterTest };
      });
      const newSelectedProject = newProjects.find(p => p.id === selectedProject.id);

      return {
        projects: newProjects,
        selectedTest: newMasterTest,
        selectedProject: newSelectedProject
      };
    }

    const newProjects = projects.map(p => {
      if (p.id !== selectedProject.id) return p;

      const newTests = p.tests.map(t => {
        if (t.id !== selectedTest.id) return t;

        const newSections = t.sections.map(s => {
          if (s.id !== sectionId) return s;
          return {
            ...s,
            questions: [...(s.questions || []), { ...question, id: Date.now() }]
          };
        });

        return {
          ...t,
          sections: newSections,
          questionCount: newSections.reduce((sum, s) => sum + s.questions.length, 0)
        };
      });
      
      return {
        ...p,
        tests: newTests,
        totalQuestions: newTests.reduce((sum, t) => sum + t.questionCount, 0)
      };
    });

    const newSelectedProject = newProjects.find(p => p.id === selectedProject.id);
    const newSelectedTest = newSelectedProject.tests.find(t => t.id === selectedTest.id);

    return {
      projects: newProjects,
      selectedTest: newSelectedTest,
      selectedProject: newSelectedProject
    };
  }),
  deleteQuestion: (sectionId, questionId, subQuestionId) => set(state => {
    const { projects, selectedTest, selectedProject } = state;
    if (!selectedTest) return state;

    if (selectedTest.id === 'master') {
      const newMasterTest = { ...selectedTest };
      const newSections = newMasterTest.sections.map(s => {
        if (s.id !== sectionId) return s;

        let newQuestions;
        if (subQuestionId) {
          newQuestions = s.questions.map(q => {
            if (q.id === questionId) {
              const newSubQuestions = q.questions.filter(subQ => subQ.id !== subQuestionId);
              return { ...q, questions: newSubQuestions };
            }
            return q;
          });
        } else {
          newQuestions = s.questions.filter(q => q.id !== questionId);
        }
        
        return {
          ...s,
          questions: newQuestions
        };
      });

      newMasterTest.sections = newSections;
      newMasterTest.questionCount = newSections.reduce((sum, s) => sum + s.questions.length, 0);

      const newProjects = projects.map(p => {
        if (p.id !== selectedProject.id) return p;
        return { ...p, masterTest: newMasterTest };
      });
      const newSelectedProject = newProjects.find(p => p.id === selectedProject.id);

      return {
        projects: newProjects,
        selectedTest: newMasterTest,
        selectedProject: newSelectedProject
      };
    }

    const newProjects = projects.map(p => {
      if (p.id !== selectedProject.id) return p;

      const newTests = p.tests.map(t => {
        if (t.id !== selectedTest.id) return t;

        const newSections = t.sections.map(s => {
          if (s.id !== sectionId) return s;

          let newQuestions;
          if (subQuestionId) {
            newQuestions = s.questions.map(q => {
              if (q.id === questionId) {
                const newSubQuestions = q.questions.filter(subQ => subQ.id !== subQuestionId);
                return { ...q, questions: newSubQuestions };
              }
              return q;
            });
          } else {
            newQuestions = s.questions.filter(q => q.id !== questionId);
          }
          
          return {
            ...s,
            questions: newQuestions
          };
        });

        return {
          ...t,
          sections: newSections,
          questionCount: newSections.reduce((sum, s) => sum + s.questions.length, 0)
        };
      });
      
      return {
        ...p,
        tests: newTests,
        totalQuestions: newTests.reduce((sum, t) => sum + t.questionCount, 0)
      };
    });

    const newSelectedProject = newProjects.find(p => p.id === selectedProject.id);
    const newSelectedTest = newSelectedProject.tests.find(t => t.id === selectedTest.id);

    return {
      projects: newProjects,
      selectedTest: newSelectedTest,
      selectedProject: newSelectedProject
    };
  }),
  updateQuestion: (sectionId, updatedQuestion) => set(state => {
    const { projects, selectedTest, selectedProject } = state;
    if (!selectedTest) return state;

    if (selectedTest.id === 'master') {
      const newMasterTest = { ...selectedTest };
      const newSections = newMasterTest.sections.map(s => {
        if (s.id !== sectionId) return s;

        const newQuestions = s.questions.map(q => {
          if (q.id === updatedQuestion.id) {
            return updatedQuestion;
          }
          if (q.type === 'reading') {
            const subQuestionIndex = q.questions.findIndex(subQ => subQ.id === updatedQuestion.id);
            if (subQuestionIndex !== -1) {
              const newSubQuestions = [...q.questions];
              newSubQuestions[subQuestionIndex] = updatedQuestion;
              return { ...q, questions: newSubQuestions };
            }
          }
          return q;
        });

        return { ...s, questions: newQuestions };
      });

      newMasterTest.sections = newSections;
      const newProjects = projects.map(p => {
        if (p.id !== selectedProject.id) return p;
        return { ...p, masterTest: newMasterTest };
      });
      const newSelectedProject = newProjects.find(p => p.id === selectedProject.id);

      return {
        projects: newProjects,
        selectedTest: newMasterTest,
        selectedProject: newSelectedProject
      };
    }

    const newProjects = projects.map(p => {
      if (p.id !== selectedProject.id) return p;

      const newTests = p.tests.map(t => {
        if (t.id !== selectedTest.id) return t;

        const newSections = t.sections.map(s => {
          if (s.id !== sectionId) return s;

          const newQuestions = s.questions.map(q => {
            if (q.id === updatedQuestion.id) {
              return updatedQuestion;
            }
            if (q.type === 'reading') {
              const subQuestionIndex = q.questions.findIndex(subQ => subQ.id === updatedQuestion.id);
              if (subQuestionIndex !== -1) {
                const newSubQuestions = [...q.questions];
                newSubQuestions[subQuestionIndex] = updatedQuestion;
                return { ...q, questions: newSubQuestions };
              }
            }
            return q;
          });

          return { ...s, questions: newQuestions };
        });

        return { ...t, sections: newSections };
      });
      
      return { ...p, tests: newTests };
    });

    const newSelectedProject = newProjects.find(p => p.id === selectedProject.id);
    const newSelectedTest = newSelectedProject.tests.find(t => t.id === selectedTest.id);

    return {
      projects: newProjects,
      selectedTest: newSelectedTest,
      selectedProject: newSelectedProject
    };
  }),
  updateTestName: (testId, newName) => set(state => {
    const { projects, selectedTest, selectedProject } = state;

    let newSelectedProject = selectedProject;

    const newProjects = projects.map(p => {
      if (p.masterTest && p.masterTest.id === testId) {
        const updatedMasterTest = { ...p.masterTest, name: newName };
        const updatedProject = { ...p, masterTest: updatedMasterTest };
        if (selectedProject && selectedProject.id === p.id) {
          newSelectedProject = updatedProject;
        }
        return updatedProject;
      }

      const testIndex = p.tests?.findIndex(t => t.id === testId);
      if (testIndex > -1) {
        const newTests = [...p.tests];
        newTests[testIndex] = { ...newTests[testIndex], name: newName };
        const updatedProject = { ...p, tests: newTests };
        if (selectedProject && selectedProject.id === p.id) {
          newSelectedProject = updatedProject;
        }
        return updatedProject;
      }

      return p;
    });

    const newSelectedTest = selectedTest && selectedTest.id === testId
      ? { ...selectedTest, name: newName }
      : selectedTest;

    return {
      projects: newProjects,
      selectedTest: newSelectedTest,
      selectedProject: newSelectedProject
    };
  }),
  deleteProject: (projectId) => set(state => ({
    projects: state.projects.filter(p => p.id !== projectId),
    selectedProject: state.selectedProject && state.selectedProject.id === projectId ? null : state.selectedProject,
  })),
}), {
  name: 'projects-store',
}))
