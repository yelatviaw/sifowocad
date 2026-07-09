
// Global Application Configurations and State Management
const adminMode = { value: false };

// Defined Section Core Structural IDs
const types = [
  "ms_10sl", "ggl_4sl", "ggl_3sl", "krs_7sl", "krs_6sl","ms_6sl", 
  "ms_5sl", "ms_4sl", "ms_3sl", "ms_2sl", "ms_1sl", "floor_credit"
];

// Explicit Mapping for Lineup Titles
const lineupNames = {
  ms_10sl: "MS-10SL",
  ggl_4sl: "GGL-4SL ",
  ggl_3sl: "GGL-3SL",
  krs_7sl: "KRS-7SL",
  krs_6sl: "KRS-6SL",
  ms_6sl: "MS-6SL",
  ms_5sl: "MS-5SL",
  ms_4sl: "MS-4SL",
  ms_3sl: "MS-3SL",
  ms_2sl: "MS-2SL",
  ms_1sl: "MS-1SL",
  floor_credit: "Floor-Credit",
};

// Fallback Default Tasks if LocalStorage is Empty
const lineupTasks = {
  ms_10sl: [
    "IC-Section connect", "IC-Lineup connect", "Section barrier", "Bolting", "Tap-wires routing(6)",
    "Tap-wires connect(6)", "CT-wires routing(6)", "CT-wires connect(6)", " S5/S6 SEM3 wires routing",
    "S5/S6 SEM3 wires connect (13)", "S2/S9 SEM3 wires routing", "S2/S9 SEM3 wires connect(4)",
    "pullAparts connect (8)", "Ethernet cables connect (4)"
  ],
  ggl_4sl: [
    "Section barrier", "Bolting", "Color-wires (5)", "Com-UM-ETH1", "Ethernets (5)", "Con-Gen1 wires (7)",
    "IC-Lineup", "IC-Unit", "pullApart", "TB/24:1", "TB-XFMR3:6", "01/PWS3:IN+(2)", "TBD4:2"
  ],
  ggl_3sl: [
    "Section barrier", "Bolting", "Color-wires (5)", "Com-UM-ETH1", "Ethernets (5)", "Con-Gen1 wires (7)",
    "IC-Lineup", "IC-Unit", "pullApart", "TB/24:1", "TB-XFMR3:6", "01/PWS3:IN+(2)", "TBD4:2"
  ],
  krs_7sl: [
    "Section barrier", "S6SCX1-S2CT1-2-3", "S6SCX6-S1CT8-9-10", "S6SCX2", "S6SCX3", "S6SCX4", "S6-S1 pullApart", "S6-S2 pullApart",
    "S1-S6 Ethernet", "S5-S6 Ethernet", "IC-Unit", "IC-Lineup", "All-Breakers-Ethernet", "X117-X118-X119-X120-X121", "All_sec-pullApart"
  ],
  krs_6sl: [
    "Section barrier", "S6SCX1-S2CT1-2-3", "S6SCX6-S1CT8-9-10", "S6SCX2", "S6SCX3", "S6SCX4", "S6-S1 pullApart", "S6-S2 pullApart",
    "S1-S6 Ethernet", "S5-S6 Ethernet", "IC-Unit", "IC-Lineup", "All-Breakers-Ethernet", "X117-X118-X119-X120-X121", "All_sec-pullApart"
  ],
  ms_6sl: [
    "IC-Lineup", "IC-Unit", "Bolting", "Section barrier", "CPT-U/G wires routing(4)", "CPT-U/G wires (4)", "Tap wires routing(8)", "Tap wires connect(8)", "Ethernet cables (3)", "HRG wire (1)"
  ],
  ms_5sl: [
    "IC-Unit", "IC Lineup", "Bolting", "1 tap wire on N", "2 wires top pan", "2 wires bottom pan", "S1CTP-C 1 wire", "SEM3 wires", "pullApart"
  ],
  ms_4sl: [
    "IC-Unit", "IC lineup", "SEM3 wires routing", "SEM3 connect", "pullApart"
  ],
  ms_3sl: [
    "CT wires routing", "CT wires connect","Tap wires routing", "Tap wires connect","IC-Section connect", "IC-Lineup connect", "Bolting", "SEM3 wires routing", "SEM3 wires connect","Ethernet connect"
  ],
  ms_2sl: [
    "Section barrier", "Bolting", "IC-Lineup", "IC-Unit", "Ethernet-cables-4"
  ],
  ms_1sl: [
    "Task 1", "Task 2", "Task 3"
  ],
  floor_credit: [
    "Not Arriving at stretch area on time", "Correctly wearing and using PPE ", "Inspecting a ladder before using","Safely bringing a ladder ", 
    "Bringing tools before a task", "Bringing parts to the work floor","Moving sections from test bay to bay", "Vacuuming the lineups", 
    "Cleaning the CAD floor","Taking out the trash","Safely returning a ladder", "Giving on-the-job training", "Shadowing new employees",
    "Returning tools after a task","Volunteer to lead a stretch session"
  ]
};
