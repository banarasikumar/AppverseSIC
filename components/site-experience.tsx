"use client";

import { useEffect, useState, type FormEvent } from "react";
import UniverseCanvas from "@/components/universe-canvas";

type FormState = { kind: "idle" | "sending" | "success" | "error"; message?: string };

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className={diagonal ? "arrow arrow-diagonal" : "arrow"}>{diagonal ? "↗" : "→"}</span>;
}

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <a className={"brand" + (footer ? " brand-footer" : "")} href="#top" aria-label="AppverseSI home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="19.5" stroke="currentColor" strokeOpacity=".35" />
          <ellipse cx="24" cy="24" rx="10" ry="19" transform="rotate(42 24 24)" stroke="currentColor" strokeWidth="1.15" />
          <ellipse cx="24" cy="24" rx="10" ry="19" transform="rotate(-42 24 24)" stroke="#9FAEFF" strokeOpacity=".8" />
          <ellipse cx="24" cy="24" rx="19" ry="7.4" transform="rotate(-25 24 24)" stroke="#A8F1D2" strokeOpacity=".8" />
          <circle cx="24" cy="24" r="6.4" fill="#11192A" stroke="#E5E9FF" strokeOpacity=".85" />
          <circle cx="24" cy="24" r="2.1" fill="#C6D0FF" />
          <circle cx="39" cy="12" r="1.5" fill="#A8F1D2" />
        </svg>
      </span>
      <span className="brand-type">APPVERSE<span>.</span>SI</span>
    </a>
  );
}

const navigation = [
  { href: "#products", label: "Products" },
  { href: "#vision", label: "Our thinking" },
  { href: "#frontier", label: "The frontier" },
  { href: "#studio", label: "Studio" }
];

export default function SiteExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scenePaused, setScenePaused] = useState(false);
  const [formState, setFormState] = useState<FormState>({ kind: "idle" });

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-color]"));
    const updateTheme = () => {
      const activeLine = window.innerHeight * 0.38;
      let active = sections[0];
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activeLine) active = section;
      });
      if (!active) return;
      document.documentElement.style.backgroundColor = active.dataset.themeColor || "#05070c";
      document.documentElement.style.setProperty("--scene-accent", active.dataset.sceneAccent || "#A8F1D2");
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", active.dataset.themeColor || "#05070c");
    };

    let themeFrame = 0;
    const onScroll = () => {
      if (themeFrame) return;
      themeFrame = window.requestAnimationFrame(() => {
        themeFrame = 0;
        updateTheme();
      });
    };

    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let revealObserver: IntersectionObserver | null = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -36px 0px" });
      revealNodes.forEach((node) => revealObserver?.observe(node));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateTheme();
    return () => {
      revealObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
        setFormState({ kind: "error", message: "We couldn’t receive your enquiry right now. Please try again later." });
        return;
      }
      form.reset();
      setFormState({ kind: "success", message: "Enquiry received and saved. We’ll review your project and respond if it’s a fit." });
    } catch {
      setFormState({ kind: "error", message: "We couldn’t connect just now. Please try again." });
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell" id="top">
      <div className="world-backdrop" aria-hidden="true"><UniverseCanvas paused={scenePaused} /></div>
      <div className="world-grain" aria-hidden="true" />

      <header className="topbar">
        <div className="container topbar-inner">
          <Brand />
          <nav className={menuOpen ? "main-nav main-nav-open" : "main-nav"} aria-label="Main navigation">
            {navigation.map((item) => <a href={item.href} key={item.href} onClick={closeMenu}>{item.label}</a>)}
            <a className="nav-cta" href="#contact" onClick={closeMenu}>Start a project <Arrow diagonal /></a>
          </nav>
          <button
            className={"menu-toggle" + (menuOpen ? " menu-toggle-open" : "")}
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home" data-theme-color="#05070C" data-scene-accent="#A8F1D2" aria-labelledby="hero-title">
          <div className="hero-light" aria-hidden="true" />
          <div className="hero-layout container">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-pulse" /> APPVERSE SUPERINTELLIGENCE <span className="eyebrow-slash">/</span> BUILDING WHAT COMES NEXT</p>
              <h1 id="hero-title">Tomorrow,<br />made <span>real.</span></h1>
              <p className="hero-lede">Apps for today. <span>A bigger vision for tomorrow.</span></p>
              <p className="hero-body">We create useful digital products now, while exploring how technology can work better together.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#products">Explore our apps <Arrow /></a>
                <a className="hero-secondary-link" href="#contact"><span>FOR BUSINESSES</span><strong>Request a project <Arrow diagonal /></strong></a>
              </div>
              <div className="hero-proofline"><span className="proofline-spark">✳</span><span>INDEPENDENT BY DESIGN</span><i /><span>BUILT WITH INTENT</span></div>
            </div>

            <aside className="hero-hud" aria-label="Scene information">
              <div className="hud-topline"><span className="hud-live-dot" /> LIVE WORLD <span>FIELD 01 / 05</span></div>
              <div className="hud-orbit" aria-hidden="true"><span /><i /><b /></div>
              <div className="hud-bottomline"><span>GRAVITATIONAL FIELD</span><strong>01.000 <i>α</i></strong></div>
            </aside>

            <div className="hero-bottom">
              <div className="scene-status"><span className="scene-status-dot" /> REAL-TIME 3D <span className="status-divider">/</span> SCROLL TO TRAVEL</div>
              <button className="scene-toggle" type="button" onClick={() => setScenePaused(!scenePaused)} aria-pressed={scenePaused}>
                <span aria-hidden="true">{scenePaused ? "▶" : "Ⅱ"}</span>{scenePaused ? "Resume scene" : "Pause scene"}
              </button>
              <a className="scroll-cue" href="#products"><span>SCROLL TO EXPLORE</span><span className="scroll-cue-line" /><span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-edge-label" aria-hidden="true">A NEW UNIVERSE OF SOFTWARE <span>✳</span></div>
        </section>

        <section className="products section-space" id="products" data-reveal data-theme-color="#080C15" data-scene-accent="#AEBBFF">
          <div className="container">
            <div className="section-topline"><span><i>01</i> / OUR PRODUCTS</span><span>BUILT IN-HOUSE · RELEASED WHEN READY</span></div>
            <div className="section-intro products-intro">
              <div><p className="micro-label">INDEPENDENT BY DESIGN</p><h2>Useful by design.<br /><span>Ready for what’s next.</span></h2></div>
              <p className="section-copy">A growing portfolio of independent apps is our focus. Over time, we want our products to work together more naturally — creating more connected digital experiences.</p>
            </div>
            <div className="product-feature">
              <div className="product-art">
                <div className="product-art-grid" aria-hidden="true" />
                <div className="product-orbit product-orbit-one" aria-hidden="true" />
                <div className="product-orbit product-orbit-two" aria-hidden="true" />
                <div className="product-core" aria-hidden="true"><span /><i /></div>
                <div className="product-coordinate coordinate-top">P / 001<br /><span>PRODUCT SYSTEM</span></div>
                <div className="product-coordinate coordinate-bottom">STATUS <strong>IN FORMATION</strong></div>
                <div className="product-art-caption">APPVERSE / IN-HOUSE<br /><span>DESIGNED TO BECOME USEFUL</span></div>
              </div>
              <div className="product-description">
                <div className="product-pill"><span className="eyebrow-pulse" /> PRODUCT PIPELINE <span>001</span></div>
                <h3>Made with purpose.<br /><em>Announced when ready.</em></h3>
                <p>We don’t present concepts as finished products. This is where we’ll introduce each app when it’s ready for people to use.</p>
                <div className="product-rule" />
                <div className="product-status-row"><span>01 / IN-HOUSE PRODUCTS</span><span><i /> IN DEVELOPMENT</span></div>
                <a className="text-link" href="#contact">Have a project in mind? <Arrow diagonal /></a>
              </div>
            </div>
            <div className="product-footnotes"><span>01 <i>INDEPENDENT APPS</i></span><span>02 <i>CONNECTED EXPERIENCES</i></span><span>03 <i>LONG-TERM SUPER-APP VISION</i></span></div>
          </div>
        </section>

        <section className="vision section-space" id="vision" data-reveal data-theme-color="#07110F" data-scene-accent="#9FF3D2">
          <div className="container">
            <div className="section-topline"><span><i>02</i> / OUR POINT OF VIEW</span><span>THINK BEYOND THE INTERFACE</span></div>
            <div className="vision-heading">
              <p className="micro-label">THINK IN UNIVERSES.</p>
              <div><h2>Don’t add to the noise.<br /><span>Change the signal.</span></h2><p className="section-copy">The most interesting questions are rarely the small ones. We explore how software can become more capable, intuitive, and human — while staying grounded in things that are genuinely useful.</p></div>
            </div>
            <div className="principle-grid">
              <article className="principle-card"><div className="principle-meta"><span>01 / CURIOSITY</span><span>↗</span></div><div className="principle-icon principle-icon-orbit" aria-hidden="true"><i /><b /></div><h3>Ask the bigger question.</h3><p>Look beyond what exists. Imagine what should exist, then work backward with discipline.</p></article>
              <article className="principle-card"><div className="principle-meta"><span>02 / ENGINEERING</span><span>↗</span></div><div className="principle-icon principle-icon-mesh" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><h3>Make ideas tangible.</h3><p>Ideas matter when they become useful, reliable, beautifully considered things.</p></article>
              <article className="principle-card"><div className="principle-meta"><span>03 / INTELLIGENCE</span><span>↗</span></div><div className="principle-icon principle-icon-signal" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div><h3>Build toward the horizon.</h3><p>Every generation of software should make room for the next to become more capable.</p></article>
            </div>
          </div>
        </section>

        <section className="frontier section-space" id="frontier" data-reveal data-theme-color="#07101A" data-scene-accent="#AEBBFF">
          <div className="container">
            <div className="section-topline"><span><i>03</i> / THE FRONTIER</span><span>THE NEXT CHAPTER IS FORMING</span></div>
            <div className="section-intro frontier-intro"><div><p className="micro-label">IN FORMATION</p><h2>A new universe<br />is taking <span>shape.</span></h2></div><p className="section-copy">A new generation of software should feel less like operating a machine and more like extending what a person can do. That is the direction we’re working toward.</p></div>
            <div className="frontier-panel">
              <div className="panel-header"><span><i className="eyebrow-pulse" /> FIELDS OF EXPLORATION</span><span>INTELLIGENCE IN FORMATION</span><span>STATE: EVOLVING</span></div>
              <div className="frontier-content">
                <div className="frontier-visual">
                  <div className="frontier-visual-grid" aria-hidden="true" />
                  <div className="frontier-rings" aria-hidden="true"><i /><i /><i /><b /></div>
                  <span className="frontier-coordinate">FIELD / 02<br />SYSTEMS EMERGING</span>
                  <span className="frontier-caption">NOTHING HERE IS STATIC <i>✳</i></span>
                </div>
                <div className="frontier-list">
                  <div className="frontier-list-head"><span>AREAS OF EXPLORATION</span><span>STATUS</span></div>
                  <article><span className="frontier-index">A / 01</span><div><h3>Intelligent applications</h3><p>Tools to think, create, and solve in new ways.</p></div><span className="frontier-state">IN DEVELOPMENT</span></article>
                  <article><span className="frontier-index">A / 02</span><div><h3>Human-centred systems</h3><p>Useful interfaces that make complexity feel effortless.</p></div><span className="frontier-state">IN DEVELOPMENT</span></article>
                  <article><span className="frontier-index">A / 03</span><div><h3>New software paradigms</h3><p>Exploring what becomes possible as intelligence evolves.</p></div><span className="frontier-state">IN DEVELOPMENT</span></article>
                </div>
              </div>
              <div className="panel-footer"><span>THE WORK COMES BEFORE THE ANNOUNCEMENT.</span><span>WE’RE JUST GETTING STARTED <b>↗</b></span></div>
            </div>
          </div>
        </section>

        <section className="studio section-space" id="studio" data-reveal data-theme-color="#08100F" data-scene-accent="#9FF3D2">
          <div className="container">
            <div className="section-topline"><span><i>04</i> / THE STUDIO</span><span>WEBSITES · APPS · CUSTOM SOFTWARE</span></div>
            <div className="studio-layout">
              <div className="studio-copy"><p className="micro-label">FOR BUSINESS PROJECTS</p><h2>Clear goals.<br /><span>Careful delivery.</span></h2><p className="section-copy">Businesses can work with us on websites, web applications, and custom software. We take on selected projects where the goal is clear and the scope is right for our team.</p><a className="button button-ghost" href="#contact">Discuss your project <Arrow diagonal /></a><div className="studio-note"><span className="eyebrow-pulse" /> SELECTED PROJECTS · THOUGHTFUL DELIVERY</div></div>
              <div className="service-list">
                <article><span>01</span><div><h3>Websites with a point of view</h3><p>Distinctive digital experiences that make a brand feel unmistakably itself.</p></div><b>↗</b></article>
                <article><span>02</span><div><h3>Custom web applications</h3><p>Useful, fast interfaces built around real workflows and real people.</p></div><b>↗</b></article>
                <article><span>03</span><div><h3>Software engineering</h3><p>Strong foundations, considered implementation, and room to evolve.</p></div><b>↗</b></article>
              </div>
            </div>
          </div>
        </section>

        <section className="contact section-space" id="contact" data-reveal data-theme-color="#080D17" data-scene-accent="#AEBBFF">
          <div className="container">
            <div className="section-topline"><span><i>05</i> / BUSINESS ENQUIRIES</span><span>START A CONVERSATION</span></div>
            <div className="contact-layout">
              <div className="contact-copy"><p className="micro-label">TELL US WHAT YOU’RE IMAGINING</p><h2>Let’s make<br /><span>it real.</span></h2><p className="section-copy">Share the idea, the problem you want to solve, and what success looks like. We’ll review your enquiry and respond when it’s a fit.</p><div className="contact-promise"><span className="promise-orb"><i /></span><div><strong>STRAIGHT TO THE POINT</strong><p>Clear scope. Thoughtful questions. No pressure.</p></div></div><div className="contact-coordinate">CONTACT / 001<br /><span>PROJECT BRIEF INTAKE</span></div></div>
              <form className="contact-form" onSubmit={submitInquiry}>
                <div className="form-heading"><span>PROJECT INTAKE</span><span><i /> ENCRYPTED IN TRANSIT</span></div>
                <div className="form-grid">
                  <label>Your name <i>*</i><input name="name" autoComplete="name" placeholder="Full name" required maxLength={100} /></label>
                  <label>Email address <i>*</i><input name="email" autoComplete="email" type="email" placeholder="you@company.com" required maxLength={254} /></label>
                  <label>Company <small>OPTIONAL</small><input name="company" autoComplete="organization" placeholder="Organization name" maxLength={120} /></label>
                  <label>Project type<select name="projectType" defaultValue=""><option value="" disabled>Choose a direction</option><option>Website / digital presence</option><option>Mobile app</option><option>Web application</option><option>Custom software</option><option>Product planning / discovery</option><option>App or platform concept</option><option>Something else</option></select></label>
                </div>
                <label className="message-label">Tell us what you have in mind <i>*</i><textarea name="message" placeholder="What are you trying to build? Who is it for? What should it make possible?" required minLength={12} maxLength={4000} rows={5} /></label>
                <div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="form-submit-row"><p>We use these details only to review and respond to your enquiry.</p><button className="button button-primary" type="submit" disabled={formState.kind === "sending"}>{formState.kind === "sending" ? "Saving…" : "Send enquiry"} <Arrow /></button></div>
                <p className={"form-feedback form-feedback-" + formState.kind} aria-live="polite" role={formState.kind === "error" ? "alert" : "status"}>{formState.message || ""}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" data-theme-color="#05070C" data-scene-accent="#A8F1D2">
        <div className="container footer-main"><div className="footer-brand"><Brand footer /><p>Useful software for today.<br />A bigger vision for tomorrow.</p></div><div className="footer-links">{navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}<a href="#contact">Business enquiries <Arrow diagonal /></a></div><a className="back-top" href="#top" aria-label="Back to top">↑</a></div>
        <div className="container footer-legal"><span>© {new Date().getFullYear()} APPVERSE.SI</span><span>INDEPENDENT BY NATURE · FUTURE-FOCUSED BY DESIGN</span><a href="#top">BACK TO ORBIT ↑</a></div>
      </footer>
    </div>
  );
}
