import createPrompt from 'prompt-sync';
import { FileWrapper } from './wrapSystem';
import { Color } from './customTypes';
const prompt: (text: string) => string = createPrompt({ sigint: true });

const inDir: string = prompt(Color.YELLOW + "Enter root directory of files: " + Color.RESET);
const outDir: string = prompt(Color.YELLOW + "Enter output directory: " + Color.RESET);

FileWrapper.wrap(inDir, outDir);