import React from 'react';

const ProjectWizard = ({ onBack, onCreate }) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [sections, setSections] = React.useState([{ id: Date.now(), name: '' }]);

  const handleSectionNameChange = (id, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, name: value } : s));
  };

  const handleAddSection = () => {
    setSections([...sections, { id: Date.now() + Math.random(), name: '' }]);
  };

  const handleRemoveSection = (id) => {
    setSections(sections.length > 1 ? sections.filter(s => s.id !== id) : sections);
  };

  const handleCreate = () => {
    const filteredSections = sections.filter(s => s.name.trim() !== '');
    onCreate({ name, description, sections: filteredSections });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-10">
        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter project name"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter project description"
            rows={3}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Sections</label>
          {sections.map((section, idx) => (
            <div key={section.id} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={section.name}
                onChange={e => handleSectionNameChange(section.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`Section ${idx + 1} name`}
              />
              <button
                type="button"
                onClick={() => handleRemoveSection(section.id)}
                className="px-2 py-1 text-red-500 hover:text-red-700"
                disabled={sections.length === 1}
                title="Remove section"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddSection}
            className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            + Add Section
          </button>
        </div>
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || sections.some(s => !s.name.trim())}
            className="px-8 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectWizard;
