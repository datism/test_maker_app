import React from 'react';
import { Plus, FolderOpen, Calendar, FileText } from 'lucide-react';

const ProjectsList = ({ projects, onProjectClick, onNewProject }) => (
  <div className="max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Projects</h1>
        <p className="text-gray-600">Manage your test projects and assessments</p>
      </div>
      <button 
        onClick={onNewProject}
        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
      >
        <Plus size={20} />
        <span className="font-medium">New Project</span>
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <div 
          key={project.id}
          onClick={() => onProjectClick(project)}
          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 overflow-hidden group"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <div className="flex items-start justify-between mb-3">
              <FolderOpen className="text-white" size={32} />
              <span className="bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-medium">
                {project.testCount} Tests
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4 text-sm">{project.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-500">
                <Calendar size={16} className="mr-2" />
                <span>Created: {new Date(project.createdDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <FileText size={16} className="mr-2" />
                <span>Total Questions: {project.totalQuestions}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 group-hover:text-green-600 transition-colors font-medium">
                Click to view tests →
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProjectsList;
