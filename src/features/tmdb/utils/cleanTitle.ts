export function cleanTitle(title: string) {
    title = title.replaceAll(/(brrip|blu[\-\s]?ray|web[\-\s]?dl|web[\s\-]?rip|x265|x264|hevc|2160p|1080p|720p|4k|hdr|hdr10|dvd[\-\s]?rip|dv|dolby\s?vision|aac|dts|dd5\.1|ac3|xvid|\dch|10bit)/gi, " ")
        .replace(/[\[\]\(\)]/g, " ")
        .replace(/[\.-]/g, " ")
        .replace(/\s+/g, " ")

    return title
}
