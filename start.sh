#!/bin/sh

# Start nginx in the background
nginx

# Start the backend server
cd /app/backend
node index.js 