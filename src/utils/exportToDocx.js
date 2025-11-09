import { Document, Packer, Paragraph, TextRun, TabStopType, AlignmentType } from 'docx';


import { saveAs } from 'file-saver';

// Estimate text width for spacing. A standard 8.5" page with 1" margins has 6.5" of usable width.
// 6.5 inches * 1440 twips/inch = 9360 twips.
// A 12pt font character is roughly 120 twips wide on average.
function estimateTextWidthInTwips(text, fontSize = 12) {
  return text.length * (fontSize / 12) * 120;
}

function formatOption(q, fontSize) {
  const options = Array.isArray(q.options) ? q.options : [];
  const labeledOptions = options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`);
  const children = [];

  if (options.length === 4) {
    const widths = labeledOptions.map(opt => estimateTextWidthInTwips(opt, fontSize / 2));
    const PAGE_WIDTH_IN_TWIPS = 9360; // 6.5 inches
    const oneColWidth = PAGE_WIDTH_IN_TWIPS / 4;
    const twoColWidth = PAGE_WIDTH_IN_TWIPS / 2;

    // Attempt 1 (4 options): 4 options on one line
    const canFitOneLine = widths.every(w => w < oneColWidth * 0.9); // Check each option fits in its column (with 5% margin)

    if (canFitOneLine) {
      const tabStops = [
        { type: TabStopType.LEFT, position: Math.floor(oneColWidth) },
        { type: TabStopType.LEFT, position: Math.floor(oneColWidth * 2) },
        { type: TabStopType.LEFT, position: Math.floor(oneColWidth * 3) },
      ];
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${labeledOptions[0]}\t${labeledOptions[1]}\t${labeledOptions[2]}\t${labeledOptions[3]}`, size: fontSize }),
        ],
        tabStops,
      }));
      // Attempt 2 (4 options): 2x2 grid
    } else if (
        (widths[0] < twoColWidth * 0.95 && widths[1] < twoColWidth * 0.9) &&
        (widths[2] < twoColWidth * 0.95 && widths[3] < twoColWidth * 0.9)) {
      const tabStops = [{ type: TabStopType.LEFT, position: Math.floor(twoColWidth) }]; // Position for the second column
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${labeledOptions[0]}\t${labeledOptions[1]}`, size: fontSize }),
        ],
        tabStops,
      }));
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${labeledOptions[2]}\t${labeledOptions[3]}`, size: fontSize }),
        ],
        tabStops,
      }));
      // Fallback (4 options): 1 option per line
    } else {
      labeledOptions.forEach(line => {
        children.push(new Paragraph({ children: [new TextRun({ text: line, size: fontSize })] }));
      });
    }
  } else if (options.length > 1 && options.length < 4) {
      const widths = labeledOptions.map(opt => estimateTextWidthInTwips(opt, fontSize / 2));
      const PAGE_WIDTH_IN_TWIPS = 9360; // 6.5 inches
      const colWidth = PAGE_WIDTH_IN_TWIPS / options.length;

      // Attempt 1 (2-3 options): All on one line
      const canFitOneLine = widths.every(w => w < colWidth * 0.9);

      if (canFitOneLine) {
        const tabStops = Array.from({ length: options.length - 1 }, (_, i) => ({
          type: TabStopType.LEFT,
          position: Math.floor(colWidth * (i + 1)),
        }));
        children.push(new Paragraph({
          children: [new TextRun({ text: labeledOptions.join('\t'), size: fontSize })],
          tabStops,
        }));
      } else {
        // Fallback (2-3 options): 1 option per line
        labeledOptions.forEach(line => {
          children.push(new Paragraph({ children: [new TextRun({ text: line, size: fontSize })] }));
        });
      }
  } else {
    // For other counts, one option per line
    labeledOptions.forEach(line => {
      children.push(new Paragraph({
        children: [new TextRun({ text: line, size: fontSize })],
      }));
    });
  }
  return children;
}

export function parseQuillHTML(quillHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(quillHTML, "text/html");
  const paragraphs = [];

  doc.body.childNodes.forEach((node) => {
    const parsed = parseNode(node);
    if (!parsed) return;
    if (Array.isArray(parsed)) paragraphs.push(...parsed);
    else paragraphs.push(parsed);
  });

  return paragraphs;
}

function parseNode(node, inherited = {}) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.replace(/\t/g, "    "); // indent tabs
    if (!text.trim()) return null;
    return new TextRun({ text, ...inherited });
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const tag = node.tagName.toLowerCase();
  const formatting = { ...inherited };

  // Tag-based formatting
  if (tag === "strong" || tag === "b") formatting.bold = true;
  if (tag === "em" || tag === "i") formatting.italics = true;
  if (tag === "u") formatting.underline = { color: "auto" };

  switch (tag) {
    case "p": {
      const runs = parseChildren(node, formatting);
      return new Paragraph({
        children: runs.length ? runs : [new TextRun("")],
      });
    }

    case "br":
      return new TextRun({ text: "\n" });

    case "ul":
      return Array.from(node.children).map(
        (li) =>
          new Paragraph({
            children: parseChildren(li, formatting),
            bullet: { level: 0 },
          })
      );

    case "ol":
      return Array.from(node.children).map(
        (li) =>
          new Paragraph({
            children: parseChildren(li, formatting),
            numbering: { reference: "numbered-list", level: 0 },
          })
      );

    case "a":
      return new TextRun({
        text: node.textContent || "",
        style: "Hyperlink",
        link: node.getAttribute("href") || "",
        ...formatting,
      });

    default:
      return parseChildren(node, formatting);
  }
}

function parseChildren(node, inherited) {
  const runs = [];
  node.childNodes.forEach((child) => {
    const parsed = parseNode(child, inherited);
    if (!parsed) return;
    if (Array.isArray(parsed)) runs.push(...parsed);
    else if (parsed instanceof Paragraph && parsed.children)
      runs.push(...parsed.children);
    else runs.push(parsed);
  });
  return runs;
}

export async function exportTestDocx({ test = null, filename = 'export.docx', returnBlob = false }) {
  // Use fixed defaults
  const fontFamily = 'Times New Roman';
  const fontSize = 24; // docx uses half-points; we'll convert later if needed
  // Build all children (header paragraphs + question blocks)
  const allChildren = [];

  // Body: questions
  if (!test) throw new Error('No test provided');
  if (!Array.isArray(test.sections)) throw new Error('Test object must include a sections array');
  let qIdx = 0; // This will now reset for each test, which is fine as it's per-document.
  test.sections.forEach((section, sectionIndex) => {
    // Section instruction
    if (section.instruction) {
      allChildren.push(new Paragraph({
        children: [new TextRun({ text: section.instruction, bold: true, italics: true, size: fontSize})], // 14pt font size
      }));
    }

    (section.questions || []).forEach((q) => {
      qIdx += 1;
      if (q.type === 'mcq') {
        allChildren.push(new Paragraph({ children: [
          new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
          ...parseQuillHTML(q.text)
        ]}));
        allChildren.push(...formatOption(q, fontSize));
      } else if (q.type === 'reading') {
        if (q.title) {
          allChildren.push(new Paragraph({
            children: [new TextRun({ text: q.title, bold: true, size: fontSize })],
            alignment: AlignmentType.CENTER,
          }));
        }
        if (q.passage) {
          allChildren.push(...parseQuillHTML(q.passage));
        }
        q.questions.forEach((subQ) => {
          qIdx += 1;
          allChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
            ...parseQuillHTML(subQ.text)
          ]}));
          allChildren.push(...formatOption(subQ, fontSize));
        });
      } else if (q.type === 'writing') {
        allChildren.push(new Paragraph({ children: [
          new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
          ...parseQuillHTML(q.text)
        ]}));
        // For writing, we won't add options
        const minUnderscoreLength = 50;
        const dynamicUnderscoreLength = Math.max(q.answer.length * 1.5, minUnderscoreLength);
        const underscoreLine = '_'.repeat(Math.round(dynamicUnderscoreLength));
        allChildren.push(new Paragraph({
          children: [new TextRun({ text: underscoreLine, size: fontSize })],
        }));
      }
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
    if (returnBlob) {
      return blob;
    } else {
      saveAs(blob, filename);
    }
  } catch (err) {
    console.error('Failed to generate DOCX:', err);
    throw err;
  }
}

export default exportTestDocx;
