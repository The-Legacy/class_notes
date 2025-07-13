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



## One-Click App for All Platforms

### Download and Run


**Recommended:**
- Download a pre-built **Class Notes** executable for your platform from the [GitHub Releases](https://github.com/The-Legacy/class_notes/releases) page (if available):
    - Windows: `Class Notes.exe`
    - Mac: `Class Notes`
    - Linux: `Class Notes`
- Place the executable, `class_notes.db`, `templates/`, and `static/` folders together in the same folder.
- Double-click the **Class Notes** app to start it.
- Your default browser will open to [http://localhost:5000](http://localhost:5000) automatically.
- When you close the browser tab or stop the server, the app will exit.
- Use the app! All your data is saved in `class_notes.db`.

**If no pre-built executable is available:**
- You must build the executable yourself (see below).

**Note:** For security reasons, scripts cannot run automatically when you download code from GitHub. You must manually run the build script after downloading.

---

## Building the Executable Yourself (Advanced)

1. Install Python 3.8+ and pip
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the build script for your platform:
   ```bash
   ./build.sh
   ```
   - On Windows, use the PyInstaller command in the script as a reference and run it in CMD/PowerShell.
4. The executable will be in the `dist/` folder, named **Class Notes** (or `Class Notes.exe` on Windows).

---

---


## Data Storage
- All your data is saved in the `class_notes.db` file in the app folder.
- To back up your notes, just copy this file.
- If `class_notes.db` does not exist, it will be created automatically on first run.

---

---


## Development
- To make changes, edit the Python or HTML files and rebuild the executable.
- For development, you can still run the app with Python as before.

---

---

## License
The-Legacy "Bicycle Fluid"
