# Class Notes App

A simple Flask web application for managing class notes, with persistent storage using SQLite. Easily add, edit, search, and archive notes for your classes.

---

## Features
- Add, edit, and delete classes and notes
- Archive and unarchive classes
- Search notes by text or date
- Customizable school name and colors
- All data is stored in a local SQLite database (`class_notes.db`)

---

## Quick Start (Executable)

### 1. Download or Build the Executable
- Download the executable from the `dist/` folder (if provided)
- **OR** build it yourself (see below)

### 2. Place Files Together
- Ensure the executable and `class_notes.db` are in the same folder
- The folders `templates/` and `static/` must also be present in the same directory as the executable

### 3. Run the App
- Double-click the executable **or** run from terminal:
  ```bash
  ./app  # or app.exe on Windows
  ```
- The app will start a local server at [http://localhost:5000](http://localhost:5000)

### 4. Using the App
- Open your browser and go to [http://localhost:5000](http://localhost:5000)
- All changes are saved in `class_notes.db` in the same folder
- **Back up this file to preserve your notes!**

---

## Building the Executable Yourself

1. Install Python 3.8+ and pip
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Build with PyInstaller:
   ```bash
   pyinstaller --onefile --add-data "class_notes.db:." --add-data "templates:templates" --add-data "static:static" app.py
   ```
   - On Windows, use `;` instead of `:` in `--add-data`.
   - The executable will be in the `dist/` folder.

---

## Development Mode

You can also run the app directly with Python:

```bash
python3 app.py
```

---

## Notes
- The app uses a local SQLite database (`class_notes.db`).
- All changes are saved automatically.
- To move your data, just copy the `class_notes.db` file.
- If `class_notes.db` does not exist, it will be created on first run.

---

## License
MIT
