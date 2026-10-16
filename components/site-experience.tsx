"use client";

import { useEffect, useState, type FormEvent } from "react";

type FormState = { kind: "idle" | "sending" | "success" | "error"; message?: string };

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className={diagonal ? "arrow arrow--diagonal" : "arrow"}>{diagonal ? "↗" : "→"}</span>;
}

function Brand() {
  return <a className="brand" href="#top" aria-label="AppverseSI home"><span className="brand-mark"><i /></span><span>APPVERSE<span className="brand-dot">.</span>SI</span></a>;
}

export default function SiteExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({ kind: "idle" });

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState({ kind: "sending" });
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setFormState({ kind: "error", message: result.error || "We couldn't send your message. Please try again later." });
        return;
      }
      form.reset();
      setFormState({ kind: "success", message: "Message received. Thanks for reaching out." });
    } catch {
      setFormState({ kind: "error", message: "We couldn't connect just now. Please try again." });
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell" id="top">
      <div className="starfield" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
      <header className="header">
        <div className="container nav-wrap">
          <Brand />
          <nav className={menuOpen ? "nav nav--open" : "nav"} aria-label="Main navigation">
            <a href="#vision" onClick={closeMenu}>Our vision</a>
            <a href="#frontier" onClick={closeMenu}>The frontier</a>
            <a href="#studio" onClick={closeMenu}>For business</a>
            <a className="nav-cta" href="#contact" onClick={closeMenu}>Start a conversation <Arrow diagonal /></a>
          </nav>
          <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}><span /><span /></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="live-dot" /> APPVERSE SUPERINTELLIGENCE <i>/</i> EST. IN POSSIBILITY</p>
              <h1>A new universe<br />of <span>software.</span></h1>
              <p className="hero-intro">We’re building intelligent digital experiences for what comes next — software designed to stretch possibility, not settle for the ordinary.</p>
              <div className="hero-actions"><a className="button button-primary" href="#frontier">Discover what’s next <Arrow /></a><a className="text-action" href="#vision">Explore our vision <Arrow diagonal /></a></div>
              <p className="hero-note"><span /> INDEPENDENT BY NATURE. FUTURE-FOCUSED BY DESIGN.</p>
            </div>
            <div className="hero-art" aria-label="Abstract orbital structure representing a universe of ideas">
              <div className="art-label art-label-top">AP / 001 <b>∴</b> 40° 44′ N</div>
              <div className="orbital-stage"><div className="orbital-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="orbit orbit-four" /><div className="orbit orbit-dashed" /><div className="core-halo" /><div className="core-sphere"><span /></div><div className="core-ring" /><i className="node node-one" /><i className="node node-two" /><i className="node node-three" /><i className="node node-four" /></div>
              <div className="art-label art-label-bottom"><span /> FORM / POSSIBILITY / INTELLIGENCE <b>FIG. 01</b></div>
            </div>
          </div>
          <div className="container hero-bottom"><span>A DIFFERENT POINT OF VIEW</span><span>CURIOUS BY DESIGN <i>✳</i> BUILT FOR TOMORROW</span><a href="#vision">SCROLL TO EXPLORE ↓</a></div>
        </section>

        <section className="section vision" id="vision" data-reveal>
          <div className="container">
            <div className="section-line"><span>01 <i>/</i> OUR NORTH STAR</span><span>THE BIGGER PICTURE</span></div>
            <div className="vision-grid"><p className="overline">A vision beyond the interface</p><div><h2>Understand the universe.<br /><span>Build toward the unknown.</span></h2><p className="body-copy">Appverse means more than a collection of applications. It’s a point of view: stay curious, think in systems, and create technology that opens up new possibilities. Superintelligence is the horizon we’re working toward — every meaningful step starts with what we build today.</p><a className="inline-link" href="#studio">See what we can build together <Arrow /></a></div></div>
            <div className="principles"><article><span>01</span><div><h3>Question the obvious.</h3><p>Progress begins where assumptions end.</p></div></article><article><span>02</span><div><h3>Build with intention.</h3><p>Every detail should earn its place.</p></div></article><article><span>03</span><div><h3>Keep looking forward.</h3><p>Today is the foundation, not the limit.</p></div></article></div>
          </div>
        </section>

        <section className="section frontier" id="frontier" data-reveal>
          <div className="container">
            <div className="section-line"><span>02 <i>/</i> THE FRONTIER</span><span>THE FIRST CHAPTER</span></div>
            <div className="frontier-heading"><div><p className="overline">Something is taking shape</p><h2>The next generation<br />is <span>in development.</span></h2></div><p className="body-copy">We’re working toward a new generation of applications — thoughtful, capable, and built to make a real difference. The first releases aren’t ready to reveal yet. When they are, you’ll find them here.</p></div>
            <div className="launch-card"><div className="launch-art"><div className="launch-grid" /><div className="launch-orbit launch-a" /><div className="launch-orbit launch-b" /><div className="launch-orbit launch-c" /><div className="launch-signal"><i /><b /></div><span>SIGNAL / 00</span><small>NO FIXED HORIZON</small></div><div className="launch-content"><p className="status"><i /> CURRENT STATUS <b>IN DEVELOPMENT</b></p><h3>First, make it<br />worth the wait.</h3><p>Our initial applications are being developed. No placeholders pretending to be products — just a clear signal that we’re building, and more is coming.</p><a className="inline-link" href="#contact">Ask us about the future <Arrow diagonal /></a></div></div>
            <p className="frontier-note">✳ &nbsp; PRODUCT NAMES AND RELEASE DATES WILL BE SHARED WHEN THEY’RE READY.</p>
          </div>
        </section>

        <section className="section studio" id="studio" data-reveal>
          <div className="container">
            <div className="section-line"><span>03 <i>/</i> THE STUDIO</span><span>OPEN TO SELECT PROJECTS</span></div>
            <div className="studio-grid"><div><p className="overline">For businesses with ambition</p><h2>Have a hard<br />problem? <span>Good.</span></h2><p className="body-copy">While our own products take shape, we’re open to working with businesses that need thoughtful digital products — from a distinctive website to a custom web application built around how they actually work.</p><a className="button button-primary" href="#contact">Tell us what you’re building <Arrow /></a></div><div className="services"><article><span>01</span><div><h3>Websites &amp; digital presence</h3><p>Purposeful, polished experiences that make a brand feel unmistakably itself.</p></div><b>↗</b></article><article><span>02</span><div><h3>Custom web applications</h3><p>Useful, responsive products designed around real workflows and people.</p></div><b>↗</b></article><article><span>03</span><div><h3>Software engineering</h3><p>Careful implementation focused on clarity, reliability, and room to grow.</p></div><b>↗</b></article><div className="service-foot"><span>SMALL TEAM. DIRECT COLLABORATION.</span><span>SELECT PROJECTS ONLY</span></div></div></div>
          </div>
        </section>

        <section className="section contact" id="contact" data-reveal>
          <div className="container">
            <div className="section-line"><span>04 <i>/</i> MAKE CONTACT</span><span>YOUR NEXT STEP STARTS HERE</span></div>
            <div className="contact-grid"><div><p className="overline">The conversation starts somewhere</p><h2>Let’s make<br /><span>something matter.</span></h2><p className="body-copy">Tell us a little about the idea, challenge, or project you have in mind. We read every genuine inquiry and will get back to you when there’s a good fit.</p><div className="contact-aside"><b>↗</b><p><strong>Ideas welcome.</strong><span>Big vision or a clear brief — start wherever you are.</span></p></div></div>
              <form className="contact-form" onSubmit={submitInquiry}>
                <div className="form-row"><label>Your name <i>*</i><input name="name" autoComplete="name" placeholder="Name" required maxLength={100} /></label><label>Email address <i>*</i><input name="email" autoComplete="email" type="email" placeholder="you@company.com" required maxLength={254} /></label></div>
                <div className="form-row"><label>Company <small>OPTIONAL</small><input name="company" autoComplete="organization" placeholder="Your organization" maxLength={120} /></label><label>Project type<select name="projectType" defaultValue=""><option value="" disabled>Select a project type</option><option>Website / digital presence</option><option>Custom web application</option><option>Software engineering</option><option>Product collaboration</option><option>Something else</option></select></label></div>
                <label>Tell us about it <i>*</i><textarea name="message" placeholder="A few details about what you’re looking to create…" required minLength={12} maxLength={4000} rows={4} /></label>
                <div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="form-bottom"><p>Your details are used only to respond to your inquiry.</p><button className="button button-primary" type="submit" disabled={formState.kind === "sending"}>{formState.kind === "sending" ? "Sending…" : "Send your inquiry"} <Arrow /></button></div>
                <p className={"form-feedback form-feedback--" + formState.kind} aria-live="polite" role={formState.kind === "error" ? "alert" : "status"}>{formState.message || ""}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer"><div className="container footer-top"><div><Brand /><p>Understand the universe.<br />Build toward superintelligence.</p></div><nav><a href="#vision">Our vision</a><a href="#frontier">The frontier</a><a href="#studio">For business</a><a href="#contact">Contact <Arrow diagonal /></a></nav><a className="top-link" href="#top" aria-label="Back to top">↑</a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} APPVERSE.SI</span><span>BUILT WITH CURIOSITY. AIMED AT WHAT’S NEXT.</span><a href="#top">BACK TO THE BEGINNING ↑</a></div></footer>
    </div>
  );
}
