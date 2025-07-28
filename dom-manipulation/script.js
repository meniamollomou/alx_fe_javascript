let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const categoryFilter = document.getElementById("categoryFilter");

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show banner
function showNotification(message) {
  const box = document.getElementById("notification");
  box.textContent = message;
  box.style.display = "block";
  setTimeout(() => box.style.display = "none", 3000);
}

// Display random quote
function showRandomQuote() {
  const category = categoryFilter.value;
  let filtered = quotes;
  if (category !== "all") {
    filtered = quotes.filter(q => q.category === category);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available. Please add one!";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${random.text}" — <em>${random.category}</em>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

// Add quote
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

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// Build form
function createAddQuoteForm() {
  const formSection = document.getElementById("formContainer");

  const heading = document.createElement("h2");
  heading.textContent = "Add Your Own Quote";

  const inputQuote = document.createElement("input");
  inputQuote.id = "newQuoteText";
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formSection.appendChild(heading);
  formSection.appendChild(inputQuote);
  formSection.appendChild(inputCategory);
  formSection.appendChild(addButton);
}

// Export
function exportQuotesToJson() {
  if (quotes.length === 0) {
    alert("No quotes to export.");
    return;
  }

  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        showNotification("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Populate category dropdown
function populateCategories() {
  const categories = new Set(quotes.map(q => q.category));
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastSelected = localStorage.getItem("lastFilter");
  if (lastSelected) {
    categoryFilter.value = lastSelected;
  }
}

// Filter quotes
function filterQuotes() {
  localStorage.setItem("lastFilter", categoryFilter.value);
  showRandomQuote();
}

// Server fetch (mock)
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: server data overrides
    quotes = [...serverQuotes, ...quotes];
    saveQuotes();
    populateCategories();

    // ✅ Required string
    showNotification("Quotes synced with server!");
  } catch (err) {
    console.error("Sync failed", err);
    showNotification("Failed to sync quotes with server.");
  }
}

// Sync periodically
function syncQuotes() {
  fetchQuotesFromServer(); // Initial sync
  setInterval(fetchQuotesFromServer, 30000); // Every 30s
}

// Init
window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  syncQuotes();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  categoryFilter.addEventListener("change", filterQuotes);

  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.innerHTML = `"${q.text}" — <em>${q.category}</em>`;
  }
});
