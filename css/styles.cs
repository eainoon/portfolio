:root {
  --accent: #4b6cb7;
  --text: #111827;
  --bg: #ffffff;
  --muted: #6b7280;
  --container: 1000px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: "Inter", system-ui, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.6;
}

.container {
  max-width: var(--container);
  margin: auto;
  padding: 1.5rem;
}

/* Header */
.site-header {
  background: var(--accent);
  color: white;
  padding: 1rem 0;
}
.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav {
  list-style: none;
  display: flex;
  gap: 1rem;
}
.nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

/* Hero */
.hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
}
.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}
.links a {
  color: var(--accent);
  text-decoration: none;
}

/* Projects */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.project {
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  background: #fafafa;
}
.project h4 { color: var(--accent); margin-bottom: 0.3rem; }

/* Skills */
#skills ul { list-style: disc inside; margin-top: 0.5rem; }

/* Contact */
#contact button {
  margin-top: 0.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
}

/* Footer */
.site-footer {
  text-align: center;
  padding: 1rem 0;
  margin-top: 2rem;
  color: var(--muted);
  border-top: 1px solid #eee;
}

/* Responsive */
@media (max-width: 768px) {
  .hero { flex-direction: column; text-align: center; }
  .profile-photo { margin-bottom: 1rem; }
}
