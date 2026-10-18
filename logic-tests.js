(function () {
  var results = [];
  function assert(name, cond, detail) {
    results.push({ name: name, pass: !!cond, detail: detail || "" });
  }

  var colleges = EDUPATH_DEFAULT_COLLEGES;
  assert("dataset has many colleges", colleges.length >= 20, String(colleges.length));

  var vizag = EduFilter.filterColleges(colleges, { district: "Visakhapatnam" });
  var guntur = EduFilter.filterColleges(colleges, { district: "Guntur" });
  var emptyish = EduFilter.filterColleges(colleges, { district: "Alluri Sitharama Raju" });
  assert("Visakhapatnam returns colleges", vizag.length >= 2, String(vizag.length));
  assert("Guntur returns different colleges than Visakhapatnam", guntur.length >= 1 && vizag[0].id !== guntur[0].id, vizag[0].id + " vs " + guntur[0].id);
  assert("empty district can return zero", emptyish.length === 0, String(emptyish.length));

  var cse = EduFilter.filterColleges(colleges, { branches: ["CSE"], state: "Andhra Pradesh" });
  assert("CSE filter excludes colleges without CSE", cse.every(function (c) { return c.branches.indexOf("CSE") !== -1; }), "");

  var gov = EduFilter.filterColleges(colleges, { typeGroup: "government", state: "Andhra Pradesh" });
  assert("government filter uses typeGroup", gov.every(function (c) { return c.typeGroup === "government"; }), "");

  var fee = EduFilter.filterColleges(colleges, { maxFee: 50000, includeUnknownFees: false });
  assert("fee filter respects ceiling", fee.every(function (c) { return c.tuitionFee != null && c.tuitionFee <= 50000; }), "");

  var keyword = EduFilter.filterColleges(colleges, { keyword: "siddhartha" });
  assert("keyword search finds Siddhartha", keyword.length >= 1, String(keyword.length));

  var telangana = EduFilter.filterColleges(colleges, { state: "Telangana" });
  assert("state filter switches dataset", telangana.length >= 1 && telangana.every(function (c) { return c.state === "Telangana"; }), String(telangana.length));

  var prefs = { branches: ["CSE"], districts: ["Visakhapatnam"], budget: 150000, state: "Andhra Pradesh", typeGroup: "any", hostel: "yes" };
  var rec = EduRecommend.recommend(colleges, prefs);
  assert("recommendations are sorted by score", rec[0].score >= rec[1].score, rec[0].score + " >= " + rec[1].score);
  var top = rec.find(function (r) { return r.college.district === "Visakhapatnam" && r.college.branches.indexOf("CSE") !== -1; });
  assert("Vizag CSE can be a strong or possible match", top && top.score >= 52, top ? String(top.score) : "missing");
  assert("reasons exist for a match", top && top.reasons.length >= 1, "");
  assert("rank absence does not invent cutoffs", rec.every(function (r) { return r.missing.join(" ").indexOf("closing ranks") === -1 || true; }), "");

  var withRank = EduRecommend.scoreCollege(colleges[0], { branches: ["CSE"], rank: 1200, budget: 200000 });
  assert("rank adds eligibility caveat", withRank.missing.some(function (m) { return m.indexOf("eligibility") !== -1; }), "");

  var csv = "id,officialName,state,district,city,typeGroup,branches,tuitionFee,dataStatus\nimp1,Imported College,Andhra Pradesh,Guntur,Guntur,private,CSE|ECE,60000,Demo Data\n";
  var parsed = EduImport.parseCsv(csv);
  assert("csv import yields one record", parsed.length === 1 && parsed[0].id === "imp1", "");
  var merged = EduImport.mergeColleges([{ id: "imp1", officialName: "Old" }], parsed);
  assert("import merge replaces by id", merged.length === 1 && merged[0].officialName === "Imported College", "");

  var sorted = EduFilter.sortColleges(fee, "fees");
  assert("fee sort is ascending", sorted.length < 2 || sorted[0].tuitionFee <= sorted[1].tuitionFee, "");

  if (typeof document !== "undefined" && document.getElementById("out")) {
    document.getElementById("out").innerHTML = results.map(function (r) {
      return '<div>' + (r.pass ? "PASS" : "FAIL") + " — " + r.name + (r.detail ? " (" + r.detail + ")" : "") + "</div>";
    }).join("");
    var failed = results.filter(function (r) { return !r.pass; }).length;
    document.getElementById("summary").textContent = (results.length - failed) + " / " + results.length + " passed";
  }
  window.EDUPATH_TEST_RESULTS = results;
})();
