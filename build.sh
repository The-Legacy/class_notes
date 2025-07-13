#!/bin/bash
# Build Class Notes executables for all platforms (run on each OS)
# Usage: ./build.sh

APP_NAME="Class Notes"
PYINSTALLER_ARGS="--onefile --name \"$APP_NAME\" --add-data \"class_notes.db:.\" --add-data \"templates:templates\" --add-data \"static:static\" app.py"

# Linux/Mac: Use : as separator
if [[ "$OSTYPE" == "linux"* || "$OSTYPE" == "darwin"* ]]; then
    pyinstaller $PYINSTALLER_ARGS
fi

# Windows: Use ; as separator (run this script in Git Bash or use the command below in CMD/PowerShell)
# pyinstaller --onefile --name "Class Notes" --add-data "class_notes.db;." --add-data "templates;templates" --add-data "static;static" app.py

echo "Build complete. Find your executable in the dist/ folder."
