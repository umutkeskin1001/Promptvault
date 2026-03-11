import { createWriteStream } from 'fs';
import archiver from 'archiver';

const archive = archiver('zip');
const output = createWriteStream('promptvault.zip');
archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();
output.on('close', () => console.log('✓ promptvault.zip created'));
