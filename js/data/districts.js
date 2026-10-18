(function (global) {
  global.EDUPATH_BRANCHES = [
    { id: "CSE", label: "CSE" },
    { id: "AIML", label: "AI & ML" },
    { id: "DS", label: "Data Science" },
    { id: "IT", label: "IT" },
    { id: "ECE", label: "ECE" },
    { id: "EEE", label: "EEE" },
    { id: "MECH", label: "Mechanical" },
    { id: "CIVIL", label: "Civil" },
    { id: "CHE", label: "Chemical" },
    { id: "OTHER", label: "Other" }
  ];

  global.EDUPATH_BRANCH_LABELS = global.EDUPATH_BRANCHES.reduce(function (acc, b) {
    acc[b.id] = b.label;
    return acc;
  }, {});

  global.EDUPATH_STATES = ["Andhra Pradesh", "Telangana"];

  global.EDUPATH_STATE_DISTRICTS = {
    "Andhra Pradesh": [
      "Alluri Sitharama Raju",
      "Anakapalli",
      "Anantapur",
      "Annamayya",
      "Bapatla",
      "Chittoor",
      "Dr. B.R. Ambedkar Konaseema",
      "East Godavari",
      "Eluru",
      "Guntur",
      "Kakinada",
      "Krishna",
      "Kurnool",
      "Nandyal",
      "NTR",
      "Palnadu",
      "Parvathipuram Manyam",
      "Prakasam",
      "Sri Potti Sriramulu Nellore",
      "Sri Sathya Sai",
      "Srikakulam",
      "Tirupati",
      "Visakhapatnam",
      "Vizianagaram",
      "West Godavari",
      "YSR Kadapa"
    ],
    "Telangana": ["Hyderabad", "Rangareddy", "Warangal"]
  };

  global.EDUPATH_SOURCES = {
    eapcetMaster: "https://eapcet-sche.aptonline.in/EAPCET/collegeMaster",
    eapcetProfile: "https://eapcet-sche.aptonline.in/EAPCET/instProfile",
    aishe: "https://dashboard.aishe.gov.in/"
  };
})(window);
