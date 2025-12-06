import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { message } from 'antd';
import { formatNumber } from '../utils/formatter';
import { StatisticRow } from '@/components/dataEntry/statistic/Statistic';

function getNestedValue(obj: any, path: (string | number)[]): any {
    return path.reduce((acc, key) => acc?.[key], obj);
}

export const exportExcelWasteStatistic = (tableData: any[], columns: any[], year: number) => {
    if (!tableData || tableData.length === 0) {
        message.warning('No waste statistic available to export.');
        return;
    }

    const disposalGroups = columns.slice(1); // Skip "Month"
    const headerRow1: string[] = [''];
    const headerRow2: string[] = ['Month'];

    disposalGroups.forEach(group => {
        const children = group.children ?? [group];
        if (children.length > 1) {
            headerRow1.push(...Array(children.length).fill(group.title));
        } else {
            headerRow1.push(group.title);
        }
        headerRow2.push(...children.map((child: { title: string; }) => child.title));
    });

    const dataRows = tableData.map(row => {
        const rowData: any[] = [row.month];

        disposalGroups.forEach(group => {
            const children = group.children ?? [group];
            children.forEach((child: { title: string }) => {
                const disposalMethod = group.title;
                const wasteType = child.title;

                const value = row.data?.[disposalMethod]?.[wasteType] ?? 0;
                rowData.push(formatNumber(value));
            });
        });

        return rowData;
    });

    const sheetData = [headerRow1, headerRow2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Create merge configuration
    const merges: XLSX.Range[] = [];
    let colIndex = 1;
    disposalGroups.forEach(group => {
        const children = group.children ?? [group];
        if (children.length > 1) {
            merges.push({
                s: { r: 0, c: colIndex },
                e: { r: 0, c: colIndex + children.length - 1 },
            });
        } else {
            merges.push({
                s: { r: 0, c: colIndex },
                e: { r: 1, c: colIndex },
            });
        }
        colIndex += children.length;
    });

    ws['!merges'] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `WasteStatistic-${year}`);
    XLSX.writeFile(wb, `WasteStatistic-${year}.xlsx`);
};

export const exportPDFWasteStatistic = (tableData: StatisticRow[], columns: any[], year: number) => {
    if (!tableData || tableData.length === 0) {
        message.warning('No waste statistic available to export.');
        return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(12);
    doc.text(`Waste Statistic (${year})`, 14, 16);

    const disposalGroups = columns.slice(1);

    const headerRow1: any[] = [''];
    const headerRow2: any[] = ['Month'];
    const columnSpans: number[] = [1];

    disposalGroups.forEach(group => {
        const children = group.children ?? [group];
        headerRow1.push({ content: group.title, colSpan: children.length, styles: { halign: 'center' } });
        headerRow2.push(...children.map((child: { title: string; }) => child.title));
        columnSpans.push(...Array(children.length).fill(1));
    });

    const dataRows = tableData.map(row => {
        const rowData: any[] = [row.month];

        disposalGroups.forEach(group => {
            const children = group.children ?? [group];

            children.forEach((child: { title: string }) => {
                const disposalMethod = group.title;
                const wasteType = child.title;

                const value = row.data?.[disposalMethod]?.[wasteType] ?? 0;
                rowData.push(formatNumber(value));
            });
        });

        return rowData;
    });

    autoTable(doc, {
        startY: 20,
        head: [headerRow1, headerRow2],
        body: dataRows,
        styles: {
            fontSize: 6.5,
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
        margin: { top: 20 },
    });

    doc.save(`WasteStatistic-${year}.pdf`);
};