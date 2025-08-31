document.addEventListener("click", async (e) => {
  const a = e.target.closest('a.cta[data-step], a.btn-outline[data-step]');
  if (!a) return;

  const step = a.getAttribute('data-step');
  const isSkip = a.hasAttribute('data-skip');
  const href = a.getAttribute('href') || '/onboard';

  try {
    if (step) {
      // Mark complete only if not skipping; if skipping you could still record a flag
      if (!isSkip) {
        const res = await fetch(`/api/onboard/complete/${encodeURIComponent(step)}`, { method: 'POST', headers: { accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (data?.next && href.startsWith('/onboard/')) {
          e.preventDefault();
          window.location.href = `/onboard/${data.next}`;
          return;
        }
      }
    }
  } catch (_) { /* ignore */ }
});
