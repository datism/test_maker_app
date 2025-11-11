export const validateProject = (project) => {
  const errors = {};
  if (!project.name) {
    errors.name = 'Project name is required';
  }
  if (!project.description) {
    errors.description = 'Project description is required';
  }
  return errors;
};

const isEditorEmpty = (value) => !value || value.replace(/<(.|\n)*?>/g, '').trim().length === 0;

export const validateMCQQuestion = ({ text, options, correctAnswer }) => {
  const errors = {};
  if (isEditorEmpty(text)) {
    errors.text = 'Question is required';
  }
  if (!options || options.length < 2) {
    errors.options = 'At least two options are required';
  } else if (options.some(opt => !opt.trim())) {
    errors.options = 'Options cannot be empty';
  }
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer < 0) {
    errors.correctAnswer = 'A correct answer must be selected';
  } else if (options && correctAnswer >= options.length) {
    errors.correctAnswer = 'The correct answer is out of bounds';
  }
  return errors;
};

function validateSubMCQ(subQ, index) {
    const errors = {};
    if (isEditorEmpty(subQ.text)) {
        errors.text = `Question ${index + 1} text is required`;
    }
    if (!subQ.options || subQ.options.length < 2) {
        errors.options = `Question ${index + 1} must have at least two options`;
    } else if (subQ.options.some(opt => !opt.trim())) {
        errors.options = `Options for question ${index + 1} cannot be empty`;
    }
    if (subQ.correctAnswer === null || subQ.correctAnswer === undefined || subQ.correctAnswer < 0) {
        errors.correctAnswer = `A correct answer for question ${index + 1} must be selected`;
    }
    return errors;
}

export const validateReadingQuestion = ({ passage, questions }) => {
  const errors = {};
  if (isEditorEmpty(passage)) {
    errors.passage = 'Passage is required';
  }
  if (!questions || questions.length === 0) {
    errors.questions = 'At least one sub-question is required';
  } else {
    const subQuestionErrors = [];
    questions.forEach((q, i) => {
        const subErrors = validateSubMCQ(q, i);
        if(Object.keys(subErrors).length > 0) {
            subQuestionErrors[i] = subErrors;
        }
    });
    if(subQuestionErrors.length > 0) {
        errors.subQuestions = subQuestionErrors;
    }
  }
  return errors;
};

export const validateFillInTheBlankQuestion = ({ passage, questions }) => {
    const errors = {};
    const blankCount = (passage.match(/{blank}/g) || []).length;

    if (isEditorEmpty(passage)) {
        errors.passage = 'Passage is required';
    } else if (blankCount === 0) {
        errors.passage = 'The passage must contain at least one {blank} placeholder';
    }

    if (blankCount !== questions.length) {
        errors.questions = `The number of sub-questions must match the number of blanks (${blankCount})`;
    }

    if (questions && questions.length > 0) {
        const subQuestionErrors = [];
        questions.forEach((q, i) => {
            const subErrors = {};
            if (!q.options || q.options.length < 2) {
                subErrors.options = `Blank ${i + 1} must have at least two options`;
            } else if (q.options.some(opt => !opt.trim())) {
                subErrors.options = `Options for blank ${i + 1} cannot be empty`;
            }
            if (q.correctAnswer === null || q.correctAnswer === undefined || q.correctAnswer < 0) {
                subErrors.correctAnswer = `A correct answer for blank ${i + 1} must be selected`;
            }
            if(Object.keys(subErrors).length > 0) {
                subQuestionErrors[i] = subErrors;
            }
        });
        if(subQuestionErrors.length > 0) {
            errors.subQuestions = subQuestionErrors;
        }
    }
    return errors;
};


export const validateWritingQuestion = ({ text, answer }) => {
  const errors = {};
  if (isEditorEmpty(text)) {
    errors.text = 'Prompt is required';
  }
  if (!answer || !answer.trim()) {
    errors.answer = 'Sample answer is required';
  }
  return errors;
};
