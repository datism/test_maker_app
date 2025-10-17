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
    const updatedProjects = state.projects.map(p => ({
      ...p,
      tests: p.tests?.filter(t => t.id !== testId) || []
    }));
    let updatedSelectedProject = state.selectedProject;
    if (state.selectedProject) {
      const project = updatedProjects.find(p => p.id === state.selectedProject.id);
      updatedSelectedProject = project ? project : null;
    }
    return {
      projects: updatedProjects,
      selectedProject: updatedSelectedProject,
      selectedTest: state.selectedTest && state.selectedTest.id === testId ? null : state.selectedTest
    };
  }),
}), {
  name: 'projects-store',
}))
