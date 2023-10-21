import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

type Item = {
    size: number;
    absPath: string;
    relPath: string;
    updatedAt: string;
}

type Items = Array<Item>;


export const downloadLocations: Items = [];

export function getDownloadLocations(absPath: string, relPath = '') {

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
                getDownloadLocations(subAbsPath, subRelPath);
                
            } else if (stats.isFile()) {
                if (item.includes('updt')) updatedAt = item;
                totalSize += getDownloadLocations(subAbsPath, subRelPath);
                fileCount++;
            }
        });

        if (fileCount) downloadLocations.push({size: totalSize, absPath, relPath, updatedAt});
        return totalSize;

    } else return 0; // Unknown type
}

class Wrapper {

    private output: fs.WriteStream;
    private archive: archiver.Archiver;

    constructor(outDir: string, loc: Item, zipID: number, updatedAt: string) {
        
        this.output = fs.createWriteStream(path.join(outDir, `${loc.relPath.replace('\\', '.')}${zipID}-${updatedAt}.zip`));
        this.archive = archiver('zip', {zlib: { level: 9 }}); // Set the compression level (0-9)

        this.output.on('close', () => {
            console.log('Archive created:', this.archive.pointer(), 'total bytes');
        });
    
        this.archive.on('error', (err) => {
            throw err;
        });
    }

    public addFile(absPath: string, name: string) {
        this.archive.file(absPath, { name });
    }

    public finalize() {
        this.archive.pipe(this.output);
        this.archive.finalize();
    }
}

export function wrap(outDir: string) {

    downloadLocations.forEach(loc => {

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