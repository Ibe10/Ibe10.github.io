// ======================== ANIMATIONS (dengan fallback jika CDN gagal) ========================
const hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

if (hasGsap) {
  gsap.registerPlugin(ScrollTrigger);

  // --- Hero entrance ---
  const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTL
    .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.3)
    .to(".hero-name",    { opacity: 1, y: 0, duration: 1.0 }, 0.55)
    .to(".hero-role",    { opacity: 1, y: 0, duration: 1.0 }, 0.75)
    .to(".hero-actions", { opacity: 1, y: 0, duration: 0.8 }, 0.95)
    .to(".hero-avatar",  { opacity: 1, scale: 1, duration: 1.2 }, 1.1);

  gsap.set([".hero-eyebrow",".hero-name",".hero-role",".hero-actions"], { y: 60 });
  gsap.set(".hero-avatar", { scale: 0.9 });

  // --- Stats counter ---
  const counters = document.querySelectorAll(".stat-number[data-target]");
  counters.forEach(el => {
    const suffix = el.dataset.suffix || "";
    const target = +el.dataset.target;
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to({ val: 0 }, {
        val: target, duration: 2, ease: "power2.out",
        onUpdate: function() { el.textContent = Math.round(this.targets()[0].val) + suffix; }
      })
    });
  });

  // --- Skill bars ---
  ScrollTrigger.create({
    trigger: "#skills", start: "top 70%", once: true,
    onEnter: () => {
      document.querySelectorAll(".skill-fill").forEach(bar => {
        bar.style.width = bar.dataset.pct + "%";
      });
    }
  });
} else {
  // Fallback: tampilkan semua konten tanpa animasi
  document.querySelectorAll(".hero-eyebrow,.hero-name,.hero-role,.hero-actions,.hero-avatar")
    .forEach(el => { el.style.opacity = "1"; });
  document.querySelectorAll(".skill-fill").forEach(bar => { bar.style.width = bar.dataset.pct + "%"; });
}

// --- Reveal on scroll ---
const reveals = document.querySelectorAll(".reveal, .reveal-scale");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add("visible"), i * 40);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
reveals.forEach(el => revealObserver.observe(el));

// --- Navbar ---
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.style.background = window.scrollY > 60
    ? "rgba(22,22,23,0.96)" : "rgba(22,22,23,0.82)";
  // active nav links
  const sections = document.querySelectorAll("section[id]");
  let active = "";
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 200) active = sec.id;
  });
  document.querySelectorAll(".nav-links a").forEach(a => {
    a.style.color = a.getAttribute("href") === "#" + active ? "#fff" : "";
  });
}, { passive: true });

// --- Mobile menu ---
const mobileBtn = document.querySelector(".nav-mobile-btn");
const navLinks = document.querySelector(".nav-links");
mobileBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// --- Contact: copy email ---
document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "Copied ✓";
    } catch {
      btn.textContent = "Copy failed";
    }
    setTimeout(() => { btn.textContent = "Copy"; }, 2000);
  });
});

// --- Contact form: Web3Forms, with WhatsApp as fallback ---
const WHATSAPP_NUMBER = "6282199005570";
const CONTACT_EMAIL = "ibrahimalfath49@gmail.com";
const form = document.querySelector(".contact-form-box form");

if (form) {
  const status = form.querySelector(".form-status");
  const submitBtn = form.querySelector(".form-submit");
  const field = name => form.elements[name].value.trim();

  const setStatus = (html, kind) => {
    status.innerHTML = html;
    status.className = "form-status" + (kind ? " " + kind : "");
  };

  const openWhatsApp = () => {
    const name = field("name"), email = field("email");
    const subject = field("subject"), message = field("message");
    if (!name || !message) {
      setStatus("Please fill in your name and message first.", "err");
      return false;
    }
    const intro = email ? `Hello Ibrahim, I'm ${name} (${email}).` : `Hello Ibrahim, I'm ${name}.`;
    const text = [intro, "", subject, message].filter((line, i) => line || i === 1).join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setStatus("Opening WhatsApp with your message…", "ok");
    return true;
  };

  form.querySelector(".form-wa").addEventListener("click", openWhatsApp);

  form.addEventListener("submit", async e => {
    e.preventDefault();

    // Without a Web3Forms key the form still works — through WhatsApp.
    if (!field("access_key")) { openWhatsApp(); return; }

    if (!form.checkValidity()) {
      setStatus("Please fill in your name, a valid email, and your message.", "err");
      return;
    }

    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("", "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Send failed");
      form.reset();
      setStatus("✅ Message sent — I'll reply within 1–2 days.", "ok");
    } catch {
      // Keep what the visitor typed; offer the other channels.
      setStatus(
        `Sorry, the message couldn't be sent. Try <a href="#" data-wa>WhatsApp</a> or email ` +
        `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`,
        "err"
      );
      status.querySelector("[data-wa]").addEventListener("click", ev => { ev.preventDefault(); openWhatsApp(); });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

// --- Typed.js (dengan fallback teks statis) ---
if (typeof Typed !== "undefined") {
  new Typed("#typed-role", {
    strings: ["Full-Stack Developer", "Laravel Specialist", "UI/UX Enthusiast", "Problem Solver"],
    typeSpeed: 55, backSpeed: 35, backDelay: 2000, loop: true
  });
} else {
  const typedEl = document.getElementById("typed-role");
  if (typedEl) typedEl.textContent = "Full-Stack Developer";
}
