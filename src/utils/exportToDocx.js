import { Document, Packer, Paragraph, TextRun, TabStopType, PageBreak } from 'docx';


import { saveAs } from 'file-saver';

// Estimate text width for spacing. A standard 8.5" page with 1" margins has 6.5" of usable width.
// 6.5 inches * 1440 twips/inch = 9360 twips.
// A 12pt font character is roughly 120 twips wide on average.
function estimateTextWidthInTwips(text, fontSize = 12) {
  return text.length * (fontSize / 12) * 120;
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
        children: [new TextRun({ text: section.instruction, bold: true, size: 28 })], // 14pt font size
      }));
    }

    (section.questions || []).forEach((q, questionIndex) => {
      qIdx += 1;

      // Options as plain text with smart spacing
      const options = Array.isArray(q.options) ? q.options : [];
      const labeledOptions = options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`);

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
          allChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
            new TextRun({ text: q.text, size: fontSize })
          ]}));
          allChildren.push(new Paragraph({
            children: [
              new TextRun({ text: `${labeledOptions[0]}\t${labeledOptions[1]}\t${labeledOptions[2]}\t${labeledOptions[3]}`, size: fontSize }),
            ],
            tabStops,
          }));
        // Attempt 2 (4 options): 2x2 grid
        } else if (
          (widths[0] < twoColWidth * 0.95 && widths[1] < twoColWidth * 0.9) &&
          (widths[2] < twoColWidth * 0.95 && widths[3] < twoColWidth * 0.9)
        ) {
          const tabStops = [{ type: TabStopType.LEFT, position: Math.floor(twoColWidth) }]; // Position for the second column
          allChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
            new TextRun({ text: q.text, size: fontSize })
          ]}));
          allChildren.push(new Paragraph({
            children: [
              new TextRun({ text: `${labeledOptions[0]}\t${labeledOptions[1]}`, size: fontSize }),
            ],
            tabStops,
          }));
          allChildren.push(new Paragraph({
            children: [
              new TextRun({ text: `${labeledOptions[2]}\t${labeledOptions[3]}`, size: fontSize }),
            ],
            tabStops,
          }));
        // Fallback (4 options): 1 option per line
        } else {
          allChildren.push(new Paragraph({ children: [
            new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
            new TextRun({ text: q.text, size: fontSize })
          ]}));
          labeledOptions.forEach(line => {
            allChildren.push(new Paragraph({ children: [new TextRun({ text: line, size: fontSize })] }));
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

          allChildren.push(new Paragraph({ children: [new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }), new TextRun({ text: q.text, size: fontSize })]}));
          allChildren.push(new Paragraph({
            children: [new TextRun({ text: labeledOptions.join('\t'), size: fontSize })],
            tabStops,
          }));
        } else {
          // Fallback (2-3 options): 1 option per line
          allChildren.push(new Paragraph({ children: [new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }), new TextRun({ text: q.text, size: fontSize })]}));
          labeledOptions.forEach(line => {
            allChildren.push(new Paragraph({ children: [new TextRun({ text: line, size: fontSize })] }));
          });
        }
      } else {
        // For other counts, one option per line
        allChildren.push(new Paragraph({ children: [
          new TextRun({ text: `Question ${qIdx}: `, bold: true, size: fontSize }),
          new TextRun({ text: q.text, size: fontSize })
        ]}));
        labeledOptions.forEach(line => {
          allChildren.push(new Paragraph({
            children: [new TextRun({ text: line, size: fontSize })],
          }));
        });
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
