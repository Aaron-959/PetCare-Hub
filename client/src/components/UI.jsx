import { PawPrint, LoaderCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export function Logo({ light = false }) {
  return <span className={`brand ${light ? "brand-light" : ""}`}><span className="brand-mark"><PawPrint size={19} /></span><span>petcare<span className="brand-hub">hub</span></span></span>;
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Spinner({ label = "Loading" }) {
  return <div className="spinner-wrap" role="status"><LoaderCircle className="spin" size={24} /><span>{label}</span></div>;
}

export function Notice({ children, type = "error" }) {
  if (!children) return null;
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return <div className={`notice notice-${type}`} role={type === "error" ? "alert" : "status"}><Icon size={18} />{children}</div>;
}

export function EmptyState({ title, children, action }) {
  return <div className="empty-state"><span className="empty-icon"><PawPrint size={25} /></span><h3>{title}</h3><p>{children}</p>{action}</div>;
}

export function StatusBadge({ status }) {
  return <span className={`status status-${String(status || "").toLowerCase()}`}>{status}</span>;
}

export function Field({ label, id, error, ...props }) {
  return <label className="field" htmlFor={id}><span>{label}</span><input id={id} aria-invalid={Boolean(error)} {...props} />{error && <small className="field-error">{error}</small>}</label>;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
