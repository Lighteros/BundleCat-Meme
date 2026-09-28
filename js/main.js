(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mast = document.getElementById("mast");
  const nav = document.getElementById("nav");
  const menu = document.getElementById("menu");
  const progress = document.getElementById("progress");
  const portrait = document.getElementById("portrait");
  const canvas = document.getElementById("mist");

  const onScroll = () => {
    const y = window.scrollY;
    mast.classList.toggle("is-stuck", y > 12);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    const mark = y + 120;
    let current = "";
    document.querySelectorAll("main section[id]").forEach((section) => {
      if (section.offsetTop <= mark) current = section.id;
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.classList.toggle("is-on", link.getAttribute("href") === `#${current}`);
    });
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const contract = "0x8e175582a9cae219ffd84a991fd9b8c94ea562bd";
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const label = "Copy";
      try {
        await navigator.clipboard.writeText(contract);
        button.textContent = "Copied";
        button.classList.add("is-done");
        window.setTimeout(() => {
          button.textContent = label;
          button.classList.remove("is-done");
        }, 1600);
      } catch {
        button.textContent = "Failed";
        window.setTimeout(() => {
          button.textContent = label;
        }, 1600);
      }
    });
  });

  menu.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open menu");
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  if (!reduce && portrait && window.matchMedia("(pointer: fine)").matches) {
    const stage = document.getElementById("stage");
    stage.addEventListener("mousemove", (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    stage.addEventListener("mouseleave", () => {
      portrait.style.transform = "none";
    });
  }

  if (!canvas || reduce) return;
  const ctx = canvas.getContext("2d");
  const motes = Array.from({ length: 48 }, () => spawn(true));

  function spawn(anywhere) {
    return {
      x: Math.random(),
      y: anywhere ? Math.random() : 1.05,
      r: 8 + Math.random() * 28,
      s: 0.00008 + Math.random() * 0.00022,
      a: 0.04 + Math.random() * 0.08,
      rose: Math.random() > 0.82,
    };
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    motes.forEach((mote) => {
      mote.y -= mote.s * 60;
      mote.x += Math.sin(mote.y * 12) * 0.0004;
      if (mote.y < -0.08) Object.assign(mote, spawn(false));
      const g = ctx.createRadialGradient(
        mote.x * canvas.width,
        mote.y * canvas.height,
        0,
        mote.x * canvas.width,
        mote.y * canvas.height,
        mote.r
      );
      const color = mote.rose ? "231,183,196" : "214,226,220";
      g.addColorStop(0, `rgba(${color},${mote.a})`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(mote.x * canvas.width, mote.y * canvas.height, mote.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
})();
