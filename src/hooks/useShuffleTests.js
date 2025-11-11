// Shuffle logic hook for generating tests
// Uses Zustand store for state
/**
 * @typedef {Object} Section
 * @property {string|number} id
 * @property {string} sectionName
 * @property {Array<Question>} questions
 *
 * @typedef {Object} Question
 * @property {string|number} id
 * @property {string} text
 * @property {string} type - 'mcq' | 'filltheblank' | 'reading' | 'writing'
 * @property {Array<string>} options - for mcq
 * @property {number} correctAnswer - for mcq
 * @property {Array<SubQuestion>} questions - for filltheblank and reading
 *
 * @typedef {Object} SubQuestion
 * @property {string|number} id
 * @property {string} text
 * @property {Array<string>} options
 * @property {number} correctAnswer
 */
import { useProjectsStore } from '../store/useProjectsStore'

function getPermutations(arr, k) {
  const results = [];

  function helper(current, remaining) {
    if (current.length === k) {
      results.push([...current]);
      return;
    }

    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const rest = remaining.slice(0, i).concat(remaining.slice(i + 1));
      current.push(next);
      helper(current, rest);
      current.pop();
    }
  }

  helper([], arr);
  return results;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// Shuffle options for a single MCQ-style question and update correctAnswer
function shuffleQuestionOptions(question) {
  if (!question.options || question.options.length === 0) {
    return question; // No options to shuffle
  }

  const originalCorrectOption = question.options[question.correctAnswer];
  const shuffledOptions = shuffleArray(question.options);
  const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);

  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectIndex
  };
}

// Shuffle options for all question types
function shuffleQuestion(question) {
  const type = question.type?.toLowerCase();

  switch (type) {
    case 'mcq':
      // MCQ: shuffle options directly
      return shuffleQuestionOptions(question);
    case 'fill-in-the-blank':
    case 'reading':
      // These have nested questions array, shuffle each sub-question's options
      if (question.questions && Array.isArray(question.questions)) {
        return {
          ...question,
          questions: question.questions.map(subQ => shuffleQuestionOptions(subQ))
        };
      }
      return question;
    default:
      return question;
  }
}

export function useShuffleTests() {
  const { selectedProject } = useProjectsStore();

  // factorial and nPk helpers (for validation)
  const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
  const nPk = (n, k) => (n >= k ? factorial(n) / factorial(n - k) : 0);

  // --- Validate before generation ---
  function validateShuffle(numTests, sectionCounts) {
    if (!selectedProject?.masterTest)
      return { valid: false, perms: 0, error: 'No master test found.' };
    if (numTests < 1)
      return { valid: false, perms: 0, error: 'Number of tests must be at least 1.' };

    const masterSections = selectedProject.masterTest.sections;
    for (let i = 0; i < sectionCounts.length; i++) {
      const questions = masterSections[i]?.questions || [];
      const count = sectionCounts[i];
      if (count < 1 || count > questions.length) {
        return {
          valid: false,
          perms: 0,
          error: `Invalid question count for section ${i + 1}`
        };
      }
    }

    // Calculate the minimum number of unique combinations available across sections
    const permsPerSection = masterSections.map((section, i) =>
      nPk(section.questions.length, sectionCounts[i])
    );
    const minPerms = Math.min(...permsPerSection);

    if (numTests > minPerms) {
      return {
        valid: false,
        perms: minPerms,
        error: `Only ${minPerms} unique tests can be generated with current settings.`
      };
    }

    return { valid: true, perms: minPerms, error: '' };
  }

  // --- Generate tests using combinations ---
  function generateTests(numTests, sectionCounts) {
    const masterSections = selectedProject.masterTest.sections || [];

    const allSectionPerms = masterSections.map((section, sIdx) => {
      const questions = section.questions || [];
      const subLen = sectionCounts[sIdx];
      const perms = getPermutations(questions, subLen);
      // Randomize order of permutations so generated tests vary
      return perms.sort(() => Math.random() - 0.5);
    });

    // Determine how many unique tests can actually be built
    const maxTests = Math.min(numTests, ...allSectionPerms.map(p => p.length));

    const newTests = [];
    for (let t = 0; t < maxTests; t++) {
      const sections = masterSections.map((section, sIdx) => {
        // Get the questions for this test variant
        const selectedQuestions = allSectionPerms[sIdx][t];
        
        // Shuffle options for each question
        const shuffledQuestions = selectedQuestions.map(q => shuffleQuestion(q));

        return {
          id: section.id,
          sectionName: section.sectionName,
          questions: shuffledQuestions
        };
      });

      newTests.push({
        id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        name: `Generated Test ${t + 1}`,
        createdDate: new Date().toISOString().split('T')[0],
        sections,
        questionCount: sections.reduce((sum, s) => sum + s.questions.length, 0)
      });
    }

    return newTests;
  }

  return { validateShuffle, generateTests };
}