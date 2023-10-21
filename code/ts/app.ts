import createPrompt from 'prompt-sync';
import { getDownloadLocations, downloadLocations, wrap } from './fileSystem';
const prompt: (text: string) => string = createPrompt({ sigint: true });

const inDir: string = prompt("Enter root directory of files: ");
const outDir: string = prompt("Enter output directory: ");

getDownloadLocations(inDir);
console.log(downloadLocations);
wrap(outDir);