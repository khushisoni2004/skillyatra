#!/bin/bash

set -e

PROJECT_DIR="$HOME/Desktop/skillyatra"
DATASET_SOURCE="$HOME/Desktop/PROJECT DATASETS"
DATASET_TARGET="$PROJECT_DIR/backend/src/data/datasets"

echo "===== SkillYatra Full Dataset Import Started ====="

cd "$PROJECT_DIR"

echo "1) Creating dataset folder..."
mkdir -p "$DATASET_TARGET"

echo "2) Copying all ZIP datasets from Desktop PROJECT DATASETS..."
cp "$DATASET_SOURCE"/*.zip "$DATASET_TARGET"/

echo "3) Copied datasets:"
ls -lh "$DATASET_TARGET"

echo "4) Going to backend..."
cd "$PROJECT_DIR/backend"

echo "5) Installing backend packages..."
npm install

echo "6) Creating .env if missing..."
if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "7) Killing old backend on port 5001..."
kill -9 $(lsof -ti:5001) 2>/dev/null || true

echo "8) Running seed..."
npm run seed

echo "9) Importing DSA + Practice datasets..."
npm run import:all

echo "10) Importing Aptitude datasets..."
node src/data/importAptitudeDataset.js

echo "11) Importing Interview datasets..."
node src/data/importInterviewDataset.js

echo "12) Fixing DSA topic mapping..."
if [ -f "src/data/fixDsaTopics.js" ]; then
  node src/data/fixDsaTopics.js
fi

echo "13) Fixing Linked List topic mapping..."
if [ -f "src/data/fixLinkedListTopics.js" ]; then
  node src/data/fixLinkedListTopics.js
fi

echo "===== All datasets imported successfully ====="
echo "Starting backend on port 5001..."

npm run dev
