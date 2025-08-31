document.addEventListener("submit", async (e) => {
  const form = e.target.closest("#signin");
  if (!form) return;
  e.preventDefault();
  const err = document.getElementById("err");
  if (err) err.style.display = "none";

  const data = new FormData(form);
  try {
    const res = await fetch("/api/auth/signin", { method: "POST", body: data });
    const json = await res.json();
    if (!res.ok || json?.ok === false) throw new Error(json?.message || "Sign-in failed");
    window.location.href = json.redirect || "/onboard";
  } catch (ex) {
    if (err) { err.textContent = ex.message || "Something went wrong"; err.style.display = "block"; }
  }
});
