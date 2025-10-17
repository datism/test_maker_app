import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/useProjectsStore';
import { isNonEmpty } from '../utils/validation';

export default function ProjectWizard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState([{ id: Date.now(), name: '' }]);
  const { addProject } = useProjectsStore();
  const navigate = useNavigate();

  function handleCreate() {
    const filteredSections = sections.filter(s => isNonEmpty(s.name));
    addProject({
      id: Date.now(),
      name,
      description,
      createdDate: new Date().toISOString().split('T')[0],
      testCount: 0,
      totalQuestions: 0,
      sections: filteredSections,
      tests: [],
      masterTest: {
        id: 'master',
        name: 'Master Test',
        createdDate: new Date().toISOString().split('T')[0],
        sections: filteredSections.map(s => ({
          sectionId: s.id,
          sectionName: s.name,
          questions: []
        })),
        questionCount: 0
      }
    });
    navigate('/');
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
      <div className="mb-4">
        <label className="block mb-1">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Sections</label>
        {sections.map((section, idx) => (
          <div key={section.id} className="flex gap-2 mb-2">
            <input
              type="text"
              value={section.name}
              onChange={e => setSections(sections.map(s => s.id === section.id ? { ...s, name: e.target.value } : s))}
              className="flex-1 border px-2 py-1 rounded"
              placeholder={`Section ${idx + 1} name`}
            />
            <button
              type="button"
              onClick={() => setSections(sections.length > 1 ? sections.filter(s => s.id !== section.id) : sections)}
              className="px-2 py-1 text-red-500"
              disabled={sections.length === 1}
            >
              &times;
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSections([...sections, { id: Date.now() + Math.random(), name: '' }])}
          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded"
        >
          + Add Section
        </button>
      </div>
      <button
        onClick={handleCreate}
        disabled={!name || sections.some(s => !isNonEmpty(s.name))}
        className="px-8 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Create Project
      </button>
    </div>
  );
}
