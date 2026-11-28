
// ============================================================================
// CORE APPLICATION UX, SYNCING, & UI ENGINES
// ============================================================================

/**
 * Debounces a function execution to prevent layout thrashing during heavy typing.
 */
function debounce(func, delay = 250) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Global debounced save wrapper for inline oninput handlers
const debouncedSaveAndUpdate = debounce(() => {
  saveAllData();
  update();
}, 250);
window.debouncedSaveAndUpdate = debouncedSaveAndUpdate;

/**
 * Safely extracts raw technician names array from UI text components to handle processing constraints.
 */
function safeGetTechList(rowElement) {
  const names = [];
  rowElement.querySelectorAll(".tech-tag").forEach(tag => {
    let rawName = tag.dataset.name || tag.textContent.replace(" ×", "").trim();
    if (rawName) names.push(rawName);
  });
  return names;
}

/**
 * Enforces or lifts system-wide UI limitations based on the admin mode toggle.
 */
function applyLockdownState() {
  const isLocked = !adminMode.value;
  const toggleBtn = document.getElementById("admin-toggle");
  
  if (toggleBtn) {
    toggleBtn.innerText = "Admin Mode: " + (adminMode.value ? "ON" : "OFF");
    toggleBtn.style.background = adminMode.value ? "#4caf50" : "#e53935";
  }

  const targets = document.querySelectorAll(
    "#headerTable input, #headerTable select, #container input, #container select, #container textarea, #container button"
  );

  targets.forEach(element => {
    if (element.id === "admin-toggle" || element.id === "pdf-btn" || element.id === "summary-btn") return;
    if (element.classList.contains("tech-tag")) return;
    element.disabled = isLocked;
  });
}

/**
 * Appends a new Lineup structural module into the primary layout dashboard view container.
 */
function addSectionBox(type, lineupInfoNumber = "", isDynamic = false, existingId = null) {
  const container = document.getElementById("container");
  if (!container) return;

  const boxId = existingId || (type + "_" + Date.now());
  const box = document.createElement("div");
  box.className = "box";
  box.id = boxId;
  box.dataset.type = type;
  box.dataset.section = lineupNames[type] || type;
  box.dataset.dynamic = isDynamic;

  const deleteBtnStyle = isDynamic ? "" : 'style="display: none;"';
  const isFC = (type === "floor_credit");

  let techOptionsHtml = `<option value="">—</option>`;
  if (typeof technicianNames !== 'undefined' && Array.isArray(technicianNames)) {
    technicianNames.forEach(name => {
      techOptionsHtml += `<option value="${name}">${name}</option>`;
    });
  }

  const sections = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"];
  const connectionTypes = [
    { label: "IC Section Connect", code: "ic-section" },
    { label: "IC Lineup Connect", code: "ic-lineup" },
    { label: "Splice plates & torque", code: "splice plates & torque" },
    { label: "Section barrier", code: "barrier" },
    { label: "Bolting", code: "bolting" },
    { label: "pullApart connect", code: "pullaparts" },
    { label: "Ethernet connect", code: "ethernet" }
  ];

  let matrixRowsHtml = "";
  connectionTypes.forEach(conn => {
    matrixRowsHtml += `<tr>
      <td style="text-align: left; font-weight: bold; padding: 6px; border: 1px solid #ddd;">${conn.label}</td>`;
    sections.forEach(sec => {
      matrixRowsHtml += `
      <td style="border: 1px solid #ddd; padding: 4px; position: relative;">
        <select class="matrix-tech-select" data-code="${conn.code}" data-section="${sec}" style="width: 100%; padding: 2px; font-size: 11px; border: 1px solid #ccc; border-radius: 4px;" 
          onchange="
            const tsInput = this.parentElement.querySelector('.matrix-timestamp');
            if(tsInput) { tsInput.value = this.value ? new Date().toLocaleString() : ''; }
            saveAllData(); update();
          ">
          ${techOptionsHtml}
        </select>
        <input type="hidden" class="matrix-timestamp" data-code="${conn.code}" data-section="${sec}" value="">
      </td>`;
    });
    matrixRowsHtml += `</tr>`;
  });

  let additionalInfoTableHtml = "";
  if (!isFC) {
    additionalInfoTableHtml = `
      <div class="horizontal-codes-container" style="margin-top: 15px; margin-bottom: 15px; overflow-x: auto;">
        <h4 style="margin: 5px 0; font-size: 13px;"> Lineup Additional Connect Info</h4>
        <table class="horizontal-codes-table" style="width:100%; border-collapse: collapse; text-align: center; font-size: 12px;">
          <thead>
            <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ccc;">
              <th style="text-align: left; padding: 6px; border: 1px solid #ddd;">Task</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S1</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S2</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S3</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S4</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S5</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S6</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S7</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S8</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S9</th>
              <th style="padding: 6px; border: 1px solid #ddd;">S10</th>
            </tr>
          </thead>
          <tbody>
            ${matrixRowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  box.innerHTML = `
    <div style="display:flex; gap:10px; margin-bottom:5px;">
      <input type="checkbox" class="include-section" onchange="saveAllData(); update();">
      <label style="font-weight:bold;">Include this Lineup in reports</label>
    </div>
    <div class="ready-banner" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px;">
      <span style="font-weight: bold; font-size: 14px;">READY FOR TEST</span>
      <div class="test-meta-info" style="font-size: 12px; font-weight: normal; text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;"></div>
    </div>
    <h3 style="display:flex; justify-content:space-between; align-items:center;">
      ${lineupNames[type] || type}
      <button class="add-btn add-section-btn" data-type="${type}">+ Add ${lineupNames[type] || type}</button>
      <button class="add-btn" style="background:#2196F3;" onclick="resetSection('${boxId}', '${type}')">Reset Lineup</button>
      <button class="delete-btn" ${deleteBtnStyle} onclick="deleteSection('${boxId}')">Delete Lineup</button>
    </h3>
    <div id="${boxId}Circle" class="gauge"><span>0%</span></div>
    <div id="${boxId}Avg" class="avg">AVG: 0%</div>
    
    <div class="meta-row">
      <div class="meta-box"><label>LineupInfo</label><input type="text" class="lineupInfo-input" value="${lineupInfoNumber}" placeholder="LineupInfo" oninput="debouncedSaveAndUpdate();"></div>
      <div class="meta-box"><label>SO</label><input type="text" class="so-input" placeholder="SO" oninput="debouncedSaveAndUpdate();"></div>
      <div class="meta-box">
        <label>Shift</label>
        <select class="shift-input" onchange="saveAllData(); update();">
          <option value="">Select</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="meta-box">
        <label>TB</label>
        <select class="tb-input" onchange="saveAllData(); update();">
          <option value="">Select</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
          <option value="40">40</option>
          <option value="50">50</option>
          <option value="60">60</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>

    <table id="${boxId}Table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Section#</th>
          <th>Progress %</th>
          <th>Technician</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    ${additionalInfoTableHtml}

    <div class="meta-row"><div class="meta-box" style="width:100%;"><label>Comments</label><textarea class="section-comment" rows="3" 
    style="width:100%;resize:vertical;" placeholder="Enter comments..." oninput="debouncedSaveAndUpdate();"></textarea></div></div>
    <button class="add-btn" onclick="addRow('${boxId}')">+ Add Task</button>
  `;
  container.appendChild(box);

  if (!existingId) {
    lineupTasks[type]?.forEach(task => addRow(boxId, task));
  }
}

/**
 * Appends a new data row into a target dashboard subtable.
 */
function addRow(type, task = "New Task", prog = "", tech = [], timestamp = "") {
  const table = document.querySelector(`#${type}Table tbody`);
  if (!table) return;
  const tr = document.createElement("tr");

  let sectionOptionsHtml = `<option value="" disabled selected hidden>Select</option>`;
  for (let i = 1; i <= 10; i++) {
    sectionOptionsHtml += `<option value="${i}">${i}</option>`;
  }
  sectionOptionsHtml += `<option value="1&2">1&2</option>`;
   sectionOptionsHtml += `<option value="1&2,3&4">1&2,3&4</option>`;
  sectionOptionsHtml += `<option value="1&3,2&3">1&3,2&3</option>`;
  sectionOptionsHtml += `<option value="2&1">2&1</option>`;
  sectionOptionsHtml += `<option value="2&3">2&3</option>`;
  sectionOptionsHtml += `<option value="3&2">3&2</option>`;
  sectionOptionsHtml += `<option value="3&4">3&4</option>`;
  sectionOptionsHtml += `<option value="5&6">5&6</option>`;
  sectionOptionsHtml += `<option value="7&8">7&8</option>`;
  sectionOptionsHtml += `<option value="8&9">8&9</option>`;
  sectionOptionsHtml += `<option value="9&10">9&10</option>`;
  sectionOptionsHtml += `<option value="TB10&20">TB10&20</option>`;
  sectionOptionsHtml += `<option value="TB30&40">TB30&40</option>`;
  sectionOptionsHtml += `<option value="TB50&60">TB50&60</option>`;
  sectionOptionsHtml += `<option value="multiple">Multiple</option>`;
  sectionOptionsHtml += `<option value="-">-</option>`;
  
  let progOptionsHtml = ``;
  const progressSteps = [0, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, "N/A"];
  progressSteps.forEach(val => {
    const isSelected = String(prog) === String(val) ? "selected" : "";
    progOptionsHtml += `<option value="${val}" ${isSelected}>${val}${typeof val === 'number' ? '%' : ''}</option>`;
  });

  tr.innerHTML = `
    <td>
      <input class="task" value="${task}" oninput="debouncedSaveAndUpdate();">
      <input type="hidden" class="time-stamp" value="${timestamp}">
    </td>
    <td>
      <select class="row-section-select" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;" onchange="saveAllData(); update();">
        ${sectionOptionsHtml}
      </select>
    </td>
    <td>
      <select class="prog" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px;" onchange="saveAllData(); update();">
        ${progOptionsHtml}
      </select>
    </td>
    <td>
      <div class="tech-container" style="display:flex; flex-wrap:wrap; gap:2px; border:1px solid #ccc; padding:2px; border-radius:4px;">
        <input type="text" class="tech-input" list="techList" placeholder="Team" style="flex:1; border:none; outline:none; min-width:100px;">
        <div class="tech-tags" style="display:flex; flex-wrap:wrap; gap:2px;"></div>
      </div>
    </td>
    <td><button class="delete-btn">Delete</button></td>
  `;

  const taskInput = tr.querySelector(".task");
  const progSelect = tr.querySelector(".prog");
  const techInput = tr.querySelector(".tech-input");
  const tagsDiv = tr.querySelector(".tech-tags");
  const deleteBtn = tr.querySelector(".delete-btn");
  const timeInput = tr.querySelector(".time-stamp");

  function addTechTag(name) {
    name = name.trim();
    if (!name) return;
    if ([...tagsDiv.children].some(tag => tag.dataset.name === name)) { techInput.value = ""; return; }

    const tag = document.createElement("span");
    tag.className = "tech-tag";
    tag.dataset.name = name;
    tag.textContent = name + " ×";

    tag.onclick = () => {
      if (!adminMode.value) return;
      tag.remove(); update(); saveAllData();
    };
    tagsDiv.appendChild(tag);
    techInput.value = "";
  }

  if (typeof tech === "string") { tech = tech.split(",").map(t => t.trim()).filter(Boolean); }
  tech.forEach(addTechTag);

  function handleAddTech() {
    if (!adminMode.value) return;
    const value = techInput.value.trim();
    if (!value) return;
    if (!technicianNames.includes(value)) { alert("Technician not in list"); techInput.value = ""; return; }
    addTechTag(value); update(); saveAllData();
  }

  techInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); handleAddTech(); } });
  techInput.addEventListener("change", handleAddTech);
  techInput.addEventListener("blur", () => { if (techInput.value.trim()) handleAddTech(); });
  taskInput.addEventListener("input", update);
  
  progSelect.addEventListener("change", () => {
    if (progSelect.value.trim() !== "" && progSelect.value !== "N/A") {
      if (!timeInput.value) {
        timeInput.value = new Date().toLocaleString();
      }
    } else {
      timeInput.value = "";
    }
    update();
    saveAllData();
  });
  
  deleteBtn.addEventListener("click", () => { if (!adminMode.value) return; tr.remove(); update(); saveAllData(); });

  table.appendChild(tr);
}

/**
 * Recalculates metrics, handles visual gauges, dynamic assignments, and dashboard allocations.
 */
function update() {
  const techAssignmentCounts = {};
  if (typeof technicianNames !== 'undefined') {
    technicianNames.forEach(name => {
      techAssignmentCounts[name] = 0;
    });
  }

  // 1. DYNAMIC COMPILATION PASS: Tally allocations across all included layouts
  document.querySelectorAll("#container .box").forEach(box => {
    if (!box.querySelector(".include-section")?.checked) return;
    
    // Tally standard task table rows
    box.querySelectorAll("table[id$='Table'] tbody tr").forEach(row => {
      safeGetTechList(row).forEach(techName => {
        if (techName.toLowerCase() === "teamwork" || techName.toLowerCase() === "team work") return; 
        if (techAssignmentCounts.hasOwnProperty(techName)) {
          techAssignmentCounts[techName]++;
        }
      });
    });

    // Tally layout inter-section connection matrix select nodes
    box.querySelectorAll(".matrix-tech-select").forEach(select => {
      const val = select.value;
      if (val && (val.toLowerCase() === "teamwork" || val.toLowerCase() === "team work")) return; 
      if (val && techAssignmentCounts.hasOwnProperty(val)) {
        techAssignmentCounts[val]++;
      }
    });
  });

  const sortedTechArray = Object.keys(techAssignmentCounts).map(name => ({
    name: name,
    count: techAssignmentCounts[name]
  })).sort((a, b) => b.count - a.count);

  const topTech = sortedTechArray.length > 0 && sortedTechArray[0].count > 0 ? sortedTechArray[0] : null;

  // ==========================================================================
  // TOP 3 TECHNICIANS LEADERBOARD BAR INJECTION
  // ==========================================================================
  try {
    const headerTable = document.getElementById("headerTable");
    if (headerTable) {
      let topTechsBar = document.getElementById("top-three-techs-podium");
      if (!topTechsBar) {
        topTechsBar = document.createElement("div");
        topTechsBar.id = "top-three-techs-podium";
        topTechsBar.style.cssText = "display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; align-items: center; justify-content: flex-start;";
        headerTable.parentNode.insertBefore(topTechsBar, headerTable);
      }

      const topThreeList = sortedTechArray.filter(tech => tech.count > 0).slice(0, 3);

      if (topThreeList.length === 0) {
        topTechsBar.innerHTML = `<span style="font-size: 13px; color: #64748b; font-style: italic;">No active technician task assignments recorded for this period.</span>`;
      } else {
        let podiumHtml = `<div style="font-size: 13px; font-weight: bold; color: #1d4d7a; margin-right: 10px; display: flex; align-items: center; gap: 4px;">👑 Top 3 Technicians:</div>`;
        
        topThreeList.forEach((tech, index) => {
          let imgUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z'/></svg>";
          if (typeof technicianImages !== 'undefined' && technicianImages[tech.name]) {
            imgUrl = technicianImages[tech.name];
          } else if (typeof fallbackImage === 'string' && fallbackImage !== "") {
            imgUrl = fallbackImage;
          }

          const rankMedals = ["🥇", "🥈", "🥉"];
          const rankColor = index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : "#cd7f32";

          podiumHtml += `
            <div style="display: flex; align-items: center; gap: 8px; background: #fff; padding: 4px 12px; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
              <div style="position: relative; display: flex; align-items: center;">
                <img src="${imgUrl}" alt="${tech.name}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; background: #e2e8f0; border: 2px solid ${rankColor};">
                <span style="position: absolute; bottom: -4px; right: -4px; font-size: 10px; background: #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">${rankMedals[index]}</span>
              </div>
              <div style="display: flex; flex-direction: column; line-height: 1.2;">
                <span style="font-weight: bold; font-size: 12px; color: #334155;">${tech.name}</span>
                <span style="font-size: 10px; color: #64748b;">${tech.count} Tasks</span>
              </div>
            </div>
          `;
        });
        
        topTechsBar.innerHTML = podiumHtml;
      }
    }
  } catch (err) {
    console.error("Top 3 Dashboard Podium Widget Error:", err);
  }

  // 2. BOX PROCESSING & VISUALMETRIC GAUGES PASS
  document.querySelectorAll("#container .box").forEach(box => {
    const isFloorCredit = box.dataset.type === "floor_credit";
    const rows = box.querySelectorAll("table[id$='Table'] tbody tr");
    let total = 0, taskCount = 0;

    rows.forEach(row => {
      const taskInput = row.querySelector(".task");
      const progInput = row.querySelector(".prog");
      if (!taskInput || taskInput.value.trim() === "") return;

      const progValue = progInput.value.trim();
      
      if (progValue === "N/A") {
        progInput.classList.remove("invalid");
        return; 
      }

      if (progValue === "") {
        progInput.classList.remove("invalid");
        taskCount++;
      } else {
        const val = parseFloat(progValue);
        if (!isNaN(val) && val >= 0 && val <= 100) { 
          total += val; 
          taskCount++;
          progInput.classList.remove("invalid"); 
        } else { 
          progInput.classList.add("invalid"); 
        }
      }
    });

    const avgDiv = box.querySelector(".avg");
    const circle = box.querySelector(".gauge");
    const banner = box.querySelector(".ready-banner");
    const testMetaContainer = box.querySelector(".test-meta-info");
    const gaugeText = circle?.querySelector("span");

    if (isFloorCredit) {
      if (circle) { circle.style.background = "conic-gradient(#607d8b 0deg,#1D4D7A 0deg)"; circle.classList.remove("stop-spin"); }
      box.classList.remove("ready-for-test");
      if (banner) banner.style.display = "none";
      if (testMetaContainer) testMetaContainer.innerHTML = "";
      if (avgDiv) avgDiv.innerText = "AVG: N/A";
      if (gaugeText) gaugeText.innerText = "N/A";
      return;
    }

    if (taskCount === 0) {
      if (circle) { circle.style.background = "conic-gradient(#607d8b 0deg,#1D4D7A 0deg)"; circle.classList.remove("stop-spin"); }
      box.classList.remove("ready-for-test");
      if (banner) banner.style.display = "none";
      if (testMetaContainer) testMetaContainer.innerHTML = "";
      if (avgDiv) avgDiv.innerText = "AVG: 0%";
      if (gaugeText) gaugeText.innerText = "0%";
      return;
    }

    const avgNum = taskCount > 0 ? Math.round(total / taskCount) : 0;
    const color = avgNum <= 49 ? "#e53935" : avgNum <= 75 ? "#fbc02d" : avgNum <= 99 ? "#8bc34a" : "#1b5e20";
    if (circle) { circle.style.background = `conic-gradient(${color} ${avgNum * 3.6}deg,#1D4D7A 0deg)`; circle.style.setProperty("--spin-color", color); circle.classList.toggle("stop-spin", avgNum >= 100); }

    if (avgNum >= 100) {
      box.classList.add("ready-for-test"); 
      if (banner) banner.style.display = "flex";
      
      const headerData = getHeaderData();
      if (testMetaContainer) {
        let topTechHtml = "";
        if (topTech && typeof technicianImages !== 'undefined') {
          const imgUrl = technicianImages[topTech.name] || fallbackImage;
          topTechHtml = `
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 4px;">
              <span style="font-weight: bold; font-size: 11px;">👑 Top Tech:</span>
              <img src="${imgUrl}" alt="${topTech.name}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; background: #e0e4e8; border: 1px solid #ffd700;">
              <span style="font-weight: bold;">${topTech.name}</span>
            </div>
          `;
        }

        const currentReadyTimestamp = new Date().toLocaleString();

        testMetaContainer.innerHTML = `
          <div>Sup: <strong>${headerData.supervisor}</strong> | FM: <strong>${headerData.foreman}</strong></div>
          ${topTechHtml}
          <div style="font-size: 11px; margin-top: 4px; opacity: 0.9;">Validated: <strong>${currentReadyTimestamp}</strong></div>
        `;
      }

      if (avgDiv) avgDiv.innerText = "READY FOR TEST"; if (gaugeText) gaugeText.innerText = "✓";
    } else {
      box.classList.remove("ready-for-test"); 
      if (banner) banner.style.display = "none";
      if (testMetaContainer) testMetaContainer.innerHTML = "";
      if (avgDiv) avgDiv.innerText = `AVG: ${avgNum}%`; if (gaugeText) gaugeText.innerText = `${avgNum}%`;
    }
  });

  // 3. CORE LIST SYNCHRONIZATION PASS
  const highlyActiveContainer = document.getElementById("highly-active-tech-list");
  const activeContainer = document.getElementById("active-tech-list");
  const inactiveContainer = document.getElementById("inactive-tech-list");

  if (highlyActiveContainer && activeContainer && inactiveContainer && typeof technicianNames !== 'undefined') {
    highlyActiveContainer.innerHTML = "";
    activeContainer.innerHTML = "";
    inactiveContainer.innerHTML = "";

    technicianNames.forEach(name => {
      const count = techAssignmentCounts[name];
      const tag = document.createElement("span");
      tag.className = "tech-tag";
      
      if (count > 1) {
        tag.textContent = `${name} (${count})`;
        highlyActiveContainer.appendChild(tag);
      } else if (count === 1) {
        tag.textContent = name;
        activeContainer.appendChild(tag);
      } else {
        tag.textContent = name;
        inactiveContainer.appendChild(tag);
      }
    });
  }
  
  if (typeof generateSummary === "function") generateSummary();
}

/**
 * Extracts and bundles current top-level summary criteria.
 */
function getHeaderData() {
  return {
    date: document.getElementById("current-datetime")?.value || "",
    srSupervisor: document.getElementById("header-sr-supervisor")?.value || "-",
    supervisor: document.getElementById("header-supervisor")?.value || "-",
    foreman: document.getElementById("header-foreman")?.value || "-",
    state: document.getElementById("header-state")?.value || "-",
    location: document.getElementById("header-location")?.value || "-"
  };
}

/**
 * Serializes local changes securely straight down into local storage caches.
 */
function saveAllData() {
  const headerData = {
    srSupervisor: document.getElementById("header-sr-supervisor")?.value || "",
    supervisor: document.getElementById("header-supervisor")?.value || "",
    foreman: document.getElementById("header-foreman")?.value || "",
    state: document.getElementById("header-state")?.value || "",
    location: document.getElementById("header-location")?.value || ""
  };
  localStorage.setItem("report_header", JSON.stringify(headerData));

  const structures = [];
  document.querySelectorAll("#container .box").forEach(box => {
    const tasks = [];
    box.querySelectorAll("table[id$='Table'] tbody tr").forEach(row => {
      const inputEl = row.querySelector(".task");
      tasks.push({ 
        taskName: inputEl ? inputEl.value : "", 
        rowSection: row.querySelector(".row-section-select")?.value || "N/A",
        progress: row.querySelector(".prog").value, 
        techs: safeGetTechList(row),
        timestamp: row.querySelector(".time-stamp")?.value || ""
      });
    });

    const matrixState = [];
    box.querySelectorAll(".matrix-tech-select").forEach(select => {
      const tsInput = select.parentElement.querySelector('.matrix-timestamp');
      matrixState.push({
        code: select.dataset.code,
        section: select.dataset.section,
        value: select.value,
        timestamp: tsInput ? tsInput.value : ""
      });
    });

    const infoInput = box.querySelector(".lineupInfo-input");
    structures.push({
      boxId: box.id, 
      type: box.dataset.type, 
      isDynamic: box.dataset.dynamic === "true",
      lineupInfo: infoInput ? infoInput.value : "", 
      so: box.querySelector(".so-input")?.value || "",
      shift: box.querySelector(".shift-input").value, 
      tb: box.querySelector(".tb-input").value,
      checked: box.querySelector(".include-section").checked, 
      comments: box.querySelector(".section-comment").value, 
      tasks: tasks,
      matrix: matrixState
    });
  });
  localStorage.setItem("report_lineups", JSON.stringify(structures));
}

/**
 * Wipes task structures and updates specific layout containers back to standard parameters.
 */
function resetSection(boxId, type) {
  if (!adminMode.value) return;
  const box = document.getElementById(boxId);
  if (!box || !confirm("Reset this section? This will delete all tasks.")) return;

  box.querySelector("tbody").innerHTML = "";
  box.querySelector(".lineupInfo-input").value = ""; box.querySelector(".so-input").value = "";
  box.querySelector(".shift-input").value = ""; box.querySelector(".tb-input").value = "";
  box.querySelector(".section-comment").value = ""; box.querySelector(".ready-banner").style.display = "none";
  if (box.querySelector(".test-meta-info")) box.querySelector(".test-meta-info").innerHTML = "";

  box.querySelectorAll(".matrix-tech-select").forEach(select => select.value = "");
  box.querySelectorAll(".matrix-timestamp").forEach(input => input.value = "");

  const circle = box.querySelector(".gauge");
  if (circle) { circle.style.background = "conic-gradient(#607d8b 0deg,#1D4D7A 0deg)"; circle.classList.remove("stop-spin"); }
  
  if (type === "floor_credit") {
    if (circle?.querySelector("span")) circle.querySelector("span").innerText = "N/A";
    box.querySelector(".avg").innerText = "AVG: N/A";
  } else {
    if (circle?.querySelector("span")) circle.querySelector("span").innerText = "0%";
    box.querySelector(".avg").innerText = "AVG: 0%";
  }

  if (typeof lineupTasks !== 'undefined') {
    lineupTasks[type]?.forEach(task => addRow(boxId, task));
  }
  update(); saveAllData();
}

/**
 * Remotely drops a modular section container entirely from context.
 */
function deleteSection(boxId) {
  if (!adminMode.value) return;
  const box = document.getElementById(boxId);
  if (!box || !confirm(`Delete ${box.dataset.section || "this section"}? This cannot be undone.`)) return;
  box.remove(); update(); saveAllData();
}

/**
 * Primary DOM Event initialization listeners.
 */
document.addEventListener("DOMContentLoaded", () => {
  const datetimeInput = document.getElementById("current-datetime");
  if (datetimeInput) {
    datetimeInput.value = new Date().toLocaleString();
    setInterval(() => { datetimeInput.value = new Date().toLocaleString(); }, 60000);
  }

  if (typeof refreshTechnicianList === "function") refreshTechnicianList();

  ["header-sr-supervisor", "header-supervisor", "header-foreman"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("list", "techList");
  });

  const adminToggleBtn = document.getElementById("admin-toggle");
  if (adminToggleBtn) {
    adminToggleBtn.addEventListener("click", () => { adminMode.value = !adminMode.value; applyLockdownState(); });
  }

  const addTechListBtn = document.getElementById("add-tech-list-btn");
  if (addTechListBtn && typeof addTechnician === "function") {
    addTechListBtn.addEventListener("click", addTechnician);
  }

  const removeTechListBtn = document.getElementById("remove-tech-list-btn");
  if (removeTechListBtn && typeof removeTechnician === "function") {
    removeTechListBtn.addEventListener("click", removeTechnician);
  }
  
  document.addEventListener("click", e => {
    if (e.target.classList.contains("add-section-btn")) {
      if (!adminMode.value) return;
      const type = e.target.dataset.type;
      const lineupInfoNumber = prompt("Enter LineupInfo number:") || "";
      addSectionBox(type, lineupInfoNumber, true); saveAllData(); update(); applyLockdownState();
    }
  });

  document.querySelectorAll(".save-header, #header-sr-supervisor, #header-supervisor, #header-foreman").forEach(el => {
    if (el) {
      el.addEventListener("change", () => { saveAllData(); update(); });
      el.addEventListener("input", debouncedSaveAndUpdate);
    }
  });

  const savedHeader = JSON.parse(localStorage.getItem("report_header"));
  if (savedHeader) {
    if (document.getElementById("header-sr-supervisor")) document.getElementById("header-sr-supervisor").value = savedHeader.srSupervisor || "";
    if (document.getElementById("header-supervisor")) document.getElementById("header-supervisor").value = savedHeader.supervisor || "";
    if (document.getElementById("header-foreman")) document.getElementById("header-foreman").value = savedHeader.foreman || "";
    if (document.getElementById("header-state")) document.getElementById("header-state").value = savedHeader.state || "";
    if (document.getElementById("header-location")) document.getElementById("header-location").value = savedHeader.location || "";
  }

  const savedLineups = JSON.parse(localStorage.getItem("report_lineups"));
  if (savedLineups && savedLineups.length > 0) {
    savedLineups.forEach(lineup => {
      addSectionBox(lineup.type, lineup.lineupInfo, lineup.isDynamic, lineup.boxId);
      const box = document.getElementById(lineup.boxId);
      if (box) {
        box.querySelector(".so-input").value = lineup.so || "";
        box.querySelector(".shift-input").value = lineup.shift || "";
        box.querySelector(".tb-input").value = lineup.tb || "";
        box.querySelector(".include-section").checked = lineup.checked;
        box.querySelector(".section-comment").value = lineup.comments || " ";
        
        if (lineup.matrix && Array.isArray(lineup.matrix)) {
          lineup.matrix.forEach(m => {
            const selectNode = box.querySelector(`.matrix-tech-select[data-code="${m.code}"][data-section="${m.section}"]`);
            if (selectNode) {
              selectNode.value = m.value || "";
              const tsInput = selectNode.parentElement.querySelector('.matrix-timestamp');
              if (tsInput) tsInput.value = m.timestamp || "";
            }
          });
        }

        if (lineup.tasks && Array.isArray(lineup.tasks)) {
          lineup.tasks.forEach(t => {
            addRow(lineup.boxId, t.taskName, t.progress, t.techs, t.timestamp || "");
            const coreRows = box.querySelectorAll("table[id$='Table'] tbody tr");
            const targetTr = coreRows[coreRows.length - 1];
            if (targetTr && t.rowSection) {
               const dropdown = targetTr.querySelector(".row-section-select");
               if (dropdown) dropdown.value = t.rowSection;
            }
          });
        }
      }
    });
  } else {
    if (typeof types !== 'undefined') {
      types.forEach(t => {
        addSectionBox(t, "", false);
        const box = document.getElementById(t);
        if (box) {
          const includeCheckbox = box.querySelector(".include-section");
          if (includeCheckbox) includeCheckbox.checked = false;
        }
      });
    }
  }

  update();
  saveAllData();
  applyLockdownState();
});

/**
 * Gathers individual lineup rows to generate overall runtime reports dynamically.
 */
function generateSummary() {
  const tbody = document.querySelector("#summaryTable tbody");
  if (!tbody) return; 
  tbody.innerHTML = "";
  const header = getHeaderData();

  const allTasksCollection = [];
  const techTotalsMap = {};

  document.querySelectorAll("#container .box").forEach(box => {
    if (!box.querySelector(".include-section")?.checked) return;
    const isFloorCredit = box.dataset.type === "floor_credit";
    
    // Double-fallback lookup strategy for LineupInfo metrics
    const infoInput = box.querySelector(".lineupInfo-input");
    let lineupInfo = "-";
    if (infoInput && infoInput.value && infoInput.value.trim() !== "") {
      lineupInfo = infoInput.value.trim();
    } else if (box.querySelector(".lineupInfo-input")?.getAttribute("value")) {
      lineupInfo = box.querySelector(".lineupInfo-input").getAttribute("value").trim();
    }
    
    const so = box.querySelector(".so-input")?.value.trim() || "-";
    const shift = box.querySelector(".shift-input")?.value || "-";
    const tb = box.querySelector(".tb-input")?.value || "-";
    const sectionName = box.dataset.section || "Unknown";
    const rows = box.querySelectorAll("table[id$='Table'] tbody tr");

    // Use Set to strictly enforce unique technician names per lineup block
    const technicians = new Set();

    // 1. Process standard table row assignments
    rows.forEach(row => { 
      const taskInput = row.querySelector(".task");
      let currentTask = "New Task";
      if (taskInput && taskInput.value && taskInput.value.trim() !== "") {
        currentTask = taskInput.value.trim();
      } else if (taskInput && taskInput.getAttribute("value") && taskInput.getAttribute("value").trim() !== "") {
        currentTask = taskInput.getAttribute("value").trim();
      }
      
      const currentTimestamp = row.querySelector(".time-stamp")?.value || "-";
      let selectedSectionValue = row.querySelector(".row-section-select")?.value || "-";

      const assignedTechs = safeGetTechList(row);

      assignedTechs.forEach(t => {
        const cleanName = t.trim();
        if (!cleanName) return;
        
        // Exclude "Teamwork" and "Team work"
        if (cleanName.toLowerCase() !== "teamwork" && cleanName.toLowerCase() !== "team work") {
          technicians.add(cleanName.toLowerCase());
          
          allTasksCollection.push({
            techName: cleanName,
            lineupInfo: lineupInfo,
            task: currentTask,
            sectionNo: selectedSectionValue, 
            timestamp: currentTimestamp
          });
          techTotalsMap[cleanName] = (techTotalsMap[cleanName] || 0) + 1;
        }
      }); 
    });

    // 2. Process Lineup Additional Connect Info (Matrix dropdowns)
    box.querySelectorAll(".matrix-tech-select").forEach(select => {
      const matrixVal = select.value?.trim();
      if (matrixVal && matrixVal.toLowerCase() !== "teamwork" && matrixVal.toLowerCase() !== "team work") {
        technicians.add(matrixVal.toLowerCase());

        const rowLabel = select.closest("tr")?.querySelector("td")?.innerText.trim() || "Additional Connection";
        const sectionLabel = select.dataset.section ? select.dataset.section.toUpperCase() : "-";
        const tsInput = select.parentElement.querySelector('.matrix-timestamp');
        const matrixTimestamp = (tsInput && tsInput.value) ? tsInput.value : "-";

        allTasksCollection.push({
          techName: matrixVal,
          lineupInfo: lineupInfo,
          task: rowLabel,
          sectionNo: sectionLabel,
          timestamp: matrixTimestamp
        });
        techTotalsMap[matrixVal] = (techTotalsMap[matrixVal] || 0) + 1;
      }
    });
    
    let avg = box.querySelector(".avg")?.innerText.replace("AVG: ", "") || "0%";
    if (isFloorCredit) {
      avg = "N/A";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${header.date}</td><td>${sectionName}</td><td>${lineupInfo}</td><td>${so}</td><td>${shift}</td>
    <td>${tb}</td><td>${rows.length}</td><td>${technicians.size}</td><td>${avg}</td>`;
    tbody.appendChild(tr);
  });

  window.cachedAllTasksCollection = allTasksCollection;

  const floorCreditBody = document.querySelector("#floorCreditTable tbody");
  if (floorCreditBody) {
    floorCreditBody.innerHTML = "";

    allTasksCollection.sort((a, b) => {
      const countB = techTotalsMap[b.techName] || 0;
      const countA = techTotalsMap[a.techName] || 0;
      return countB - countA;
    });

    allTasksCollection.forEach(item => {
      if (item.techName.toLowerCase() === "teamwork" || item.techName.toLowerCase() === "team work") return;

      const trFC = document.createElement("tr");
      trFC.innerHTML = `
        <td>
          <a href="javascript:void(0)" onclick="openTechModal('${item.techName.replace(/'/g, "\\'")}')" style="color: #1d4d7a; font-weight: bold; text-decoration: underline;">${item.techName}</a>
        </td>
        <td>${item.lineupInfo}</td>
        <td>${item.task}</td>
        <td style="text-align: center; font-weight: bold; color: #1d4d7a;">${item.sectionNo}</td>
        <td>${item.timestamp}</td>
      `;
      floorCreditBody.appendChild(trFC);
    });
  }
}

/**
 * Opens modal overlay displaying subset records mapped exclusively to a chosen technician name with avatar image.
 */
function openTechModal(techName) {
  generateSummary();

  const modal = document.getElementById("techPerformanceModal");
  const modalTitle = document.getElementById("modalTechTitle");
  const modalSummary = document.getElementById("modalTechSummary");
  const modalAvatar = document.getElementById("modalTechAvatar");
  const modalTbody = document.querySelector("#modalTechTable tbody");
  
  if (!modal || !modalTbody || !window.cachedAllTasksCollection) return;
  
  modalTbody.innerHTML = "";
  modalTitle.innerText = `Performance History: ${techName}`;
  
  // Dynamic Image Retrieval Pass
  if (modalAvatar) {
    let imgUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z'/></svg>";
    
    if (typeof technicianImages !== 'undefined' && technicianImages[techName]) {
      imgUrl = technicianImages[techName];
    } else if (typeof fallbackImage === 'string' && fallbackImage !== "") {
      imgUrl = fallbackImage;
    }
    
    modalAvatar.src = imgUrl;
    modalAvatar.alt = techName;
  }

  const filteredTasks = window.cachedAllTasksCollection.filter(
    item => item.techName.toLowerCase() === techName.toLowerCase()
  );
  
  modalSummary.innerText = `Total Registered Contributions: ${filteredTasks.length} task entries.`;
  
  if (filteredTasks.length === 0) {
    modalTbody.innerHTML = `<tr><td colspan="4" style="color:#777; font-style:italic; text-align:center; padding:15px;">No active logs tracked for this period.</td></tr>`;
  } else {
    filteredTasks.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight:bold; color:#1e293b;">${item.lineupInfo}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; color:#334155; text-align:left;">${item.task}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; font-weight: bold; color: #1d4d7a; text-align:center;">${item.sectionNo}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; font-style: italic; color: #555;">${item.timestamp}</td>
      `;
      modalTbody.appendChild(tr);
    });
  }
  
  modal.style.display = "flex";
}

/**
 * Closes modal overlay and purges view tables.
 */
function closeTechModal() {
  const modal = document.getElementById("techPerformanceModal");
  if (modal) modal.style.display = "none";
}












