import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, PawPrint, Stethoscope, CalendarDays, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { Logo, Button } from "./UI.jsx";

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const signOut = async () => {
    try { await logout(); navigate("/"); } catch (error) { window.alert(error.message); }
  };
  return <header className="site-header"><div className="nav-shell">
    <Link to="/" onClick={close} aria-label="PetCare Hub home"><Logo /></Link>
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
    <nav className={`nav-links ${open ? "nav-open" : ""}`} aria-label="Main navigation">
      {user ? <>
        <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
        <NavLink to="/pets" onClick={close}>My pets</NavLink>
        <NavLink to="/veterinarians" onClick={close}>Veterinarians</NavLink>
        <NavLink to="/appointments" onClick={close}>Appointments</NavLink>
        {user.role === "admin" && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
        <NavLink to="/profile" onClick={close}>Profile</NavLink>
        <Button variant="outline" className="nav-signout" onClick={signOut}>Sign out</Button>
      </> : <>
        <a href="/#services" onClick={close}>Our services</a>
        <a href="/#care-team" onClick={close}>Our care team</a>
        <Link to="/login" onClick={close}>Sign in</Link>
        <Link to="/register" onClick={close}><Button>Get started <span aria-hidden="true">→</span></Button></Link>
      </>}
    </nav>
  </div></header>;
}

const sidebarItems = [
  ["/dashboard", "Overview", LayoutDashboard],
  ["/pets", "My pets", PawPrint],
  ["/veterinarians", "Veterinarians", Stethoscope],
  ["/appointments", "Appointments", CalendarDays]
];

export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();
  return <><Navbar /><div className="app-shell">
    <aside className="sidebar"><div className="sidebar-label">YOUR SPACE</div>{sidebarItems.map(([to, label, Icon]) => <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? "side-active" : ""}`}><Icon size={18} />{label}</NavLink>)}
      {user?.role === "admin" && <><div className="sidebar-label sidebar-spaced">MANAGEMENT</div><NavLink to="/admin" className={({ isActive }) => `side-link ${isActive ? "side-active" : ""}`}><ShieldCheck size={18} />Admin dashboard</NavLink></>}
      <div className="sidebar-bottom"><NavLink to="/profile" className="side-link"><Settings size={18} />Profile & settings</NavLink><button className="side-link side-button" onClick={async () => { try { await logout(); navigate("/"); } catch (error) { window.alert(error.message); } }}><LogOut size={18} />Sign out</button><div className="sidebar-user"><span className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</span><div><strong>{user?.name}</strong><small>{user?.role === "admin" ? "Administrator" : "Pet parent"}</small></div></div></div>
    </aside>
    <main className="app-main"><Outlet /></main>
  </div></>;
}
