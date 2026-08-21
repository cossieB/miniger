import { appDataDir, join } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { state } from "~/state";
import type { ImgSubfolder } from "~/types";

export async function saveImg(file: File, folder: ImgSubfolder, id: string | number) {
    const d = await appDataDir()
    const path = await join(d, "images", folder, `${id}.webp`)
    try {
        const webPFileImg = await convertToWebP(file)
        const buffer = await webPFileImg.arrayBuffer()
        const uint8array = new Uint8Array(buffer);
        await writeFile(path, uint8array)
        return true
    }
    catch (error) {
        state.status.setStatus("Error updating image: " + String(error))
        return false
    }
}

export async function downloadImage(url: string, id: number, folder: ImgSubfolder) {
    const res = await fetch(url)
    const blob = await res.blob();
    const file = new File([blob], id.toString(), {
        type: blob.type,
    })
    saveImg(file, folder, id)
}

function convertToWebP(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            return reject(new Error('File must be an image.'));
        }

        const img: HTMLImageElement = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (!ctx) {
                URL.revokeObjectURL(img.src);
                return reject(new Error('Failed to get canvas 2d context.'));
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    URL.revokeObjectURL(img.src);
                    return reject(new Error('Canvas compilation failed.'));
                }

                const newFileName: string = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                const webpFile: File = new File([blob], newFileName, { type: 'image/webp' });

                URL.revokeObjectURL(img.src);
                resolve(webpFile);
            }, 'image/webp', quality);
        };

        img.onerror = (err: Event | string) => {
            URL.revokeObjectURL(img.src);
            reject(err);
        };
    });
}
