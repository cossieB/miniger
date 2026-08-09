import { describe, it, expect, vi } from 'vitest';
import { parsePlaylistContent } from './parsePlaylist'; // Adjust the import path as needed

// Mock the JSON extension import
vi.mock('~/videoExtensions.json', () => ({
  default: ['.mp4', 'mkv', '.avi'] // Tests both dot and dot-less formats
}));

describe('parsePlaylistContent', () => {
  
  describe('M3U / M3U8 Parsing', () => {
    it('should extract valid paths and ignore comments and empty lines', () => {
      const content = `
        #EXTM3U
        #EXTINF:123, Sample Video
        video1.mp4
        
        # This is a comment
        /movies/video2.mkv
      `;
      const result = parsePlaylistContent(content, 'playlist.m3u8');
      expect(result).toEqual(['video1.mp4', '/movies/video2.mkv']);
    });
  });

  describe('PLS Parsing', () => {
    it('should extract paths from FileX keys case-insensitively', () => {
      const content = `
        [playlist]
        File1=C:\\Videos\\movie.mp4
        FILE2=/downloads/clip.mkv
        Title1=Sample
        NumberOfEntries=2
      `;
      const result = parsePlaylistContent(content, 'playlist.pls');
      expect(result).toEqual(['C:\\Videos\\movie.mp4', '/downloads/clip.mkv']);
    });
  });

  describe('MPCPL Parsing', () => {
    it('should extract paths from Media Player Classic playlists', () => {
      const content = `
        1,type,0
        1,filename,episode1.mp4
        2,filename,episode2.mkv
      `;
      const result = parsePlaylistContent(content, 'playlist.mpcpl');
      expect(result).toEqual(['episode1.mp4', 'episode2.mkv']);
    });
  });

  describe('ASX Parsing', () => {
    it('should extract href attributes from ref tags attributes', () => {
      const content = `
        <Asx Version="3.0">
          <Entry>
            <Ref href="C:\\Videos\\test.mp4" />
          </Entry>
          <ENTRY>
            <ref HREF="/local/file.mkv" />
          </ENTRY>
        </Asx>
      `;
      const result = parsePlaylistContent(content, 'playlist.asx');
      expect(result).toEqual(['C:\\Videos\\test.mp4', '/local/file.mkv']);
    });
  });

  describe('Extension Filtering and Normalisation', () => {
    it('should filter out unsupported extensions', () => {
      const content = `
        valid.mp4
        invalid.txt
        audio.mp3
      `;
      const result = parsePlaylistContent(content, 'playlist.m3u');
      expect(result).toEqual(['valid.mp4']);
    });

    it('should handle uppercase file extensions case-insensitively', () => {
      const content = `
        movie.MP4
        clip.Mkv
      `;
      const result = parsePlaylistContent(content, 'playlist.m3u');
      expect(result).toEqual(['movie.MP4', 'clip.Mkv']);
    });
  });

  describe('Edge Cases', () => {
    it('should return an empty array if the playlist format extension is unknown', () => {
      const content = `video1.mp4`;
      const result = parsePlaylistContent(content, 'unknown.txt');
      expect(result).toEqual([]);
    });

    it('should return an empty array if no paths match the criteria', () => {
      const content = ``;
      const result = parsePlaylistContent(content, 'empty.m3u');
      expect(result).toEqual([]);
    });

    it('should handle file names with no extension gracefully', () => {
      const content = `
        just-a-file
      `;
      const result = parsePlaylistContent(content, 'playlist.m3u');
      expect(result).toEqual([]);
    });
  });
});