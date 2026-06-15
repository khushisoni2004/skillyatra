#!/bin/bash

set -e

PROJECT_DIR="$HOME/Desktop/skillyatra"
DATASET_SOURCE="$HOME/Desktop/PROJECT DATASETS"
DATASET_TARGET="$PROJECT_DIR/backend/src/data/datasets"

echo "======================================"
echo " SkillYatra Complete Backend Runner"
echo "======================================"

echo "Project folder: $PROJECT_DIR"
echo "Dataset source: $DATASET_SOURCE"
echo "Dataset target: $DATASET_TARGET"

cd "$PROJECT_DIR"

echo ""
echo "1) Creating backend dataset folder..."
mkdir -p "$DATASET_TARGET"

echo ""
echo "2) Copying all ZIP datasets from PROJECT DATASETS..."
cp "$DATASET_SOURCE"/*.zip "$DATASET_TARGET"/

echo ""
echo "3) Dataset files copied:"
ls -lh "$DATASET_TARGET" | grep ".zip" || true

echo ""
echo "4) Moving to backend..."
cd "$PROJECT_DIR/backend"

echo ""
echo "5) Installing backend packages..."
npm install

echo ""
echo "6) Creating .env if missing..."
if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo ""
echo "7) Killing old backend on port 5001..."
kill -9 $(lsof -ti:5001) 2>/dev/null || true

echo ""
echo "8) Seeding demo users/resources..."
npm run seed

echo ""
echo "9) Importing DSA + general Practice datasets..."
npm run import:all

echo ""
echo "10) Importing Aptitude / Placement NQT datasets..."
if [ -f "src/data/importAptitudeDataset.js" ]; then
  node src/data/importAptitudeDataset.js
else
  echo "importAptitudeDataset.js not found, skipped"
fi

echo ""
echo "11) Importing Interview datasets..."
if [ -f "src/data/importInterviewDataset.js" ]; then
  node src/data/importInterviewDataset.js
else
  echo "importInterviewDataset.js not found, skipped"
fi

echo ""
echo "12) Fixing DSA topic mapping..."
if [ -f "src/data/fixDsaTopics.js" ]; then
  node src/data/fixDsaTopics.js
else
  echo "fixDsaTopics.js not found, skipped"
fi

echo ""
echo "13) Fixing Linked List mapping..."
if [ -f "src/data/fixLinkedListTopics.js" ]; then
  node src/data/fixLinkedListTopics.js
else
  echo "fixLinkedListTopics.js not found, skipped"
fi

echo ""
echo "14) Fixing important DSA topics..."
if [ -f "src/data/fixImportantDsaTopics.js" ]; then
  node src/data/fixImportantDsaTopics.js
else
  echo "fixImportantDsaTopics.js not found, skipped"
fi

echo ""
echo "======================================"
echo " All datasets imported successfully"
echo " Backend starting on port 5001"
echo "======================================"

npm run dev
