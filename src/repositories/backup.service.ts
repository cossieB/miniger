import { join } from "@tauri-apps/api/path";
import { readDir, remove, stat } from "@tauri-apps/plugin-fs";
import { sql, Kysely } from "kysely";

export interface BackupConfig {
    backupDir: string;
    liveDbPath: string;
    maxBackups?: number;
    backupIntervalMs?: number;
}

export interface BackupStat {
    path: string;
    name: string;
    time: number;
}

export class DatabaseBackupManager {
    private maxBackups: number;
    private backupIntervalMs: number;

    constructor(
        private db: Kysely<any>,
        private config: BackupConfig
    ) {
        this.maxBackups = config.maxBackups ?? 10;
        // Default to 24 hours
        this.backupIntervalMs = config.backupIntervalMs ?? 86400000;
    }

    async getBackupStats(): Promise<BackupStat[]> {
        try {
            const entries = await readDir(this.config.backupDir);
            const backupFiles = entries.filter(entry =>
                entry.isFile && entry.name.startsWith('db_backup_') && entry.name.endsWith('.db')
            );

            const filesWithStats = await Promise.all(backupFiles.map(async (file) => {
                const filePath = await join(this.config.backupDir, file.name);
                const fileInfo = await stat(filePath);
                return {
                    path: filePath,
                    name: file.name,
                    time: fileInfo.birthtime?.getTime() || fileInfo.mtime?.getTime() || 0
                };
            }));

            return filesWithStats.sort((a, b) => b.time - a.time);
        } 
        catch {
            return [];
        }
    }

    /**
     * Checks if a backup is needed based on time elapsed AND file modifications.
     */
    async needsBackup(backups?: BackupStat[]): Promise<boolean> {
        try {
            const currentBackups = backups ?? await this.getBackupStats();
            const lastBackup = currentBackups.at(0);

            if (!lastBackup) return true;

            const now = Date.now();
            if (now - lastBackup.time < this.backupIntervalMs) {
                return false;
            }

            let latestLiveChange = 0;

            try {
                const dbInfo = await stat(this.config.liveDbPath);
                latestLiveChange = dbInfo.mtime?.getTime() || 0;
            } catch {
                return false; // Live database doesn't exist to backup
            }

            return latestLiveChange > (lastBackup.time + 1000);

        } catch (error) {
            console.error("Error checking if backup is needed:", error);
            return true;
        }
    }

    async backupDb(): Promise<void> {
        try {
            const currentBackups = await this.getBackupStats();

            if (!(await this.needsBackup(currentBackups))) {
                return;
            }

            const timestamp = Date.now();
            const backupFileName = `db_backup_${timestamp}.db`;
            const backupFilePath = await join(this.config.backupDir, backupFileName);

            // SQLite VACUUM requires forward slashes even on Windows
            const safePath = backupFilePath.replace(/\\/g, '/');

            await sql`VACUUM INTO '${sql.raw(safePath)}'`.execute(this.db);
            const updatedBackups = await this.getBackupStats();
            await this.pruneOldBackups(updatedBackups);

        } catch (error) {
            console.error("Backup failed:", error);            
        }
    }

    private async pruneOldBackups(filesWithStats: BackupStat[]): Promise<void> {
        if (filesWithStats.length <= this.maxBackups) return;

        const filesToDelete = filesWithStats.slice(this.maxBackups);

        for (const file of filesToDelete) {
            try {
                await remove(file.path);
            } catch (err) {
                console.error(`Failed to delete old backup ${file.name}:`, err);
            }
        }
    }
}