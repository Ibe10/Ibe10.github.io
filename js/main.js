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

// --- Contact form (opens the visitor's email client) ---
const form = document.querySelector(".contact-form-box form");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("fname").value.trim();
    const email = document.getElementById("femail").value.trim();
    const subject = document.getElementById("fsubject").value.trim() || "Message from Portfolio";
    const message = document.getElementById("fmessage").value.trim();
    const body = `Hello Ibrahim,%0D%0A%0D%0A${encodeURIComponent(message)}%0D%0A%0D%0A— ${encodeURIComponent(name)} (${encodeURIComponent(email)})`;
    window.location.href = `mailto:ibrahimalfath49@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    const btn = form.querySelector(".form-submit");
    const orig = btn.textContent;
    btn.textContent = "✅ Opening your email app...";
    btn.style.background = "#34c759";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; form.reset(); }, 3500);
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
