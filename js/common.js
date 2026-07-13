"use strict";

(() => {
  const pages = ["home", "about", "rhythms", "goals"];
  const storageKey = "myQuestVisitedPagesV2";
  const body = document.body;
  const currentPage = body.dataset.page || "home";
  const menuButton = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    if (link.dataset.navPage === currentPage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  function setMenu(open) {
    if (!menuButton || !mainNav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    menuButton.querySelector("span").textContent = open ? "×" : "☰";
    mainNav.classList.toggle("hidden", !open);
    document.body.style.overflow = open && window.innerWidth < 1024 ? "hidden" : "";
  }

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
    mainNav.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
    document.addEventListener("click", (event) => {
      if (mainNav.classList.contains("hidden")) return;
      if (mainNav.contains(event.target) || menuButton.contains(event.target)) return;
      if (window.innerWidth < 1024) setMenu(false);
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuButton.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        document.body.style.overflow = "";
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.querySelector("span").textContent = "☰";
        mainNav.classList.add("hidden");
      }
    });
  }

  document.querySelectorAll("img[data-fallback-target]").forEach((image) => {
    image.addEventListener("error", () => {
      const target = document.getElementById(image.dataset.fallbackTarget);
      if (target) target.classList.add("is-fallback");
    });
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  function readVisitedPages() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((page) => pages.includes(page)) : [];
    } catch (error) {
      console.warn("방문 기록을 불러오지 못했습니다.", error);
      return [];
    }
  }

  function updateTourProgress() {
    const visited = readVisitedPages();
    if (!visited.includes(currentPage)) visited.push(currentPage);
    try { localStorage.setItem(storageKey, JSON.stringify(visited)); }
    catch (error) { console.warn("방문 기록을 저장하지 못했습니다.", error); }

    const count = pages.filter((page) => visited.includes(page)).length;
    const percent = Math.round((count / pages.length) * 100);
    document.querySelectorAll("[data-tour-progress-bar]").forEach((bar) => { bar.style.width = `${percent}%`; });
    document.querySelectorAll("[data-tour-progress-text]").forEach((text) => { text.textContent = `${count}/${pages.length}`; });
    document.querySelectorAll("[data-progress-page]").forEach((card) => {
      const isVisited = visited.includes(card.dataset.progressPage);
      card.dataset.visited = String(isVisited);
      const state = card.querySelector("[data-visit-state]");
      if (state) state.textContent = isVisited ? "VISITED ✓" : "NOT VISITED";
    });
    document.querySelectorAll("[data-tour-badge]").forEach((badge) => {
      const complete = count === pages.length;
      badge.dataset.complete = String(complete);
      badge.textContent = complete
        ? "FIRST TOUR COMPLETE · 모든 페이지 탐색 완료 ✓"
        : `SITE QUEST · ${count}/${pages.length} PAGE COMPLETE`;
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  updateTourProgress();
})();
