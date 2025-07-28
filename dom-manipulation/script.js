let quotes = [];
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const categoryFilter = document.getElementById("categoryFilter");

// ✅ Notification
const notification = document.createElement("div");
notification.style.background = "#ffeb3b";
notification.style.padding = "10px";
notification.style.margin = "10px auto";
notification.style.display = "none";
notification.style.maxWidth = "500px";
notification.style.borderRadius = "5px";
notification.style.fontWeight = "bold";
document.body.insertBefore(notification, quoteDisplay);

function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 4000);
}

// ✅ Load and Save
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) quotes = JSON.parse(stored);
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ✅ Display
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

// ✅ Add Quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  showNotification("Quote added.");
  textInput.value = "";
  categoryInput.value = "";
  syncQuotes(); // trigger sync
}

// ✅ Create Form
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

// ✅ Populate Categories
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

function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value);
  showRandomQuote();
}

// ✅ Export
function exportQuotesToJson() {
  if (quotes.length === 0) {
    alert("No quotes to export.");
    return;
  }

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

// ✅ Import
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        showNotification("Quotes imported.");
      } else {
        alert("Invalid JSON.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ Fetch from server (mock)
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    // Use only first 5
    return data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server",
    }));
  } catch (error) {
    console.error("Error fetching server quotes:", error);
    return [];
  }
}

// ✅ Post local quotes to server
async function postQuotesToServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quotes),
    });
    await res.json();
  } catch (err) {
    console.error("Failed to post quotes:", err);
  }
}

// ✅ Sync (combine everything)
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  let hasConflict = false;
  const localTexts = quotes.map(q => q.text);
  const newFromServer = serverQuotes.filter(q => !localTexts.includes(q.text));

  if (newFromServer.length > 0) {
    quotes.push(...newFromServer);
    hasConflict = true;
  }

  saveQuotes();
  populateCategories();

  if (hasConflict) {
    showNotification("Quotes synced from server. Conflicts resolved.");
  }

  await postQuotesToServer();
}

// ✅ On Load
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

  syncQuotes(); // initial sync
  setInterval(syncQuotes, 30000); // periodic sync every 30s
});
