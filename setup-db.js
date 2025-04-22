
// Run this file to set up the database schema

import { exec } from 'child_process';

console.log('Setting up database schema...');
exec('node migrations/init.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});
