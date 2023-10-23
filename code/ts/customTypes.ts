export type Item = {
    size: number;
    absPath: string;
    relPath: string;
    updatedAt?: string;
    biggestFileSize?: number;
}

export type Items = Array<Item>;