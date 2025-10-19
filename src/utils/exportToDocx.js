import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
// Estimate text width for spacing
function estimateTextWidth(text, fontSize = 12, font = "Times New Roman") {
  const avgCharWidth = 0.6;
  return text.length * fontSize * avgCharWidth;
}

// Format MCQ options as plain text with smart spacing
function formatQuestionForDocx(questionText, answers) {
  const font = "Times New Roman";
  const fontSize = 12;
  const pageWidth = 500;
  const labeled = answers.map((ans, i) => `${String.fromCharCode(65 + i)}. ${ans}`);
  const widths = labeled.map(ans => estimateTextWidth(ans, fontSize, font));
  const minSpaces = 16;
  const totalWidth = widths.reduce((a, b) => a + b, 0) + minSpaces * 3 * estimateTextWidth(" ", fontSize, font);
  if (totalWidth <= pageWidth) {
    const spaceWidth = estimateTextWidth(" ", fontSize, font);
    const remaining = pageWidth - widths.reduce((a, b) => a + b, 0);
    const spacesBetween = Math.floor(remaining / (3 * spaceWidth));
    const spaceStr = " ".repeat(Math.max(minSpaces, spacesBetween));
    return `${labeled.join(spaceStr)}`;
  }
  const minSpaces2 = 32;
  const line1Width = widths[0] + widths[1] + minSpaces2 * estimateTextWidth(" ", fontSize, font);
  const line2Width = widths[2] + widths[3] + minSpaces2 * estimateTextWidth(" ", fontSize, font);
  if (line1Width <= pageWidth && line2Width <= pageWidth) {
    const spaceWidth = estimateTextWidth(" ", fontSize, font);
    const rem1 = pageWidth - (widths[0] + widths[1]);
    const rem2 = pageWidth - (widths[2] + widths[3]);
    const spacesBetween1 = Math.floor(rem1 / spaceWidth);
    const spacesBetween2 = Math.floor(rem2 / spaceWidth);
    const spaceStr1 = " ".repeat(Math.max(minSpaces2, spacesBetween1));
    const spaceStr2 = " ".repeat(Math.max(minSpaces2, spacesBetween2));
    return `${labeled[0]}${spaceStr1}${labeled[1]}\n${labeled[2]}${spaceStr2}${labeled[3]}`;
  }
  return labeled.join("\n");
}
import { saveAs } from 'file-saver';

// Small helper to strip tags but keep inline styles for basic bold/underline
function parseHeaderHtml(headerHtml, defaultStyle) {
  // Very small parser: handle <b>, <strong>, <u>, <span style="font-size:..">, <div>/<p>
  // Return an array of Paragraphs (docx Paragraph objects) or plain objects we convert later
  const container = document.createElement('div');
  container.innerHTML = headerHtml || '';
  const paragraphs = [];
  Array.from(container.childNodes).forEach(node => {
    const runs = [];
    function walk(n) {
      if (n.nodeType === Node.TEXT_NODE) {
        runs.push({ text: n.nodeValue, bold: false, underline: false });
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const tag = n.tagName.toLowerCase();
        const isBold = tag === 'b' || tag === 'strong';
        const isUnderline = tag === 'u';
        if (tag === 'br') {
          runs.push({ break: true });
        } else if (tag === 'span' || tag === 'div' || tag === 'p') {
          const style = n.getAttribute('style') || '';
          const sizeMatch = style.match(/font-size:\s*(\d+)px/);
          const size = sizeMatch ? parseInt(sizeMatch[1], 10) : defaultStyle.fontSize;
          const alignMatch = style.match(/text-align:\s*(left|center|right)/);
          const align = alignMatch ? alignMatch[1] : defaultStyle.alignment || 'left';
          // recurse children
          Array.from(n.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              runs.push({ text: child.nodeValue, bold: isBold, underline: isUnderline, size, align });
            } else {
              walk(child);
            }
          });
          // paragraph break
          runs.push({ breakParagraph: true, align, size });
        } else {
          // other inline tags
          Array.from(n.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) runs.push({ text: child.nodeValue, bold: isBold, underline: isUnderline });
            else walk(child);
          });
        }
      }
    }
    walk(node);
    paragraphs.push(runs);
  });
  return paragraphs;
}

export async function exportTestDocx({ headerHtml = '', test = null, filename = 'export.docx' }) {
  // Use fixed defaults
  const fontFamily = 'Times New Roman';
  const fontSize = 24; // docx uses half-points; we'll convert later if needed
  const spacingBetweenQuestions = 200;
  // Build all children (header paragraphs + question blocks)
  const allChildren = [];

  // Header
  if (headerHtml) {
    const paras = parseHeaderHtml(headerHtml, { fontSize, alignment: 'center' });
    paras.forEach(runs => {
      const textRuns = runs.filter(r => r.text).map(r => new TextRun({ text: r.text, bold: r.bold, underline: r.underline ? {} : undefined, size: r.size || fontSize }));
      const alignStr = runs.find(r => r.align && typeof r.align === 'string')?.align || 'center';
      const alignment = alignStr === 'center' ? AlignmentType.CENTER : (alignStr === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT);
      const para = new Paragraph({ children: textRuns, alignment });
      allChildren.push(para);
    });
  }

  // Body: questions
  if (!test) throw new Error('No test provided');
  if (!Array.isArray(test.sections)) throw new Error('Test object must include a sections array');
  let qIdx = 0;
  test.sections.forEach(section => {
    (section.questions || []).forEach(q => {
      qIdx += 1;
      // Question label
      allChildren.push(new Paragraph({ children: [
        new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
        new TextRun({ text: q.text, size: fontSize })
      ], spacing: { after: spacingBetweenQuestions } }));

      // Options as plain text with smart spacing
      const opts = Array.isArray(q.options) ? q.options : [];
      const formatted = formatQuestionForDocx(q.text, opts);
      formatted.split('\n').forEach(line => {
        allChildren.push(new Paragraph({ children: [new TextRun({ text: line, size: fontSize })] }));
      });
      // small space after each question
      allChildren.push(new Paragraph({}));
    });
  });

  try {
    const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: { font: fontFamily, size: fontSize }
        }
      ]
    },
    sections: [
      {
        children: allChildren
      }
    ]
  });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (err) {
    console.error('Failed to generate DOCX:', err);
    throw err;
  }
}

export default exportTestDocx;
