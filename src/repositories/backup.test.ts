import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseBackupManager } from './backup.service';
import { readDir, stat, remove } from '@tauri-apps/plugin-fs';

// Mock Tauri modules
vi.mock('@tauri-apps/plugin-fs', () => ({
    readDir: vi.fn(),
    stat: vi.fn(),
    remove: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
    join: vi.fn((dir, file) => `${dir}/${file}`),
}));

// Mock Kysely DB
const mockDb = {} as any; 

describe('DatabaseBackupManager', () => {
    let manager: DatabaseBackupManager;

    beforeEach(() => {
        vi.clearAllMocks();
        manager = new DatabaseBackupManager(mockDb, {
            backupDir: '/mock/backup/dir',
            liveDbPath: '/mock/live/db.sqlite',
            maxBackups: 2,
            backupIntervalMs: 10000 
        });
    });

    it('should return true for needsBackup when no backups exist', async () => {
        vi.mocked(readDir).mockResolvedValue([]);
        const needsBackup = await manager.needsBackup();
        expect(needsBackup).toBe(true);
    });

    it('should prune excess backups', async () => {
        vi.mocked(readDir).mockResolvedValue([
            { name: 'db_backup_3.db', isFile: true, isDirectory: false, isSymlink: false },
            { name: 'db_backup_2.db', isFile: true, isDirectory: false, isSymlink: false },
            { name: 'db_backup_1.db', isFile: true, isDirectory: false, isSymlink: false },
        ]);

        vi.mocked(stat).mockImplementation(async (path: any) => {
            // Fake timestamps so 3 is newest, 1 is oldest
            if (path.includes('backup_3')) return { mtime: new Date(3000) } as any;
            if (path.includes('backup_2')) return { mtime: new Date(2000) } as any;
            if (path.includes('backup_1')) return { mtime: new Date(1000) } as any;
            return {} as any;
        });

        const stats = await manager.getBackupStats();
        
        await (manager as any).pruneOldBackups(stats);
        
        expect(remove).toHaveBeenCalledWith('/mock/backup/dir/db_backup_1.db');
        expect(remove).toHaveBeenCalledTimes(1);
    });
});