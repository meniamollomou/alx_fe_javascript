let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFileInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

// Load from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote (with filter if selected)
function showRandomQuote() {
  let filtered = quotes;

  const selectedCategory = categoryFilter.value;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
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

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  syncQuotesToServer(); // POST to mock server

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
}

// Create form dynamically
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

// Export quotes as JSON
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

// Import from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
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

// Populate category dropdown
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from localStorage
  const lastSelected = localStorage.getItem("lastCategory");
  if (lastSelected) {
    categoryFilter.value = lastSelected;
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategory", selected);
  showRandomQuote();
}

// Simulate POST to mock server
function syncQuotesToServer() {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quotes),
  })
  .then(response => response.json())
  .then(data => {
    console.log("Quotes synced to server (mock):", data);
  })
  .catch(error => {
    console.error("Error syncing to server:", error);
  });
}

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);

  // Show last viewed quote
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const lastQuote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${lastQuote.text}" — <em>${lastQuote.category}</em>`;
  }
});
