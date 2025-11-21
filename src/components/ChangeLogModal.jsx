import React from 'react';
import { changelogs } from '../utils/changelogs';

export default function ChangeLogModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded shadow-lg max-w-3xl w-full mx-4 p-4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold">Change Log</h3>
          <button
            aria-label="Close changelog"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {changelogs.map((c, idx) => (
            <div key={idx} className="border-t pt-3">
              <div className="flex justify-between text-sm text-gray-600">
                <div className="font-medium">v{c.version}</div>
                <div>{c.date}</div>
              </div>
              <div className="text-sm text-gray-700 mt-2 text-left" dangerouslySetInnerHTML={{ __html: c.description }} />
            </div>
          ))}
        </div>

        <div className="mt-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
