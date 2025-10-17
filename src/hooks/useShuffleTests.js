// Shuffle logic hook for generating tests
// Uses Zustand store for state
/**
 * @typedef {Object} Section
 * @property {string|number} sectionId
 * @property {string} sectionName
 * @property {Array<Question>} questions
 *
 * @typedef {Object} Question
 * @property {string|number} id
 * @property {string} text
 * @property {Array<string>} options
 * @property {number} correctAnswer
 */
import { useProjectsStore } from '../store/useProjectsStore'

export function useShuffleTests() {
  const { selectedProject } = useProjectsStore();

  function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
  }
  function nPk(n, k) {
    return n >= k ? factorial(n) / factorial(n - k) : 0;
  }

  function validateShuffle(numTests, sectionCounts) {
    if (!selectedProject?.masterTest) return { valid: false, perms: 0, error: 'No master test.' };
    if (numTests < 1) return { valid: false, perms: 0, error: 'Number of tests must be at least 1.' };
    const masterSections = selectedProject.masterTest.sections;
    for (let i = 0; i < sectionCounts.length; ++i) {
      if (
        sectionCounts[i] < 1 ||
        sectionCounts[i] > (masterSections[i]?.questions.length || 0)
      ) {
        return { valid: false, perms: 0, error: `Invalid question count for section ${i + 1}` };
      }
    }
    let totalPerms = 1;
    for (let i = 0; i < masterSections.length; ++i) {
      totalPerms *= nPk(masterSections[i].questions.length, sectionCounts[i]);
    }
    if (numTests > totalPerms) {
      return { valid: false, perms: totalPerms, error: `Only ${totalPerms} unique tests can be generated with current settings.` };
    }
    return { valid: true, perms: totalPerms, error: '' };
  }

  function generateTests(numTests, sectionCounts) {
    const masterSections = selectedProject.masterTest.sections;
    const generated = new Set();
    const newTests = [];
    let attempts = 0;
    while (newTests.length < numTests && attempts < numTests * 20) {
      const sections = masterSections.map((section, sidx) => {
        const pool = [...section.questions];
        const chosen = [];
        for (let j = 0; j < sectionCounts[sidx]; ++j) {
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
          name: `Generated Test ${newTests.length + 1}`,
          createdDate: new Date().toISOString().split('T')[0],
          sections,
          questionCount: sections.reduce((sum, s) => sum + s.questions.length, 0)
        });
      }
      attempts++;
    }
    return newTests;
  }

  return { validateShuffle, generateTests };
}
