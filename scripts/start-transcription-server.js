#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting IBM Watson Transcription Server...');

// Start the WebSocket server
const serverProcess = spawn('node', [
  path.join(__dirname, '../server/websocket-server.ts')
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start transcription server:', error);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`🛑 Transcription server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down transcription server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('🛑 Terminating transcription server...');
  serverProcess.kill('SIGTERM');
}); 