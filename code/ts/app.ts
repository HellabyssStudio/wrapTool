import createPrompt from 'prompt-sync';
import { FileWrapper } from './wrapSystem';
const prompt: (text: string) => string = createPrompt({ sigint: true });

const inDir: string = prompt("Enter root directory of files: ");
const outDir: string = prompt("Enter output directory: ");

FileWrapper.wrap(inDir, outDir);