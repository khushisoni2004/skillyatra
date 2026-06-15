from pathlib import Path
import shutil

src = Path("src/data/permanent_backup/dsaCodingQuestions_FINAL_SAFE.json")
dst = Path("src/data/dsaCodingQuestions.json")

if not src.exists():
    print("Safe backup not found.")
    raise SystemExit(1)

shutil.copy2(src, dst)
print("DSA safe data restored successfully.")
print("Restored file:", dst)
