import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3,
  Heart, HeartPulse, PawPrint, Plus, Search, ShieldCheck, Sparkles, Stethoscope, Syringe,
  Scissors, Smile, Star, Trash2, Edit3, X
} from "lucide-react";
import { api, send } from "./api.js";
import { useAuth } from "./context/AuthContext.jsx";
import { AppLayout, Navbar } from "./components/Layout.jsx";
import { Button, EmptyState, Field, Notice, PageHeading, Spinner, StatusBadge } from "./components/UI.jsx";

const services = [
  { title: "General checkup", description: "Routine wellness visits to keep little noses and tails happy.", icon: Stethoscope, color: "mint" },
  { title: "Vaccination", description: "Thoughtful protection and clear guidance at every life stage.", icon: Syringe, color: "peach" },
  { title: "Dental care", description: "Gentle dental checks for brighter smiles and healthier pets.", icon: Smile, color: "lavender" },
  { title: "Grooming", description: "A comfortable tidy-up from a team that puts pets at ease.", icon: Scissors, color: "butter" },
  { title: "Emergency consultation", description: "Prompt guidance when your best friend needs urgent attention.", icon: HeartPulse, color: "peach" }
];
const serviceOptions = ["General Checkup", "Vaccination", "Dental Care", "Grooming", "Emergency Consultation"];
const emptyPet = { name: "", species: "Dog", breed: "", dateOfBirth: "", gender: "Unknown", weightKg: "", notes: "", photoUrl: "" };
const emptyDoctor = {
  name: "", specialization: "", experienceYears: 0, consultationFee: 500, bio: "", photoUrl: "", active: true,
  weeklySchedule: [1, 2, 3, 4, 5, 6].map(dayOfWeek => ({ dayOfWeek, startTime: "09:00", endTime: "17:00" }))
};

function Photo({ src, name, className = "" }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  return failed ? <span className={`photo-fallback ${className}`}>{name?.split(" ").filter(Boolean).slice(-1)[0]?.slice(0, 1) || "P"}</span> :
    <img className={className} src={src} alt="" onError={() => setFailed(true)} loading="lazy" />;
}

function RequireAuth() {
  const { user, ready } = useAuth();
  if (!ready) return <Spinner label="Checking your session…" />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const { user } = useAuth();
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/unauthorized" replace />;
}

function ConnectionBanner() {
  const { connectionError, refresh } = useAuth();
  const [retrying, setRetrying] = useState(false);
  if (!connectionError) return null;
  const retry = async () => {
    setRetrying(true);
    await refresh();
    setRetrying(false);
  };
  return <div className="connection-banner"><Notice>{connectionError}<button className="connection-retry" onClick={retry} disabled={retrying}>{retrying ? "Checking…" : "Retry"}</button></Notice></div>;
}

function Landing() {
  const [doctors, setDoctors] = useState([]);
  const [doctorError, setDoctorError] = useState("");
  useEffect(() => { api("/veterinarians").then(result => setDoctors(result.veterinarians.slice(0, 3))).catch(failure => setDoctorError(failure.message)); }, []);
  return <><Navbar /><main>
    <section className="hero"><div className="hero-copy"><span className="eyebrow"><Heart size={14} fill="currentColor" /> A little more love in every visit</span><h1>Better care for your <em>best friend.</em></h1><p>Thoughtful veterinary care, trusted doctors and easy appointments — all in one happy place.</p><div className="hero-actions"><Link to="/register"><Button>Book an appointment <ArrowRight size={17} /></Button></Link><a className="text-link" href="#services">Explore our care <ArrowUpRight size={16} /></a></div><div className="hero-proof"><div className="mini-avatars"><span>A</span><span>K</span><span>I</span></div><div><strong>Care that feels personal</strong><small>For every paw, feather and friend</small></div><div className="proof-stars"><Star size={15} fill="currentColor" /><b>4.9</b><small>demo rating</small></div></div></div>
      <div className="hero-visual"><div className="hero-photo-wrap"><img className="hero-photo" src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85" alt="Two happy dogs enjoying time together" onError={event => { event.currentTarget.style.display = "none"; }} /><div className="hero-photo-fallback"><PawPrint size={74} /></div></div><div className="floating-note note-top"><span className="note-icon"><Check size={17} /></span><span><b>Care you can count on</b><small>One visit at a time</small></span></div><div className="floating-note note-bottom"><span className="note-icon note-pink"><CalendarDays size={18} /></span><span><b>Appointments, made easy</b><small>Find a time that works</small></span></div><div className="hero-sparkle"><Sparkles size={25} /></div></div>
    </section>
    <section className="trust-strip"><span>HERE FOR THEIR HAPPIEST, HEALTHIEST DAYS</span><div><Heart size={17} /> Gentle care</div><div><ShieldCheck size={17} /> Trusted team</div><div><Clock3 size={17} /> Easy booking</div></section>
    <section id="services" className="section section-services"><div className="section-heading"><span className="eyebrow">A little care goes a long way</span><h2>Everything they need to <em>feel their best.</em></h2><p>From nose-to-tail checkups to the little things that make a big difference.</p></div><div className="service-grid">{services.map(({ title, description, icon: Icon, color }) => <article className="service-card" key={title}><span className={`service-icon ${color}`}><Icon size={22} /></span><h3>{title}</h3><p>{description}</p><Link to="/register" className="service-link">Get started <ArrowRight size={14} /></Link></article>)}</div></section>
    <section id="care-team" className="section section-team"><div className="section-heading row-heading"><div><span className="eyebrow">Good people. Great care.</span><h2>Meet your care <em>team.</em></h2><p>Our sample profiles are here to help you explore the booking experience.</p></div><Link className="text-link" to="/veterinarians">Meet all veterinarians <ArrowRight size={16} /></Link></div>{doctorError ? <Notice>{doctorError}</Notice> : doctors.length ? <div className="doctor-grid">{doctors.map((doctor, index) => <article className="doctor-card" key={doctor._id}><div className={`doctor-image doctor-tone-${index % 3}`}><Photo src={doctor.photoUrl} name={doctor.name} /><span className="doctor-available"><i /> Demo profile</span></div><div className="doctor-info"><span className="doctor-specialty">{doctor.specialization}</span><h3>{doctor.name}</h3><p>{doctor.experienceYears} years experience <span>·</span> ₹{doctor.consultationFee} / visit</p><Link to="/register" className="doctor-book">View availability <ArrowRight size={15} /></Link></div></article>)}</div> : <p className="team-empty">Demonstration care-team profiles will appear here after MongoDB is configured and seeded.</p>}</section>
    <section className="section how-section"><div className="section-heading"><span className="eyebrow">Simple from the start</span><h2>From “hello” to <em>all better.</em></h2></div><div className="steps-grid">{[["01", "Create your account", "A safe, simple space for you and your pets."], ["02", "Add your pet", "Tell us a little about your best friend."], ["03", "Choose your care", "Find a vet, service and time that fit."], ["04", "See you soon", "Get your booking details and you’re set."]].map(([number, title, text]) => <div className="step-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></div>)}</div></section>
    <section className="why-section"><div className="why-copy"><span className="eyebrow">Care with a little extra heart</span><h2>Because they’re not <em>“just pets.”</em></h2><p>They’re your morning routine, your favorite hello and your very best friend. We make it easier to show up for them, every day.</p><Link to="/register"><Button>Find their next appointment <ArrowRight size={17} /></Button></Link></div><div className="why-points"><article><span><Heart size={20} /></span><div><h3>Kind, thoughtful care</h3><p>Every visit starts with listening and a gentler approach.</p></div></article><article><span><CalendarDays size={20} /></span><div><h3>Your pet’s care, organized</h3><p>Keep appointments and pet details together in one place.</p></div></article><article><span><ShieldCheck size={20} /></span><div><h3>Made for peace of mind</h3><p>Clear details, transparent fees and no surprise bookings.</p></div></article></div></section>
    <section className="section testimonial-section"><div className="quote-mark">“</div><span className="eyebrow">A note from our demo wall</span><blockquote>It’s so much easier to keep track of Luna’s visits. Booking her checkup took just a few minutes.</blockquote><p className="sample-label">Sample demonstration testimonial · not a verified customer review</p></section>
    <section className="section faq-section"><div className="section-heading"><span className="eyebrow">Good to know</span><h2>A few little <em>answers.</em></h2></div><div className="faq-list">{[["How do I book an appointment?", "Create an account, add your pet, choose a veterinarian and select an available time. Your booking reference appears after the server saves the appointment."], ["Can I manage more than one pet?", "Yes. Add each pet to your account and select the right companion while booking."], ["Can I change or cancel a visit?", "You can reschedule or cancel pending and confirmed appointments from your appointments page, subject to availability."], ["Are these veterinarian profiles real?", "No. The included profiles and availability are demonstration data for this student project."]].map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div></section>
    <section className="bottom-cta"><div><span className="eyebrow">A happier visit starts here</span><h2>Ready to make their day?</h2><p>Set up a profile for your pet and find the care they deserve.</p></div><Link to="/register"><Button variant="light">Get started <ArrowRight size={16} /></Button></Link></section>
  </main><Footer /></>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div><Link to="/"><span className="brand footer-brand"><span className="brand-mark"><PawPrint size={19} /></span><span>petcare<span className="brand-hub">hub</span></span></span></Link><p>Every paw deserves the best care.</p></div><div className="footer-links"><a href="/#services">Services</a><a href="/#care-team">Care team</a><Link to="/login">Sign in</Link><Link to="/register">Get started</Link></div><div className="footer-contact"><strong>Made for the love of pets</strong><span>PetCare Hub · Student demonstration project</span><span>Sample clinic profiles are not verified medical providers.</span></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} PetCare Hub</span><span>Every Paw Deserves the Best Care.</span></div></footer>;
}

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = event => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async event => {
    event.preventDefault();
    setError("");
    if (isRegister && form.password !== form.confirmPassword) return setError("Your passwords don’t match.");
    setBusy(true);
    try {
      if (isRegister) await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      else await login({ email: form.email, password: form.password });
      navigate("/dashboard", { replace: true });
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  return <><Navbar /><main className="auth-page"><div className="auth-art"><span className="eyebrow">A happy place for pet people</span><h1>{isRegister ? "A little more care, right around the corner." : "Welcome back to your pet’s happy place."}</h1><p>Keep their care close, their appointments simple and their tails wagging.</p><div className="auth-art-badge"><PawPrint size={20} /><span>Every Paw Deserves the Best Care.</span></div></div><div className="auth-form-wrap"><div className="auth-form-head"><span className="eyebrow">{isRegister ? "LET’S GET STARTED" : "GOOD TO SEE YOU"}</span><h2>{isRegister ? "Create your account" : "Sign in to PetCare Hub"}</h2><p>{isRegister ? "Your pet’s next happy visit starts here." : "Your pets and appointments are waiting."}</p></div><Notice>{error}</Notice><form onSubmit={submit} className="form-stack">
    {isRegister && <><Field id="name" name="name" label="Your full name" autoComplete="name" required maxLength={80} value={form.name} onChange={update} placeholder="e.g. Aanya Sharma" /><Field id="phone" name="phone" label="Phone number" type="tel" autoComplete="tel" pattern="[+0-9 ()-]{8,20}" required value={form.phone} onChange={update} placeholder="+91 98765 43210" /></>}
    <Field id="email" name="email" label="Email address" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={update} placeholder="you@example.com" />
    <Field id="password" name="password" label="Password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} maxLength={72} required value={form.password} onChange={update} placeholder="At least 8 characters" />
    {isRegister && <><p className="password-help">Use 8 or more characters. A longer passphrase is even better.</p><Field id="confirmPassword" name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" minLength={8} required value={form.confirmPassword} onChange={update} placeholder="Type your password again" /></>}
    <Button disabled={busy}>{busy ? "One moment…" : isRegister ? "Create my account" : "Sign in"} <ArrowRight size={17} /></Button>
  </form><p className="auth-switch">{isRegister ? "Already have an account?" : "New to PetCare Hub?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create your account"}</Link></p><p className="secure-note"><ShieldCheck size={14} /> Your password is securely hashed and never stored in your browser.</p></div></main><Footer /></>;
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ pets: [], appointments: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api("/pets"), api("/appointments")]).then(([pets, appointments]) => setData({ pets: pets.pets, appointments: appointments.appointments }))
      .catch(failure => setError(failure.message)).finally(() => setLoading(false));
  }, []);
  const todayParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const today = `${todayParts.find(part => part.type === "year")?.value}-${todayParts.find(part => part.type === "month")?.value}-${todayParts.find(part => part.type === "day")?.value}`;
  const upcoming = useMemo(() => data.appointments.filter(item => ["Pending", "Confirmed"].includes(item.status) && item.appointmentDate?.slice(0, 10) >= today).sort((a, b) => `${a.appointmentDate}${a.startTime}`.localeCompare(`${b.appointmentDate}${b.startTime}`)), [data.appointments, today]);
  const completed = data.appointments.filter(item => item.status === "Completed").length;
  if (loading) return <Spinner label="Gathering your pet care details…" />;
  return <><PageHeading eyebrow="YOUR PETCARE HOME" title={`Hello, ${user?.name?.split(" ")[0] || "friend"}!`} description="Here’s a little look at what’s happening with your pet family." action={<Link to="/book"><Button><Plus size={17} /> Book a visit</Button></Link>} />
    <Notice>{error}</Notice><div className="stat-grid"><StatCard icon={PawPrint} label="Your pets" value={data.pets.length} tone="mint" /><StatCard icon={CalendarDays} label="Upcoming visits" value={upcoming.length} tone="peach" /><StatCard icon={CheckCircle2} label="Happy check-ins" value={completed} tone="lavender" /></div>
    <div className="dashboard-columns"><section className="panel"><div className="panel-heading"><div><span className="eyebrow">ON THE CALENDAR</span><h2>Coming up</h2></div><Link className="small-link" to="/appointments">All appointments <ArrowRight size={14} /></Link></div>
      {upcoming.length ? <div className="appointment-list">{upcoming.slice(0, 3).map(appointment => <AppointmentRow key={appointment._id} appointment={appointment} />)}</div> : <EmptyState title="Nothing on the calendar yet">When you book a visit, you’ll find it here.<Link className="small-link" to={data.pets.length ? "/book" : "/pets"}>{data.pets.length ? "Find a time" : "Add your first pet"} <ArrowRight size={14} /></Link></EmptyState>}
    </section><section className="panel pet-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR LITTLE FAMILY</span><h2>My pets</h2></div><Link className="icon-link" to="/pets" aria-label="Manage pets"><ArrowUpRight size={18} /></Link></div>
      {data.pets.length ? <div className="mini-pet-list">{data.pets.slice(0, 4).map(pet => <div className="mini-pet" key={pet._id}><span className="pet-emoji">{speciesIcon(pet.species)}</span><div><strong>{pet.name}</strong><small>{pet.breed || pet.species}</small></div><span className="mini-pet-species">{pet.species}</span></div>)}</div> : <EmptyState title="No pets added just yet">Add your pet’s details to make booking their first visit easy.<Link className="small-link" to="/pets">Add a pet <ArrowRight size={14} /></Link></EmptyState>}<Link className="add-pet-link" to="/pets"><Plus size={15} /> Manage your pets</Link>
    </section></div><div className="dashboard-tip"><span><Sparkles size={19} /></span><div><strong>A small reminder, a big difference</strong><p>Regular checkups help your best friend feel their best. Find a time that works for both of you.</p></div><Link to="/veterinarians">Meet the care team <ArrowRight size={15} /></Link></div>
  </>;
}

function StatCard({ icon: Icon, label, value, tone }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}><Icon size={21} /></span><div><span>{label}</span><strong>{value}</strong></div><span className="stat-decoration">✳</span></article>;
}

function AppointmentRow({ appointment }) {
  const date = formatDate(appointment.appointmentDate);
  return <article className="appointment-row"><div className="date-tile"><strong>{date.day}</strong><span>{date.month}</span></div><div className="appointment-row-info"><strong>{appointment.serviceType}</strong><span>{appointment.pet?.name || "Pet"} with {appointment.veterinarian?.name || "Veterinarian"}</span><small><Clock3 size={13} /> {appointment.startTime} · {date.full}</small></div><StatusBadge status={appointment.status} /></article>;
}

function formatDate(value) {
  const raw = typeof value === "string" ? value.slice(0, 10) : "";
  const date = new Date(`${raw}T12:00:00`);
  if (!raw || Number.isNaN(date.getTime())) return { day: "—", month: "", full: "Date unavailable" };
  return { day: new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(date), month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date), full: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(date) };
}

function speciesIcon(species) {
  return ({ Dog: "🐕", Cat: "🐈", Bird: "🐦", Rabbit: "🐇", Other: "🐾" })[species] || "🐾";
}

function PetForm({ initial, onSave, onCancel, busy }) {
  const [form, setForm] = useState(initial || emptyPet);
  const update = event => setForm({ ...form, [event.target.name]: event.target.value });
  return <form className="pet-form form-stack" onSubmit={event => { event.preventDefault(); onSave(form); }}>
    <div className="form-grid"><Field id="pet-name" label="Pet name" name="name" required maxLength={60} value={form.name} onChange={update} placeholder="Their lovely name" />
      <label className="field"><span>Species</span><select name="species" value={form.species} onChange={update}>{["Dog", "Cat", "Bird", "Rabbit", "Other"].map(value => <option key={value}>{value}</option>)}</select></label>
      <Field id="pet-breed" label="Breed (optional)" name="breed" maxLength={60} value={form.breed} onChange={update} placeholder="e.g. Indie" />
      <label className="field"><span>Gender</span><select name="gender" value={form.gender} onChange={update}>{["Unknown", "Female", "Male"].map(value => <option key={value}>{value}</option>)}</select></label>
      <Field id="pet-birth" label="Date of birth (optional)" name="dateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth?.slice(0, 10) || ""} onChange={update} />
      <Field id="pet-weight" label="Weight in kg (optional)" name="weightKg" type="number" min="0" max="250" step="0.1" value={form.weightKg ?? ""} onChange={update} placeholder="e.g. 8.5" />
    </div><label className="field"><span>Photo URL (optional)</span><input name="photoUrl" type="url" maxLength={500} value={form.photoUrl} onChange={update} placeholder="https://…" /></label><label className="field"><span>Notes (optional)</span><textarea name="notes" rows="3" maxLength={500} value={form.notes} onChange={update} placeholder="Anything your care team should know?" /></label>
    <div className="form-actions"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save pet details"}</Button></div>
  </form>;
}

function PetsPage() {
  const [pets, setPets] = useState([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = () => api("/pets").then(data => setPets(data.pets)).catch(failure => setError(failure.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const save = async form => {
    setError(""); setBusy(true);
    try {
      const { dateOfBirth, ...fields } = form;
      const body = { ...fields, dateOfBirth: dateOfBirth || null, weightKg: form.weightKg === "" ? null : Number(form.weightKg) };
      await api(editing ? `/pets/${editing._id}` : "/pets", send(editing ? "PATCH" : "POST", body));
      setShowForm(false); setEditing(null); await load();
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  };
  const remove = async pet => {
    if (!window.confirm(`Remove ${pet.name} from your pet list?`)) return;
    try { await api(`/pets/${pet._id}`, { method: "DELETE" }); await load(); } catch (failure) { setError(failure.message); }
  };
  const filtered = pets.filter(pet => `${pet.name} ${pet.breed} ${pet.species}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="YOUR LITTLE FAMILY" title="My pets" description="Every great visit starts with getting to know your best friend." action={!showForm && <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={17} /> Add a pet</Button>} /><Notice>{error}</Notice>
    {showForm && <section className="panel form-panel"><div className="panel-heading"><div><span className="eyebrow">{editing ? "A LITTLE UPDATE" : "NEW BEST FRIEND"}</span><h2>{editing ? `Update ${editing.name}` : "Add a pet"}</h2></div><button className="icon-link" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close form"><X size={18} /></button></div><PetForm key={editing?._id || "new"} initial={editing ? { ...editing, dateOfBirth: editing.dateOfBirth?.slice(0, 10) || "", weightKg: editing.weightKg ?? "" } : emptyPet} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }} busy={busy} /></section>}
    {loading ? <Spinner label="Finding your pets…" /> : pets.length ? <><div className="list-toolbar"><label className="search-field"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your pets" aria-label="Search pets" /></label><span>{filtered.length} {filtered.length === 1 ? "pet" : "pets"}</span></div><div className="pet-grid">{filtered.map(pet => <article className="pet-card" key={pet._id}><div className="pet-card-cover"><Photo src={pet.photoUrl} name={pet.name} className="pet-photo" /><span className="pet-species-pill">{speciesIcon(pet.species)} {pet.species}</span></div><div className="pet-card-content"><div className="pet-name-line"><h2>{pet.name}</h2><div className="pet-actions"><button onClick={() => { setEditing(pet); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Edit ${pet.name}`}><Edit3 size={16} /></button><button onClick={() => remove(pet)} aria-label={`Delete ${pet.name}`}><Trash2 size={16} /></button></div></div><p>{pet.breed || `${pet.species} friend`}{pet.gender !== "Unknown" && ` · ${pet.gender}`}</p><div className="pet-details">{pet.weightKg && <span>{pet.weightKg} kg</span>}{pet.dateOfBirth && <span>Born {formatDate(pet.dateOfBirth).full}</span>}</div>{pet.notes && <p className="pet-notes">{pet.notes}</p>}<Link to={`/book?pet=${pet._id}`} className="pet-book-link">Book a visit for {pet.name} <ArrowRight size={15} /></Link></div></article>)}</div>{!filtered.length && <EmptyState title="No matching pets">Try another name, breed or species.</EmptyState>}</> : !showForm && <EmptyState title="Your pet family starts here">Add a pet profile to make booking and managing their care simple.<Button onClick={() => setShowForm(true)}><Plus size={16} /> Add your first pet</Button></EmptyState>}
  </>;
}

function VeterinariansPage() {
  const [vets, setVets] = useState([]);
  const [query, setQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api("/veterinarians").then(data => setVets(data.veterinarians)).catch(failure => setError(failure.message)).finally(() => setLoading(false)); }, []);
  const specialties = [...new Set(vets.map(vet => vet.specialization))].sort();
  const filtered = vets.filter(vet => `${vet.name} ${vet.specialization}`.toLowerCase().includes(query.toLowerCase()) && (!specialization || vet.specialization === specialization) && (!maxFee || vet.consultationFee <= Number(maxFee)));
  return <><PageHeading eyebrow="MEET YOUR CARE TEAM" title="Find their person." description="Thoughtful veterinarians, ready to help your best friend feel their best." /><Notice>{error}</Notice>
    <div className="directory-intro"><span><ShieldCheck size={18} /> Demonstration veterinarian profiles and availability</span><p>These are sample records for this student project, not verified medical providers.</p></div>
    <div className="filter-bar"><label className="search-field"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name or specialty" aria-label="Search veterinarians" /></label><label className="filter-select"><span>Specialty</span><select value={specialization} onChange={event => setSpecialization(event.target.value)}><option value="">All specialties</option>{specialties.map(value => <option key={value}>{value}</option>)}</select></label><label className="filter-select"><span>Fee up to</span><select value={maxFee} onChange={event => setMaxFee(event.target.value)}><option value="">Any fee</option><option value="600">₹600</option><option value="750">₹750</option><option value="1000">₹1,000</option></select></label></div>
    {loading ? <Spinner label="Finding the care team…" /> : filtered.length ? <div className="doctor-grid directory-grid">{filtered.map((doctor, index) => <DoctorCard doctor={doctor} index={index} key={doctor._id} />)}</div> : <EmptyState title="No matches just yet">Try another name, specialty or consultation fee.</EmptyState>}
  </>;
}

function DoctorCard({ doctor, index = 0 }) {
  const { user } = useAuth();
  return <article className="doctor-card"><div className={`doctor-image doctor-tone-${index % 3}`}><Photo src={doctor.photoUrl} name={doctor.name} /><span className="doctor-available"><i /> Demo availability</span></div><div className="doctor-info"><span className="doctor-specialty">{doctor.specialization}</span><h3>{doctor.name}</h3><p>{doctor.experienceYears} years experience</p><p className="doctor-bio">{doctor.bio || "Here to make every visit a little more comfortable."}</p><div className="doctor-card-bottom"><strong>₹{doctor.consultationFee}<small> / visit</small></strong><Link to={user ? `/book?veterinarian=${doctor._id}` : "/login"} className="button button-primary">Book a visit <ArrowRight size={15} /></Link></div></div></article>;
}

function BookPage() {
  const [params] = useSearchParams();
  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [petId, setPetId] = useState(params.get("pet") || "");
  const [vetId, setVetId] = useState(params.get("veterinarian") || "");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [serviceType, setServiceType] = useState(serviceOptions[0]);
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState([]);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);
  useEffect(() => { Promise.all([api("/pets"), api("/veterinarians")]).then(([petData, vetData]) => { setPets(petData.pets); setVets(vetData.veterinarians); }).catch(failure => setError(failure.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!vetId || !date) { setSlots([]); setStartTime(""); return; }
    setStartTime("");
    api(`/veterinarians/${vetId}/slots?date=${encodeURIComponent(date)}`).then(data => setSlots(data.slots)).catch(failure => { setSlots([]); setError(failure.message); });
  }, [vetId, date]);
  const pet = pets.find(item => item._id === petId);
  const vet = vets.find(item => item._id === vetId);
  const minDate = new Date().toLocaleDateString("en-CA");
  const submit = async () => {
    setBusy(true); setError("");
    try {
      const result = await api("/appointments", send("POST", { petId, veterinarianId: vetId, date, startTime, serviceType, reason }));
      setConfirmed(result.appointment);
    } catch (failure) {
      setError(failure.message);
      if (failure.status === 409) {
        api(`/veterinarians/${vetId}/slots?date=${encodeURIComponent(date)}`)
          .then(data => setSlots(data.slots))
          .catch(refreshFailure => setError(refreshFailure.message));
      }
    }
    finally { setBusy(false); }
  };
  if (loading) return <Spinner label="Getting your booking ready…" />;
  if (confirmed) return <section className="booking-success"><span className="success-icon"><CheckCircle2 size={36} /></span><span className="eyebrow">ALL BOOKED IN</span><h1>A little more care is on the calendar.</h1><p>Your appointment request has been saved. Your booking reference is below.</p><div className="booking-reference"><small>BOOKING REFERENCE</small><strong>{confirmed.bookingReference}</strong></div><div className="booking-recap"><strong>{confirmed.pet?.name || pet?.name} · {confirmed.serviceType}</strong><span>{formatDate(confirmed.appointmentDate).full} at {confirmed.startTime}</span><span>{confirmed.veterinarian?.name || vet?.name} · ₹{confirmed.consultationFee}</span><StatusBadge status={confirmed.status} /></div><Link to="/appointments"><Button>View my appointments <ArrowRight size={16} /></Button></Link></section>;
  if (!pets.length) return <><PageHeading eyebrow="BOOK A LITTLE CARE" title="First, tell us about your pet." description="We’ll need a pet profile before we can find the right visit." /><EmptyState title="Add your pet before booking">Pet details help your care team prepare for your visit.<Link to="/pets"><Button>Add a pet <ArrowRight size={16} /></Button></Link></EmptyState></>;
  const canContinue = step === 1 ? Boolean(petId) : step === 2 ? Boolean(vetId) : step === 3 ? Boolean(date && startTime && serviceType) : true;
  return <><PageHeading eyebrow="A FEW STEPS TO THEIR NEXT VISIT" title="Let’s find a good time." description="Your booking is only a few little steps away." /><Notice>{error}</Notice><div className="booking-layout"><div className="booking-main"><div className="booking-steps">{["Your pet", "Care team", "Date & time", "Review"].map((label, index) => <div className={`booking-step ${step === index + 1 ? "current" : ""} ${step > index + 1 ? "complete" : ""}`} key={label}><span>{step > index + 1 ? <Check size={15} /> : index + 1}</span><small>{label}</small></div>)}</div>
    <section className="panel booking-panel"><div className="booking-panel-heading"><span className="eyebrow">STEP {step} OF 4</span><h2>{["Who’s coming in?", "Choose your care team.", "Pick a day and time.", "Take a final look."][step - 1]}</h2><p>{["Select the pet who needs a little care.", "Find a veterinarian who feels like a good fit.", "Availability is shown in India Standard Time.", "Everything look right? Send your appointment request."][step - 1]}</p></div>
      {step === 1 && <div className="selection-grid">{pets.map(item => <button key={item._id} className={`selection-card ${petId === item._id ? "selection-active" : ""}`} onClick={() => setPetId(item._id)}><span className="pet-emoji">{speciesIcon(item.species)}</span><strong>{item.name}</strong><small>{item.breed || item.species}</small>{petId === item._id && <CheckCircle2 size={18} />}</button>)}</div>}
      {step === 2 && <div className="selection-vets">{vets.map((doctor, index) => <button key={doctor._id} className={`selection-vet ${vetId === doctor._id ? "selection-active" : ""}`} onClick={() => setVetId(doctor._id)}><Photo src={doctor.photoUrl} name={doctor.name} /><span><strong>{doctor.name}</strong><small>{doctor.specialization} · {doctor.experienceYears} years</small></span><b>₹{doctor.consultationFee}</b></button>)}</div>}
      {step === 3 && <div className="form-stack"><label className="field"><span>Service</span><select value={serviceType} onChange={event => setServiceType(event.target.value)}>{serviceOptions.map(item => <option key={item}>{item}</option>)}</select></label><Field id="booking-date" label="Appointment date" type="date" min={minDate} required value={date} onChange={event => setDate(event.target.value)} />{date && <div className="slot-section"><span className="field-label">Available times · India Standard Time</span>{slots.length ? <div className="slot-grid">{slots.map(slot => <button type="button" key={slot} className={`slot-button ${startTime === slot ? "slot-selected" : ""}`} onClick={() => setStartTime(slot)}>{slot}</button>)}</div> : <p className="slot-empty">{vetId ? "No times available for this day. Try another date." : "Choose a veterinarian first."}</p>}</div>}<label className="field"><span>Anything we should know? <small>Optional</small></span><textarea rows="3" maxLength={500} value={reason} onChange={event => setReason(event.target.value)} placeholder="A little context for your veterinarian…" /></label></div>}
      {step === 4 && <div className="review-card"><div><span>YOUR PET</span><strong>{pet?.name} · {pet?.species}</strong></div><div><span>CARE TEAM</span><strong>{vet?.name} · {vet?.specialization}</strong></div><div><span>VISIT</span><strong>{serviceType}</strong></div><div><span>WHEN</span><strong>{formatDate(`${date}T12:00:00.000Z`).full} at {startTime} IST</strong></div><div><span>CONSULTATION FEE</span><strong>₹{vet?.consultationFee}</strong></div>{reason && <div><span>NOTE FOR THE VET</span><strong>{reason}</strong></div>}</div>}
      <div className="booking-controls">{step > 1 ? <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button> : <span />}{step < 4 ? <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>Continue <ArrowRight size={16} /></Button> : <Button disabled={busy} onClick={submit}>{busy ? "Saving your appointment…" : "Confirm appointment"} <Check size={16} /></Button>}</div>
    </section></div><aside className="booking-aside"><div className="booking-aside-icon"><PawPrint size={22} /></div><h3>A little heads-up</h3><p>Available times are checked again when you confirm, so your slot is only saved once we’ve secured it.</p><div className="aside-demo"><ShieldCheck size={16} /><span>Sample profiles and schedules are demonstration data.</span></div></aside></div></>;
}

function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rescheduling, setRescheduling] = useState(null);
    const [date, setDate] = useState("");
    const [slot, setSlot] = useState("");
    const [slots, setSlots] = useState([]);
    const [busy, setBusy] = useState(false);
    const load = () => api(`/appointments${status ? `?status=${encodeURIComponent(status)}` : ""}`)
      .then(data => setAppointments(data.appointments)).catch(failure => setError(failure.message)).finally(() => setLoading(false));
    useEffect(() => { load(); }, [status]);
    useEffect(() => {
      if (!rescheduling || !date) { setSlots([]); setSlot(""); return; }
      api(`/veterinarians/${rescheduling.veterinarian._id}/slots?date=${encodeURIComponent(date)}`)
        .then(data => setSlots(data.slots)).catch(failure => setError(failure.message));
    }, [rescheduling, date]);
    const cancel = async appointment => {
      if (!window.confirm(`Cancel ${appointment.pet?.name || "your pet"}’s appointment?`)) return;
      setError("");
      try { await api(`/appointments/${appointment._id}/cancel`, send("PATCH", {})); await load(); }
      catch (failure) { setError(failure.message); }
    };
    const saveReschedule = async () => {
      setError(""); setBusy(true);
      try {
        await api(`/appointments/${rescheduling._id}/reschedule`, send("PATCH", { date, startTime: slot }));
        setRescheduling(null); setDate(""); setSlot(""); await load();
      } catch (failure) { setError(failure.message); }
      finally { setBusy(false); }
    };
    const filtered = appointments.filter(item => `${item.pet?.name} ${item.veterinarian?.name} ${item.serviceType} ${item.bookingReference}`.toLowerCase().includes(search.toLowerCase()));
    return <><PageHeading eyebrow="YOUR VISITS, ALL IN ONE PLACE" title="Appointments" description="Keep up with upcoming visits and see your pet’s care history." action={<Link to="/book"><Button><Plus size={16} /> Book a visit</Button></Link>} /><Notice>{error}</Notice>
      <div className="filter-bar appointment-filters"><label className="search-field"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search visits, pets or vets" aria-label="Search appointments" /></label><label className="filter-select"><span>Status</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="">All appointments</option>{["Pending", "Confirmed", "Completed", "Cancelled"].map(item => <option key={item}>{item}</option>)}</select></label></div>
      {loading ? <Spinner label="Checking your appointments…" /> : filtered.length ? <div className="appointments-stack">{filtered.map(appointment => {
        const dateInfo = formatDate(appointment.appointmentDate);
        return <article className="appointment-card" key={appointment._id}><div className="date-tile large-date"><strong>{dateInfo.day}</strong><span>{dateInfo.month}</span><small>{appointment.startTime}</small></div><div className="appointment-card-main"><div className="appointment-title"><div><span className="eyebrow">{appointment.serviceType}</span><h2>{appointment.pet?.name || "Pet"} with {appointment.veterinarian?.name || "Veterinarian"}</h2></div><StatusBadge status={appointment.status} /></div><div className="appointment-card-meta"><span><CalendarDays size={15} />{dateInfo.full}</span><span><Stethoscope size={15} />{appointment.veterinarian?.specialization}</span><span><strong>₹{appointment.consultationFee}</strong> consultation</span></div>{appointment.reason && <p className="appointment-reason">“{appointment.reason}”</p>}<div className="booking-ref">Ref: {appointment.bookingReference}</div>
          {["Pending", "Confirmed"].includes(appointment.status) && <div className="appointment-actions"><button className="button button-outline button-small" onClick={() => { setRescheduling(appointment); setDate(""); setSlot(""); }}><CalendarDays size={15} /> Reschedule</button><button className="button button-quiet button-small" onClick={() => cancel(appointment)}><X size={15} /> Cancel appointment</button></div>}</div>
          {rescheduling?._id === appointment._id && <div className="reschedule-box"><strong>Choose a new time for {appointment.pet?.name}’s visit</strong><div className="reschedule-controls"><Field id="reschedule-date" label="New date" type="date" min={new Date().toLocaleDateString("en-CA")} value={date} onChange={event => setDate(event.target.value)} /><label className="field"><span>Available time</span><select value={slot} onChange={event => setSlot(event.target.value)} disabled={!slots.length}><option value="">Select a time</option>{slots.map(item => <option key={item}>{item}</option>)}</select></label></div><div className="form-actions"><Button variant="outline" onClick={() => setRescheduling(null)}>Keep current time</Button><Button disabled={!date || !slot || busy} onClick={saveReschedule}>{busy ? "Updating…" : "Save new time"}</Button></div></div>}</article>;
      })}</div> : <EmptyState title={appointments.length ? "No matching appointments" : "No appointments just yet"}>{appointments.length ? "Try changing the search or status filter." : "When you book a visit, you’ll find its details here."}{!appointments.length && <Link to="/book"><Button>Book your first visit <ArrowRight size={16} /></Button></Link>}</EmptyState>}
    </>;
}

function ProfilePage() {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: user.name, phone: user.phone });
    const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const updateProfile = async event => {
      event.preventDefault(); setBusy(true); setError(""); setNotice("");
      try { const result = await api("/auth/profile", send("PATCH", profile)); updateUser(result.user); setNotice("Your profile details have been updated."); }
      catch (failure) { setError(failure.message); } finally { setBusy(false); }
    };
    const changePassword = async event => {
      event.preventDefault(); setBusy(true); setError(""); setNotice("");
      try { await api("/auth/change-password", send("PATCH", password)); await logout(); navigate("/login"); }
      catch (failure) { setError(failure.message); } finally { setBusy(false); }
    };
    return <><PageHeading eyebrow="YOUR ACCOUNT, YOUR WAY" title="Profile & settings" description="Keep your contact details up to date and your account secure." /><Notice>{error}</Notice><Notice type="success">{notice}</Notice><div className="settings-grid"><section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR DETAILS</span><h2>Personal information</h2></div></div><form className="form-stack" onSubmit={updateProfile}><Field id="profile-name" label="Full name" required maxLength={80} value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /><Field id="profile-email" label="Email address" type="email" value={user.email} disabled /><Field id="profile-phone" label="Phone number" type="tel" pattern="[+0-9 ()-]{8,20}" required value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} /><Button disabled={busy}>Save changes</Button></form></section><section className="panel settings-panel"><div className="panel-heading"><div><span className="eyebrow">A LITTLE EXTRA SECURITY</span><h2>Change password</h2></div></div><form className="form-stack" onSubmit={changePassword}><Field id="current-password" label="Current password" type="password" autoComplete="current-password" required value={password.currentPassword} onChange={event => setPassword({ ...password, currentPassword: event.target.value })} /><Field id="new-password" label="New password" type="password" minLength={8} maxLength={72} autoComplete="new-password" required value={password.newPassword} onChange={event => setPassword({ ...password, newPassword: event.target.value })} /><p className="password-help">Changing your password will sign you out everywhere.</p><Button variant="outline" disabled={busy}>Update password</Button></form></section></div><div className="settings-footnote"><ShieldCheck size={17} /><span>Your session is held in an HTTP-only cookie. Passwords are never saved in local storage.</span></div></>;
}

function AdminPage() {
    const [dashboard, setDashboard] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [vets, setVets] = useState([]);
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [doctor, setDoctor] = useState(emptyDoctor);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const load = async () => {
      try {
        const [summary, visits, doctors] = await Promise.all([api("/admin/dashboard"), api("/admin/appointments?limit=50"), api("/admin/veterinarians")]);
        setDashboard(summary); setAppointments(visits.appointments); setVets(doctors.veterinarians); setError("");
      } catch (failure) { setError(failure.message); } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);
    const setStatus = async (appointment, status) => {
      setError(""); setSuccess("");
      try { await api(`/admin/appointments/${appointment._id}/status`, send("PATCH", { status })); setSuccess(`Appointment ${appointment.bookingReference} marked ${status.toLowerCase()}.`); await load(); }
      catch (failure) { setError(failure.message); }
    };
    const openDoctorForm = item => {
      setEditing(item || null);
      setDoctor(item ? { ...item, weeklySchedule: item.weeklySchedule || [] } : emptyDoctor);
      setShowForm(true);
    };
    const saveDoctor = async event => {
      event.preventDefault(); setBusy(true); setError(""); setSuccess("");
      const body = { ...doctor, experienceYears: Number(doctor.experienceYears), consultationFee: Number(doctor.consultationFee), slotDurationMinutes: 30 };
      try { await api(editing ? `/admin/veterinarians/${editing._id}` : "/admin/veterinarians", send(editing ? "PATCH" : "POST", body)); setShowForm(false); setSuccess("Veterinarian profile saved."); await load(); }
      catch (failure) { setError(failure.message); } finally { setBusy(false); }
    };
    const deactivate = async item => {
      if (!window.confirm(`Deactivate ${item.name}? They will no longer appear in public searches.`)) return;
      try { await api(`/admin/veterinarians/${item._id}/deactivate`, send("PATCH", {})); setSuccess(`${item.name} was deactivated.`); await load(); }
      catch (failure) { setError(failure.message); }
    };
    if (loading) return <Spinner label="Loading the clinic overview…" />;
    const stats = dashboard?.stats || {};
    const visits = appointments.filter(item => (!filter || item.status === filter) && `${item.owner?.name} ${item.pet?.name} ${item.veterinarian?.name} ${item.bookingReference}`.toLowerCase().includes(search.toLowerCase()));
    return <><PageHeading eyebrow="CLINIC MANAGEMENT" title="Admin dashboard" description="A clear overview of clinic visits and your care team." action={<button className="button button-outline" onClick={() => openDoctorForm(null)}><Plus size={17} /> Add veterinarian</button>} /><Notice>{error}</Notice><Notice type="success">{success}</Notice>
      <div className="stat-grid admin-stat-grid"><StatCard icon={CalendarDays} label="All appointments" value={stats.appointments || 0} tone="mint" /><StatCard icon={Clock3} label="Pending" value={stats.pending || 0} tone="peach" /><StatCard icon={CheckCircle2} label="Confirmed" value={stats.confirmed || 0} tone="lavender" /><StatCard icon={CheckCircle2} label="Completed visits" value={stats.completed || 0} tone="lavender" /><StatCard icon={PawPrint} label="Registered pets" value={stats.pets || 0} tone="butter" /><StatCard icon={Stethoscope} label="Veterinarians" value={stats.veterinarians || 0} tone="mint" /></div>
      <div className="admin-overview"><section className="panel status-panel"><div className="panel-heading"><div><span className="eyebrow">VISIT SNAPSHOT</span><h2>Appointment status</h2></div></div>{[["Pending", stats.pending], ["Confirmed", stats.confirmed], ["Completed", stats.completed], ["All appointments", stats.appointments]].map(([label, count]) => <div className="bar-row" key={label}><span>{label}</span><div className="bar-track"><i style={{ width: `${stats.appointments ? Math.max(count / stats.appointments * 100, count ? 5 : 0) : 0}%` }} /></div><b>{count || 0}</b></div>)}</section><section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">ON THE BOOKS</span><h2>Recent appointments</h2></div></div>{dashboard?.recent?.length ? dashboard.recent.slice(0, 5).map(item => <div className="recent-item" key={item._id}><span className="recent-avatar">{item.pet?.name?.slice(0, 1) || "P"}</span><div><strong>{item.pet?.name || "Pet"} · {item.serviceType}</strong><small>{item.owner?.name || "Owner"} with {item.veterinarian?.name || "Vet"}</small></div><StatusBadge status={item.status} /></div>) : <p className="muted">No appointments yet.</p>}</section></div>
      <section className="panel admin-table-panel"><div className="panel-heading"><div><span className="eyebrow">THE CLINIC CALENDAR</span><h2>Manage appointments</h2></div></div><div className="filter-bar compact-filter"><label className="search-field"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search pet, owner or reference" aria-label="Search clinic appointments" /></label><label className="filter-select"><span>Status</span><select value={filter} onChange={event => setFilter(event.target.value)}><option value="">All statuses</option>{["Pending", "Confirmed", "Completed", "Cancelled"].map(item => <option key={item}>{item}</option>)}</select></label></div>
        <div className="table-scroll"><table><thead><tr><th>Pet & owner</th><th>Veterinarian</th><th>Date & time</th><th>Status</th><th>Update</th></tr></thead><tbody>{visits.map(item => <tr key={item._id}><td><strong>{item.pet?.name || "Pet"}</strong><small>{item.owner?.name || "Owner"} · {item.bookingReference}</small></td><td>{item.veterinarian?.name || "Veterinarian"}</td><td>{formatDate(item.appointmentDate).full}<small>{item.startTime} · {item.serviceType}</small></td><td><StatusBadge status={item.status} /></td><td><select className="table-select" aria-label={`Set status for ${item.bookingReference}`} value="" disabled={!["Pending", "Confirmed"].includes(item.status)} onChange={event => event.target.value && setStatus(item, event.target.value)}><option value="">Choose…</option>{item.status === "Pending" && <option>Confirmed</option>}{["Pending", "Confirmed"].includes(item.status) && <option>Cancelled</option>}{item.status === "Confirmed" && <option>Completed</option>}</select></td></tr>)}</tbody></table>{!visits.length && <p className="table-empty">No appointments match those filters.</p>}</div>
      </section>
      <section className="panel admin-vets-panel"><div className="panel-heading"><div><span className="eyebrow">THE CARE TEAM</span><h2>Veterinarian management</h2></div><span className="panel-count">{vets.filter(item => item.active).length} active</span></div><div className="admin-vet-list">{vets.map(item => <article className="admin-vet-row" key={item._id}><div><strong>{item.name}</strong><small>{item.specialization} · ₹{item.consultationFee} · {item.active ? "Active" : "Inactive"}</small></div><div className="admin-vet-actions"><button className="button button-outline button-small" onClick={() => openDoctorForm(item)}><Edit3 size={14} /> Edit</button>{item.active && <button className="button button-quiet button-small" onClick={() => deactivate(item)}><X size={14} /> Deactivate</button>}</div></article>)}</div></section>
      {showForm && <div className="modal-backdrop" role="presentation"><section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="vet-modal-title"><div className="panel-heading"><div><span className="eyebrow">CARE TEAM DETAILS</span><h2 id="vet-modal-title">{editing ? "Update veterinarian" : "Add veterinarian"}</h2></div><button className="icon-link" onClick={() => setShowForm(false)} aria-label="Close"><X size={19} /></button></div><form className="form-stack" onSubmit={saveDoctor}><div className="form-grid"><Field id="vet-name" label="Full name" required maxLength={80} value={doctor.name} onChange={event => setDoctor({ ...doctor, name: event.target.value })} /><Field id="vet-specialty" label="Specialization" required maxLength={80} value={doctor.specialization} onChange={event => setDoctor({ ...doctor, specialization: event.target.value })} /><Field id="vet-experience" label="Years of experience" type="number" min="0" max="60" required value={doctor.experienceYears} onChange={event => setDoctor({ ...doctor, experienceYears: event.target.value })} /><Field id="vet-fee" label="Fee in INR" type="number" min="0" max="100000" required value={doctor.consultationFee} onChange={event => setDoctor({ ...doctor, consultationFee: event.target.value })} /></div><Field id="vet-photo" label="Photo URL (optional)" type="url" value={doctor.photoUrl || ""} onChange={event => setDoctor({ ...doctor, photoUrl: event.target.value })} /><label className="field"><span>Short biography</span><textarea rows="3" maxLength="600" value={doctor.bio} onChange={event => setDoctor({ ...doctor, bio: event.target.value })} /></label><fieldset className="schedule-editor"><legend>Available days · India Standard Time</legend><div className="schedule-days">{[["Monday", 1], ["Tuesday", 2], ["Wednesday", 3], ["Thursday", 4], ["Friday", 5], ["Saturday", 6], ["Sunday", 0]].map(([label, day]) => <label key={day}><input type="checkbox" checked={(doctor.weeklySchedule || []).some(item => item.dayOfWeek === day)} onChange={event => { const schedule = doctor.weeklySchedule || []; const weeklySchedule = event.target.checked ? [...schedule, { dayOfWeek: day, startTime: schedule[0]?.startTime || "09:00", endTime: schedule[0]?.endTime || "17:00" }].sort((a, b) => a.dayOfWeek - b.dayOfWeek) : schedule.filter(item => item.dayOfWeek !== day); setDoctor({ ...doctor, weeklySchedule }); }} />{label}</label>)}</div></fieldset><div className="form-grid"><Field id="vet-start-time" label="Daily opening time" type="time" value={doctor.weeklySchedule?.[0]?.startTime || "09:00"} onChange={event => setDoctor({ ...doctor, weeklySchedule: doctor.weeklySchedule.map(item => ({ ...item, startTime: event.target.value })) })} /><Field id="vet-end-time" label="Daily closing time" type="time" value={doctor.weeklySchedule?.[0]?.endTime || "17:00"} onChange={event => setDoctor({ ...doctor, weeklySchedule: doctor.weeklySchedule.map(item => ({ ...item, endTime: event.target.value })) })} /></div><p className="password-help">Appointments use 30-minute slots within the selected daily schedule.</p><div className="form-actions"><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button></div></form></section></div>}
    </>;
}

function NotFound() {
    return <><Navbar /><main className="not-found"><span className="error-number">404</span><span className="eyebrow">A LITTLE OFF THE LEASH</span><h1>We can’t find that page.</h1><p>It may have moved, or maybe a curious paw nudged the wrong link.</p><Link to="/"><Button>Back to PetCare Hub <ArrowRight size={16} /></Button></Link></main><Footer /></>;
}

function Unauthorized() {
    return <><Navbar /><main className="not-found"><span className="error-number"><ShieldCheck size={82} /></span><span className="eyebrow">THIS SPACE IS FOR THE CARE TEAM</span><h1>You don’t have access to this page.</h1><p>Administrator tools are only available to authorized clinic administrators.</p><Link to="/dashboard"><Button>Back to your dashboard <ArrowRight size={16} /></Button></Link></main><Footer /></>;
}

export default function App() {
    return <><ConnectionBanner /><Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<RequireAuth />}><Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pets" element={<PetsPage />} />
        <Route path="/veterinarians" element={<VeterinariansPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route element={<RequireAdmin />}><Route path="/admin" element={<AdminPage />} /></Route>
      </Route></Route>
      <Route path="*" element={<NotFound />} />
    </Routes></>;
}
