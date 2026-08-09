import extensions from "~/videoExtensions.json"

const hasAllowedExtension = (path: string, extensions: string[]): boolean => {
    const cleanPath = path.split('?')[0].trim();
    const ext = cleanPath.split('.').pop()?.toLowerCase() ?? '';
    return extensions.map(e => e.toLowerCase().replace(/^\./, '')).includes(ext);
};

export function parsePlaylistContent(content: string, filename: string): string[] {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    let rawPaths: string[] = [];

    if (ext === 'm3u' || ext === 'm3u8') {
        rawPaths = content
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith('#'));
    } else if (ext === 'pls') {
        rawPaths = content
            .split(/\r?\n/)
            .map(line => line.trim().match(/^File\d+=(.+)$/i)?.[1]?.trim())
            .filter((path): path is string => Boolean(path));
    } else if (ext === 'mpcpl') {
        rawPaths = content
            .split(/\r?\n/)
            .map(line => line.trim().match(/^\d+,filename,(.+)$/i)?.[1]?.trim())
            .filter((path): path is string => Boolean(path));
    } else if (ext === 'asx') {
        const matches = content.matchAll(/<ref\s+[^>]*href=["']([^"']+)["']/gi);
        for (const match of matches) {
            if (match[1]?.trim()) {
                rawPaths.push(match[1].trim());
            }
        }
    }
    return rawPaths.filter(path => hasAllowedExtension(path, extensions));
}