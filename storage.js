(function (global) {
  var KEYS = {
    shortlist: "edupath.shortlist",
    compare: "edupath.compare",
    family: "edupath.family",
    planner: "edupath.planner",
    recent: "edupath.recent",
    history: "edupath.searchHistory",
    imported: "edupath.importedColleges",
    prefs: "edupath.prefs"
  };

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  global.EduStore = {
    keys: KEYS,
    getShortlist: function () { return read(KEYS.shortlist, []); },
    setShortlist: function (ids) { write(KEYS.shortlist, ids.slice(0, 20)); },
    getCompare: function () { return read(KEYS.compare, []); },
    setCompare: function (ids) { write(KEYS.compare, ids.slice(0, 4)); },
    getFamily: function () { return read(KEYS.family, defaultFamily()); },
    setFamily: function (data) { write(KEYS.family, data); },
    getPlanner: function () { return read(KEYS.planner, defaultPlanner()); },
    setPlanner: function (data) { write(KEYS.planner, data); },
    getRecent: function () { return read(KEYS.recent, []); },
    pushRecent: function (id) {
      var list = read(KEYS.recent, []).filter(function (x) { return x !== id; });
      list.unshift(id);
      write(KEYS.recent, list.slice(0, 8));
    },
    getHistory: function () { return read(KEYS.history, []); },
    pushHistory: function (entry) {
      var list = read(KEYS.history, []);
      list.unshift(entry);
      write(KEYS.history, list.slice(0, 8));
    },
    getImported: function () { return read(KEYS.imported, []); },
    setImported: function (list) { write(KEYS.imported, list); },
    getPrefs: function () { return read(KEYS.prefs, null); },
    setPrefs: function (prefs) { write(KEYS.prefs, prefs); },
    clearAll: function () {
      Object.keys(KEYS).forEach(function (k) { localStorage.removeItem(KEYS[k]); });
    }
  };

  function defaultFamily() {
    return {
      studentPriorities: "Branch of interest, campus environment, and longer-term learning opportunities.",
      parentPriorities: "Manageable fees, hostel safety, and a realistic commute or residential plan.",
      preferredBranches: [],
      preferredLocations: "",
      budgetConcerns: "",
      notes: "",
      decisionSummary: "",
      collegeNotes: {},
      studentGoal: "top_tech",
      studentEnv: "metro_hackathons",
      studentBranchVsBrand: "branch_first",
      parentPriority: "verified_placement",
      parentBudget: "6l_10l",
      parentLoan: "modest_loan",
      checklist: [true, true, true, true, false]
    };
  }

  function defaultPlanner() {
    return {
      collegeId: "",
      tuition: 80000,
      tuitionIsOfficial: false,
      hostel: 45000,
      food: 36000,
      transport: 18000,
      other: 15000,
      equipment: 70000,
      familyBudget: 500000,
      savings: 400000,
      interest: 9.25,
      startingCtc: 8.5
    };
  }
})(window);
