# wrapTool
Tool created for wrapping Hellabyss assets.

## How to start and use
Program was created for node.js v19.0.0 but should also work for older versions.

To install all required node modules run npm install.

- npm run start - start application

- npm run build - compile ts files into js files
  
- npm run build-start - compile ts files into js files and then start application

## What you need to know
- Program is wrapping just end-folders (folders that contain files)
- Every end-folder have to contain update version file (format: updt{updateNumber}) or it will be ignored
- Enter root directory of files and output directory as absolute path

## Limits
There are size limitations because this system was built for the Github storage.
- A single file can be up to 1.9 GB in size
- No limits for folder size

## Division of folders (dynamic wrapped file size)
FS = Folder size
MinS = biggest file in the folder 
MaxS = 1.9 GB fixed limit
ceil = Math.ceil()
MB = 1024^2

- FS < 300MB && MinS < 300MB: ceil FS + 1MB

- FS < 1000MB && MinS < FS * 5/8: ceil FS * 5/8 // half + 1/8

- FS < maxSize && MinS < FS * 3/8: ceil FS * 3/8 // quarter + 1/8

- MinS < 500*MB: ceil 500MB

- default: ceil MinS + 10MB
