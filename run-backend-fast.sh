#!/bin/bash

cd "$HOME/Desktop/skillyatra/backend"

echo "Starting SkillYatra backend only..."
echo "No dataset import. Fast mode."

kill -9 $(lsof -ti:5001) 2>/dev/null || true

npm run dev
