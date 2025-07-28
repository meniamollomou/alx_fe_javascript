let quotes = [];
let lastSyncTime = Date.now();

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// Notification UI
const notification = document.createElement("div");
notification.style.background = "#ffd700";
notification.style.padding = "10px";
notification.style.margin = "10px auto";
notification.style.display = "none";
notification.style.maxWidth = "500px";
notification.style.borderRadius = "5px";
document.body.insertBefore(notification, quoteDisplay);

function showNotification(msg) {
  notification.textContent = msg;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 5000);
}

// Load from localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) quotes = JSON.parse(stored);
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quote
function showRandomQuote() {
  let filtered = quotes;
  const selected = categoryFilter.value;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }

  const index = Math.floor(Math.random() * filtered.length);
  const quote = filtered[index];
  quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNotification("Quote added and synced to server.");
  syncQuotes(); // Sync after add

  textInput.value = "";
  categoryInput.value = "";
}

// Build add form
function createAddQuoteForm() {
  const form = document.getElementById("formContainer");

  const title = document.createElement("h2");
  title.textContent = "Add Your Own Quote";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  form.append(title, textInput, categoryInput, addBtn);
}

// Populate category filter
function populateCategories() {
  const unique = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  unique.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const last = localStorage.getItem("lastCategory");
  if (last) categoryFilter.value = last;
}

// Handle filter
function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value);
  showRandomQuote();
}

// Export
function exportQuotesToJson() {
  if (quotes.length === 0) return alert("No quotes to export.");
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        showNotification("Quotes imported successfully.");
      } else {
        alert("Invalid JSON file.");
      }
    } catch {
      alert("Failed to read file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// 🔁 SYNC LOGIC 🔁

// Fetch from mock server
function fetchQuotesFromServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(res => res.json())
    .then(serverQuotes => {
      // Simulate using only the first 5 and mapping to our format
      return serverQuotes.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server",
      }));
    });
}

// Push local quotes to server
function postQuotesToServer() {
  return fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quotes),
  }).then(res => res.json());
}

// Main sync function
function syncQuotes() {
  fetchQuotesFromServer().then(serverQuotes => {
    let hasConflict = false;

    // Conflict detection: if local quote text doesn't match server ones
    const localTexts = new Set(quotes.map(q => q.text));
    const newServerQuotes = serverQuotes.filter(q => !localTexts.has(q.text));

    if (newServerQuotes.length > 0) {
      quotes.push(...newServerQuotes);
      hasConflict = true;
    }

    saveQuotes();
    populateCategories();

    if (hasConflict) {
      showNotification("New quotes received from server. Conflicts resolved.");
    }

    postQuotesToServer(); // Always send back to mock server
  });
}

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
  }

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  categoryFilter.addEventListener("change", filterQuotes);

  // Periodic syncing every 30s
  syncQuotes();
  setInterval(syncQuotes, 30000);
});
