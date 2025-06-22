// import { NextRequest } from 'next/server';
// import { getAllWasteRecords } from '@/lib/services/wasteRecord.service';
// import { verifyToken } from '@/lib/firebase/verifyToken';
// import { renderToStream } from '@react-pdf/renderer';
// import { WasteRecordPDF } from '@/lib/pdf/wasteRecordPdf';

// export async function GET(req: NextRequest) {
//     // Verify Firebase token (optional, based on your setup)
//     await verifyToken(req);

//     // Get records
//     const records = await getAllWasteRecords({});

//     // Render PDF as stream
//     const pdfStream = await renderToStream(<WasteRecordPDF records={ records.data } />);

//     // Return as a streaming PDF response
//     return new Response(pdfStream, {
//         status: 200,
//         headers: {
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': 'attachment; filename="WasteRecords.pdf"',
//         },
//     });
// }
