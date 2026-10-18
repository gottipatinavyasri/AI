(function (global) {
  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function matchesKeyword(college, keyword) {
    if (!keyword) return true;
    var hay = [
      college.officialName,
      college.shortName,
      college.id,
      college.city,
      college.district,
      college.address,
      college.affiliation
    ].join(" ").toLowerCase();
    return hay.indexOf(keyword) !== -1;
  }

  function matchesBranches(college, branches) {
    if (!branches || !branches.length) return true;
    return branches.some(function (b) {
      return college.branches && college.branches.indexOf(b) !== -1;
    });
  }

  function matchesType(college, typeGroup) {
    if (!typeGroup || typeGroup === "all") return true;
    return college.typeGroup === typeGroup;
  }

  function matchesHostel(college, hostel) {
    if (!hostel || hostel === "all") return true;
    if (hostel === "yes") return college.hostelAvailable === "Yes";
    if (hostel === "no") return college.hostelAvailable === "No";
    if (hostel === "unknown") return college.hostelAvailable === "Unknown" || !college.hostelAvailable;
    return true;
  }

  function matchesAffiliation(college, affiliation) {
    if (!affiliation || affiliation === "all") return true;
    var value = normalize(college.affiliation);
    return value.indexOf(normalize(affiliation)) !== -1;
  }

  function matchesFee(college, maxFee, includeUnknownFees) {
    if (maxFee == null || maxFee === "") return true;
    if (college.tuitionFee == null) return includeUnknownFees !== false;
    return Number(college.tuitionFee) <= Number(maxFee);
  }

  function filterColleges(colleges, filters) {
    filters = filters || {};
    var keyword = normalize(filters.keyword);
    return (colleges || []).filter(function (college) {
      if (filters.state && filters.state !== "all" && college.state !== filters.state) return false;
      if (filters.district && filters.district !== "all" && college.district !== filters.district) return false;
      if (filters.city && normalize(college.city).indexOf(normalize(filters.city)) === -1) return false;
      if (!matchesKeyword(college, keyword)) return false;
      if (!matchesBranches(college, filters.branches)) return false;
      if (!matchesType(college, filters.typeGroup)) return false;
      if (!matchesFee(college, filters.maxFee, filters.includeUnknownFees)) return false;
      if (!matchesHostel(college, filters.hostel)) return false;
      if (!matchesAffiliation(college, filters.affiliation)) return false;
      return true;
    });
  }

  function sortColleges(colleges, sortBy, prefs) {
    var list = (colleges || []).slice();
    var rec = global.EduRecommend;
    list.sort(function (a, b) {
      if (sortBy === "fees") {
        var fa = a.tuitionFee == null ? Number.POSITIVE_INFINITY : a.tuitionFee;
        var fb = b.tuitionFee == null ? Number.POSITIVE_INFINITY : b.tuitionFee;
        if (fa !== fb) return fa - fb;
        return a.officialName.localeCompare(b.officialName);
      }
      if (sortBy === "match" && rec && prefs) {
        return rec.scoreCollege(b, prefs).score - rec.scoreCollege(a, prefs).score;
      }
      return a.officialName.localeCompare(b.officialName);
    });
    return list;
  }

  function uniqueValues(colleges, key) {
    var set = {};
    (colleges || []).forEach(function (c) {
      if (c[key]) set[c[key]] = true;
    });
    return Object.keys(set).sort();
  }

  global.EduFilter = {
    filterColleges: filterColleges,
    sortColleges: sortColleges,
    uniqueValues: uniqueValues,
    matchesKeyword: matchesKeyword
  };
})(window);
