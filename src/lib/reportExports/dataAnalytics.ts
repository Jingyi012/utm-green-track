import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type ExportDataAnalyticsParams = {
  container: HTMLElement;
  campusName: string;
  periodLabel: string;
  analysisTab: 'yearly' | 'lifetime';
};

const SECTION_LABELS: Record<string, string> = {
  'summary-generation': 'Summary',
  'summary-diversion': 'Summary',
  'summary-cost': 'Summary',
  'summary-savings': 'Summary',
  'waste-generation-metrics': 'Waste Generation Analysis',
  'waste-generation-trend': 'Waste Generation Analysis',
  'waste-generation-breakdown': 'Waste Generation Analysis',
  'waste-diversion-metrics': 'Waste Diversion Analysis',
  'waste-diversion-trend': 'Waste Diversion Analysis',
  'waste-diversion-ptj': 'Waste Diversion Analysis',
  'waste-diversion-programmes': 'Waste Diversion Analysis',
  'waste-diversion-composition': 'Waste Diversion Analysis',
  'waste-cost-metrics': 'Waste Management Cost Analysis',
  'waste-cost-expenditure': 'Waste Management Cost Analysis',
  'waste-cost-savings': 'Waste Management Cost Analysis',
  'lifetime-generation': 'Lifetime Analysis',
  'lifetime-diversion': 'Lifetime Analysis',
  'lifetime-cost': 'Lifetime Analysis',
  'lifetime-savings': 'Lifetime Analysis',
};

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function captureSection(element: HTMLElement) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: Math.max(document.documentElement.clientWidth, element.scrollWidth),
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  };
}

export async function exportDataAnalyticsPdf({
  container,
  campusName,
  periodLabel,
  analysisTab,
}: ExportDataAnalyticsParams) {
  await wait(400);

  const sections = Array.from(
    container.querySelectorAll<HTMLElement>('[data-analytics-export-section]'),
  ).filter((element) => element.offsetWidth > 0 && element.offsetHeight > 0);

  if (sections.length === 0) {
    throw new Error('No analytics sections found to export.');
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;
  let lastSectionLabel = '';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Data Analytics Report', margin, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Campus: ${campusName}`, margin, currentY);
  currentY += 5;
  doc.text(`${analysisTab === 'yearly' ? 'Year' : 'Year Range'}: ${periodLabel}`, margin, currentY);
  currentY += 5;
  doc.text(`View: ${analysisTab === 'yearly' ? 'Yearly Analysis' : 'Lifetime Analysis'}`, margin, currentY);
  currentY += 8;

  for (let index = 0; index < sections.length; index += 1) {
    const section = sections[index];
    const sectionKey = section.dataset.analyticsExportSection ?? '';
    const sectionLabel = SECTION_LABELS[sectionKey] ?? 'Analytics Section';
    const { dataUrl, width, height } = await captureSection(section);
    const renderedHeight = (height * contentWidth) / width;
    const shouldShowLabel = sectionLabel !== lastSectionLabel;
    const sectionTitleHeight = shouldShowLabel ? 10 : 0;

    if (currentY + sectionTitleHeight + renderedHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      lastSectionLabel = '';
    }

    if (shouldShowLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(sectionLabel, margin, currentY + 4);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, currentY + 6, pageWidth - margin, currentY + 6);
      lastSectionLabel = sectionLabel;
    }

    doc.addImage(dataUrl, 'PNG', margin, currentY + sectionTitleHeight, contentWidth, renderedHeight);
    currentY += sectionTitleHeight + renderedHeight + 8;
  }

  const safeCampus = campusName.replace(/\s+/g, '_');
  const safePeriod = periodLabel.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  doc.save(`Data_Analytics_${safeCampus}_${analysisTab}_${safePeriod}.pdf`);
}
