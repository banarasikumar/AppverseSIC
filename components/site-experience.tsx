"use client";

import { useEffect, useState, type FormEvent } from "react";
import UniverseCanvas from "@/components/universe-canvas";

type FormState = { kind: "idle" | "sending" | "success" | "error"; message?: string };

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className={diagonal ? "arrow arrow--diagonal" : "arrow"}>{diagonal ? "↗" : "→"}</span>;
}

function Brand() {
  return <a className="brand" href="#top" aria-label="AppverseSI home"><span className="brand-symbol"><i /><b /></span><span className="brand-word">APPVERSE<span>.</span>SI</span></a>;
}

export default function SiteExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scenePaused, setScenePaused] = useState(false);
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
      <header className="topbar">
        <div className="container topbar-inner">
          <Brand />
          <nav className={menuOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Main navigation">
            <a href="#vision" onClick={closeMenu}>Vision</a>
            <a href="#frontier" onClick={closeMenu}>The frontier</a>
            <a href="#studio" onClick={closeMenu}>Studio</a>
            <a className="nav-contact" href="#contact" onClick={closeMenu}>Start a conversation <Arrow diagonal /></a>
          </nav>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}><span /><span /></button>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-canvas"><UniverseCanvas paused={scenePaused} /></div>
          <div className="hero-atmosphere" aria-hidden="true" />
          <div className="hero-gridlines" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> APPVERSE SUPERINTELLIGENCE <i>/</i> FIELD 001</p>
              <h1 id="hero-title">A universe<br />of <em>intelligence.</em></h1>
              <p className="hero-lede">The next frontier isn’t somewhere we go. It’s what we learn to build.</p>
              <p className="hero-body">We’re creating a new universe of software — intelligent applications and digital experiences, imagined with curiosity and engineered for what comes next.</p>
              <div className="hero-actions">
                <a className="button button-solid" href="#frontier">Explore the frontier <Arrow /></a>
                <a className="button button-quiet" href="#vision">Our point of view <Arrow diagonal /></a>
              </div>
              <div className="hero-index"><span>01</span><i /> THINK BIGGER THAN THE INTERFACE</div>
            </div>
            <div className="scene-label scene-label--top"><span className="tiny-cross">+</span><span>LIVE ENVIRONMENT</span><b>AP / 001</b></div>
            <div className="scene-hud">
              <div className="hud-heading"><span className="hud-live" /><span>PARTICLE SYSTEM</span><b>ACTIVE</b></div>
              <div className="hud-spectrum"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="hud-details"><div><span>RENDER</span><b>REAL-TIME / WEBGL</b></div><div><span>INPUT</span><b>POINTER + TOUCH</b></div></div>
              <button className="scene-toggle" type="button" onClick={() => setScenePaused(!scenePaused)} aria-pressed={scenePaused}><span>{scenePaused ? "▶" : "Ⅱ"}</span>{scenePaused ? "RESUME MOTION" : "PAUSE MOTION"}</button>
            </div>
            <div className="scene-label scene-label--left"><span>VISUALIZATION / 3D</span><i>↘</i></div>
          </div>
          <div className="container hero-footer-line"><span><i>✳</i> INDEPENDENT BY NATURE. FUTURE-FOCUSED BY DESIGN.</span><a href="#vision">SCROLL TO EXPLORE <b>↓</b></a><span className="refresh-note">FRAME PACING: DISPLAY-SYNCED</span></div>
        </section>

        <section className="vision section-pad" id="vision" data-reveal>
          <div className="container">
            <div className="section-heading"><span><i>01</i> / THE POINT OF VIEW</span><span className="section-heading-right">A DIFFERENT SCALE OF THINKING</span></div>
            <div className="vision-main">
              <p className="micro-label">THINK IN UNIVERSES.</p>
              <div><h2>Don’t just add<br />to the noise. <span>Change the signal.</span></h2><p className="section-copy">We believe the best technology starts with an unusually large question — and then earns its way toward an answer. AppverseSI exists to explore that space between today’s useful software and tomorrow’s more capable intelligence.</p><p className="section-copy">Not technology for spectacle alone. Not complexity for its own sake. Things that feel inevitable in hindsight because someone was curious enough to begin.</p></div>
            </div>
            <div className="vision-principles">
              <article className="principle"><div className="principle-top"><span>01 / CURIOSITY</span><b>↗</b></div><h3>Ask the bigger question.</h3><p>Look beyond what exists. Imagine what should exist, then work backward with discipline.</p><div className="principle-mark principle-mark--orbit"><i /><b /><em /></div></article>
              <article className="principle"><div className="principle-top"><span>02 / ENGINEERING</span><b>↗</b></div><h3>Make the impossible tangible.</h3><p>Ideas only matter when they become useful, reliable, beautifully considered things.</p><div className="principle-mark principle-mark--mesh"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
              <article className="principle"><div className="principle-top"><span>03 / INTELLIGENCE</span><b>↗</b></div><h3>Build toward the horizon.</h3><p>Every generation of software should make room for the next to become more capable.</p><div className="principle-mark principle-mark--signal"><i /><i /><i /><i /><i /><i /></div></article>
            </div>
          </div>
        </section>

        <section className="frontier section-pad" id="frontier" data-reveal>
          <div className="container">
            <div className="section-heading"><span><i>02</i> / THE FRONTIER</span><span className="section-heading-right">THE NEXT CHAPTER IS FORMING</span></div>
            <div className="frontier-intro"><div><p className="micro-label">IN FORMATION</p><h2>A new universe<br />is taking <span>shape.</span></h2></div><p className="section-copy">Our applications are being developed with the same conviction that defines the brand: take the long view, sweat the details, and make something worth putting into the world. We’ll reveal them when they’re ready.</p></div>
            <div className="frontier-console">
              <div className="console-top"><span><i /> DEVELOPMENT MATRIX</span><span>APVERSE / CONCEPTUAL FRAMEWORK</span><span>STATE: EVOLVING</span></div>
              <div className="console-body">
                <div className="console-visual"><div className="console-rings"><i /><i /><i /><b /></div><div className="console-coordinate">FIELD / 02<br />INTELLIGENCE IN FORMATION</div><div className="console-bottom">NO PRODUCT ANNOUNCEMENTS YET <span>◇</span></div></div>
                <div className="console-list">
                  <div className="console-list-head"><span>AREAS OF EXPLORATION</span><span>STATUS</span></div>
                  <article><div className="console-number">A / 01</div><div className="console-item-copy"><h3>Intelligent applications</h3><p>Software designed around new ways to think, create, and solve.</p></div><span className="status-pill"><i /> IN DEVELOPMENT</span></article>
                  <article><div className="console-number">A / 02</div><div className="console-item-copy"><h3>Human-centred systems</h3><p>Useful interfaces that make complexity feel effortless.</p></div><span className="status-pill"><i /> IN DEVELOPMENT</span></article>
                  <article><div className="console-number">A / 03</div><div className="console-item-copy"><h3>New software paradigms</h3><p>Exploring what becomes possible as intelligence evolves.</p></div><span className="status-pill"><i /> IN DEVELOPMENT</span></article>
                </div>
              </div>
              <div className="console-bottomline"><span>THE WORK COMES BEFORE THE ANNOUNCEMENT.</span><span>WE’RE JUST GETTING STARTED <b>↗</b></span></div>
            </div>
          </div>
        </section>

        <section className="studio section-pad" id="studio" data-reveal>
          <div className="container">
            <div className="section-heading"><span><i>03</i> / THE STUDIO</span><span className="section-heading-right">SELECT PROJECTS / DIRECT COLLABORATION</span></div>
            <div className="studio-layout"><div className="studio-copy"><p className="micro-label">FOR PEOPLE BUILDING WHAT’S NEXT</p><h2>Big ambition.<br /><span>Grounded execution.</span></h2><p className="section-copy">While our own frontier expands, we work with select businesses to turn difficult digital problems into thoughtful, dependable software. Small-team focus, direct communication, and care in every detail.</p><a className="button button-outline" href="#contact">Discuss a project <Arrow diagonal /></a></div>
              <div className="studio-services"><article><span>01</span><div><h3>Websites with a point of view</h3><p>Distinctive digital experiences that make a brand feel unmistakably itself.</p></div><b>↗</b></article><article><span>02</span><div><h3>Custom web applications</h3><p>Useful, fast interfaces built around real workflows and real people.</p></div><b>↗</b></article><article><span>03</span><div><h3>Software engineering</h3><p>Careful implementation, strong foundations, and room to evolve.</p></div><b>↗</b></article><div className="studio-note"><i /> OPEN TO A SMALL NUMBER OF WELL-SUITED PROJECTS</div></div>
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact" data-reveal>
          <div className="container">
            <div className="section-heading"><span><i>04</i> / OPEN CHANNEL</span><span className="section-heading-right">START WITH A CONVERSATION</span></div>
            <div className="contact-layout"><div className="contact-copy"><p className="micro-label">ALL GREAT THINGS BEGIN SOMEWHERE</p><h2>What should<br />exist <span>next?</span></h2><p className="section-copy">Have an idea, a challenge, or a digital project that deserves real thought? Give us the signal. We read every genuine inquiry and will respond when there’s a good fit.</p><div className="contact-signal"><span className="signal-orb"><i /></span><div><b>CHANNEL OPEN</b><p>Ideas, collaborations, and considered challenges.</p></div></div></div>
              <form className="contact-form" onSubmit={submitInquiry}>
                <div className="form-heading"><span>INQUIRY / 001</span><span>FIELDS MARKED * ARE REQUIRED</span></div>
                <div className="form-grid"><label>Your name <i>*</i><input name="name" autoComplete="name" placeholder="How should we address you?" required maxLength={100} /></label><label>Email address <i>*</i><input name="email" autoComplete="email" type="email" placeholder="you@company.com" required maxLength={254} /></label><label>Company <small>OPTIONAL</small><input name="company" autoComplete="organization" placeholder="Your organization" maxLength={120} /></label><label>Project type<select name="projectType" defaultValue=""><option value="" disabled>Choose a direction</option><option>Website / digital presence</option><option>Custom web application</option><option>Software engineering</option><option>Product collaboration</option><option>Something else</option></select></label></div>
                <label className="message-label">Tell us what you have in mind <i>*</i><textarea name="message" placeholder="The idea, the problem, the thing you wish existed…" required minLength={12} maxLength={4000} rows={4} /></label>
                <div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="form-submit-row"><p>Your information is used only to respond to your inquiry.</p><button className="button button-solid" type="submit" disabled={formState.kind === "sending"}>{formState.kind === "sending" ? "Transmitting…" : "Send the signal"} <Arrow /></button></div>
                <p className={"form-feedback form-feedback--" + formState.kind} aria-live="polite" role={formState.kind === "error" ? "alert" : "status"}>{formState.message || ""}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-main"><div className="footer-brand"><Brand /><p>A new universe of software.<br />A long view of intelligence.</p></div><div className="footer-links"><a href="#vision">Vision</a><a href="#frontier">The frontier</a><a href="#studio">Studio</a><a href="#contact">Contact <Arrow diagonal /></a></div><a className="back-top" href="#top" aria-label="Back to top">↑</a></div><div className="container footer-legal"><span>© {new Date().getFullYear()} APPVERSE.SI</span><span>INDEPENDENT BY NATURE · FUTURE-FOCUSED BY DESIGN</span><a href="#top">BACK TO ORBIT ↑</a></div></footer>
    </div>
  );
}
