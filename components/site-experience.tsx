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
    const themedSections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-color]"));
    const updateTheme = () => {
      const activeLine = window.innerHeight * 0.38;
      let active = themedSections[0];
      themedSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activeLine) active = section;
      });
      if (!active) return;
      const color = active.dataset.themeColor || "#05080b";
      const accent = active.dataset.sceneAccent || "#b7f6dc";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
      document.documentElement.style.backgroundColor = color;
      document.documentElement.style.setProperty("--scene-accent", accent);
      document.body.dataset.scene = active.id || "hero";
    };
    let themeFrame = 0;
    const onScrollTheme = () => {
      if (themeFrame) return;
      themeFrame = window.requestAnimationFrame(() => {
        themeFrame = 0;
        updateTheme();
      });
    };
    window.addEventListener("scroll", onScrollTheme, { passive: true });
    window.addEventListener("resize", onScrollTheme, { passive: true });
    updateTheme();

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
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollTheme);
      window.removeEventListener("resize", onScrollTheme);
      if (themeFrame) window.cancelAnimationFrame(themeFrame);
    };
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
      <div className="world-backdrop" aria-hidden="true"><UniverseCanvas paused={scenePaused} /></div>
      <header className="topbar">
        <div className="container topbar-inner">
          <Brand />
          <nav className={menuOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Main navigation">
            <a href="#vision" onClick={closeMenu}>Vision</a>
            <a href="#frontier" onClick={closeMenu}>The frontier</a>
            <a href="#products" onClick={closeMenu}>Our apps</a>
            <a href="#studio" onClick={closeMenu}>Studio</a>
            <a className="nav-contact" href="#contact" onClick={closeMenu}>Start a conversation <Arrow diagonal /></a>
          </nav>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}><span /><span /></button>
        </div>
      </header>

      <main>
        <section className="hero" id="home" data-theme-color="#05080b" data-scene-accent="#b7f6dc" aria-labelledby="hero-title">
          <div className="hero-atmosphere" aria-hidden="true" />
          <div className="hero-gridlines" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> APPVERSE SUPERINTELLIGENCE <i>/</i> AN EXPLORATION OF WHAT COMES NEXT</p>
              <h1 id="hero-title">Beyond the<br />known <em>universe.</em></h1>
              <p className="hero-lede">We build and publish our own apps — and build with businesses.</p>
              <p className="hero-body">AppverseSI is an independent software business developing its own applications and partnering with businesses to plan, design, and build digital products.</p>
              <div className="hero-actions">
                <a className="button button-solid" href="#products">Explore our apps <Arrow /></a>
                <a className="hero-business-link" href="#studio">For businesses: build with us <Arrow diagonal /></a>
              </div>
              <div className="hero-index"><span>01</span><i /> THE FUTURE IS NOT A FLAT SURFACE</div>
            </div>
            <div className="scene-label scene-label--top"><span className="tiny-cross">+</span><span>EVENT HORIZON</span><b>AP / 001</b></div>
            <div className="scene-hud">
              <div className="hud-heading"><span className="hud-live" /><span>BLACK HOLE / ACCRETION DISK</span><b>LIVE 3D</b></div>
              <p className="scene-caption">Light curves. Matter spirals. Space bends.</p>
              <button className="scene-toggle" type="button" onClick={() => setScenePaused(!scenePaused)} aria-pressed={scenePaused}><span>{scenePaused ? "▶" : "Ⅱ"}</span>{scenePaused ? "RESUME MOVEMENT" : "PAUSE MOVEMENT"}</button>
            </div>
            <div className="scene-label scene-label--left"><span>GRAVITATIONAL LENSING</span><i>↘</i></div>
          </div>
          <div className="container hero-footer-line"><span><i>✳</i> BUILT WITH CURIOSITY. DESIGNED FOR WHAT COMES NEXT.</span><a href="#vision">SCROLL TO DESCEND <b>↓</b></a><span className="refresh-note">FRAME PACING: DISPLAY-SYNCED</span></div>
        </section>

        <section className="vision section-pad" id="vision" data-reveal data-theme-color="#07110f" data-scene-accent="#9ff3d2">
          <div className="container">
            <div className="section-heading"><span><i>01</i> / THE POINT OF VIEW</span><span className="section-heading-right">A DIFFERENT SCALE OF THINKING</span></div>
            <div className="vision-main">
              <p className="micro-label">THINK IN UNIVERSES.</p>
              <div><h2>Don’t just add<br />to the noise. <span>Change the signal.</span></h2><p className="section-copy">The most interesting questions are rarely the small ones. We are exploring how software can become more capable, more intuitive, and more human — while staying grounded in things that are genuinely useful.</p><p className="section-copy">The aim is not spectacle for its own sake. It is to make the extraordinary useful, and to build with enough care that the technology gets out of the way.</p></div>
            </div>
            <div className="vision-principles">
              <article className="principle"><div className="principle-top"><span>01 / CURIOSITY</span><b>↗</b></div><h3>Ask the bigger question.</h3><p>Look beyond what exists. Imagine what should exist, then work backward with discipline.</p><div className="principle-mark principle-mark--orbit"><i /><b /><em /></div></article>
              <article className="principle"><div className="principle-top"><span>02 / ENGINEERING</span><b>↗</b></div><h3>Make the impossible tangible.</h3><p>Ideas only matter when they become useful, reliable, beautifully considered things.</p><div className="principle-mark principle-mark--mesh"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
              <article className="principle"><div className="principle-top"><span>03 / INTELLIGENCE</span><b>↗</b></div><h3>Build toward the horizon.</h3><p>Every generation of software should make room for the next to become more capable.</p><div className="principle-mark principle-mark--signal"><i /><i /><i /><i /><i /><i /></div></article>
            </div>
          </div>
        </section>

        <section className="frontier section-pad" id="frontier" data-reveal data-theme-color="#07101a" data-scene-accent="#9bafff">
          <div className="container">
            <div className="section-heading"><span><i>02</i> / THE FRONTIER</span><span className="section-heading-right">THE NEXT CHAPTER IS FORMING</span></div>
            <div className="frontier-intro"><div><p className="micro-label">IN FORMATION</p><h2>A new universe<br />is taking <span>shape.</span></h2></div><p className="section-copy">A new generation of software should feel less like operating a machine and more like extending what a person can do. That is the direction we are working toward.</p></div>
            <div className="frontier-console">
              <div className="console-top"><span><i /> FIELDS OF EXPLORATION</span><span>INTELLIGENCE IN FORMATION</span><span>STATE: EVOLVING</span></div>
              <div className="console-body">
                <div className="console-visual"><div className="console-rings"><i /><i /><i /><b /></div><div className="console-coordinate">FIELD / 02<br />INTELLIGENCE IN FORMATION</div><div className="console-bottom">NOTHING HERE IS STATIC <span>✳</span></div></div>
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

        <section className="products section-pad" id="products" data-reveal data-theme-color="#080d14" data-scene-accent="#a8b6ff">
          <div className="container">
            <div className="section-heading"><span><i>03</i> / OUR PRODUCTS</span><span className="section-heading-right">BUILT IN-HOUSE · RELEASED WHEN READY</span></div>
            <div className="products-intro">
              <div><p className="micro-label">INDEPENDENT BY DESIGN</p><h2>Our own apps.<br /><span>Our next frontier.</span></h2></div>
              <p className="section-copy">AppverseSI develops and publishes its own software. We’re working toward a portfolio of useful applications, with a longer-term ambition to create more connected, super-app experiences.</p>
            </div>
            <div className="product-shelf">
              <div className="product-orbit" aria-hidden="true">
                <div className="product-orbit__ring product-orbit__ring--outer" />
                <div className="product-orbit__ring product-orbit__ring--middle" />
                <div className="product-orbit__ring product-orbit__ring--inner" />
                <div className="product-orbit__core"><span>AV</span></div>
                <span className="product-orbit__label product-orbit__label--top">PRODUCT SYSTEM / 001</span>
                <span className="product-orbit__label product-orbit__label--bottom">INDEPENDENTLY BUILT</span>
                <i className="product-orbit__satellite" />
              </div>
              <div className="product-shelf-copy">
                <p className="product-kicker"><span className="eyebrow-dot" /> PRODUCT PIPELINE / 001</p>
                <h3>Built with intent.<br />Announced when ready.</h3>
                <p>Our own apps are central to the AppverseSI vision, not just a portfolio of client work. We’re building toward that portfolio now; individual products will appear here when there’s something real and ready to share.</p>
                <div className="product-status">
                  <span className="status-pill"><i /> IN DEVELOPMENT</span>
                  <span className="product-status-note">NO PUBLIC RELEASES ANNOUNCED</span>
                </div>
                <a className="product-build-link" href="#contact">Build with AppverseSI <Arrow diagonal /></a>
              </div>
            </div>
            <div className="products-footnote"><span>01 / USEFUL INDEPENDENT APPS</span><span>02 / CONNECTED DIGITAL EXPERIENCES</span><span>03 / LONG-TERM SUPER-APP AMBITION</span></div>
          </div>
        </section>

        <section className="studio section-pad" id="studio" data-reveal data-theme-color="#08100f" data-scene-accent="#9ff3d2">
          <div className="container">
            <div className="section-heading"><span><i>04</i> / THE STUDIO</span><span className="section-heading-right">CRAFT, ENGINEERING & COLLABORATION</span></div>
            <div className="studio-layout"><div className="studio-copy"><p className="micro-label">FOR PEOPLE BUILDING WHAT’S NEXT</p><h2>Big ambition.<br /><span>Grounded execution.</span></h2><p className="section-copy">While our own apps take shape, we work with businesses to plan, design, and engineer digital products — from focused websites and applications to larger platforms. The starting point is the problem, the people using the product, and a scope we can execute with care.</p><a className="button button-outline" href="#contact">Discuss a project <Arrow diagonal /></a></div>
              <div className="studio-services"><article><span>01</span><div><h3>Websites with a point of view</h3><p>Distinctive digital experiences that make a brand feel unmistakably itself.</p></div><b>↗</b></article><article><span>02</span><div><h3>Custom web applications</h3><p>Useful, fast interfaces built around real workflows and real people.</p></div><b>↗</b></article><article><span>03</span><div><h3>Software engineering</h3><p>Careful implementation, strong foundations, and room to evolve.</p></div><b>↗</b></article><div className="studio-note"><i /> OPEN TO A SMALL NUMBER OF WELL-SUITED PROJECTS</div></div>
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact" data-reveal data-theme-color="#080d17" data-scene-accent="#a8b6ff">
          <div className="container">
            <div className="section-heading"><span><i>05</i> / OPEN CHANNEL</span><span className="section-heading-right">START WITH A CONVERSATION</span></div>
            <div className="contact-layout"><div className="contact-copy"><p className="micro-label">ALL GREAT THINGS BEGIN SOMEWHERE</p><h2>What should<br />exist <span>next?</span></h2><p className="section-copy">Have an idea for an app, platform, or digital workflow? Tell us what you’re trying to achieve. We review each genuine inquiry and respond when there’s a good fit.</p><div className="contact-signal"><span className="signal-orb"><i /></span><div><b>CHANNEL OPEN</b><p>Ideas, collaborations, and considered challenges.</p></div></div></div>
              <form className="contact-form" onSubmit={submitInquiry}>
                <div className="form-heading"><span>INQUIRY / 001</span><span>FIELDS MARKED * ARE REQUIRED</span></div>
                <div className="form-grid"><label>Your name <i>*</i><input name="name" autoComplete="name" placeholder="How should we address you?" required maxLength={100} /></label><label>Email address <i>*</i><input name="email" autoComplete="email" type="email" placeholder="you@company.com" required maxLength={254} /></label><label>Company <small>OPTIONAL</small><input name="company" autoComplete="organization" placeholder="Your organization" maxLength={120} /></label><label>Project type<select name="projectType" defaultValue=""><option value="" disabled>Choose a direction</option><option>Website / digital presence</option><option>Custom web application</option><option>Software engineering</option><option>Product collaboration</option><option>Product planning / discovery</option><option>App or platform development</option><option>Long-term product / super-app concept</option><option>Something else</option></select></label></div>
                <label className="message-label">Tell us what you have in mind <i>*</i><textarea name="message" placeholder="The idea, the problem, the thing you wish existed…" required minLength={12} maxLength={4000} rows={4} /></label>
                <div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="form-submit-row"><p>Your information is used only to respond to your inquiry.</p><button className="button button-solid" type="submit" disabled={formState.kind === "sending"}>{formState.kind === "sending" ? "Transmitting…" : "Send the signal"} <Arrow /></button></div>
                <p className={"form-feedback form-feedback--" + formState.kind} aria-live="polite" role={formState.kind === "error" ? "alert" : "status"}>{formState.message || ""}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" data-theme-color="#05080b" data-scene-accent="#b7f6dc"><div className="container footer-main"><div className="footer-brand"><Brand /><p>A new universe of software.<br />A long view of intelligence.</p></div><div className="footer-links"><a href="#vision">Vision</a><a href="#frontier">The frontier</a><a href="#products">Our apps</a><a href="#studio">Studio</a><a href="#contact">Contact <Arrow diagonal /></a></div><a className="back-top" href="#top" aria-label="Back to top">↑</a></div><div className="container footer-legal"><span>© {new Date().getFullYear()} APPVERSE.SI</span><span>INDEPENDENT BY NATURE · FUTURE-FOCUSED BY DESIGN</span><a href="#top">BACK TO ORBIT ↑</a></div></footer>
    </div>
  );
}
