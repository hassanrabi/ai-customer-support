// ============================================================================
// LUNAWEAR — script.js
// Handles: mobile navigation toggle + the "Ask LunaWear AI" support form,
// which submits to an n8n webhook and swaps between form / success / error
// states based on the response.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. MOBILE NAVIGATION TOGGLE
// ---------------------------------------------------------------------------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

navToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Close the mobile menu automatically once a nav link is tapped
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ---------------------------------------------------------------------------
// 2. AI CUSTOMER SUPPORT FORM
// ---------------------------------------------------------------------------

// Replace this with your real n8n production webhook URL when this page
// goes live. Example shape: https://your-instance.app.n8n.cloud/webhook/lunawear-support
const WEBHOOK_URL = "https://YOUR-N8N-DOMAIN/webhook/lunawear-support";

const supportForm = document.getElementById("supportForm");
const submitBtn = document.getElementById("submitBtn");
const btnLabel = submitBtn.querySelector(".btn-label");
const formError = document.getElementById("formError");
const successState = document.getElementById("successState");
const resetFormBtn = document.getElementById("resetFormBtn");

supportForm.addEventListener("submit", async (event) => {
  // Stop the browser from doing a full page reload on submit
  event.preventDefault();

  // Hide any previous error message before trying again
  formError.hidden = true;

  // Collect the three field values from the form
  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim(),
  };

  // Show a loading state on the button so the user knows something is happening
  setLoading(true);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // n8n webhooks return a non-2xx status if the workflow itself fails,
    // so we treat anything outside 200-299 as an error too.
    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }

    // Success: hide the form, show the confirmation card
    showSuccess();
  } catch (error) {
    // Network failure, CORS issue, or non-2xx response all land here
    console.error("LunaWear AI support submission failed:", error);
    formError.hidden = false;
  } finally {
    setLoading(false);
  }
});

// Lets the visitor send a follow-up message without refreshing the page
resetFormBtn.addEventListener("click", () => {
  supportForm.reset();
  successState.hidden = true;
  supportForm.hidden = false;
});

/**
 * Toggles the submit button between its normal and loading appearance.
 * @param {boolean} isLoading
 */
function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  btnLabel.textContent = isLoading ? "Sending" : "Send Message";
  btnLabel.classList.toggle("is-loading", isLoading);
}

/** Swaps the form out for the success confirmation card. */
function showSuccess() {
  supportForm.hidden = true;
  successState.hidden = false;
}
