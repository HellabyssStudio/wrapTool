import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Item } from './customTypes';

export default class Wrapper {

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