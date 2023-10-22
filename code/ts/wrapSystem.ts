import fs from 'fs';
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
            let updatedAt: string;
            
            files.forEach(item => {
                const subAbsPath = path.join(absPath, item);
                const subRelPath = path.join(relPath, item);
                const stats = fs.statSync(subAbsPath);
    
                if (stats.isDirectory()) {
                    this.findDownloadLocations(subAbsPath, subRelPath);
                    
                } else if (stats.isFile()) {
                    if (item.includes('updt')) updatedAt = item;
                    totalSize += this.findDownloadLocations(subAbsPath, subRelPath);
                    fileCount++;
                }
            });
    
            if (fileCount) this.downloadLocations.push({size: totalSize, absPath, relPath, updatedAt});
            return totalSize;
    
        } else return 0; // Unknown type
    }

    wrap(outDir: string) {

        this.downloadLocations.forEach(loc => {
    
            const files = fs.readdirSync(loc.absPath);
    
            let zipSize = 0;
            let zipID = 0;
            let wrapper = new Wrapper(outDir, loc, zipID, loc.updatedAt);
    
            for (let i = 0; i < files.length; i++) {
                
                const subAbsPath = path.join(loc.absPath, files[i]);
                const stats = fs.statSync(subAbsPath);
    
    
                // skip directories and updateAt files
                if (stats.isDirectory() || files[i].includes('updt')) continue;
    
                // reset wrapper after passing size limit
                if (zipSize + stats.size > 200 * 1024 * 1024) {
                    zipSize = stats.size;
                    zipID++;
                    wrapper.finalize();
                    wrapper = new Wrapper(outDir, loc, zipID, loc.updatedAt);
                }
    
                // Add files to the archive
                wrapper.addFile(subAbsPath, files[i]);
                zipSize += stats.size;
            }
    
            wrapper.finalize();
        });
    }
}

class sizeLimiterCalculator {

    public static calculate() {

    } 
}