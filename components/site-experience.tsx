"use client";

import { useEffect, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import UniverseCanvas from "@/components/universe-canvas";

type FormState = { kind: "idle" | "sending" | "success" | "error"; message?: string };

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className={diagonal ? "arrow arrow--diagonal" : "arrow"}>{diagonal ? "↗" : "→"}</span>;
}

function Brand({ footer = false }: { footer?: boolean }) {
  const markId = footer ? "appverse-mark-footer" : "appverse-mark-header";
  return (
    <a className="brand" href="#top" aria-label="AppverseSI home">
      <span className="brand-symbol" aria-hidden="true">
        <svg className="brand-symbol-art" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id={`${markId}-rim`} x1="6" y1="7" x2="42" y2="41" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F3F6FF" />
              <stop offset=".42" stopColor="#9EADFF" />
              <stop offset=".76" stopColor="#B7F7E4" />
              <stop offset="1" stopColor="#7586DE" />
            </linearGradient>
            <radialGradient id={`${markId}-core`} cx="0" cy="0" r="1" gradientTransform="translate(19 16) rotate(58) scale(25)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B7C8FF" />
              <stop offset=".32" stopColor="#39466F" />
              <stop offset=".7" stopColor="#101421" />
              <stop offset="1" stopColor="#03040A" />
            </radialGradient>
            <radialGradient id={`${markId}-light`} cx="0" cy="0" r="1" gradientTransform="translate(33 12) rotate(126) scale(26)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C3D2FF" stopOpacity=".9" />
              <stop offset="1" stopColor="#8D9DFF" stopOpacity="0" />
            </radialGradient>
            <filter id={`${markId}-glow`} x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>
          <circle cx="24" cy="24" r="19.1" stroke={`url(#${markId}-rim)`} strokeOpacity=".42" strokeWidth=".7" />
          <path d="M7.1 28.2C5.4 18.8 12.7 8.2 22.6 6.1C32.4 4 41.6 12.1 42 21.5" stroke={`url(#${markId}-rim)`} strokeWidth="1.55" strokeLinecap="round" />
          <path d="M40.7 25.2C39.9 34.2 31.6 41.7 22.2 41.2C16.7 40.9 11.8 38 8.8 33.5" stroke={`url(#${markId}-rim)`} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8.6 15.3C15.9 10.6 29.2 14.6 36.2 23.5C40.3 28.8 40.7 34.5 37.6 37.7" stroke="#B4C4FF" strokeOpacity=".63" strokeWidth=".8" />
          <path d="M11.1 35.6C11.6 26.5 22.1 15.8 31.5 12.2C36.4 10.3 40 12 40.6 15.6" stroke="#9DF2DD" strokeOpacity=".62" strokeWidth=".85" />
          <ellipse cx="24" cy="24" rx="9.1" ry="12.2" transform="rotate(39 24 24)" fill={`url(#${markId}-core)`} stroke={`url(#${markId}-rim)`} strokeWidth=".85" />
          <ellipse cx="24" cy="24" rx="6.1" ry="8.4" transform="rotate(39 24 24)" fill={`url(#${markId}-light)`} opacity=".55" />
          <circle cx="24" cy="24" r="4.15" fill="#03040A" stroke="#D7E2FF" strokeOpacity=".8" strokeWidth=".65" />
          <circle cx="24" cy="24" r="5.1" stroke="#A9B8FF" strokeOpacity=".6" strokeWidth=".5" filter={`url(#${markId}-glow)`} />
          <circle cx="39.1" cy="10.2" r="1.35" fill="#C5D2FF" />
          <circle cx="8.1" cy="32.5" r=".95" fill="#B7F7E4" />
        </svg>
      </span>
      <span className="brand-word">APPVERSE<span>.</span>SI</span>
    </a>
  );
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
    let revealObserver: IntersectionObserver | null = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      nodes.forEach((node) => revealObserver?.observe(node));
    }
    return () => {
      revealObserver?.disconnect();
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
      setFormState({ kind: "success", message: "Enquiry sent. We’ll review your project and respond if it’s a fit." });
    } catch {
      setFormState({ kind: "error", message: "We couldn't connect just now. Please try again." });
    }
  }

  const closeMenu = () => setMenuOpen(false);

  function followPointer(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 100}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 100}%`);
  }

  function resetPointer(event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--pointer-x");
    event.currentTarget.style.removeProperty("--pointer-y");
  }

  function moveMagnetic(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / Math.max(1, bounds.width / 2);
    const y = (event.clientY - bounds.top - bounds.height / 2) / Math.max(1, bounds.height / 2);
    event.currentTarget.style.setProperty("--mag-x", `${(x * 5).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--mag-y", `${(y * 4).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--mag-light-x", `${((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 100}%`);
    event.currentTarget.style.setProperty("--mag-light-y", `${((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 100}%`);
  }

  function resetMagnetic(event: ReactPointerEvent<HTMLAnchorElement>) {
    event.currentTarget.style.setProperty("--mag-x", "0px");
    event.currentTarget.style.setProperty("--mag-y", "0px");
  }

  return (
    <div className="site-shell" id="top">
      <div className="world-backdrop" aria-hidden="true"><UniverseCanvas paused={scenePaused} /></div>
      <header className="topbar">
        <div className="container topbar-inner">
          <Brand />
          <nav className={menuOpen ? "main-nav main-nav--open" : "main-nav"} aria-label="Main navigation">
            <a href="#products" onClick={closeMenu}>Our apps</a>
            <a href="#frontier" onClick={closeMenu}>The frontier</a>
            <a href="#vision" onClick={closeMenu}>Our thinking</a>
            <a href="#studio" onClick={closeMenu}>Studio</a>
            <a className="nav-contact" href="#contact" onClick={closeMenu}>Request a project <Arrow diagonal /></a>
          </nav>
          <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}><span /><span /></button>
        </div>
      </header>

      <main>
        <section className="hero" id="home" data-theme-color="#05080b" data-scene-accent="#b7f6dc" aria-labelledby="hero-title" onPointerMove={followPointer} onPointerLeave={resetPointer}>
          <div className="hero-atmosphere" aria-hidden="true" />
          <div className="hero-gridlines" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> APPVERSE SUPERINTELLIGENCE <i>/</i> BUILDING WHAT COMES NEXT</p>
              <h1 id="hero-title">Tomorrow,<br />made <em>real.</em></h1>
              <p className="hero-lede">Apps for today. A bigger vision for tomorrow.</p>
              <p className="hero-body">We’re creating useful products now, while exploring how digital experiences can work better together.</p>
              <div className="hero-actions">
                <a className="button button-solid button-magnetic" href="#products" onPointerMove={moveMagnetic} onPointerLeave={resetMagnetic}>Explore our apps <Arrow /></a>
                <a className="hero-business-link" href="#contact"><span className="hero-business-kicker">FOR BUSINESSES</span><span>Request a project <Arrow diagonal /></span></a>
              </div>
            </div>
            <div className="scene-controls">
              <span>REAL-TIME 3D · SCROLL TO TRAVEL</span>
              <button className="scene-toggle" type="button" onClick={() => setScenePaused(!scenePaused)} aria-pressed={scenePaused} aria-label={scenePaused ? "Resume 3D scene animation" : "Pause 3D scene animation"}><span aria-hidden="true">{scenePaused ? "▶" : "Ⅱ"}</span>{scenePaused ? "Resume scene" : "Pause scene"}</button>
            </div>
          </div>
          <div className="container hero-footer-line"><span><i>✳</i> OUR PRODUCTS. OUR LONG-TERM VISION.</span><a href="#products">DISCOVER WHAT WE’RE BUILDING <b>↓</b></a></div>
        </section>

        <section className="products section-pad" id="products" data-reveal data-theme-color="#080d14" data-scene-accent="#a8b6ff">
          <div className="container">
            <div className="section-heading"><span><i>01</i> / OUR PRODUCTS</span><span className="section-heading-right">BUILT IN-HOUSE · RELEASED WHEN READY</span></div>
            <div className="products-intro">
              <div><p className="micro-label">INDEPENDENT BY DESIGN</p><h2>Useful by design.<br /><span>Built for what’s next.</span></h2></div>
              <p className="section-copy">A growing portfolio of useful apps is the focus now. Over time, we want our products to work together more naturally, opening the door to richer digital experiences.</p>
            </div>
            <div className="product-shelf" onPointerMove={followPointer} onPointerLeave={resetPointer}>
              <div className="product-stage-copy">
                <span className="product-stage-index">APPVERSESI / IN-HOUSE</span>
                <p>Made here.<br /><em>Released with purpose.</em></p>
                <span className="product-stage-caption">BUILT WITH INTENT · RELEASED WHEN READY</span>
              </div>
              <div className="product-shelf-copy">
                <p className="product-kicker"><span className="eyebrow-dot" /> PRODUCT PIPELINE / 001</p>
                <h3>Built with intent.<br />Announced when ready.</h3>
                <p>This is where we’ll introduce each app as it becomes ready for people to use.</p>
                <div className="product-status">
                  <span className="status-pill"><i /> IN DEVELOPMENT</span>
                  <span className="product-status-note">REVEALED WHEN READY</span>
                </div>
                <a className="product-build-link" href="#contact">Business project enquiries <Arrow diagonal /></a>
              </div>
            </div>
            <div className="products-footnote"><span>01 / USEFUL INDEPENDENT APPS</span><span>02 / CONNECTED DIGITAL EXPERIENCES</span><span>03 / LONG-TERM SUPER-APP AMBITION</span></div>
          </div>
        </section>

        <section className="vision section-pad" id="vision" data-reveal data-theme-color="#07110f" data-scene-accent="#9ff3d2">
          <div className="container">
            <div className="section-heading"><span><i>02</i> / THE POINT OF VIEW</span><span className="section-heading-right">A DIFFERENT SCALE OF THINKING</span></div>
            <div className="vision-main">
              <p className="micro-label">THINK IN UNIVERSES.</p>
              <div><h2>Don’t just add<br />to the noise. <span>Change the signal.</span></h2><p className="section-copy">The most interesting questions are rarely the small ones. We are exploring how software can become more capable, more intuitive, and more human — while staying grounded in things that are genuinely useful.</p><p className="section-copy">The aim is not spectacle alone. It is to make the extraordinary useful, and to build with enough care that the technology gets out of the way.</p></div>
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
            <div className="section-heading"><span><i>03</i> / THE FRONTIER</span><span className="section-heading-right">THE NEXT CHAPTER IS FORMING</span></div>
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

        <section className="studio section-pad" id="studio" data-reveal data-theme-color="#08100f" data-scene-accent="#9ff3d2">
          <div className="container">
            <div className="section-heading"><span><i>04</i> / THE STUDIO</span><span className="section-heading-right">WEBSITES, APPS & CUSTOM SOFTWARE</span></div>
            <div className="studio-layout"><div className="studio-copy"><p className="micro-label">FOR BUSINESS PROJECTS</p><h2>Clear goals.<br /><span>Careful delivery.</span></h2><p className="section-copy">Businesses can request websites, web applications, and custom software from us. We take on selected projects where the goal is clear and the scope is right for our team.</p><a className="button button-outline" href="#contact">Request a project <Arrow diagonal /></a></div>
              <div className="studio-services"><article><span>01</span><div><h3>Websites with a point of view</h3><p>Distinctive digital experiences that make a brand feel unmistakably itself.</p></div><b>↗</b></article><article><span>02</span><div><h3>Custom web applications</h3><p>Useful, fast interfaces built around real workflows and real people.</p></div><b>↗</b></article><article><span>03</span><div><h3>Software engineering</h3><p>Careful implementation, strong foundations, and room to evolve.</p></div><b>↗</b></article><div className="studio-note"><i /> OPEN TO A SMALL NUMBER OF WELL-SUITED PROJECTS</div></div>
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact" data-reveal data-theme-color="#080d17" data-scene-accent="#a8b6ff">
          <div className="container">
            <div className="section-heading"><span><i>05</i> / BUSINESS ENQUIRIES</span><span className="section-heading-right">REQUEST A PROJECT</span></div>
            <div className="contact-layout"><div className="contact-copy"><p className="micro-label">FOR WEBSITES, APPS & CUSTOM SOFTWARE</p><h2>What do you need<br /><span>built?</span></h2><p className="section-copy">Tell us what you need, what it should do, and who it is for. We review each project enquiry and respond when the work is a good fit.</p><div className="contact-signal"><span className="signal-orb"><i /></span><div><b>PROJECT ENQUIRIES</b><p>Websites, apps, and custom software.</p></div></div><a className="contact-direct-email" href="mailto:understandtheuniverse7@gmail.com?subject=AppverseSI%20project%20enquiry">Prefer email? understandtheuniverse7@gmail.com <Arrow diagonal /></a></div>
              <form className="contact-form" onSubmit={submitInquiry}>
                <div className="form-heading"><span>INQUIRY / 001</span><span>FIELDS MARKED * ARE REQUIRED</span></div>
                <div className="form-grid"><label>Your name <i>*</i><input name="name" autoComplete="name" placeholder="How should we address you?" required maxLength={100} /></label><label>Email address <i>*</i><input name="email" autoComplete="email" type="email" placeholder="you@company.com" required maxLength={254} /></label><label>Company <small>OPTIONAL</small><input name="company" autoComplete="organization" placeholder="Your organization" maxLength={120} /></label><label>Project type<select name="projectType" defaultValue=""><option value="" disabled>Choose a direction</option><option>Website / digital presence</option><option>Mobile app</option><option>Web application</option><option>Custom software</option><option>Product planning / discovery</option><option>App or platform concept</option><option>Something else</option></select></label></div>
                <label className="message-label">Tell us what you have in mind <i>*</i><textarea name="message" placeholder="Describe the app, website or software you need, what it should do, and any key requirements." required minLength={12} maxLength={4000} rows={4} /></label>
                <div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <div className="form-submit-row"><p>Your information is used only to respond to your inquiry.</p><button className="button button-solid" type="submit" disabled={formState.kind === "sending"}>{formState.kind === "sending" ? "Sending…" : "Send project enquiry"} <Arrow /></button></div>
                <p className={"form-feedback form-feedback--" + formState.kind} aria-live="polite" role={formState.kind === "error" ? "alert" : "status"}>
                  {formState.message || ""}
                  {formState.kind === "error" && <>{" "}Please email <a href="mailto:understandtheuniverse7@gmail.com?subject=AppverseSI%20project%20enquiry">understandtheuniverse7@gmail.com</a> directly instead.</>}
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer" data-theme-color="#05080b" data-scene-accent="#b7f6dc"><div className="container footer-main"><div className="footer-brand"><Brand footer /><p>A new universe of software.<br />A long view of intelligence.</p></div><div className="footer-links"><a href="#products">Our apps</a><a href="#frontier">The frontier</a><a href="#vision">Our thinking</a><a href="#studio">Studio</a><a href="#contact">Business enquiries <Arrow diagonal /></a></div><a className="back-top" href="#top" aria-label="Back to top">↑</a></div><div className="container footer-legal"><span>© {new Date().getFullYear()} APPVERSE.SI</span><span>INDEPENDENT BY NATURE · FUTURE-FOCUSED BY DESIGN</span><a href="#top">BACK TO ORBIT ↑</a></div></footer>
    </div>
  );
}
