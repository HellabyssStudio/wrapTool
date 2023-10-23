import fs, { stat } from 'fs';
import path from 'path';
import Wrapper from './wrapper';
import { Items } from './customTypes';

export class FileWrapper {

    public static wrap(inDir: string, outDir: string) {

        const wrapSystem = new WrapSystem();
        wrapSystem.findDownloadLocations(inDir);
        wrapSystem.wrap(outDir);
    }
}

class WrapSystem {

    private downloadLocations: Items = [];

    findDownloadLocations(absPath: string, relPath = '') {

        const stats = fs.statSync(absPath);
    
        if (stats.isFile()) {
            return stats.size; // If it's a file, return its size in bytes
    
        } else if (stats.isDirectory()) {
            // If it's a directory, calculate the total size of its contents
            const files = fs.readdirSync(absPath);
            let totalSize = 0;
            let fileCount = 0;
            let biggestFileSize = 0;
            let updatedAt: string;
            
            files.forEach(item => {
                const subAbsPath = path.join(absPath, item);
                const subRelPath = path.join(relPath, item);
                const stats = fs.statSync(subAbsPath);
    
                if (stats.isDirectory()) {
                    this.findDownloadLocations(subAbsPath, subRelPath);
                    
                } else if (stats.isFile()) {
                    if (item.includes('updt')) updatedAt = item;
                    if (biggestFileSize < stats.size) biggestFileSize = stats.size;
                    totalSize += stats.size;
                    fileCount++;
                }
            });
    
            if (fileCount && updatedAt !== undefined) this.downloadLocations.push({size: totalSize, absPath, relPath, updatedAt, biggestFileSize});
            return totalSize;
    
        } else return 0; // Unknown type
    }

    wrap(outDir: string) {

        this.downloadLocations.forEach(loc => {
    
            const files = fs.readdirSync(loc.absPath);
    
            let zipSize = 0;
            let zipID = 0;
            let wrapper = new Wrapper(outDir, loc, zipID, loc.updatedAt);

            const minLimit = loc.biggestFileSize;
            const maxLimit = Math.floor(1.9 * 1024 * 1024 * 1024);
            const dynamicLimit = sizeLimiterCalculator.calculate(loc.size, minLimit, maxLimit);
    
            for (let i = 0; i < files.length; i++) {
                
                const subAbsLoc = path.join(loc.absPath, files[i]);
                const stats = fs.statSync(subAbsLoc);
                
    
                // skip directories and updateAt files
                if (stats.isDirectory() || files[i].includes('updt')) continue;
    
                // reset wrapper after passing size limit
                if (zipSize + stats.size > dynamicLimit[0]) {
                    zipSize = stats.size;
                    zipID++;
                    wrapper.finalize();
                    wrapper = new Wrapper(outDir, loc, zipID, loc.updatedAt);
                }
    
                // Add files to the archive
                wrapper.addFile(subAbsLoc, files[i]);
                zipSize += stats.size;
            }
    
            wrapper.finalize();
        });
    }
}

class sizeLimiterCalculator {

    public static calculate(folderSize: number, minSize: number, maxSize: number) {

        const MB = 1024 * 1024;

        switch (true) {
            case folderSize < 300*MB && minSize < 300*MB: return [Math.ceil(folderSize + 1*MB), 1];
            case folderSize < 1000*MB && minSize < folderSize * 5/8: return [Math.ceil(folderSize * 5/8), 2]; // half + 1/8
            case folderSize < maxSize && minSize < folderSize * 3/8: return [Math.ceil(folderSize * 3/8), 3]; // quarter + 1/8
            case minSize < 500*MB: return [Math.ceil(500*MB), 4];
            default: return [Math.ceil(minSize + 10*MB), 5];
        }
    }
}