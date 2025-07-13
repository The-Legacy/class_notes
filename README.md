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

1. Go to the [GitHub Releases](https://github.com/The-Legacy/class_notes/releases) page.
2. Download the correct zip file for your operating system:
    - **Windows:** `Class_Notes_Windows.zip`
    - **Mac:** `Class_Notes_Mac.zip`
    - **Linux:** `Class_Notes_Linux.zip`
3. Unzip the downloaded file:
    - **Windows:** Right-click the zip file and select "Extract All..."
    - **Mac:** Double-click the zip file to extract it
    - **Linux:** Use your file manager or run `unzip Class_Notes_Linux.zip` in the terminal
4. Open the extracted folder. You should see:
    - The executable (`Class Notes.exe` on Windows, `Class Notes` on Mac/Linux)
    - `class_notes.db`, `templates/`, and `static/` folders
5. **Run the app:**
    - **Windows:** Double-click `Class Notes.exe` or open a terminal in the folder and run `./Class_Notes.exe`
    - **Mac/Linux:** Open a terminal in the folder and run `./Class\ Notes` (use tab to autocomplete the name)
6. Your default browser will open to [http://localhost:5000](http://localhost:5000) automatically.
7. When you close the browser tab or stop the server, the app will exit.
8. All your data is saved in `class_notes.db` in the same folder.

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
