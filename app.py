import os
import sys
import flask
import sqlite3 as sql
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# Database setup
DATABASE = 'class_notes.db'

def init_db():
    """Initialize the database with required tables"""
    conn = sql.connect(DATABASE)
    cursor = conn.cursor()
    
    # Create classes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#007bff',
            archived INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add archived column to existing tables if it doesn't exist
    try:
        cursor.execute('ALTER TABLE classes ADD COLUMN archived INTEGER DEFAULT 0')
        print("Added archived column to classes table")
    except sql.OperationalError:
        # Column already exists
        pass
    
    # Create notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes (id)
        )
    ''')
    
    # Create settings table for school customization
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT NOT NULL
        )
    ''')
    
    # Insert default settings if they don't exist
    cursor.execute('''
        INSERT OR IGNORE INTO settings (key, value) VALUES ('school_name', 'U of M')
    ''')
    cursor.execute('''
        INSERT OR IGNORE INTO settings (key, value) VALUES ('school_primary_color', '#7C2328')
    ''')
    cursor.execute('''
        INSERT OR IGNORE INTO settings (key, value) VALUES ('school_secondary_color', '#00274C')
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sql.connect(DATABASE)
    conn.row_factory = sql.Row
    return conn

def get_setting(key, default=None):
    """Get a setting value"""
    conn = get_db_connection()
    result = conn.execute('SELECT value FROM settings WHERE key = ?', (key,)).fetchone()
    conn.close()
    return result['value'] if result else default

def set_setting(key, value):
    """Set a setting value"""
    conn = get_db_connection()
    conn.execute('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', (key, value))
    conn.commit()
    conn.close()

def calculate_notes_per_day():
    """Calculate notes per day based on all notes"""
    conn = get_db_connection()
    
    # Get the date of the first note
    first_note = conn.execute('SELECT MIN(created_at) as first_date FROM notes').fetchone()
    total_notes = conn.execute('SELECT COUNT(*) as count FROM notes').fetchone()['count']
    
    if not first_note or not first_note['first_date'] or total_notes == 0:
        conn.close()
        return 0
    
    # Calculate days since first note
    from datetime import datetime
    first_date = datetime.fromisoformat(first_note['first_date'].replace('Z', '+00:00'))
    current_date = datetime.now()
    days_diff = (current_date - first_date).days + 1  # +1 to include today
    
    conn.close()
    return round(total_notes / days_diff, 1) if days_diff > 0 else total_notes

@app.route('/')
def index():
    """Home page with class overview"""
    conn = get_db_connection()
    classes = conn.execute('SELECT * FROM classes WHERE archived = 0 ORDER BY created_at DESC').fetchall()
    
    # Get note count for each class
    class_stats = []
    for cls in classes:
        note_count = conn.execute('SELECT COUNT(*) as count FROM notes WHERE class_id = ?', (cls['id'],)).fetchone()['count']
        class_stats.append({
            'class': cls,
            'note_count': note_count
        })
    
    # Get school settings
    school_name = get_setting('school_name', 'U of M')
    school_primary_color = get_setting('school_primary_color', '#7C2328')
    school_secondary_color = get_setting('school_secondary_color', '#00274C')
    
    # Calculate notes per day
    notes_per_day = calculate_notes_per_day()
    
    conn.close()
    return render_template('index.html', 
                         class_stats=class_stats,
                         school_name=school_name,
                         school_primary_color=school_primary_color,
                         school_secondary_color=school_secondary_color,
                         notes_per_day=notes_per_day)

@app.route('/add_class', methods=['GET', 'POST'])
def add_class():
    """Add a new class"""
    if request.method == 'POST':
        name = request.form['name']
        code = request.form['code']
        description = request.form['description']
        color = request.form['color']
        
        if name and code:
            conn = get_db_connection()
            conn.execute(
                'INSERT INTO classes (name, code, description, color) VALUES (?, ?, ?, ?)',
                (name, code, description, color)
            )
            conn.commit()
            conn.close()
            flash(f'Class "{name}" added successfully!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Class name and code are required!', 'error')
    
    return render_template('add_class.html')

@app.route('/class/<int:class_id>')
def view_class(class_id):
    """View a specific class and its notes"""
    conn = get_db_connection()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_id,)).fetchone()
    
    if not cls:
        flash('Class not found!', 'error')
        return redirect(url_for('index'))
    
    notes = conn.execute(
        'SELECT * FROM notes WHERE class_id = ? ORDER BY updated_at DESC',
        (class_id,)
    ).fetchall()
    
    conn.close()
    return render_template('class_view.html', cls=cls, notes=notes)

@app.route('/class/<int:class_id>/add_note', methods=['GET', 'POST'])
def add_note(class_id):
    """Add a new note to a class"""
    conn = get_db_connection()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_id,)).fetchone()
    if not cls:
        flash('Class not found!', 'error')
        return redirect(url_for('index'))
    if cls['archived']:
        flash('Cannot add notes to an archived class.', 'error')
        conn.close()
        return redirect(url_for('view_class', class_id=class_id))
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        print(f"DEBUG: Received title: {title}")
        print(f"DEBUG: Received content length: {len(content) if content else 0}")
        print(f"DEBUG: Content preview: {content[:100] if content else 'None'}")
        if title and content:
            conn.execute(
                'INSERT INTO notes (class_id, title, content) VALUES (?, ?, ?)',
                (class_id, title, content)
            )
            conn.commit()
            conn.close()
            flash(f'Note "{title}" added successfully!', 'success')
            return redirect(url_for('view_class', class_id=class_id))
        else:
            flash('Title and content are required!', 'error')
            print(f"DEBUG: Validation failed - title: {'YES' if title else 'NO'}, content: {'YES' if content else 'NO'}")
    conn.close()
    return render_template('add_note.html', cls=cls)

@app.route('/note/<int:note_id>')
def view_note(note_id):
    """View a specific note"""
    conn = get_db_connection()
    note = conn.execute(
        '''SELECT n.*, c.name as class_name, c.code as class_code, c.color as class_color
           FROM notes n
           JOIN classes c ON n.class_id = c.id
           WHERE n.id = ?''',
        (note_id,)
    ).fetchone()
    
    if not note:
        flash('Note not found!', 'error')
        return redirect(url_for('index'))
    
    conn.close()
    return render_template('view_note.html', note=note)

@app.route('/note/<int:note_id>/edit', methods=['GET', 'POST'])
def edit_note(note_id):
    """Edit an existing note"""
    conn = get_db_connection()
    note = conn.execute(
        '''SELECT n.*, c.name as class_name, c.code as class_code, c.archived as class_archived
           FROM notes n
           JOIN classes c ON n.class_id = c.id
           WHERE n.id = ?''',
        (note_id,)
    ).fetchone()
    if not note:
        flash('Note not found!', 'error')
        return redirect(url_for('index'))
    if note['class_archived']:
        flash('Cannot edit notes in an archived class.', 'error')
        conn.close()
        return redirect(url_for('view_note', note_id=note_id))
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        if title and content:
            conn.execute(
                'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                (title, content, note_id)
            )
            conn.commit()
            conn.close()
            flash(f'Note "{title}" updated successfully!', 'success')
            return redirect(url_for('view_note', note_id=note_id))
        else:
            flash('Title and content are required!', 'error')
    conn.close()
    return render_template('edit_note.html', note=note)

@app.route('/search')
def search():
    """Search through notes"""
    query = request.args.get('q', '')
    results = []
    
    if query:
        conn = get_db_connection()
        
        # Check if query looks like a date
        date_query = None
        try:
            # Try to parse various date formats
            from datetime import datetime
            for date_format in ['%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%d/%m/%Y', '%Y/%m/%d']:
                try:
                    parsed_date = datetime.strptime(query, date_format)
                    date_query = parsed_date.strftime('%Y-%m-%d')
                    break
                except ValueError:
                    continue
        except:
            pass
        
        if date_query:
            # Search by date
            results = conn.execute(
                '''SELECT n.*, c.name as class_name, c.code as class_code, c.color as class_color
                   FROM notes n
                   JOIN classes c ON n.class_id = c.id
                   WHERE DATE(n.created_at) = ? OR DATE(n.updated_at) = ?
                   ORDER BY n.updated_at DESC''',
                (date_query, date_query)
            ).fetchall()
        else:
            # Regular text search
            results = conn.execute(
                '''SELECT n.*, c.name as class_name, c.code as class_code, c.color as class_color
                   FROM notes n
                   JOIN classes c ON n.class_id = c.id
                   WHERE n.title LIKE ? OR n.content LIKE ?
                   ORDER BY n.updated_at DESC''',
                (f'%{query}%', f'%{query}%')
            ).fetchall()
        
        conn.close()
    
    return render_template('search.html', query=query, results=results)

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    """App settings page"""
    if request.method == 'POST':
        school_name = request.form['school_name']
        school_primary_color = request.form['school_primary_color']
        school_secondary_color = request.form['school_secondary_color']
        
        if school_name:
            set_setting('school_name', school_name)
            set_setting('school_primary_color', school_primary_color)
            set_setting('school_secondary_color', school_secondary_color)
            flash('Settings updated successfully!', 'success')
            return redirect(url_for('index'))
        else:
            flash('School name is required!', 'error')
    
    # Color options for swatches/buttons
    color_options = [
        {"name": "Maroon", "value": "#7C2328", "text": "#fff"},
        {"name": "Navy", "value": "#00274C", "text": "#fff"},
        {"name": "Blue", "value": "#007bff", "text": "#fff"},
        {"name": "Maize", "value": "#FFCB05", "text": "#222"},
        {"name": "Green", "value": "#228B22", "text": "#fff"},
        {"name": "Dark Green", "value": "#006400", "text": "#fff"},
        {"name": "White", "value": "#fff", "text": "#222"},
        {"name": "Orange", "value": "#FF8200", "text": "#222"},
        {"name": "Purple", "value": "#6F42C1", "text": "#fff"},
        {"name": "Black", "value": "#000", "text": "#fff"},
        {"name": "Yellow", "value": "#FFD600", "text": "#222"},
    ]

    school_name = get_setting('school_name', 'U of M')
    school_primary_color = get_setting('school_primary_color', '#7C2328')
    school_secondary_color = get_setting('school_secondary_color', '#00274C')

    conn = get_db_connection()
    total_classes = conn.execute('SELECT COUNT(*) as count FROM classes WHERE archived = 0').fetchone()['count']
    total_notes = conn.execute('SELECT COUNT(*) as count FROM notes n JOIN classes c ON n.class_id = c.id WHERE c.archived = 0').fetchone()['count']
    conn.close()

    notes_per_day = calculate_notes_per_day()

    return render_template('settings.html',
                         school_name=school_name,
                         school_primary_color=school_primary_color,
                         school_secondary_color=school_secondary_color,
                         total_classes=total_classes,
                         total_notes=total_notes,
                         notes_per_day=notes_per_day,
                         color_options=color_options)

@app.route('/class/<int:class_id>/delete', methods=['POST'])
def delete_class(class_id):
    """Delete a class and all its notes"""
    conn = get_db_connection()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_id,)).fetchone()
    
    if not cls:
        flash('Class not found!', 'error')
        return redirect(url_for('index'))
    
    # Delete all notes associated with the class
    conn.execute('DELETE FROM notes WHERE class_id = ?', (class_id,))
    # Delete the class
    conn.execute('DELETE FROM classes WHERE id = ?', (class_id,))
    conn.commit()
    conn.close()
    
    flash(f'Class "{cls["name"]}" and all its notes have been deleted.', 'success')
    return redirect(url_for('index'))

@app.route('/class/<int:class_id>/archive', methods=['POST'])
def archive_class(class_id):
    """Archive a class"""
    conn = get_db_connection()
    cls = conn.execute('SELECT * FROM classes WHERE id = ?', (class_id,)).fetchone()
    
    if not cls:
        flash('Class not found!', 'error')
        return redirect(url_for('index'))
    
    # Archive the class
    conn.execute('UPDATE classes SET archived = 1 WHERE id = ?', (class_id,))
    conn.commit()
    conn.close()
    
    flash(f'Class "{cls["name"]}" has been archived.', 'info')
    return redirect(url_for('index'))

@app.route('/note/<int:note_id>/delete', methods=['POST'])
def delete_note(note_id):
    """Delete a note"""
    conn = get_db_connection()
    note = conn.execute(
        '''SELECT n.*, c.id as class_id, c.name as class_name
           FROM notes n
           JOIN classes c ON n.class_id = c.id
           WHERE n.id = ?''',
        (note_id,)
    ).fetchone()
    
    if not note:
        flash('Note not found!', 'error')
        return redirect(url_for('index'))
    
    # Delete the note
    conn.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    conn.commit()
    conn.close()
    
    flash(f'Note "{note["title"]}" has been deleted.', 'success')
    return redirect(url_for('view_class', class_id=note['class_id']))

@app.route('/archived')
def archived_classes():
    """View archived classes"""
    conn = get_db_connection()
    classes = conn.execute('SELECT * FROM classes WHERE archived = 1 ORDER BY created_at DESC').fetchall()
    
    # Get note count for each archived class
    class_stats = []
    for cls in classes:
        note_count = conn.execute('SELECT COUNT(*) as count FROM notes WHERE class_id = ?', (cls['id'],)).fetchone()['count']
        class_stats.append({
            'class': cls,
            'note_count': note_count
        })
    
    conn.close()
    return render_template('archived.html', class_stats=class_stats)

@app.route('/class/<int:class_id>/unarchive', methods=['POST'])
def unarchive_class(class_id):
    """Unarchive a class"""
    conn = get_db_connection()
    cls = conn.execute('SELECT * FROM classes WHERE id = ? AND archived = 1', (class_id,)).fetchone()
    
    if not cls:
        flash('Archived class not found!', 'error')
        return redirect(url_for('archived_classes'))
    
    # Unarchive the class
    conn.execute('UPDATE classes SET archived = 0 WHERE id = ?', (class_id,))
    conn.commit()
    conn.close()
    
    flash(f'Class "{cls["name"]}" has been restored to active classes.', 'success')
    return redirect(url_for('archived_classes'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)

