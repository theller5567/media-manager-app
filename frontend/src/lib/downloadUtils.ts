/**
 * Download a file from URL with custom filename
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Create blob from response
    const blob = await response.blob();

    // Create blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Create temporary anchor element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download multiple files (for bulk downloads)
 * Downloads files sequentially to avoid browser blocking
 */
export async function downloadMultipleFiles(
  files: Array<{ url: string; filename: string }>
): Promise<void> {
  if (files.length === 0) {
    return;
  }

  // Download files sequentially with a small delay between each
  for (let i = 0; i < files.length; i++) {
    try {
      await downloadFile(files[i].url, files[i].filename);
      
      // Add a small delay between downloads to avoid browser blocking
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error(`Failed to download ${files[i].filename}:`, error);
      // Continue with next file even if one fails
    }
  }
}
