import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { message } from 'antd';
import autoTable from 'jspdf-autotable';
import { DisposalMethod, DisposalMethodLabels } from '../enum/disposalMethod';
import { WasteType, WasteTypeLabels } from '../enum/wasteType';
import { WasteRecordStatus, wasteRecordStatusLabels } from '../enum/wasteRecordStatus';
import { Campus, CampusLabels } from '../enum/campus';

export function exportExcelWasteRecord(records: any[], filename = 'WasteRecords.xlsx') {
    if (!records || records.length === 0) {
        message.warning('No waste records available to export.');
        return;
    }

    const headers = [
        ['No.', 'Date', 'Campus', 'Location', 'Disposal Method', 'Waste Type', 'Weight (KG)', 'Status'],
    ];

    const rows = records.map((r, i) => [
        i + 1,
        new Date(r.date).toLocaleDateString("en-GB"),
        CampusLabels[r.campus as Campus] ?? r.campus,
        r.location ?? "-",
        DisposalMethodLabels[r.disposalMethod as DisposalMethod] ?? r.disposalMethod,
        WasteTypeLabels[r.wasteType as WasteType] ?? r.wasteType,
        r.wasteWeight.toFixed(2),
        wasteRecordStatusLabels[r.status as WasteRecordStatus] ?? r.status,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WasteRecords');

    XLSX.writeFile(workbook, filename);
}

export function exportPdfWasteRecord(records: any[], filename = 'WasteRecords.pdf') {
    if (!records || records.length === 0) {
        message.warning('No waste records available to export.');
        return;
    }

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
    });

    // Title
    doc.setFontSize(12);
    doc.text('Waste Records Report', 40, 30);

    // Define table headers
    const headers = [
        'No.',
        'Date',
        'Campus',
        'Location',
        'Disposal Method',
        'Waste Type',
        'Weight (KG)',
        'Status'
    ];

    // Format rows
    const body = records.map((r, i) => [
        i + 1,
        new Date(r.date).toLocaleDateString("en-GB"),
        CampusLabels[r.campus as Campus] ?? r.campus,
        r.location ?? "-",
        DisposalMethodLabels[r.disposalMethod as DisposalMethod] ?? r.disposalMethod,
        WasteTypeLabels[r.wasteType as WasteType] ?? r.wasteType,
        r.wasteWeight.toFixed(2),
        wasteRecordStatusLabels[r.status as WasteRecordStatus] ?? r.status,
    ]);

    // Generate table
    autoTable(doc, {
        startY: 40,
        head: [headers],
        body,
        styles: {
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
        },
        headStyles: {
            fillColor: [34, 139, 34], // Forest green
            textColor: [255, 255, 255],
            halign: 'center',
            valign: 'middle',
        },
        bodyStyles: {
            halign: 'center',
            valign: 'middle',
        },
        margin: { top: 40 },
    });

    doc.save(filename);
}
