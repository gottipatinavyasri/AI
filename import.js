(function (global) {
  var REQUIRED = ["id", "officialName", "state", "district"];

  function parseJsonRecords(text) {
    var data = JSON.parse(text);
    if (Array.isArray(data)) return data.map(normalizeRecord);
    if (data && Array.isArray(data.colleges)) return data.colleges.map(normalizeRecord);
    throw new Error("JSON must be an array of colleges or an object with a colleges array.");
  }

  function parseCsv(text) {
    var rows = splitCsv(text);
    if (!rows.length) return [];
    var header = rows[0].map(function (h) { return h.trim(); });
    return rows.slice(1).filter(function (r) { return r.join("").trim(); }).map(function (row) {
      var obj = {};
      header.forEach(function (key, i) { obj[key] = row[i]; });
      return normalizeRecord(obj);
    });
  }

  function splitCsv(text) {
    var rows = [];
    var row = [];
    var cur = "";
    var inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
      else if (ch !== "\r") cur += ch;
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function normalizeRecord(raw) {
    if (!raw || !raw.id || !raw.officialName) {
      throw new Error("Each college needs at least id and officialName.");
    }
    var branches = raw.branches;
    if (typeof branches === "string") {
      branches = branches.split(/[|;,]/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    var sources = raw.sourceUrls;
    if (typeof sources === "string") {
      sources = sources.split(/[|;,]/).map(function (s) { return s.trim(); }).filter(Boolean);
    }
    var status = raw.dataStatus || "Demo Data";
    if (["Verified", "Partially Verified", "Demo Data"].indexOf(status) === -1) status = "Demo Data";
    return {
      id: String(raw.id).trim(),
      officialName: String(raw.officialName).trim(),
      shortName: raw.shortName || raw.officialName,
      state: raw.state || "Andhra Pradesh",
      district: raw.district || "Not available",
      city: raw.city || "Not available",
      address: raw.address || "Not available",
      institutionType: raw.institutionType || "Not available",
      typeGroup: raw.typeGroup === "government" ? "government" : "private",
      branches: branches || [],
      tuitionFee: raw.tuitionFee === "" || raw.tuitionFee == null ? null : Number(raw.tuitionFee),
      feeYear: raw.feeYear || null,
      hostelAvailable: raw.hostelAvailable || "Unknown",
      hostelFee: raw.hostelFee === "" || raw.hostelFee == null ? null : Number(raw.hostelFee),
      websiteUrl: raw.websiteUrl || null,
      affiliation: raw.affiliation || null,
      accreditation: raw.accreditation || null,
      placementMedianLpa: raw.placementMedianLpa === "" || raw.placementMedianLpa == null ? null : Number(raw.placementMedianLpa),
      placementHighestLpa: raw.placementHighestLpa === "" || raw.placementHighestLpa == null ? null : Number(raw.placementHighestLpa),
      entranceNote: raw.entranceNote || "",
      sourceUrls: sources || [],
      lastVerifiedDate: raw.lastVerifiedDate || new Date().toISOString().slice(0, 10),
      dataStatus: status,
      notes: raw.notes || "Imported record. Verify all fields before using them for counselling decisions.",
      campusImage: raw.campusImage || "images/campus-1.jpg",
      establishedYear: raw.establishedYear ? Number(raw.establishedYear) : null,
      womenOnly: raw.womenOnly === true || raw.womenOnly === "true"
    };
  }

  function mergeColleges(base, incoming) {
    var map = {};
    (base || []).forEach(function (c) { map[c.id] = c; });
    (incoming || []).forEach(function (c) { map[c.id] = c; });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function toJson(colleges) {
    return JSON.stringify(colleges, null, 2);
  }

  global.EduImport = {
    parseJsonRecords: parseJsonRecords,
    parseCsv: parseCsv,
    normalizeRecord: normalizeRecord,
    mergeColleges: mergeColleges,
    toJson: toJson,
    REQUIRED: REQUIRED
  };
})(window);
