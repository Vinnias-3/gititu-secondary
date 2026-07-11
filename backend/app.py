from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'school.db')

def get_db():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()
    db.executescript('''
        CREATE TABLE IF NOT EXISTS admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS site_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            school_name TEXT DEFAULT 'Gititu Secondary School',
            motto TEXT DEFAULT 'Strive for Excellence',
            location TEXT DEFAULT 'Muranga County, Kenya',
            phone TEXT DEFAULT '+254700000000',
            email TEXT DEFAULT 'info@gitituschool.ac.ke',
            logo_url TEXT DEFAULT '',
            primary_color TEXT DEFAULT '#0d3b1e',
            secondary_color TEXT DEFAULT '#f4a620'
        );
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            department TEXT,
            subject_specialty TEXT,
            qualification TEXT,
            experience TEXT,
            phone TEXT,
            email TEXT,
            image_url TEXT,
            bio TEXT,
            display_order INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_event BOOLEAN DEFAULT 0,
            event_date TEXT
        );
        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_url TEXT NOT NULL,
            caption TEXT,
            category TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT 0
        );
        INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES ('admin', 'admin123');
        INSERT OR IGNORE INTO site_settings (id) VALUES (1);
    ''')
    db.commit()
    
    # Seed if empty
    c = db.execute("SELECT COUNT(*) FROM staff").fetchone()[0]
    if c == 0:
        db.executescript('''
            INSERT INTO staff (name, title, department, subject_specialty, qualification, experience, image_url, bio) VALUES
            ('Dr. James Kariuki', 'Principal', 'Administration', 'School Management', 'PhD Educational Leadership, Kenyatta University', '25 years', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Dr. Kariuki has led Gititu Secondary since 2015.'),
            ('Mrs. Grace Wanjiku', 'Deputy Principal', 'Administration', 'Curriculum Development', 'M.Ed Curriculum Studies, UoN', '18 years', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'Mrs. Wanjiku oversees academic programs.'),
            ('Mr. Peter Njoroge', 'Senior Teacher', 'Mathematics', 'Mathematics & Further Maths', 'B.Ed Mathematics, Moi University', '12 years', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'Innovative teaching methods for KCSE success.'),
            ('Ms. Esther Muthoni', 'HOD Languages', 'English', 'English & Literature', 'BA Literature, Egerton University', '10 years', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'Best English results in the county.'),
            ('Mr. David Omari', 'HOD Sciences', 'Science', 'Chemistry & Biology', 'B.Sc Biochemistry, JKUAT', '15 years', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'Manages science department and KCSE practicals.');
            
            INSERT INTO news (title, content, is_event, event_date) VALUES
            ('Form One Admission 2026', 'Form One admission is now open. Visit the school for registration.', 1, '2026-01-15'),
            ('KCSE 2025 Results', 'Gititu Secondary achieved a mean score of 8.5 in KCSE 2025!', 0, NULL);
            
            INSERT INTO gallery (image_url, caption, category) VALUES
            ('https://images.unsplash.com/photo-1523050854058-8df9010e3c0f?w=600', 'School Assembly', 'Events'),
            ('https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600', 'Computer Lab', 'Facilities');
        ''')
        db.commit()
    db.close()

init_db()

@app.route('/')
def home(): return jsonify({'status':'Gititu Secondary School API','version':'2.0'})

@app.route('/api/site-settings')
def get_settings():
    db=get_db(); r=db.execute("SELECT * FROM site_settings WHERE id=1").fetchone(); db.close()
    return jsonify(dict(r))

@app.route('/api/staff')
def get_staff():
    db=get_db(); r=db.execute("SELECT * FROM staff ORDER BY display_order").fetchall(); db.close()
    return jsonify([dict(x) for x in r])

@app.route('/api/news')
def get_news():
    db=get_db(); r=db.execute("SELECT * FROM news ORDER BY created_at DESC").fetchall(); db.close()
    return jsonify([dict(x) for x in r])

@app.route('/api/gallery')
def get_gallery():
    db=get_db(); r=db.execute("SELECT * FROM gallery ORDER BY uploaded_at DESC").fetchall(); db.close()
    return jsonify([dict(x) for x in r])

@app.route('/api/contact', methods=['POST'])
def contact():
    d=request.json
    db=get_db(); db.execute("INSERT INTO contact_messages (name,email,message) VALUES (?,?,?)",(d['name'],d['email'],d['message'])); db.commit(); db.close()
    return jsonify({'message':'Sent'}),201

@app.route('/api/admin/login', methods=['POST'])
def login():
    d=request.json
    db=get_db(); u=db.execute("SELECT * FROM admin_users WHERE username=? AND password_hash=?",(d['username'],d['password'])).fetchone(); db.close()
    if u: return jsonify({'token':'admin-token','user':u['username']})
    return jsonify({'error':'Invalid'}),401

@app.route('/api/admin/site-settings', methods=['PUT'])
def update_settings():
    d=request.json
    db=get_db()
    db.execute("UPDATE site_settings SET school_name=?,motto=?,location=?,phone=?,email=?,logo_url=?,primary_color=?,secondary_color=? WHERE id=1",
        (d.get('school_name'),d.get('motto'),d.get('location'),d.get('phone'),d.get('email'),d.get('logo_url'),d.get('primary_color'),d.get('secondary_color')))
    db.commit(); db.close()
    return jsonify({'message':'Updated'})

@app.route('/api/admin/staff', methods=['POST'])
def add_staff():
    d=request.json
    db=get_db()
    db.execute("INSERT INTO staff (name,title,department,subject_specialty,qualification,experience,image_url,bio) VALUES (?,?,?,?,?,?,?,?)",
        (d['name'],d['title'],d.get('department'),d.get('subject_specialty'),d.get('qualification'),d.get('experience'),d.get('image_url'),d.get('bio')))
    db.commit(); db.close()
    return jsonify({'message':'Added'}),201

@app.route('/api/admin/staff/<int:id>', methods=['PUT'])
def update_staff(id):
    d=request.json
    db=get_db()
    db.execute("UPDATE staff SET name=?,title=?,department=?,subject_specialty=?,qualification=?,experience=?,image_url=?,bio=? WHERE id=?",
        (d['name'],d['title'],d.get('department'),d.get('subject_specialty'),d.get('qualification'),d.get('experience'),d.get('image_url'),d.get('bio'),id))
    db.commit(); db.close()
    return jsonify({'message':'Updated'})

@app.route('/api/admin/staff/<int:id>', methods=['DELETE'])
def delete_staff(id):
    db=get_db(); db.execute("DELETE FROM staff WHERE id=?",(id,)); db.commit(); db.close()
    return jsonify({'message':'Deleted'})

@app.route('/api/admin/news', methods=['POST'])
def add_news():
    d=request.json
    db=get_db()
    db.execute("INSERT INTO news (title,content,image_url,is_event,event_date) VALUES (?,?,?,?,?)",
        (d['title'],d['content'],d.get('image_url'),1 if d.get('is_event') else 0,d.get('event_date') or None))
    db.commit(); db.close()
    return jsonify({'message':'Added'}),201

@app.route('/api/admin/news/<int:id>', methods=['DELETE'])
def delete_news(id):
    db=get_db(); db.execute("DELETE FROM news WHERE id=?",(id,)); db.commit(); db.close()
    return jsonify({'message':'Deleted'})

@app.route('/api/admin/gallery', methods=['POST'])
def add_gallery():
    d=request.json
    db=get_db()
    db.execute("INSERT INTO gallery (image_url,caption,category) VALUES (?,?,?)",(d['image_url'],d.get('caption'),d.get('category')))
    db.commit(); db.close()
    return jsonify({'message':'Added'}),201

@app.route('/api/admin/gallery/<int:id>', methods=['DELETE'])
def delete_gallery(id):
    db=get_db(); db.execute("DELETE FROM gallery WHERE id=?",(id,)); db.commit(); db.close()
    return jsonify({'message':'Deleted'})

@app.route('/api/admin/messages')
def get_messages():
    db=get_db(); r=db.execute("SELECT * FROM contact_messages ORDER BY created_at DESC").fetchall(); db.close()
    return jsonify([dict(x) for x in r])

if __name__=='__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
