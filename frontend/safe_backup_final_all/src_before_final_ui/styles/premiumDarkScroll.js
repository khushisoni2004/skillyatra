function applyScrollClass() {
  if (window.scrollY > 12) {
    document.body.classList.add("sy-scrolled");
  } else {
    document.body.classList.remove("sy-scrolled");
  }
}

applyScrollClass();
window.addEventListener("scroll", applyScrollClass, { passive: true });
