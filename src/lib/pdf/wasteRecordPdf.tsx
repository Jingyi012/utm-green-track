import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: 'green',
    },
    table: {
        display: 'flex',
        width: 'auto',
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
    },
    headerCell: {
        fontWeight: 'bold',
        padding: 4,
        flexGrow: 1,
        backgroundColor: '#d9ead3',
        border: 1,
    },
    cell: {
        padding: 4,
        flexGrow: 1,
        border: 1,
    },
});

export const WasteRecordPDF = ({ records }: { records: any[] }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Waste Records Report</Text>

            <View style={styles.table}>
                {/* Header */}
                <View style={styles.row}>
                    {['No.', 'Date', 'Campus', 'Location', 'Disposal Method', 'Waste Type', 'Weight (KG)', 'Status'].map((header, i) => (
                        <Text key={i} style={styles.headerCell}>{header}</Text>
                    ))}
                </View>

                {/* Rows */}
                {records.map((record, index) => (
                    <View key={record.id || index} style={styles.row}>
                        <Text style={styles.cell}>{index + 1}</Text>
                        <Text style={styles.cell}>{new Date(record.date).toLocaleDateString('en-GB')}</Text>
                        <Text style={styles.cell}>{record.campusName}</Text>
                        <Text style={styles.cell}>{record.location}</Text>
                        <Text style={styles.cell}>{record.disposalMethod}</Text>
                        <Text style={styles.cell}>{record.wasteType}</Text>
                        <Text style={styles.cell}>{record.wasteWeight}</Text>
                        <Text style={styles.cell}>{record.status}</Text>
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);
