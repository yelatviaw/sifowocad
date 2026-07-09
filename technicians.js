

// ==========================================
// TECHNICIAN DATABASE, IMAGES, & STATE ENGINE
// ==========================================

// Seed or load persistent technician names array
let technicianNames = JSON.parse(localStorage.getItem("technicianNames")) || [
  "Alice", "Atkinson", "Bella", "Camila", "Charlotte", "Christine", "Cook", "DA","Edwin","Gianna", 
  "Gir","Jack", "Jenson", "Jes","Kidd", "Lawson", "Libby", "Luna", "Lautaro","Marcelo", "Market","Mason", 
  "McKinley", "Nicholas", "Parker", "Rajish","Samantha", "Sofia","Teamwork",
];

// Mapped Image Paths (FIXED ALPHABETICAL ORDER)
const technicianImages = {
  Alice: "images/Dog-by-Oscar-Sutton.PNG",
  Atkinson: "images/sdst_favicon1.PNG",
  Bella: "images/bella.jpg",
  Camila: "images/image_2.jpg",
  Charlotte: "images/charlotte.jpg",
  Christine: "images/christine.jpg",
  Cook: "images/cook.jpg",
  DA: "images/da.jpg",
  Edwin: "images/edwin.jpg",
  Gianna: "images/lion-unsplash .jpg",
  Gir: "images/gir.jpg",
  Jack: "images/jack.jpg",
  Jenson: "images/jenson.jpg",
  Jes: "images/jes.jpg",
  Kidd: "images/kidd.jpg",
  Lautaro: "images/lautaro.jpg", // Moved up
  Lawson: "images/lawson.jpg",
  Libby: "images/libby.jpg",
  Luna: "images/luna.jpg",       // Moved down
  Marcelo: "images/marcelo.jpg",
  Market: "images/market.jpg",
  Mason: "images/mason.jpg",
  McKinley: "images/mckinley.jpg",
  Nicholas: "images/nicholas.jpg",
  Parker: "images/parker.jpg",
  Rajish: "images/rajish.jpg",
  Samantha: "images/samantha.jpg",
  Sofia: "images/sofia.jpg",
  Teamwork: "images/teamwork.jpg",
};

// Default fallback image if a new technician is added and doesn't have an image mapped yet
const fallbackImage = "images/default-avatar.png";

// Maintain a sorted array for form insertion datalists
technicianNames.sort((a, b) => a.localeCompare(b));

/**
 * Extracts raw technician string tags assigned to a specific dynamic UI row element
 */
function getTechList(row) {
  return [...row.querySelectorAll(".tech-tag")]
    .map(t => t.dataset.name)
    .filter(Boolean);
}

/**
 * Re-renders the dynamic HTML datalist used for input autocomplete.
 */
function refreshTechnicianList() {
  let dl = document.getElementById("techList");
  if (!dl) {
    dl = document.createElement("datalist");
    dl.id = "techList";
    document.body.appendChild(dl);
  }
  dl.innerHTML = "";
  
  technicianNames.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    
    // Store image URL in dataset attribute since standard <option> does not render inner HTML elements
    const imageUrl = technicianImages[name] || fallbackImage;
    option.setAttribute("data-img", imageUrl);
    
    dl.appendChild(option);
  });
  
  localStorage.setItem("technicianNames", JSON.stringify(technicianNames));
}

/**
 * Interactively appends a unique technician name to the active database array
 */
function addTechnician() {
  const name = prompt("Enter technician name to add:")?.trim();
  if (!name || technicianNames.includes(name)) return alert("Invalid or duplicate name");
  technicianNames.push(name);
  technicianNames.sort((a, b) => a.localeCompare(b)); 
  refreshTechnicianList();
  if (typeof update === "function") update();
}

/**
 * Interactively purges an existing technician name from the active database array
 */
function removeTechnician() {
  const name = prompt("Enter technician name to remove:")?.trim();
  const index = technicianNames.indexOf(name);
  if (index === -1) return alert("Technician not found");
  if (confirm(`Remove ${name}?`)) {
    technicianNames.splice(index, 1);
    refreshTechnicianList();
    if (typeof update === "function") update();
  }
}
