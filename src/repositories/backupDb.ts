import { appDataDir, join } from "@tauri-apps/api/path";
import { db } from "~/kysely/database";
import { DatabaseBackupManager } from "./backup.service"; 

export async function initBackup() {
    const baseDir = await appDataDir();
    const backupDir = await join(baseDir, "backups");
    const liveDbPath = await join(baseDir, "mngr.db"); 

    const backupManager = new DatabaseBackupManager(db, {
        backupDir,
        liveDbPath,
        maxBackups: 10,
        backupIntervalMs: 86400000 // 24 hours
    });

    await backupManager.backupDb();
}