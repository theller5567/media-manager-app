export const extractFormatFromExtension = (fileExtension: string) => {
    const normalizedExtension = fileExtension.toLowerCase().replace(/^\./, '');
    switch (normalizedExtension) {
        case 'jpg':
            return 'image'
        case 'png':
            return 'image'
        case 'gif':
            return 'image'
        case 'webp':
            return 'image'
        case 'avif':
            return 'image'
        case 'pdf':
            return 'document'
        case 'doc':
            return 'document'
        case 'docx':
            return 'document'
        case 'ppt':
            return 'document'
        case 'pptx':
            return 'document'
        case 'xls':
            return 'document'
        case 'xlsx':
            return 'document'
        case 'mp3':
            return 'audio'
        case 'wav':
            return 'audio'
        case 'ogg':
            return 'audio'
        case 'flac':
            return 'audio'
        case 'mp4':
            return 'video'
        case 'mov':
            return 'video'
        case 'avi':
            return 'video'
        case 'webm':
            return 'video'
        case 'mkv':
            return 'video'
        default:
            return 'other'
    }
}