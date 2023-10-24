import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { Color, Item } from './customTypes';

export default class Wrapper {

    private output: fs.WriteStream;
    private archive: archiver.Archiver;

    constructor(outDir: string, loc: Item, zipID: number, updatedAt: string) {
        
        this.output = fs.createWriteStream(path.join(outDir, `${loc.relPath.replaceAll('\\', '.')}${zipID}-${updatedAt}.zip`));
        this.archive = archiver('zip', {zlib: { level: 9 }}); // Set the compression level (0-9)

        this.output.on('close', () => {
            console.log(`${loc.relPath} ${Color.YELLOW}${this.archive.pointer()}B${Color.RESET}`);
        });
    
        this.archive.on('error', (err) => {
            throw err;
        });
    }

    public addFile(absLoc: string, name: string) {
        this.archive.file(absLoc, { name });
    }

    public finalize() {
        this.archive.pipe(this.output);
        this.archive.finalize();
    }
}