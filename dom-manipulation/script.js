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
  populateCategories();
}

// Show random quote (based on filter)
function showRandomQuote() {
  let filtered = getFilteredQuotes();

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
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

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Create Add Quote Form
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

// Populate category dropdown
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes based on dropdown
function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category === selectedCategory);
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote();
}

// Export quotes to JSON
function exportQuotesToJson() {
  if (quotes.length === 0) {
    alert("No quotes to export.");
    return;
  }

  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (e) {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

////////////////////////////////////////////////////////
// ============ SIMULATED SERVER SYNC BELOW ==========
////////////////////////////////////////////////////////

// Simulated fetch from server
async function fetchQuotesFromServer() {
  try {
    // Fake API for simulating fetch
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    // Transform server data to quote format
    const serverQuotes = data.map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Conflict resolution: Replace local quotes with server ones
    const localQuoteCount = quotes.length;
    quotes = [...serverQuotes];
    saveQuotes();

    if (localQuoteCount !== serverQuotes.length) {
      notifyUser("Quotes synced from server (conflicts resolved).");
    }
  } catch (error) {
    console.error("Error syncing from server:", error);
  }
}

// Notify user of conflict or sync
function notifyUser(message) {
  const note = document.createElement("p");
  note.style.color = "green";
  note.textContent = message;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 4000);
}

////////////////////////////////////////////////////////
// ================= INITIALIZATION ===================
////////////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  // Load last viewed quote
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const lastQuote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${lastQuote.text}" — <em>${lastQuote.category}</em>`;
  }

  // Event listeners
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  categoryFilter.addEventListener("change", filterQuotes);

  // Simulate periodic server sync every 30 seconds
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000); // 30 seconds
});
