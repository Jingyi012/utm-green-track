export function downloadFile(
    data: BlobPart,
    contentDispositionHeader?: string,
    manualFileName?: string
) {

    const fileName =
        extractFilename(contentDispositionHeader) ||
        manualFileName ||
        "file";

    const blob = new Blob([data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
}

function extractFilename(contentDispositionHeader?: string): string | null {
    if (!contentDispositionHeader) return null;

    const filenameStarMatch = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/);
    if (filenameStarMatch) {
        return decodeURIComponent(filenameStarMatch[1]);
    }

    const filenameMatch = contentDispositionHeader.match(/filename="([^"]+)"/);
    if (filenameMatch) {
        return filenameMatch[1];
    }

    return null;
}