import React, { useState, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:5000/api';

function App() {
  const [page, setPage] = useState('home');
  const [settings, setSettings] = useState({});
  const [staff, setStaff] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetch(`${API}/site-settings`).then(r => r.json()).then(setSettings);
    fetch(`${API}/staff`).then(r => r.json()).then(setStaff);
    fetch(`${API}/news`).then(r => r.json()).then(setNews);
    fetch(`${API}/gallery`).then(r => r.json()).then(setGallery);
    window.addEventListener('scroll', () => {
      setScrollY(window.scrollY);
      setShowBackToTop(window.scrollY > 500);
    });
  }, []);

  const primary = settings.primary_color || '#0d3b1e';
  const secondary = settings.secondary_color || '#f4a620';

  // Group staff by department
  const staffByDept = {};
  staff.forEach(s => {
    if (!staffByDept[s.department]) staffByDept[s.department] = [];
    staffByDept[s.department].push(s);
  });

  const goToPage = (p) => { setPage(p); setMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); };

  return (
    <div className="app">
      <div className="particles-bg">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="particle" style={{left:`${Math.random()*100}%`,animationDelay:`${Math.random()*10}s`,animationDuration:`${15+Math.random()*20}s`,fontSize:`${10+Math.random()*20}px`,opacity:0.08+Math.random()*0.15}}>
            {['📚','🎓','⭐','💡','🔬','⚽','🎨','💻'][i%8]}
          </div>
        ))}
      </div>

      <header className={scrollY > 100 ? 'header-scrolled' : ''} style={{background: scrollY > 100 ? primary : `linear-gradient(135deg, ${primary} 0%, #0a2a15 100%)`}}>
        <div className="top-bar">
          <marquee scrollamount="3">🎓 Admissions Open 2026 | 📞 {settings.phone || '+254 700 000 000'} | 📧 {settings.email || 'info@gitituschool.ac.ke'} | Excellence Since 1985</marquee>
        </div>
        <div className="header-main">
          <div className="logo-section">
            <img src="https://img.icons8.com/color/96/school.png" alt="Logo" className="school-logo" />
            <div>
              <h1>{settings.school_name || 'Gititu Secondary School'}</h1>
              <p className="motto">"{settings.motto || 'Strive for Excellence'}"</p>
            </div>
          </div>
        </div>
        <nav>
          <div className="hamburger" onClick={()=>setMenuOpen(!menuOpen)}>☰ {menuOpen ? 'Close' : 'Menu'}</div>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {[
              {id:'home', icon:'🏠', label:'Home'},
              {id:'about', icon:'📖', label:'About'},
              {id:'admissions', icon:'🎓', label:'Admissions'},
              {id:'academics', icon:'📚', label:'Academics'},
              {id:'staff', icon:'👨‍🏫', label:'Staff'},
              {id:'activities', icon:'⚽', label:'Activities'},
              {id:'news', icon:'📰', label:'News'},
              {id:'gallery', icon:'🖼️', label:'Gallery'},
              {id:'contact', icon:'✉️', label:'Contact'},
            ].map(p => (
              <button key={p.id} className={page===p.id?'active':''} onClick={()=>goToPage(p.id)}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main>
        {page === 'home' && <HomePage settings={settings} news={news} gallery={gallery} secondary={secondary} goToPage={goToPage} />}
        {page === 'about' && <AboutPage settings={settings} secondary={secondary} />}
        {page === 'admissions' && <AdmissionsPage secondary={secondary} settings={settings} />}
        {page === 'academics' && <AcademicsPage secondary={secondary} />}
        {page === 'staff' && <StaffPage staffByDept={staffByDept} secondary={secondary} selectedStaff={selectedStaff} setSelectedStaff={setSelectedStaff} />}
        {page === 'activities' && <ActivitiesPage secondary={secondary} />}
        {page === 'news' && <NewsPage news={news} secondary={secondary} />}
        {page === 'gallery' && <GalleryPage gallery={gallery} />}
        {page === 'contact' && <ContactPage settings={settings} secondary={secondary} />}
      </main>

      {showBackToTop && <button className="back-to-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>↑</button>}

      {selectedStaff && (
        <div className="staff-modal-overlay" onClick={()=>setSelectedStaff(null)}>
          <div className="staff-modal" onClick={e=>e.stopPropagation()}>
            <span className="modal-close" onClick={()=>setSelectedStaff(null)}>&times;</span>
            <img src={selectedStaff.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStaff.name)}&size=300&background=${secondary.replace('#','')}&color=fff&bold=true`} alt={selectedStaff.name} className="modal-img" />
            <h2>{selectedStaff.name}</h2>
            <p className="modal-role" style={{color:secondary}}>{selectedStaff.title}</p>
            <div className="modal-details">
              <p><strong>Department:</strong> {selectedStaff.department}</p>
              {selectedStaff.subject_specialty && <p><strong>Specialty:</strong> {selectedStaff.subject_specialty}</p>}
              {selectedStaff.qualification && <p><strong>Qualification:</strong> {selectedStaff.qualification}</p>}
              {selectedStaff.experience && <p><strong>Experience:</strong> {selectedStaff.experience}</p>}
              {selectedStaff.bio && <p className="modal-bio">{selectedStaff.bio}</p>}
            </div>
          </div>
        </div>
      )}

      <footer style={{background: primary}}>
        <div className="footer-grid">
          <div><h3>{settings.school_name || 'Gititu Secondary School'}</h3><p>"{settings.motto || 'Strive for Excellence'}"</p><div className="social-links"><span>📘</span><span>🐦</span><span>📸</span><span>▶️</span></div></div>
          <div><h4>Quick Links</h4>{['home','about','admissions','academics','staff','activities','news','gallery','contact'].map(p=><a key={p} onClick={()=>goToPage(p)}>{p.charAt(0).toUpperCase()+p.slice(1)}</a>)}</div>
          <div><h4>Contact</h4><p>📞 {settings.phone||'+254700000000'}</p><p>📧 {settings.email||'info@gitituschool.ac.ke'}</p><p>📍 {settings.location||'Muranga County, Kenya'}</p><p>🕐 Mon-Fri: 8AM-5PM</p></div>
        </div>
        <div className="footer-bottom"><p>© 2026 {settings.school_name||'Gititu Secondary School'}. Built by <strong>TechGlobal Cybersecurity</strong></p></div>
      </footer>
    </div>
  );
}

function HomePage({ settings, news, gallery, secondary, goToPage }) {
  return (<>
    <section className="hero-full">
      <div className="hero-overlay"></div>
      <div className="hero-content-main">
        <h2 className="fade-in">Welcome to <span style={{color:secondary}}>{settings.school_name||'Gititu Secondary School'}</span></h2>
        <p className="slide-up">A Premier Center of Academic Excellence — Nurturing Leaders, Inspiring Greatness</p>
        <div className="hero-buttons">
          <button className="btn-primary pulse" style={{background:secondary,color:'#000'}} onClick={()=>goToPage('admissions')}>Apply Now 🎓</button>
          <button className="btn-outline" onClick={()=>goToPage('gallery')}>Virtual Tour 🏫</button>
        </div>
        <div className="hero-stats">
          <div className="stat"><span>500+</span><p>Students</p></div>
          <div className="stat"><span>30+</span><p>Teachers</p></div>
          <div className="stat"><span>8.5</span><p>Mean Score</p></div>
          <div className="stat"><span>95%</span><p>Uni Transition</p></div>
        </div>
      </div>
      <div className="scroll-indicator"><div className="mouse"><div className="wheel"></div></div><p>Scroll</p></div>
    </section>

    <section className="section"><h2 className="section-title">Why Choose Us?</h2><div className="features-grid">{[{icon:'📚',title:'Quality Education',desc:'CBC curriculum with excellent KCSE results'},{icon:'💻',title:'Modern Facilities',desc:'Computer lab, science labs, library'},{icon:'⚽',title:'Sports Excellence',desc:'Active sports programs & competitions'},{icon:'🎓',title:'University Prep',desc:'95% transition to top universities'},{icon:'🎨',title:'Arts & Culture',desc:'Music, drama, and cultural activities'},{icon:'🛡️',title:'Safe Environment',desc:'Secure campus with caring staff'}].map((f,i)=><div key={i} className="feature-card" style={{borderTop:`3px solid ${secondary}`}}><span className="feature-icon">{f.icon}</span><h3>{f.title}</h3><p>{f.desc}</p></div>)}</div></section>

    <section className="section dark-bg" style={{background:'#0d3b1e'}}><h2 className="section-title light">Latest Updates</h2><div className="news-grid">{news.slice(0,3).map(n=><div key={n.id} className="news-card-modern">{n.image_url&&<img src={n.image_url} alt={n.title}/>}<div className="news-tag" style={{background:secondary}}>{n.is_event?'📅 Event':'📰 News'}</div><h3>{n.title}</h3><p>{n.content?.substring(0,100)}...</p></div>)}</div></section>

    <section className="section"><h2 className="section-title">Our Gallery</h2><div className="gallery-masonry">{gallery.slice(0,6).map((g,i)=><div key={g.id} className="gallery-masonry-item"><img src={g.image_url} alt={g.caption}/><div className="gallery-caption">{g.caption||'School Life'}</div></div>)}</div></section>

    <section className="cta-section" style={{background:secondary, color:'#000'}}><h2>Ready to Join {settings.school_name||'Gititu Secondary School'}?</h2><p>Applications for 2026 admissions are now open.</p><button className="btn-large" onClick={()=>goToPage('admissions')} style={{background:'#000',color:secondary,border:'none',padding:'18px 45px',borderRadius:50,fontSize:'1.2rem',fontWeight:'bold',cursor:'pointer',marginTop:20}}>Apply Now →</button></section>
  </>);
}

function AboutPage({ settings, secondary }) {
  return (<div className="page-container"><div className="page-hero" style={{background:'url(https://images.unsplash.com/photo-1523050854058-8df9010e3c0f?w=1200) center/cover'}}><div className="page-hero-overlay"></div><h2>About {settings.school_name||'Gititu Secondary School'}</h2></div><div className="content-block"><div className="about-grid"><div><h3>Our Story</h3><p>{settings.school_name||'Gititu Secondary School'} stands as a beacon of educational excellence in {settings.location||'Muranga County, Kenya'}. Founded with a vision to provide quality secondary education.</p><h3>Our Mission</h3><p>To provide holistic education that nurtures academic excellence, moral integrity, and practical skills.</p><h3>Our Vision</h3><p>To be a leading center of academic excellence producing innovative and responsible global citizens.</p></div><div className="about-highlights">{[{icon:'📚',title:'KCSE Excellence',desc:'Consistent mean scores above 8.0'},{icon:'💻',title:'Modern Labs',desc:'Computer & Science laboratories'},{icon:'⚽',title:'Sports',desc:'Active co-curricular programs'},{icon:'🎓',title:'Transition Rate',desc:'95% to universities'}].map((h,i)=><div key={i} className="highlight-card" style={{borderLeft:`5px solid ${secondary}`}}><span>{h.icon}</span><strong>{h.title}</strong><p>{h.desc}</p></div>)}</div></div></div></div>);
}

function AdmissionsPage({ secondary, settings }) {
  const downloadForm = () => {
    const formHTML = `<html><head><title>Admission Form - ${settings.school_name||'Gititu Secondary School'}</title><style>body{font-family:Arial;padding:30px;max-width:700px;margin:auto} h1{color:#0d3b1e} h2{color:#f4a620} table{width:100%;border-collapse:collapse;margin:15px 0} td{padding:10px;border:1px solid #ccc} input{width:100%;padding:8px;border:1px solid #ddd} .section{margin:25px 0}</style></head><body><h1>${settings.school_name||'Gititu Secondary School'}</h1><h2>Admission Application Form 2026</h2><div class="section"><h3>Student Information</h3><table><tr><td>Full Name:</td><td><input/></td></tr><tr><td>Date of Birth:</td><td><input type="date"/></td></tr><tr><td>Gender:</td><td><input/></td></tr><tr><td>KCPE Marks:</td><td><input type="number"/></td></tr><tr><td>Primary School:</td><td><input/></td></tr></table></div><div class="section"><h3>Parent/Guardian</h3><table><tr><td>Parent Name:</td><td><input/></td></tr><tr><td>Phone:</td><td><input/></td></tr><tr><td>Email:</td><td><input type="email"/></td></tr><tr><td>Address:</td><td><input/></td></tr></table></div><p>📞 ${settings.phone||'+254700000000'} | 📧 ${settings.email||'info@gitituschool.ac.ke'}</p></body></html>`;
    const blob = new Blob([formHTML], {type:'text/html'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Admission_Form_${settings.school_name||'Gititu'}_2026.html`;
    a.click();
  };

  return (<div className="page-container"><div className="page-hero" style={{background:'url(https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200) center/cover'}}><div className="page-hero-overlay"></div><h2>Admissions</h2><p>Join our community of excellence</p></div><div className="content-block"><div className="admissions-grid"><div className="admission-card"><h3>📋 Requirements</h3><ul><li>KCPE Certificate (minimum 250 marks)</li><li>Birth Certificate</li><li>School Leaving Certificate</li><li>2 Passport Size Photos</li><li>Parent/Guardian ID Copy</li></ul></div><div className="admission-card"><h3>💰 Fee Structure</h3><table className="fee-table"><tbody><tr><td>Form 1 Admission</td><td>Ksh 35,000</td></tr><tr><td>Form 2-4 (per term)</td><td>Ksh 28,000</td></tr><tr><td>Boarding (per term)</td><td>Ksh 15,000</td></tr><tr><td>Activity Fee</td><td>Ksh 3,000</td></tr></tbody></table></div><div className="admission-card"><h3>📅 Key Dates</h3><ul><li>Form 1 Admission: January 2026</li><li>Term 1: Jan - April 2026</li><li>Term 2: May - August 2026</li><li>Term 3: Sept - November 2026</li></ul></div><div className="admission-card"><h3>🏠 Boarding</h3><p>Modern dormitories with comfortable beds, study areas, and 24/7 supervision. Nutritious meals provided daily.</p></div></div>

    <div className="online-application" id="apply-form">
      <h2>📝 Apply Online</h2>
      <div className="application-form">
        <div className="form-row"><input placeholder="Student Full Name*" required/><input placeholder="Date of Birth*" type="date" required/></div>
        <div className="form-row"><input placeholder="KCPE Index Number*" required/><input placeholder="KCPE Marks*" type="number" required/></div>
        <div className="form-row"><input placeholder="Primary School Attended*" required/><input placeholder="Parent/Guardian Name*" required/></div>
        <div className="form-row"><input placeholder="Parent Phone*" required/><input placeholder="Parent Email" type="email"/></div>
        <div className="form-row"><textarea placeholder="Home Address" rows="2"></textarea></div>
        <button className="btn-primary pulse" style={{background:secondary,color:'#000',padding:'15px 40px',border:'none',borderRadius:50,fontSize:'1rem',fontWeight:'bold',cursor:'pointer',marginTop:15,width:'100%'}}>Submit Application 📩</button>
      </div>
    </div>

    <div className="cta-center" style={{marginTop:30}}><p style={{fontSize:'1.1rem',marginBottom:15}}>Prefer to fill offline? Download the form:</p><button onClick={downloadForm} style={{border:`2px solid ${secondary}`,color:secondary,background:'transparent',padding:'15px 35px',borderRadius:50,fontSize:'1rem',fontWeight:'bold',cursor:'pointer'}}>📥 Download Admission Form</button></div></div></div>);
}

function AcademicsPage({ secondary }) {
  const subjects = [{cat:'Sciences',items:['Mathematics','Physics','Chemistry','Biology','Computer Studies']},{cat:'Languages',items:['English','Kiswahili','French','German']},{cat:'Humanities',items:['Geography','History','CRE','Business Studies','Agriculture']},{cat:'Technical',items:['Home Science','Art & Design','Music','Physical Education']}];
  return (<div className="page-container"><div className="page-hero" style={{background:'url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200) center/cover'}}><div className="page-hero-overlay"></div><h2>Academics</h2></div><div className="content-block">{subjects.map((cat,i)=><div key={i} style={{marginBottom:30}}><h3 style={{color:secondary,borderBottom:`3px solid ${secondary}`,paddingBottom:8,marginBottom:15}}>{cat.cat}</h3><div className="subjects-grid">{cat.items.map(s=><div key={s} className="subject-tag">{s}</div>)}</div></div>)}<h3 style={{color:secondary,marginTop:30}}>📊 Performance</h3><div className="performance-stats"><div className="perf-card"><span>8.5</span><p>Mean Score (2025)</p></div><div className="perf-card"><span>95%</span><p>University Transition</p></div><div className="perf-card"><span>A-</span><p>Best Grade</p></div><div className="perf-card"><span>Top 10</span><p>In Murang'a County</p></div></div></div></div>);
}

function StaffPage({ staffByDept, secondary, selectedStaff, setSelectedStaff }) {
  return (<div className="page-container"><div className="page-hero" style={{background:'url(https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200) center/cover'}}><div className="page-hero-overlay"></div><h2>Our Staff</h2><p>Click a teacher to view their full profile</p></div><div className="content-block">{Object.entries(staffByDept).map(([dept, members])=><div key={dept} style={{marginBottom:40}}><h2 style={{color:secondary,borderBottom:`3px solid ${secondary}`,paddingBottom:8,marginBottom:20}}>{dept}</h2><div className="staff-grid large">{members.map(s=><div key={s.id} className="staff-card-detailed clickable" onClick={()=>setSelectedStaff(s)} style={{cursor:'pointer'}}><div className="staff-img-large"><img src={s.image_url||`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&size=200&background=${secondary.replace('#','')}&color=fff&bold=true`} alt={s.name}/></div><h3>{s.name}</h3><p className="role" style={{color:secondary}}>{s.title}</p>{s.subject_specialty&&<p style={{fontSize:'0.85rem',color:'#666'}}>{s.subject_specialty}</p>}</div>)}</div></div>)}</div></div>);
}

function ActivitiesPage({ secondary }) {
  const activities = [{icon:'⚽',title:'Football',desc:'School team competes in county & regional tournaments'},{icon:'🏀',title:'Basketball',desc:'Active basketball program with regular matches'},{icon:'🏃',title:'Athletics',desc:'Track & field events, cross country running'},{icon:'🎵',title:'Music & Drama',desc:'Annual music festivals & drama competitions'},{icon:'🎨',title:'Art Club',desc:'Painting, drawing, and creative arts'},{icon:'🔬',title:'Science Club',desc:'Experiments, projects & science fairs'},{icon:'💻',title:'Computer Club',desc:'Coding, robotics & IT skills'},{icon:'🌱',title:'Environmental Club',desc:'Tree planting & conservation'},{icon:'📰',title:'Journalism',desc:'School magazine & news writing'},{icon:'🎓',title:'Debate Club',desc:'Public speaking & argumentation skills'}];
  return (<div className="page-container"><div className="page-hero" style={{background:'url(https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200) center/cover'}}><div className="page-hero-overlay"></div><h2>Co-Curricular Activities</h2></div><div className="content-block"><div className="activities-grid">{activities.map((a,i)=><div key={i} className="activity-card" style={{borderTop:`3px solid ${secondary}`}}><span className="activity-icon">{a.icon}</span><h3>{a.title}</h3><p>{a.desc}</p></div>)}</div></div></div>);
}

function NewsPage({ news, secondary }) {
  return (<div className="page-container"><div className="page-hero"><h2>News & Events</h2></div><div className="content-block"><div className="news-list-vertical">{news.map(n=><div key={n.id} className="news-card-horizontal" style={{borderLeft:`5px solid ${secondary}`}}>{n.image_url&&<img src={n.image_url} alt={n.title}/>}<div><h3>{n.title}</h3>{n.is_event&&<span className="badge" style={{background:secondary}}>📅 {n.event_date}</span>}<p>{n.content}</p></div></div>)}</div></div></div>);
}

function GalleryPage({ gallery }) {
  const [selected, setSelected] = useState(null);
  return (<div className="page-container"><div className="page-hero"><h2>Gallery</h2></div><div className="content-block"><div className="gallery-grid large">{gallery.map(g=><div key={g.id} className="gallery-card" onClick={()=>setSelected(g)}><img src={g.image_url} alt={g.caption}/><div className="gallery-overlay"><p>{g.caption||'View'}</p></div></div>)}</div></div>{selected&&<div className="lightbox" onClick={()=>setSelected(null)}><span className="close">&times;</span><img src={selected.image_url} alt={selected.caption}/><p>{selected.caption}</p></div>}</div>);
}

function ContactPage({ settings, secondary }) {
  const [form,setForm]=useState({name:'',email:'',message:''});const [sent,setSent]=useState(false);
  const submit=(e)=>{e.preventDefault();fetch(`${API}/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}).then(()=>setSent(true));};
  return (<div className="page-container"><div className="page-hero"><h2>Contact Us</h2></div><div className="content-block"><div className="contact-layout"><div className="contact-details">{[['📞','Phone',settings.phone||'+254700000000'],['📧','Email',settings.email||'info@gitituschool.ac.ke'],['📍','Location',settings.location||'Muranga County, Kenya'],['🕐','Hours','Mon-Fri: 8AM-5PM']].map(([icon,label,value],i)=><div key={i} className="contact-card"><span>{icon}</span><div><strong>{label}</strong><p>{value}</p></div></div>)}</div><form onSubmit={submit} className="contact-form">{sent?<div className="success-message">✅ Message sent!</div>:<><h3>Send Message</h3><input placeholder="Full Name" required onChange={e=>setForm({...form,name:e.target.value})}/><input type="email" placeholder="Email" required onChange={e=>setForm({...form,email:e.target.value})}/><textarea placeholder="Your Message" required onChange={e=>setForm({...form,message:e.target.value})}/><button type="submit" style={{background:secondary,color:'#000',fontWeight:'bold',padding:15,border:'none',borderRadius:8,cursor:'pointer',fontSize:'1rem'}}>Send ✉️</button></>}</form></div></div></div>);
}

export default App;
