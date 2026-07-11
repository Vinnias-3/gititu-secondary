import React, { useState, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:5000/api/admin';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [page, setPage] = useState('dashboard');
  const [settings, setSettings] = useState({});
  const [staff, setStaff] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [messages, setMessages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const login = (e) => {
    e.preventDefault();
    const u = e.target.username.value;
    const p = e.target.password.value;
    fetch('http://localhost:5000/api/admin/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username:u, password:p})
    }).then(r=>r.json()).then(d => {
      if(d.token){ setToken(d.token); setLoggedIn(true); }
      else alert('Wrong credentials');
    });
  };

  const loadData = () => {
    fetch(`http://localhost:5000/api/site-settings`).then(r=>r.json()).then(setSettings);
    fetch(`http://localhost:5000/api/staff`).then(r=>r.json()).then(setStaff);
    fetch(`http://localhost:5000/api/news`).then(r=>r.json()).then(setNews);
    fetch(`http://localhost:5000/api/gallery`).then(r=>r.json()).then(setGallery);
    fetch(`${API}/messages`).then(r=>r.json()).then(setMessages);
  };

  useEffect(() => { if(loggedIn) loadData(); }, [loggedIn]);

  if(!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>👻 Admin Panel</h1>
          <p>{settings.school_name || 'Gititu Secondary School'}</p>
          <form onSubmit={login}>
            <input name="username" placeholder="Username" defaultValue="admin" required />
            <input name="password" type="password" placeholder="Password" defaultValue="admin123" required />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <h2>👻 Admin</h2>
        {[
          {id:'dashboard', icon:'📊', label:'Dashboard'},
          {id:'settings', icon:'⚙️', label:'Settings'},
          {id:'staff', icon:'👨‍🏫', label:'Staff'},
          {id:'news', icon:'📰', label:'News'},
          {id:'gallery', icon:'🖼️', label:'Gallery'},
          {id:'messages', icon:'✉️', label:'Messages'},
        ].map(p => (
          <button key={p.id} className={page===p.id?'active':''} onClick={()=>{setPage(p.id);setMenuOpen(false);}}>
            {p.icon} {p.label}
          </button>
        ))}
        <button className="logout" onClick={()=>setLoggedIn(false)}>🚪 Logout</button>
      </aside>

      <main className="admin-main">
        <div className="mobile-header">
          <button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)}>☰ Menu</button>
          <h2>👻 Admin Panel</h2>
        </div>

        {page === 'dashboard' && <Dashboard settings={settings} staff={staff} news={news} messages={messages} gallery={gallery} />}
        {page === 'settings' && <SettingsPanel settings={settings} loadData={loadData} />}
        {page === 'staff' && <StaffPanel staff={staff} loadData={loadData} />}
        {page === 'news' && <NewsPanel news={news} loadData={loadData} />}
        {page === 'gallery' && <GalleryPanel gallery={gallery} loadData={loadData} />}
        {page === 'messages' && <MessagesPanel messages={messages} />}
      </main>
    </div>
  );
}

function Dashboard({ settings, staff, news, messages, gallery }) {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><span>{staff.length}</span><p>Staff Members</p></div>
        <div className="stat-card"><span>{news.length}</span><p>News & Events</p></div>
        <div className="stat-card"><span>{gallery.length}</span><p>Gallery Images</p></div>
        <div className="stat-card"><span>{messages.length}</span><p>Messages</p></div>
      </div>
      <div className="quick-info">
        <p><strong>School:</strong> {settings.school_name || 'Gititu Secondary School'}</p>
        <p><strong>Motto:</strong> {settings.motto || 'Strive for Excellence'}</p>
        <p><strong>Location:</strong> {settings.location || 'Muranga County, Kenya'}</p>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, loadData }) {
  const [form, setForm] = useState(settings);
  useEffect(()=>{setForm(settings);},[settings]);

  const save = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/admin/site-settings`, {
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)
    }).then(()=>{alert('Settings saved!'); loadData();});
  };

  return (
    <div className="panel">
      <h1>School Settings</h1>
      <form onSubmit={save} className="admin-form">
        <label>School Name</label>
        <input value={form.school_name||''} onChange={e=>setForm({...form,school_name:e.target.value})} />
        <label>Motto</label>
        <input value={form.motto||''} onChange={e=>setForm({...form,motto:e.target.value})} />
        <label>Location</label>
        <input value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})} />
        <label>Phone</label>
        <input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})} />
        <label>Email</label>
        <input value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} />
        <label>Primary Color</label>
        <input type="color" value={form.primary_color||'#0d3b1e'} onChange={e=>setForm({...form,primary_color:e.target.value})} />
        <label>Secondary Color</label>
        <input type="color" value={form.secondary_color||'#f4a620'} onChange={e=>setForm({...form,secondary_color:e.target.value})} />
        <label>Logo URL</label>
        <input value={form.logo_url||''} onChange={e=>setForm({...form,logo_url:e.target.value})} placeholder="https://..." />
        <button type="submit">💾 Save Settings</button>
      </form>
    </div>
  );
}

function StaffPanel({ staff, loadData }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({name:'',title:'',department:'',subject_specialty:'',qualification:'',experience:'',image_url:'',bio:''});

  const reset = () => { setEditing(null); setForm({name:'',title:'',department:'',subject_specialty:'',qualification:'',experience:'',image_url:'',bio:''}); };

  const edit = (s) => { setEditing(s.id); setForm(s); };

  const save = (e) => {
    e.preventDefault();
    const url = editing ? `${API}/staff/${editing}` : `${API}/staff`;
    const method = editing ? 'PUT' : 'POST';
    fetch(url, {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
      .then(()=>{alert('Saved!'); reset(); loadData();});
  };

  const remove = (id) => {
    if(window.confirm('Delete this staff member?')) {
      fetch(`${API}/staff/${id}`,{method:'DELETE'}).then(()=>loadData());
    }
  };

  return (
    <div className="panel">
      <h1>Manage Staff</h1>
      <form onSubmit={save} className="admin-form">
        <h3>{editing ? 'Edit Staff' : 'Add New Staff'}</h3>
        <div className="form-grid">
          <input placeholder="Name*" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input placeholder="Title*" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
          <input placeholder="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})} />
          <input placeholder="Subject Specialty" value={form.subject_specialty||''} onChange={e=>setForm({...form,subject_specialty:e.target.value})} />
          <input placeholder="Qualification" value={form.qualification||''} onChange={e=>setForm({...form,qualification:e.target.value})} />
          <input placeholder="Experience" value={form.experience||''} onChange={e=>setForm({...form,experience:e.target.value})} />
          <input placeholder="Image URL" value={form.image_url||''} onChange={e=>setForm({...form,image_url:e.target.value})} />
          <textarea placeholder="Bio" value={form.bio||''} onChange={e=>setForm({...form,bio:e.target.value})} />
        </div>
        <div className="form-buttons">
          <button type="submit">{editing ? '✏️ Update' : '➕ Add'}</button>
          {editing && <button type="button" onClick={reset} className="cancel">Cancel</button>}
        </div>
      </form>

      <div className="list">
        <h3>Current Staff ({staff.length})</h3>
        {staff.map(s => (
          <div key={s.id} className="list-item">
            <div>
              <strong>{s.name}</strong> — {s.title} ({s.department})
            </div>
            <div className="list-actions">
              <button onClick={()=>edit(s)}>✏️</button>
              <button onClick={()=>remove(s.id)} className="delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsPanel({ news, loadData }) {
  const [form, setForm] = useState({title:'',content:'',image_url:'',is_event:false,event_date:''});

  const save = (e) => {
    e.preventDefault();
    fetch(`${API}/news`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
      .then(()=>{alert('Added!'); setForm({title:'',content:'',image_url:'',is_event:false,event_date:''}); loadData();});
  };

  const remove = (id) => {
    if(window.confirm('Delete?')) fetch(`${API}/news/${id}`,{method:'DELETE'}).then(()=>loadData());
  };

  return (
    <div className="panel">
      <h1>Manage News & Events</h1>
      <form onSubmit={save} className="admin-form">
        <h3>Add News/Event</h3>
        <input placeholder="Title*" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
        <textarea placeholder="Content*" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} required />
        <input placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} />
        <label><input type="checkbox" checked={form.is_event} onChange={e=>setForm({...form,is_event:e.target.checked})} /> This is an event</label>
        {form.is_event && <input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})} />}
        <button type="submit">➕ Add</button>
      </form>
      <div className="list">
        <h3>Current ({news.length})</h3>
        {news.map(n => (
          <div key={n.id} className="list-item">
            <div><strong>{n.title}</strong> {n.is_event && '📅'}</div>
            <button onClick={()=>remove(n.id)} className="delete">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryPanel({ gallery, loadData }) {
  const [form, setForm] = useState({image_url:'',caption:'',category:''});

  const save = (e) => {
    e.preventDefault();
    fetch(`${API}/gallery`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)})
      .then(()=>{alert('Added!'); setForm({image_url:'',caption:'',category:''}); loadData();});
  };

  const remove = (id) => {
    if(window.confirm('Delete?')) fetch(`${API}/gallery/${id}`,{method:'DELETE'}).then(()=>loadData());
  };

  return (
    <div className="panel">
      <h1>Manage Gallery</h1>
      <form onSubmit={save} className="admin-form">
        <h3>Add Image</h3>
        <input placeholder="Image URL*" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} required />
        <input placeholder="Caption" value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})} />
        <input placeholder="Category (e.g. Events, Sports)" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <button type="submit">➕ Add</button>
      </form>
      <div className="gallery-preview">
        {gallery.map(g => (
          <div key={g.id} className="gallery-thumb">
            <img src={g.image_url} alt={g.caption} />
            <button onClick={()=>remove(g.id)} className="delete-overlay">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesPanel({ messages }) {
  return (
    <div className="panel">
      <h1>Contact Messages ({messages.length})</h1>
      {messages.map(m => (
        <div key={m.id} className="message-card" style={{background: m.is_read?'#fff':'#e8f5e9'}}>
          <p><strong>{m.name}</strong> — {m.email}</p>
          <p>{m.message}</p>
          <small>{new Date(m.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}

export default App;
