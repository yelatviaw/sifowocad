
// ============================================================================
// PDF GENERATION & EXPORT ENGINE
// ============================================================================

/**
 * Compiles application states, values, metrics, and logs to export a clean PDF document.
 */
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Fetch top-level configuration metadata metrics
  const headerData = getHeaderData();

  // --- Document Title Banner ---
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(29, 77, 122); // Deep Navy (#1D4D7A)
  doc.text("CAD Production Report (GForm) Connect", 14, 18);

  // --- Header Metadata Table Layout ---
  doc.autoTable({
    startY: 24,
    theme: "grid",
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
    head: [["Date", "Sr. Supervisor", "Supervisor", "Foreman", "State", "Location"]],
    body: [[
      headerData.date,
      headerData.srSupervisor,
      headerData.supervisor,
      headerData.foreman,
      headerData.state.toUpperCase(),
      headerData.location
    ]],
    styles: { fontSize: 9, halign: "center" }
  });

  let currentY = doc.lastAutoTable.finalY + 14;

  // ==========================================================================
  // 1. CAD PRODUCTION SUMMARY REPORT (Directly below Header Table)
  // ==========================================================================
  const summaryRows = [];
  document.querySelectorAll("#summaryTable tbody tr").forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length >= 9) {
      summaryRows.push([
        tds[0].innerText, tds[1].innerText, tds[2].innerText, 
        tds[3].innerText, tds[4].innerText, tds[5].innerText, 
        tds[6].innerText, tds[7].innerText, tds[8].innerText
      ]);
    }
  });

  if (summaryRows.length > 0) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(29, 77, 122);
    doc.text("Summary Report by Lineup", 14, currentY - 4);

    doc.autoTable({
      startY: currentY,
      theme: "grid",
      headStyles: { fillColor: [29, 77, 122], textColor: [255, 255, 255], fontStyle: "bold" },
      head: [["Date", "Lineup", "LineupInfo", "SO", "Shift", "TB", "# Tasks", "# Tech", "Avg"]],
      body: summaryRows,
      styles: { fontSize: 8, halign: "center" },
      margin: { left: 14, right: 14 }
    });
    currentY = doc.lastAutoTable.finalY + 12;
  }

  // ==========================================================================
  // MODULE CONTAINERS RENDER LOOP
  // ==========================================================================
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(29, 77, 122);
  doc.text("Detail Report by Lineup", 14, currentY - 4);

  // Added distinct 5mm gap block buffer space right underneath text
  currentY += 5;

  const boxes = document.querySelectorAll("#container .box");
  let sectionCounter = 1; 
  
  boxes.forEach((box) => {
    if (!box.querySelector(".include-section")?.checked) return;

    const isFloorCredit = box.dataset.type === "floor_credit";
    const sectionTitle = box.dataset.section || "Lineup Block";
    const lineupInfo = box.querySelector(".lineupInfo-input")?.value || "-";
    const so = box.querySelector(".so-input")?.value || "-";
    const shift = box.querySelector(".shift-input")?.value || "-";
    const tb = box.querySelector(".tb-input")?.value || "-";
    const comments = box.querySelector(".section-comment")?.value.trim() || "No comments entered.";
    const avgScore = box.querySelector(".avg")?.innerText || "AVG: 0%";

    // Section Block Header Context Banner
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(29, 77, 122);
    doc.text(`${sectionCounter}. ${sectionTitle} (LineupInfo: ${lineupInfo})`, 14, currentY);
    currentY += 4;
    sectionCounter++; 

    // Lineup Parameters Bar
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`SO: ${so}  |  Shift: ${shift}  |  TB: ${tb}  |  Metrics: ${avgScore}`, 14, currentY);
    currentY += 5;

    // Collect rows
    const rowsData = [];
    box.querySelectorAll("table[id$='Table'] tbody tr").forEach((row) => {
      const task = row.querySelector(".task")?.value || "";
      const sectionNo = row.querySelector(".row-section-select")?.value || "-";
      
      const progRaw = row.querySelector(".prog")?.value || "";
      // Conditionally attach % only if it is a numeric value, keep raw text if "N/A"
      const progress = (progRaw !== "" && progRaw !== "N/A") ? `${progRaw}%` : progRaw || "-";
      
      // FIX: Changed from getTechList to safeGetTechList to maintain app.js schema integrity
      const techniciansList = safeGetTechList(row).join(", ") || "-";
      
      rowsData.push([task, sectionNo, progress, techniciansList]);
    });

    // Render task data profiles - Full grids with internal striped rows
    doc.autoTable({
      startY: currentY,
      theme: "striped", 
      styles: { fontSize: 8.5, lineColor: [210, 215, 225], lineWidth: 0.3 }, 
      headStyles: { fillColor: [29, 77, 122], textColor: [255, 255, 255] },
      head: [["Task Description", "Section #", "Progress", "Assigned Technicians"]],
      body: rowsData,
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 83 }
      },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.autoTable.previous.finalY + 5;

    // --- Dynamic Additional Connection Matrix ---
    if (!isFloorCredit) {
      const matrixSelections = [];
      box.querySelectorAll(".matrix-tech-select").forEach((select) => {
        if (select.value) {
          const rowLabel = select.closest("tr").querySelector("td").innerText.trim();
          const sectionLabel = select.dataset.section.toUpperCase();
          
          const timestampInput = select.nextElementSibling;
          const matrixTimestamp = (timestampInput && timestampInput.value) ? timestampInput.value : "-";

          matrixSelections.push([rowLabel, sectionLabel, select.value, matrixTimestamp]);
        }
      });

      if (matrixSelections.length > 0) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.text("Additional Connect Information:", 14, currentY);
        currentY += 3;

        doc.autoTable({
          startY: currentY,
          theme: "grid",
          headStyles: { fillColor: [79, 163, 209], textColor: [255, 255, 255] },
          head: [["Connection Task", "Target Section", "Technician Assigned", "Timestamp"]],
          body: matrixSelections,
          styles: { fontSize: 8, halign: "center" },
          columnStyles: {
            0: { halign: "left" },
            2: { halign: "left" },
            3: { fontStyle: "italic", cellWidth: 40 }
          },
          margin: { left: 14, right: 14 }
        });
        currentY = doc.autoTable.previous.finalY + 5;
      }
    }

    // --- Comment Meta Box output context ---
    doc.setFont("Helvetica", "oblique");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    
    const wrappedComments = doc.splitTextToSize(`Comments: ${comments}`, 182);
    doc.text(wrappedComments, 14, currentY);
    currentY += (wrappedComments.length * 4.5) + 4;

    // --- Container Visual Split Divider ---
    doc.setDrawColor(200, 215, 225);
    doc.setLineWidth(0.4);
    doc.line(14, currentY, 196, currentY);
    currentY += 8;
  });

  // ==========================================================================
  // LOWER APPENDIX ANALYTICS REPORTS
  // ==========================================================================

  // --- 2. CAD Technicians Performance Report (Grouped & Sorted) ---
  const rawPerformanceData = [];
  document.querySelectorAll("#floorCreditTable tbody tr").forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length >= 5) {
      rawPerformanceData.push({
        name: tds[0].innerText.replace(" ×", "").trim(),
        lineupInfo: tds[1].innerText,
        task: tds[2].innerText,
        sectionNo: tds[3].innerText,
        timestamp: tds[4].innerText
      });
    }
  });

  if (rawPerformanceData.length > 0) {
    // Tally frequency metrics to map top technician assignment weight scales
    const techCounts = {};
    rawPerformanceData.forEach(item => {
      techCounts[item.name] = (techCounts[item.name] || 0) + 1;
    });

    // Enforce matching rank parameters to cluster technician elements cohesively without dispersion
    rawPerformanceData.sort((a, b) => {
      if (techCounts[b.name] !== techCounts[a.name]) {
        return techCounts[b.name] - techCounts[a.name]; // Highest overall volume remains at peak index
      }
      return a.name.localeCompare(b.name); // Secondary alphabetical fallback
    });

    const performanceRows = rawPerformanceData.map(item => [
      item.name,
      item.lineupInfo,
      item.task,
      item.sectionNo,
      item.timestamp
    ]);

    currentY += 4;
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text("Technician Performance Report by Name", 14, currentY - 4);

    doc.autoTable({
      startY: currentY,
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: "bold" },
      head: [["Technician Name", "LineupInfo", "Task", "Section#", "Timestamp"]],
      body: performanceRows,
      styles: { fontSize: 8, halign: "center" },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold" },
        2: { halign: "left" },
        3: { fontStyle: "bold" },
        4: { fontStyle: "italic" }
      },
      margin: { left: 14, right: 14 }
    });
  }

  // --- Global Dynamic Page Counter Injection Engine ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 32, pageHeight - 12);
  }

  // Save Document Context Output
  doc.save(`Production_Report_${headerData.date.replace(/[/,:\s]/g, "_")}.pdf`);
}
