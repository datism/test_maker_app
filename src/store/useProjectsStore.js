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
}), {
  name: 'projects-store',
}))
