let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const categoryFilter = document.getElementById("categoryFilter");
const notification = document.getElementById("notification");

// Load from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show random quote
function showRandomQuote() {
  let filtered = quotes;
  const selected = localStorage.getItem("selectedCategory") || "all";
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];
  quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill in all fields.");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added!");
}

// Build quote form dynamically
function createAddQuoteForm() {
  const form = document.getElementById("formContainer");

  const title = document.createElement("h2");
  title.textContent = "Add Your Own Quote";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.id = "newQuoteCategory";
  inputCat.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.onclick = addQuote;

  form.appendChild(title);
  form.appendChild(inputText);
  form.appendChild(inputCat);
  form.appendChild(button);
}

// Populate category dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved) categoryFilter.value = saved;
}

// Filter quotes by category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// Export to JSON
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported!");
      } else {
        alert("Invalid file.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Show notification
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Sync with mock server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await res.json();
    return data.map(item => ({
      text: item.title,
      category: "Server"
    }));
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

// Sync and handle conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  quotes = serverQuotes; // Server wins
  saveQuotes();
  populateCategories();
  showNotification("Quotes synced with server!");
}

// Periodic sync every 30 seconds
setInterval(syncQuotes, 30000);

// INIT
window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  newQuoteBtn.onclick = showRandomQuote;
  exportBtn.onclick = exportQuotesToJson;

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
  }

  syncQuotes();
  categoryFilter.onchange = filterQuotes;
});
