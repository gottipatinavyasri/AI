(function () {
  var H = EduHelpers;
  var store = EduStore;
  var colleges = [];
  var wizardStep = 1;
  var lastResults = [];

  function allColleges() {
    return EduImport.mergeColleges(EDUPATH_DEFAULT_COLLEGES, store.getImported());
  }

  function byId(id) {
    return colleges.find(function (c) { return c.id === id; });
  }

  function go(path) {
    location.hash = path;
  }

  function parseRoute() {
    var raw = (location.hash || "#/").replace(/^#/, "");
    var parts = raw.split("/").filter(Boolean);
    if (!parts.length) return { name: "home" };
    if (parts[0] === "college" && parts[1]) return { name: "detail", id: decodeURIComponent(parts[1]) };
    return { name: parts[0] };
  }

  function toast(message) {
    var el = document.getElementById("toast");
    el.textContent = message;
    el.hidden = false;
    setTimeout(function () { el.hidden = true; }, 2400);
  }

  function icon(name) {
    var map = { home: "⌂", search: "⌕", compare: "⇄", family: "⚭", coin: "₹", leaf: "✦" };
    return map[name] || "•";
  }

  function navHtml(active) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === active);
    });
    document.getElementById("compareCount").textContent = store.getCompare().length;
    document.getElementById("shortCount").textContent = store.getShortlist().length;
  }

  function render() {
    colleges = allColleges();
    var route = parseRoute();
    var app = document.getElementById("app");
    navHtml(route.name === "detail" ? "explore" : route.name);
    document.getElementById("mobileNav").classList.remove("open");
    if (route.name === "home") app.innerHTML = viewHome();
    else if (route.name === "explore") app.innerHTML = viewExplore();
    else if (route.name === "recommend") app.innerHTML = viewRecommend();
    else if (route.name === "detail") app.innerHTML = viewDetail(route.id);
    else if (route.name === "compare") app.innerHTML = viewCompare();
    else if (route.name === "family") app.innerHTML = viewFamily();
    else if (route.name === "planner") app.innerHTML = viewPlanner();
    else if (route.name === "about") app.innerHTML = viewAbout();
    else if (route.name === "shortlist") app.innerHTML = viewShortlist();
    else app.innerHTML = viewHome();
    bindPage(route);
    window.scrollTo(0, 0);
  }

  function statusBadge(c) {
    return '<span class="badge ' + H.statusClass(c.dataStatus) + '">' + H.escapeHtml(c.dataStatus) + "</span>";
  }

  function collegeCard(c, extra) {
    extra = extra || "";
    return (
      '<article class="college-card">' +
        '<div class="media"><img src="' + H.escapeHtml(c.campusImage) + '" alt="" onerror="this.style.background=\'#d9e6dc\'"></div>' +
        '<div class="body">' +
          "<div>" + statusBadge(c) + ' <span class="badge badge-soft">' + H.escapeHtml(H.typeLabel(c)) + "</span></div>" +
          "<h3>" + H.escapeHtml(c.shortName) + "</h3>" +
          '<div class="meta">' + H.escapeHtml(c.city) + " · " + H.escapeHtml(c.district) + ", " + H.escapeHtml(c.state) + "</div>" +
          "<div>" + (c.branches || []).slice(0, 5).map(function (b) { return '<span class="badge badge-soft">' + H.escapeHtml(H.branchLabel(b)) + "</span> "; }).join("") + "</div>" +
          "<div><strong>Tuition:</strong> " + H.formatInr(c.tuitionFee) + (c.dataStatus === "Demo Data" && c.tuitionFee != null ? ' <span class="help">(demo)</span>' : "") + "</div>" +
          '<div class="chip-row">' +
            '<button class="btn btn-dark btn-small" data-go="#/college/' + encodeURIComponent(c.id) + '">View details</button>' +
            '<button class="btn btn-line btn-small" data-compare="' + H.escapeHtml(c.id) + '">Compare</button>' +
            '<button class="btn btn-line btn-small" data-save="' + H.escapeHtml(c.id) + '">Shortlist</button>' +
          "</div>" + extra +
        "</div>" +
      "</article>"
    );
  }

  function viewHome() {
    return (
      '<section class="hero">' +
        '<img class="hero-photo" src="images/hero-campus.jpg" alt="University campus lawn and academic buildings">' +
        '<div class="hero-scrim"></div>' +
        '<div class="wrap hero-inner">' +
          '<div class="eyebrow">EduPath AI · Family decision support</div>' +
          "<h1>Find the Right College. Build the Right Future.</h1>" +
          '<p class="lede">A premium family decision-support platform for students and parents comparing engineering colleges by rank context, budget, branch, and district — starting with Andhra Pradesh, with room to add other Indian states.</p>' +
          '<div class="hero-actions">' +
            '<button class="btn btn-primary" data-go="#/recommend">Find My Best-Fit College</button>' +
            '<button class="btn btn-ghost" data-go="#/explore">Explore Colleges by District</button>' +
            '<button class="btn btn-ghost" id="tryDemo">Try Demo</button>' +
          "</div>" +
          '<form class="search-glass" id="heroSearch">' +
            '<div><label for="heroState">State</label><select id="heroState"></select></div>' +
            '<div><label for="heroDistrict">District</label><select id="heroDistrict"></select></div>' +
            '<div><label for="heroKeyword">College name or keyword</label><input id="heroKeyword" placeholder="Example: AUCE, Siddhartha, Kakinada"></div>' +
            '<div style="align-self:end"><button class="btn btn-primary" type="submit">Search</button></div>' +
          "</form>" +
          '<div class="stat-row" style="margin-top:22px">' +
            "<div class='stat'><b>" + colleges.length + "</b> records in current dataset</div>" +
            "<div class='stat'><b>" + EDUPATH_STATE_DISTRICTS["Andhra Pradesh"].length + "</b> AP districts supported</div>" +
            "<div class='stat'><b>Local only</b> saved shortlists stay in this browser</div>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<section class="section"><div class="wrap">' +
        '<div class="section-head"><div class="kicker">What families use</div><h2 class="serif">Clear tools, not a black box.</h2><p>EduPath AI uses an explainable recommendation engine — a transparent scoring method, not a trained AI model unless a live model is connected later.</p></div>' +
        '<div class="grid-4">' +
          feature("01", "Better College Matches", "Match preferred branches, budget, and districts, then read why each college appeared.") +
          feature("02", "Financial Clarity", "Estimate four-year cost, loan EMI, and budget surplus before counselling freeze dates.") +
          feature("03", "Family Alignment", "Put student ambitions and parent concerns on one page with a printable agreement.") +
          feature("04", "District-Wise Search", "Choose a state, then its districts. Results come from the dataset, not a repeated shortlist.") +
        "</div>" +
      "</div></section>" +
      '<section class="section" style="padding-top:0"><div class="wrap">' +
        '<div class="grid-2">' +
          '<div class="panel steps">' +
            '<div class="kicker">How EduPath AI Guides Your Family</div><h2 class="serif">Four calm steps</h2>' +
            '<div class="step"><h3>Share preferences</h3><p class="meta">Exam, rank (optional), branches, districts, budget, and hostel needs.</p></div>' +
            '<div class="step"><h3>Review explainable matches</h3><p class="meta">Each card shows a preference-match score, reasons, and missing facts.</p></div>' +
            '<div class="step"><h3>Compare and cost the degree</h3><p class="meta">Use comparison and the affordability planner. Official fees are separated from estimates.</p></div>' +
            '<div class="step"><h3>Decide as a family</h3><p class="meta">Write priorities, pros and cons, and print a decision report from this browser.</p></div>' +
          "</div>" +
          '<div class="panel" style="background:linear-gradient(160deg,#123628,#1f5a43);color:#f6f1e6">' +
            "<h2 class='serif'>How this helps families</h2>" +
            "<p>Students often argue for a branch or city. Parents often argue for fees and safety. EduPath AI puts both on one page with the same records, the same gaps, and the same sources.</p>" +
            "<ul>" +
              "<li>No admission guarantee from rank when cutoffs are missing.</li>" +
              "<li>Demo tuition is labelled DEMO DATA.</li>" +
              "<li>Source links point to EAPCET and AISHE pages, which are public directories — not a live API inside this app.</li>" +
            "</ul>" +
            '<button class="btn btn-primary" data-go="#/about">About & data sources</button>' +
          "</div>" +
        "</div>" +
      "</div></section>"
    );
  }

  function feature(n, title, text) {
    return '<article class="feature"><div class="icon-orb">' + n + "</div><h3>" + title + "</h3><p class='meta'>" + text + "</p></article>";
  }

  function familyAlignment(f) {
    var score = 86;
    var divergence = "Minor divergence on campus location versus hostel preference; both sides agree on placement stability.";
    var suggestion = "Keep the shortlist tight, visit the top two campuses together, and confirm official fees before locking web options.";
    if (f.studentBranchVsBrand === "branch_first" && f.parentPriority === "brand_prestige") {
      score = 68;
      divergence = "The student wants a preferred branch first, while parents are leaning toward institutional brand even if the branch is lower.";
      suggestion = "Look at strong state autonomous or government colleges that still list the preferred branch, rather than forcing a brand-versus-branch standoff.";
    } else if (f.parentBudget === "under_6l" && f.studentGoal === "top_tech") {
      score = 74;
      divergence = "The student is aiming at high-tech metro campuses while the parent budget ceiling is under ₹6 lakh for four years.";
      suggestion = "Prioritise government university colleges in preferred districts. Listed demo tuition is often far below private metro options.";
    }
    return { score: score, divergence: divergence, suggestion: suggestion };
  }

  function loanEmi(principal, annualPct, months) {
    if (principal <= 0) return 0;
    var r = (Number(annualPct) / 100) / 12;
    if (!r) return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  function optionList(values, selected, withAll) {
    var html = withAll ? '<option value="all">All</option>' : "";
    values.forEach(function (v) {
      html += '<option value="' + H.escapeHtml(v) + '"' + (v === selected ? " selected" : "") + ">" + H.escapeHtml(v) + "</option>";
    });
    return html;
  }

  function districtsFor(state) {
    if (!state || state === "all") {
      return EDUPATH_STATES.reduce(function (acc, s) { return acc.concat(EDUPATH_STATE_DISTRICTS[s]); }, []);
    }
    return EDUPATH_STATE_DISTRICTS[state] || [];
  }

  function currentFiltersFromForm() {
    var branchNodes = document.querySelectorAll("[data-branch].active");
    var branches = Array.prototype.map.call(branchNodes, function (n) { return n.getAttribute("data-branch"); });
    return {
      state: val("fState") || "all",
      district: val("fDistrict") || "all",
      city: val("fCity"),
      keyword: val("fKeyword"),
      branches: branches,
      typeGroup: val("fType") || "all",
      maxFee: val("fFee") ? Number(val("fFee")) : null,
      hostel: val("fHostel") || "all",
      affiliation: val("fAff") || "all",
      sortBy: val("fSort") || "name"
    };
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function viewExplore() {
    var params = new URLSearchParams((location.hash.split("?")[1] || ""));
    var state = params.get("state") || "Andhra Pradesh";
    var district = params.get("district") || "all";
    var keyword = params.get("q") || "";
    return (
      '<div class="page wrap">' +
        '<div class="pagerow"><div><div class="kicker">Directory</div><h1 class="serif">Search colleges across districts</h1><p class="meta">This directory only contains records currently loaded in the dataset. It does not claim to list every engineering college in a district.</p></div>' +
        '<button class="btn btn-line" id="clearFilters">Clear filters</button></div>' +
        '<div class="notice" style="margin-bottom:16px">EAPCET college master and AISHE dashboards are linked as references. This app is not live-connected to those systems. Fees and placements in demo records are labelled <strong>DEMO DATA</strong>.</div>' +
        '<div class="filters">' +
          fieldSelect("fState", "State", optionList(EDUPATH_STATES, state, true)) +
          fieldSelect("fDistrict", "District", optionList(districtsFor(state), district, true)) +
          fieldInput("fCity", "City or town", "Example: Vijayawada") +
          fieldInput("fKeyword", "College name or keyword", "Name, city, or affiliation", keyword) +
          fieldSelect("fType", "Government or private", '<option value="all">All</option><option value="government">Government</option><option value="private">Private</option>') +
          fieldSelect("fFee", "Max annual tuition", '<option value="">Any / including unknown</option><option value="50000">₹50,000</option><option value="80000">₹80,000</option><option value="100000">₹1,00,000</option><option value="150000">₹1,50,000</option><option value="250000">₹2,50,000</option>') +
          fieldSelect("fHostel", "Hostel", '<option value="all">All</option><option value="yes">Listed as available</option><option value="unknown">Unknown / not available</option>') +
          fieldSelect("fAff", "Affiliation contains", '<option value="all">All</option><option value="JNTUK">JNTUK</option><option value="JNTUA">JNTUA</option><option value="JNTU-GV">JNTU-GV</option><option value="Andhra University">Andhra University</option><option value="Nagarjuna">Acharya Nagarjuna University</option>') +
          fieldSelect("fSort", "Sort by", '<option value="name">Name</option><option value="fees">Fees (low to high)</option><option value="match">Preference-match score</option>') +
        "</div>" +
        '<div class="help">Engineering branches (select any combination)</div>' +
        '<div class="chip-row" id="branchChips">' + EDUPATH_BRANCHES.map(function (b) {
          return '<button type="button" class="chip" data-branch="' + b.id + '">' + b.label + "</button>";
        }).join("") + "</div>" +
        '<p><strong id="resultCount">0</strong> matching results</p>' +
        '<div class="grid-3" id="resultGrid"></div>' +
        '<p class="help" id="historyLine"></p>' +
      "</div>"
    );
  }

  function fieldSelect(id, label, options) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><select id="' + id + '">' + options + "</select></div>";
  }
  function fieldInput(id, label, ph, value) {
    return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" placeholder="' + H.escapeHtml(ph || "") + '" value="' + H.escapeHtml(value || "") + '"></div>';
  }

  function applyExplore() {
    var filters = currentFiltersFromForm();
    var prefs = store.getPrefs() || demoPrefs();
    var list = EduFilter.sortColleges(EduFilter.filterColleges(colleges, filters), filters.sortBy, prefs);
    document.getElementById("resultCount").textContent = String(list.length);
    document.getElementById("resultGrid").innerHTML = list.length
      ? list.map(function (c) { return collegeCard(c); }).join("")
      : '<div class="empty"><h3>No colleges match these filters</h3><p>Try another district, clear the branch chips, or raise the fee ceiling. Empty districts are expected — the dataset is a sample, not a complete census.</p><button class="btn btn-dark" id="clearFilters2">Clear filters</button></div>';
    store.pushHistory({ when: Date.now(), state: filters.state, district: filters.district, keyword: filters.keyword });
    var hist = store.getHistory().slice(0, 4).map(function (h) {
      return (h.district && h.district !== "all" ? h.district : h.state) + (h.keyword ? " · " + h.keyword : "");
    }).join("  ·  ");
    document.getElementById("historyLine").textContent = hist ? "Recent searches on this browser: " + hist : "";
  }

  function demoPrefs() {
    return {
      exam: "AP EAPCET",
      rank: 18500,
      category: "OC",
      branches: ["CSE", "AIML"],
      state: "Andhra Pradesh",
      districts: ["Visakhapatnam", "NTR", "Guntur"],
      budget: 150000,
      typeGroup: "any",
      hostel: "yes",
      womenOnly: false
    };
  }

  function viewRecommend() {
    var p = store.getPrefs() || demoPrefs();
    return (
      '<div class="page wrap">' +
        '<div class="kicker">Explainable recommendation engine</div>' +
        '<h1 class="serif">Find My Best-Fit College</h1>' +
        '<p class="meta">This is a transparent preference scorer. It is not a trained AI model and it does not guarantee admission.</p>' +
        '<div class="wizard">' +
          '<div class="wizard-nav">' +
            [1,2,3,4,5,6].map(function (n) {
              var names = ["Exam & rank", "Branches", "Location", "Budget & type", "Campus extras", "Results"];
              return '<button type="button" data-step="' + n + '" class="' + (wizardStep === n ? "active" : "") + '">' + n + ". " + names[n-1] + "</button>";
            }).join("") +
          "</div>" +
          '<form class="panel" id="wizardForm">' +
            '<div class="step-pane" data-pane="1">' +
              fieldSelect("wExam", "Entrance examination", optionList(["AP EAPCET", "TG EAPCET", "JEE Main", "JEE Advanced", "Not sure / other"], p.exam, false)) +
              fieldInput("wRank", "Rank (optional)", "Used only as context, not as a cutoff predictor", p.rank || "") +
              fieldSelect("wCat", "Category (optional)", optionList(["OC", "BC", "SC", "ST", "EWS", "Prefer not to say"], p.category, false)) +
              '<p class="help">Category is stored locally and is not used to invent reserved-category cutoffs.</p>' +
            "</div>" +
            '<div class="step-pane" data-pane="2">' +
              "<p>Preferred engineering branches</p>" +
              '<div class="chip-row">' + EDUPATH_BRANCHES.map(function (b) {
                var on = (p.branches || []).indexOf(b.id) !== -1;
                return '<button type="button" class="chip' + (on ? " active" : "") + '" data-wbranch="' + b.id + '">' + b.label + "</button>";
              }).join("") + "</div>" +
            "</div>" +
            '<div class="step-pane" data-pane="3">' +
              fieldSelect("wState", "Preferred state", optionList(EDUPATH_STATES, p.state, true)) +
              '<div class="field"><label>Preferred districts (hold Ctrl/Cmd to select several)</label><select id="wDistricts" multiple size="8"></select></div>' +
            "</div>" +
            '<div class="step-pane" data-pane="4">' +
              fieldInput("wBudget", "Annual tuition budget (₹)", "150000", p.budget || "") +
              fieldSelect("wType", "Institution preference", '<option value="any">No preference</option><option value="government">Government</option><option value="private">Private</option>') +
            "</div>" +
            '<div class="step-pane" data-pane="5">' +
              fieldSelect("wHostel", "Hostel requirement", '<option value="any">No preference</option><option value="yes">Need hostel listed as available</option>') +
              '<label class="help"><input type="checkbox" id="wWomen"> Prefer a women-only campus if listed</label>' +
              '<p class="help">Distance-from-home scoring is not applied because reliable geo-coordinates are not in this dataset.</p>' +
            "</div>" +
            '<div class="step-pane" data-pane="6" id="wizardResults"><p>Submit to generate matches.</p></div>' +
            '<div class="chip-row" style="margin-top:16px">' +
              '<button type="button" class="btn btn-line" id="wizBack">Back</button>' +
              '<button type="button" class="btn btn-dark" id="wizNext">Continue</button>' +
              '<button type="submit" class="btn btn-primary">Find My Best-Fit College</button>' +
            "</div>" +
            '<p class="error" id="wizError"></p>' +
          "</form>" +
        "</div>" +
      "</div>"
    );
  }

  function collectWizard() {
    var branches = Array.prototype.map.call(document.querySelectorAll("[data-wbranch].active"), function (n) { return n.getAttribute("data-wbranch"); });
    var distSel = document.getElementById("wDistricts");
    var districts = distSel ? Array.prototype.filter.call(distSel.options, function (o) { return o.selected; }).map(function (o) { return o.value; }) : [];
    return {
      exam: val("wExam"),
      rank: val("wRank") ? Number(val("wRank")) : null,
      category: val("wCat"),
      branches: branches,
      state: val("wState") || "all",
      districts: districts,
      budget: val("wBudget") ? Number(val("wBudget")) : null,
      typeGroup: val("wType") || "any",
      hostel: val("wHostel") || "any",
      womenOnly: !!(document.getElementById("wWomen") && document.getElementById("wWomen").checked)
    };
  }

  function showWizardPane() {
    document.querySelectorAll(".step-pane").forEach(function (p) {
      p.hidden = String(p.getAttribute("data-pane")) !== String(wizardStep);
    });
    document.querySelectorAll(".wizard-nav button").forEach(function (b) {
      b.classList.toggle("active", Number(b.getAttribute("data-step")) === wizardStep);
    });
  }

  function fillDistrictMulti(state, selected) {
    var sel = document.getElementById("wDistricts");
    if (!sel) return;
    var list = districtsFor(state === "all" ? "Andhra Pradesh" : state);
    sel.innerHTML = list.map(function (d) {
      return '<option value="' + H.escapeHtml(d) + '"' + ((selected || []).indexOf(d) !== -1 ? " selected" : "") + ">" + H.escapeHtml(d) + "</option>";
    }).join("");
  }

  function renderWizardResults(prefs) {
    lastResults = EduRecommend.recommend(colleges, prefs);
    var groups = {
      "Strong Preference Match": [],
      "Possible Match": [],
      "Needs Eligibility Verification": []
    };
    lastResults.forEach(function (r) { groups[r.label].push(r); });
    var html = '<div class="notice">Cutoff ranks are not in this dataset. Every recommendation still needs eligibility verification with the official counselling authority.</div>';
    Object.keys(groups).forEach(function (label) {
      html += "<h2 class='serif'>" + label + " · " + groups[label].length + "</h2>";
      html += '<div class="grid-2">' + groups[label].slice(0, 8).map(resultCard).join("") + "</div>";
    });
    document.getElementById("wizardResults").innerHTML = html;
  }

  function resultCard(r) {
    var c = r.college;
    return (
      '<article class="match-card card" style="padding:16px">' +
        statusBadge(c) + ' <span class="badge badge-gold">' + r.label + " · " + r.score + "</span>" +
        "<h3>" + H.escapeHtml(c.officialName) + "</h3>" +
        '<p class="meta">' + H.escapeHtml(c.district) + " · matching branches: " +
          (r.matchedBranches.length ? r.matchedBranches.map(H.branchLabel).join(", ") : "None listed") + "</p>" +
        "<p><strong>Tuition:</strong> " + H.formatInr(c.tuitionFee) + " · budget " + r.budgetFit + "</p>" +
        "<p>" + r.reasons.map(H.escapeHtml).join(" ") + "</p>" +
        (r.missing.length ? '<p class="help">Missing or uncertain: ' + r.missing.map(H.escapeHtml).join(" ") + "</p>" : "") +
        (c.sourceUrls || []).map(function (u) { return '<a href="' + H.escapeHtml(u) + '" target="_blank" rel="noopener">Source</a> '; }).join("") +
        '<div class="chip-row">' +
          '<button class="btn btn-dark btn-small" data-go="#/college/' + encodeURIComponent(c.id) + '">View details</button>' +
          '<button class="btn btn-line btn-small" data-compare="' + H.escapeHtml(c.id) + '">Compare</button>' +
        "</div>" +
      "</article>"
    );
  }

  function viewDetail(id) {
    var c = byId(id);
    if (!c) return '<div class="page wrap empty"><h2>College not found</h2><button class="btn btn-dark" data-go="#/explore">Back to directory</button></div>';
    store.pushRecent(id);
    var score = EduRecommend.scoreCollege(c, store.getPrefs() || demoPrefs());
    return (
      '<div class="page wrap">' +
        '<p class="help"><a href="#/explore">Directory</a> / ' + H.escapeHtml(c.shortName) + "</p>" +
        '<div class="detail-hero">' +
          '<img src="' + H.escapeHtml(c.campusImage) + '" alt="Campus photograph for ' + H.escapeHtml(c.shortName) + '">' +
          "<div>" +
            statusBadge(c) +
            "<h1 class='serif'>" + H.escapeHtml(c.officialName) + "</h1>" +
            '<p class="meta">' + H.escapeHtml(c.address) + "</p>" +
            '<p class="meta">' + H.escapeHtml(c.city) + ", " + H.escapeHtml(c.district) + ", " + H.escapeHtml(c.state) + "</p>" +
            '<div class="chip-row">' +
              '<button class="btn btn-primary" data-compare="' + H.escapeHtml(c.id) + '">Add to Compare</button>' +
              '<button class="btn btn-dark" data-save="' + H.escapeHtml(c.id) + '">Save to Shortlist</button>' +
              '<button class="btn btn-line" data-go="#/planner?college=' + encodeURIComponent(c.id) + '">Affordability planner</button>' +
            "</div>" +
            '<p class="help">Preference-match score with your saved (or demo) preferences: <strong>' + score.score + "</strong> · " + score.label + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="grid-2" style="margin-top:22px">' +
          '<div class="panel">' +
            "<h3>Verified facts vs unavailable fields</h3>" +
            kv("Institution type", H.na(c.institutionType)) +
            kv("Branches / courses", (c.branches || []).map(H.branchLabel).join(", ") || "Not available") +
            kv("Annual tuition", H.formatInr(c.tuitionFee) + (c.feeYear ? " · " + c.feeYear : "") + (c.dataStatus === "Demo Data" ? " · DEMO DATA" : "")) +
            kv("Hostel", c.hostelAvailable === "Unknown" ? "Not available" : c.hostelAvailable) +
            kv("Hostel cost", H.formatInr(c.hostelFee) + (c.hostelFee != null && c.dataStatus === "Demo Data" ? " · DEMO DATA" : "")) +
            kv("Affiliation", H.na(c.affiliation)) +
            kv("Accreditation", "Not available — not independently verified in this dataset") +
            kv("Placement statistics", "Not available as verified figures") +
            kv("Official website", c.websiteUrl ? '<a href="' + H.escapeHtml(c.websiteUrl) + '" target="_blank" rel="noopener">' + H.escapeHtml(c.websiteUrl) + "</a>" : "Not available") +
            kv("Data status", c.dataStatus) +
            kv("Last reviewed in app", H.na(c.lastVerifiedDate)) +
            kv("Women-only campus", c.womenOnly ? "Listed as women-only" : "No") +
          "</div>" +
          '<div class="panel">' +
            "<h3>Sources and caveats</h3>" +
            "<p>" + H.escapeHtml(c.notes) + "</p>" +
            "<p>" + H.escapeHtml(c.entranceNote) + "</p>" +
            "<ul>" + (c.sourceUrls || []).map(function (u) { return '<li><a href="' + H.escapeHtml(u) + '" target="_blank" rel="noopener">' + H.escapeHtml(u) + "</a></li>"; }).join("") + "</ul>" +
            '<p class="help">Data completeness for this record: ' + H.completeness(c) + "%</p>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function kv(k, v) {
    return '<div class="kv"><div>' + k + "</div><div>" + v + "</div></div>";
  }

  function viewCompare() {
    var ids = store.getCompare();
    var list = ids.map(byId).filter(Boolean);
    var prefs = store.getPrefs() || demoPrefs();
    var rows = [
      ["Location", function (c) { return c.city + ", " + c.district + ", " + c.state; }],
      ["Type", function (c) { return c.institutionType; }],
      ["Preferred branches in record", function (c) {
        var m = (c.branches || []).filter(function (b) { return (prefs.branches || []).indexOf(b) !== -1; });
        return m.length ? m.map(H.branchLabel).join(", ") : "None of your saved preferred branches";
      }],
      ["Tuition (label status)", function (c) { return H.formatInr(c.tuitionFee) + " · " + c.dataStatus; }],
      ["Hostel", function (c) { return c.hostelAvailable === "Unknown" ? "Not available" : c.hostelAvailable; }],
      ["Distance from home", function () { return "Not available"; }],
      ["Placement statistics", function () { return "Not available as verified figures"; }],
      ["Accreditation", function () { return "Not available as verified figures"; }],
      ["Preference-match score", function (c) { return String(EduRecommend.scoreCollege(c, prefs).score); }],
      ["Data completeness", function (c) { return H.completeness(c) + "%"; }]
    ];
    var head = "<th>Field</th>" + list.map(function (c) { return "<th>" + H.escapeHtml(c.shortName) + ' <button class="btn btn-line btn-small" data-uncompare="' + c.id + '">Remove</button></th>'; }).join("");
    var body = rows.map(function (row) {
      var values = list.map(row[1]);
      var unique = values.filter(function (v, i, a) { return a.indexOf(v) === i; }).length > 1;
      return "<tr><th>" + row[0] + "</th>" + values.map(function (v) { return '<td class="' + (unique ? "diff" : "") + '">' + H.escapeHtml(String(v)) + "</td>"; }).join("") + "</tr>";
    }).join("");
    var cheapest = list.slice().sort(function (a, b) { return (a.tuitionFee || 9e9) - (b.tuitionFee || 9e9); })[0];
    var career = list.slice().sort(function (a, b) { return (b.placementMedianLpa || 0) - (a.placementMedianLpa || 0); })[0];
    var balanced = list.slice().sort(function (a, b) {
      return EduRecommend.scoreCollege(b, prefs).score - EduRecommend.scoreCollege(a, prefs).score;
    })[0];
    var highlights = list.length ? (
      '<div class="highlight-row">' +
        '<div class="panel"><span class="kicker">Affordability</span><strong>' + H.escapeHtml(cheapest.shortName) + "</strong><p class='meta'>Lowest listed annual tuition in this set: " + H.formatInr(cheapest.tuitionFee) + "</p></div>" +
        '<div class="panel"><span class="kicker">Career priority</span><strong>' + H.escapeHtml(career.shortName) + "</strong><p class='meta'>" + (career.placementMedianLpa != null ? "Highest listed median CTC: ₹" + career.placementMedianLpa + " LPA (demo if labelled)" : "Verified placement figures are not available — compare using fees and match score instead.") + "</p></div>" +
        '<div class="panel"><span class="kicker">Balanced option</span><strong>' + H.escapeHtml(balanced.shortName) + "</strong><p class='meta'>Highest preference-match score with your saved (or demo) profile.</p></div>" +
      "</div>"
    ) : "";
    return (
      '<div class="page wrap">' +
        '<div class="pagerow"><div><div class="kicker">Compare</div><h1 class="serif">Side-by-side, up to four colleges</h1><p class="meta">Highlighted cells differ across the selected set. Difference is not a ranking of which college is best for every family.</p></div>' +
        '<button class="btn btn-line" id="clearCompare">Clear comparison</button></div>' +
        highlights +
        (list.length ? '<div style="overflow:auto"><table class="compare-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table></div>" : '<div class="empty"><p>Add colleges from the directory or recommendation results.</p><button class="btn btn-dark" data-go="#/explore">Browse colleges</button></div>') +
        '<h3 style="margin-top:28px">Recently viewed</h3>' +
        '<div class="chip-row">' + store.getRecent().map(function (id) {
          var c = byId(id); if (!c) return "";
          return '<button class="chip" data-compare="' + id + '">Add ' + H.escapeHtml(c.shortName) + "</button>";
        }).join("") + "</div>" +
      "</div>"
    );
  }

  function viewFamily() {
    var f = store.getFamily();
    var ids = store.getShortlist();
    var list = ids.map(byId).filter(Boolean);
    return (
      '<div class="page wrap">' +
        '<div class="kicker">Family Decision Room</div>' +
        '<h1 class="serif">Talk it through on one page</h1>' +
        '<div class="notice">Saved notes stay in this browser only. They are not synced across devices or family members\' phones.</div>' +
        '<form id="familyForm" class="family-grid" style="margin-top:16px">' +
          '<div class="panel"><h3>Student priorities</h3><textarea name="studentPriorities">' + H.escapeHtml(f.studentPriorities) + "</textarea>" +
            fieldInput("famLoc", "Preferred locations", "Districts or cities", f.preferredLocations) + "</div>" +
          '<div class="panel"><h3>Parent priorities</h3><textarea name="parentPriorities">' + H.escapeHtml(f.parentPriorities) + "</textarea>" +
            '<div class="field"><label>Budget concerns</label><textarea name="budgetConcerns">' + H.escapeHtml(f.budgetConcerns) + "</textarea></div></div>" +
          '<div class="panel" style="grid-column:1/-1"><h3>Shared shortlist</h3>' +
            (list.length ? list.map(function (c) {
              var note = (f.collegeNotes && f.collegeNotes[c.id]) || { pro: "", con: "" };
              return '<div class="panel" style="box-shadow:none;margin-bottom:12px"><strong>' + H.escapeHtml(c.officialName) + "</strong>" +
                '<div class="grid-2"><div class="field"><label>Pros</label><textarea data-pro="' + c.id + '">' + H.escapeHtml(note.pro) + '</textarea></div>' +
                '<div class="field"><label>Cons</label><textarea data-con="' + c.id + '">' + H.escapeHtml(note.con) + "</textarea></div></div></div>";
            }).join("") : '<p class="help">Shortlist colleges from the directory first.</p><button class="btn btn-line" type="button" data-go="#/explore">Open directory</button>') +
          "</div>" +
          '<div class="panel"><h3>Shared notes</h3><textarea name="notes">' + H.escapeHtml(f.notes) + "</textarea></div>" +
          '<div class="panel"><h3>Final decision summary</h3><textarea name="decisionSummary">' + H.escapeHtml(f.decisionSummary) + "</textarea></div>" +
          '<div class="chip-row" style="grid-column:1/-1">' +
            '<button class="btn btn-dark" type="submit">Save in this browser</button>' +
            '<button class="btn btn-primary no-print" type="button" id="printFamily">Print decision report</button>' +
            '<button class="btn btn-line" type="button" data-go="#/planner">Open affordability planner</button>' +
          "</div>" +
        "</form>" +
        '<article id="printArea" class="panel print-only"><h1>EduPath AI family decision report</h1><p>Generated for local demo use. Not an official counselling document.</p></article>' +
      "</div>"
    );
  }

  function viewPlanner() {
    var p = store.getPlanner();
    var params = new URLSearchParams((location.hash.split("?")[1] || ""));
    var selected = params.get("college") || p.collegeId;
    var c = byId(selected);
    if (c && c.tuitionFee != null) p.tuition = c.tuitionFee;
    if (c && c.hostelFee != null) p.hostel = c.hostelFee;
    var annual = Number(p.tuition || 0) + Number(p.hostel || 0) + Number(p.food || 0) + Number(p.transport || 0) + Number(p.other || 0);
    var four = annual * 4;
    var diff = Number(p.familyBudget || 0) - four;
    return (
      '<div class="page wrap">' +
        '<div class="kicker">Affordability planner</div>' +
        '<h1 class="serif">Estimate the four-year conversation, not a loan offer</h1>' +
        '<div class="notice">Only tuition copied from a college record is prefilled. Food, transport, and other costs are user estimates. Scholarship eligibility is never guaranteed here.</div>' +
        '<form id="planForm" class="grid-2" style="margin-top:16px">' +
          '<div class="panel">' +
            fieldSelect("pCollege", "College (optional prefills demo tuition)", '<option value="">Manual entry</option>' + colleges.map(function (x) {
              return '<option value="' + x.id + '"' + (x.id === selected ? " selected" : "") + ">" + H.escapeHtml(x.shortName) + "</option>";
            }).join("")) +
            '<div class="field"><label>Annual tuition (₹)</label><input id="pTuition" type="number" value="' + (p.tuition || 0) + '"><p class="help">' + (c && c.tuitionFee != null ? "Prefill is " + c.dataStatus + ", not an official fee order." : "User-entered estimate.") + "</p></div>" +
            '<div class="field"><label>Hostel (₹ / year)</label><input id="pHostel" type="number" value="' + (p.hostel || 0) + '"></div>' +
            '<div class="field"><label>Food estimate (₹ / year)</label><input id="pFood" type="number" value="' + (p.food || 0) + '"></div>' +
            '<div class="field"><label>Transport estimate (₹ / year)</label><input id="pTransport" type="number" value="' + (p.transport || 0) + '"></div>' +
            '<div class="field"><label>Other expenses (₹ / year)</label><input id="pOther" type="number" value="' + (p.other || 0) + '"></div>' +
            '<div class="field"><label>Family four-year budget (₹)</label><input id="pBudget" type="number" value="' + (p.familyBudget || 0) + '"></div>' +
            '<button class="btn btn-dark" type="submit">Save estimate in this browser</button>' +
          "</div>" +
          '<div class="panel">' +
            "<h3>Totals</h3>" +
            kv("Estimated annual total", H.formatInr(annual)) +
            kv("Estimated four-year total", H.formatInr(four)) +
            kv("Difference vs family budget", (diff >= 0 ? "Within budget by " : "Above budget by ") + H.formatInr(Math.abs(diff))) +
            "<h3>Scholarships</h3><p>This dataset does not include verified, student-specific scholarship lists. Families may review state fee-reimbursement or national schemes on official portals and must confirm eligibility there. EduPath AI does not guarantee any scholarship.</p>" +
            '<button class="btn btn-line" type="button" data-go="#/family">Take this number to the Family Decision Room</button>' +
          "</div>" +
        "</form>" +
      "</div>"
    );
  }

  function viewShortlist() {
    var list = store.getShortlist().map(byId).filter(Boolean);
    return '<div class="page wrap"><h1 class="serif">Saved shortlist</h1><p class="meta">Stored locally in this browser.</p><div class="grid-3">' +
      (list.length ? list.map(function (c) { return collegeCard(c); }).join("") : '<div class="empty">No saved colleges yet.</div>') + "</div></div>";
  }

  function viewAbout() {
    return (
      '<div class="page wrap">' +
        '<div class="kicker">About & data sources</div>' +
        '<h1 class="serif">Transparent by design</h1>' +
        "<p>EduPath AI is a family decision-support platform for engineering education. The working demo starts with Andhra Pradesh districts and can accept additional states through JSON or CSV import.</p>" +
        "<h3>What we checked</h3>" +
        "<ul>" +
          '<li><a href="https://eapcet-sche.aptonline.in/EAPCET/collegeMaster" target="_blank" rel="noopener">AP EAPCET college master</a> is a public HTML directory. It is not connected as a live API in this app. The first visible table at review time listed pharmacy programmes, so we did not scrape it as a complete engineering census.</li>' +
          '<li><a href="https://eapcet-sche.aptonline.in/EAPCET/instProfile" target="_blank" rel="noopener">AP EAPCET institution profiles</a> is likewise a public listing page, not an authenticated data feed.</li>' +
          '<li><a href="https://dashboard.aishe.gov.in/" target="_blank" rel="noopener">AISHE dashboard</a> is an interactive government dashboard without a public JSON API used by this demo.</li>' +
        "</ul>" +
        "<h3>Data status labels</h3>" +
        "<p><span class='badge badge-verified'>Verified</span> would mean a field was copied from an official table we could access without bypassing restrictions. This demo currently has no such live feed.</p>" +
        "<p><span class='badge badge-partial'>Partially Verified</span> means identity fields such as a public website may be known while fees remain unavailable.</p>" +
        "<p><span class='badge badge-demo'>Demo Data</span> marks illustrative tuition, hostel, or other figures used so judges can exercise filters and scoring.</p>" +
        "<h3>Import more colleges</h3>" +
        '<p>Upload a JSON array or CSV with columns: id, officialName, state, district, city, address, institutionType, typeGroup, branches, tuitionFee, feeYear, hostelAvailable, hostelFee, websiteUrl, affiliation, accreditation, sourceUrls, dataStatus.</p>' +
        '<input type="file" id="importFile" accept=".json,.csv,application/json,text/csv">' +
        '<div class="chip-row"><button class="btn btn-line" id="exportJson" type="button">Download current dataset</button><button class="btn btn-line" id="resetData" type="button">Reset imported records</button></div>' +
        '<p id="importMsg" class="help"></p>' +
        "<h3>Limitations</h3>" +
        "<ul><li>No cutoff predictor.</li><li>No claim of covering every college in every district.</li><li>No cross-device sync.</li><li>Recommendation scoring is rule-based and explainable.</li></ul>" +
      "</div>"
    );
  }

  function bindPage(route) {
    document.querySelectorAll("[data-go]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); go(el.getAttribute("data-go")); });
    });
    document.querySelectorAll("[data-compare]").forEach(function (el) {
      el.addEventListener("click", function () { toggleCompare(el.getAttribute("data-compare")); });
    });
    document.querySelectorAll("[data-save]").forEach(function (el) {
      el.addEventListener("click", function () { toggleShort(el.getAttribute("data-save")); });
    });
    document.querySelectorAll("[data-uncompare]").forEach(function (el) {
      el.addEventListener("click", function () {
        store.setCompare(store.getCompare().filter(function (id) { return id !== el.getAttribute("data-uncompare"); }));
        render();
      });
    });

    if (route.name === "home") bindHome();
    if (route.name === "explore") bindExplore(route);
    if (route.name === "recommend") bindRecommend();
    if (route.name === "family") bindFamily();
    if (route.name === "planner") bindPlanner();
    if (route.name === "about") bindAbout();
    if (route.name === "compare") {
      var clear = document.getElementById("clearCompare");
      if (clear) clear.onclick = function () { store.setCompare([]); render(); };
    }
  }

  function bindHome() {
    fillStateDistrict("heroState", "heroDistrict", "Andhra Pradesh", "all");
    document.getElementById("heroState").addEventListener("change", function () {
      fillStateDistrict("heroState", "heroDistrict", val("heroState"), "all");
    });
    document.getElementById("heroSearch").addEventListener("submit", function (e) {
      e.preventDefault();
      var qs = new URLSearchParams({
        state: val("heroState"),
        district: val("heroDistrict"),
        q: val("heroKeyword")
      });
      go("#/explore?" + qs.toString());
    });
    document.getElementById("tryDemo").onclick = runDemo;
  }

  function fillStateDistrict(stateId, distId, state, district) {
    var s = document.getElementById(stateId);
    var d = document.getElementById(distId);
    if (!s || !d) return;
    s.innerHTML = optionList(EDUPATH_STATES, state, true);
    d.innerHTML = optionList(districtsFor(s.value), district, true);
  }

  function bindExplore() {
    fillStateDistrict("fState", "fDistrict", val("fState") || "Andhra Pradesh", val("fDistrict") || "all");
    var params = new URLSearchParams((location.hash.split("?")[1] || ""));
    if (params.get("state")) document.getElementById("fState").value = params.get("state");
    fillStateDistrict("fState", "fDistrict", val("fState"), params.get("district") || "all");
    if (params.get("q")) document.getElementById("fKeyword").value = params.get("q");
    document.getElementById("fState").addEventListener("change", function () {
      fillStateDistrict("fState", "fDistrict", val("fState"), "all");
      applyExplore();
    });
    ["fDistrict", "fCity", "fKeyword", "fType", "fFee", "fHostel", "fAff", "fSort"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", H.debounce(applyExplore, 120));
      document.getElementById(id).addEventListener("change", applyExplore);
    });
    document.getElementById("branchChips").addEventListener("click", function (e) {
      var t = e.target.closest("[data-branch]");
      if (!t) return;
      t.classList.toggle("active");
      applyExplore();
    });
    function clear() {
      go("#/explore");
      setTimeout(function () {
        ["fCity", "fKeyword"].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ""; });
        document.querySelectorAll("[data-branch]").forEach(function (c) { c.classList.remove("active"); });
        applyExplore();
      }, 0);
    }
    var b = document.getElementById("clearFilters");
    if (b) b.onclick = clear;
    applyExplore();
    document.getElementById("resultGrid").addEventListener("click", function (e) {
      if (e.target.id === "clearFilters2") clear();
    });
  }

  function bindRecommend() {
    var prefs = store.getPrefs() || demoPrefs();
    document.getElementById("wType").value = prefs.typeGroup || "any";
    document.getElementById("wHostel").value = prefs.hostel || "any";
    document.getElementById("wWomen").checked = !!prefs.womenOnly;
    fillDistrictMulti(val("wState"), prefs.districts);
    document.getElementById("wState").addEventListener("change", function () { fillDistrictMulti(val("wState"), []); });
    document.querySelector(".wizard-nav").addEventListener("click", function (e) {
      var b = e.target.closest("[data-step]");
      if (!b) return;
      wizardStep = Number(b.getAttribute("data-step"));
      showWizardPane();
    });
    document.getElementById("branchChips") && null;
    document.querySelectorAll("[data-wbranch]").forEach(function (ch) {
      ch.addEventListener("click", function () { ch.classList.toggle("active"); });
    });
    document.getElementById("wizNext").onclick = function () { wizardStep = Math.min(6, wizardStep + 1); showWizardPane(); };
    document.getElementById("wizBack").onclick = function () { wizardStep = Math.max(1, wizardStep - 1); showWizardPane(); };
    document.getElementById("wizardForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var p = collectWizard();
      if (!p.branches.length) {
        document.getElementById("wizError").textContent = "Select at least one preferred branch.";
        wizardStep = 2; showWizardPane();
        return;
      }
      if (p.rank != null && (p.rank < 1 || p.rank > 500000)) {
        document.getElementById("wizError").textContent = "Enter a realistic rank or leave the field blank.";
        wizardStep = 1; showWizardPane();
        return;
      }
      document.getElementById("wizError").textContent = "";
      store.setPrefs(p);
      wizardStep = 6;
      showWizardPane();
      renderWizardResults(p);
    });
    showWizardPane();
  }

  function bindFamily() {
    document.getElementById("familyForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = store.getFamily();
      f.studentPriorities = this.studentPriorities.value;
      f.parentPriorities = this.parentPriorities.value;
      f.budgetConcerns = this.budgetConcerns.value;
      f.notes = this.notes.value;
      f.decisionSummary = this.decisionSummary.value;
      f.preferredLocations = document.getElementById("famLoc").value;
      f.collegeNotes = f.collegeNotes || {};
      document.querySelectorAll("[data-pro]").forEach(function (t) {
        var id = t.getAttribute("data-pro");
        f.collegeNotes[id] = f.collegeNotes[id] || { pro: "", con: "" };
        f.collegeNotes[id].pro = t.value;
      });
      document.querySelectorAll("[data-con]").forEach(function (t) {
        var id = t.getAttribute("data-con");
        f.collegeNotes[id] = f.collegeNotes[id] || { pro: "", con: "" };
        f.collegeNotes[id].con = t.value;
      });
      store.setFamily(f);
      toast("Family notes saved in this browser.");
    });
    document.getElementById("printFamily").onclick = function () {
      var f = store.getFamily();
      document.getElementById("printArea").innerHTML =
        "<h1>EduPath AI family decision report</h1>" +
        "<p>Local browser copy · not an official counselling document</p>" +
        "<h3>Student priorities</h3><p>" + H.escapeHtml(f.studentPriorities) + "</p>" +
        "<h3>Parent priorities</h3><p>" + H.escapeHtml(f.parentPriorities) + "</p>" +
        "<h3>Budget concerns</h3><p>" + H.escapeHtml(f.budgetConcerns) + "</p>" +
        "<h3>Decision summary</h3><p>" + H.escapeHtml(f.decisionSummary) + "</p>" +
        "<h3>Notes</h3><p>" + H.escapeHtml(f.notes) + "</p>";
      document.getElementById("printArea").classList.remove("print-only");
      window.print();
      document.getElementById("printArea").classList.add("print-only");
    };
  }

  function bindPlanner() {
    document.getElementById("pCollege").addEventListener("change", function () {
      go("#/planner?college=" + encodeURIComponent(this.value));
    });
    document.getElementById("planForm").addEventListener("submit", function (e) {
      e.preventDefault();
      store.setPlanner({
        collegeId: val("pCollege"),
        tuition: Number(val("pTuition")),
        hostel: Number(val("pHostel")),
        food: Number(val("pFood")),
        transport: Number(val("pTransport")),
        other: Number(val("pOther")),
        familyBudget: Number(val("pBudget"))
      });
      toast("Planner saved in this browser.");
      render();
    });
  }

  function bindAbout() {
    document.getElementById("importFile").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var incoming = file.name.toLowerCase().indexOf(".csv") !== -1
            ? EduImport.parseCsv(String(reader.result))
            : EduImport.parseJsonRecords(String(reader.result));
          store.setImported(EduImport.mergeColleges(store.getImported(), incoming));
          document.getElementById("importMsg").textContent = "Imported " + incoming.length + " records. They remain in this browser until reset.";
          colleges = allColleges();
        } catch (err) {
          document.getElementById("importMsg").textContent = "Import failed: " + err.message;
        }
      };
      reader.readAsText(file);
    });
    document.getElementById("exportJson").onclick = function () {
      var blob = new Blob([EduImport.toJson(allColleges())], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "edupath-colleges.json";
      a.click();
    };
    document.getElementById("resetData").onclick = function () {
      store.setImported([]);
      document.getElementById("importMsg").textContent = "Imported records cleared. Built-in demo dataset restored.";
    };
  }

  function toggleCompare(id) {
    var ids = store.getCompare();
    if (ids.indexOf(id) !== -1) ids = ids.filter(function (x) { return x !== id; });
    else {
      if (ids.length >= 4) { toast("You can compare up to four colleges."); return; }
      ids.push(id);
    }
    store.setCompare(ids);
    document.getElementById("compareCount").textContent = ids.length;
    toast("Comparison list updated.");
  }

  function toggleShort(id) {
    var ids = store.getShortlist();
    if (ids.indexOf(id) !== -1) ids = ids.filter(function (x) { return x !== id; });
    else ids.push(id);
    store.setShortlist(ids);
    document.getElementById("shortCount").textContent = ids.length;
    toast("Shortlist updated in this browser.");
  }

  function runDemo() {
    store.setPrefs(demoPrefs());
    wizardStep = 6;
    go("#/recommend");
    setTimeout(function () {
      if (document.getElementById("wizardResults")) {
        renderWizardResults(demoPrefs());
        toast("Demo preferences loaded: AP EAPCET rank 18,500, CSE & AI/ML, coastal AP districts, ₹1.5L budget.");
      }
    }, 50);
  }

  document.getElementById("menuToggle").addEventListener("click", function () {
    document.getElementById("mobileNav").classList.toggle("open");
  });
  document.getElementById("tryDemoNav").addEventListener("click", runDemo);
  window.addEventListener("hashchange", render);
  colleges = allColleges();
  render();
})();
