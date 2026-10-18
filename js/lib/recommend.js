(function (global) {
  function labels() {
    return global.EDUPATH_BRANCH_LABELS || {};
  }

  function scoreCollege(college, prefs) {
    prefs = prefs || {};
    var reasons = [];
    var missing = [];
    var score = 0;

    var preferredBranches = prefs.branches || [];
    var matchedBranches = (college.branches || []).filter(function (b) {
      return preferredBranches.indexOf(b) !== -1;
    });
    if (!preferredBranches.length) {
      score += 18;
    } else if (matchedBranches.length) {
      score += 30;
      reasons.push(
        "Matches your preferred branch" +
          (matchedBranches.length > 1 ? "es" : "") +
          ": " +
          matchedBranches.map(function (b) { return labels()[b] || b; }).join(", ") +
          "."
      );
    } else {
      missing.push("This record does not list your preferred engineering branch.");
    }

    var preferredDistricts = prefs.districts || [];
    if (prefs.state && college.state === prefs.state) {
      score += 10;
      if (!preferredDistricts.length) {
        reasons.push("Located in your preferred state: " + college.state + ".");
      }
    }
    if (preferredDistricts.length) {
      if (preferredDistricts.indexOf(college.district) !== -1) {
        score += 15;
        reasons.push("Located in your preferred district: " + college.district + ".");
      } else if (prefs.state && college.state === prefs.state) {
        score += 4;
        reasons.push("Same preferred state, but not in a selected district.");
      }
    } else if (!prefs.state) {
      score += 12;
    }

    var budget = Number(prefs.budget);
    if (!budget) {
      score += 12;
    } else if (college.tuitionFee == null) {
      score += 8;
      missing.push("Annual tuition fee is not available in this dataset.");
    } else if (college.tuitionFee <= budget) {
      score += 25;
      reasons.push("Listed tuition fits your stated annual budget of " + format(budget) + ".");
    } else {
      var over = college.tuitionFee - budget;
      score += Math.max(0, 10 - Math.round((over / budget) * 10));
      reasons.push("Listed tuition is above your stated budget by " + format(over) + ".");
    }

    if (!prefs.typeGroup || prefs.typeGroup === "any") {
      score += 6;
    } else if (college.typeGroup === prefs.typeGroup) {
      score += 10;
      reasons.push("Matches your " + (prefs.typeGroup === "government" ? "government" : "private") + " institution preference.");
    } else {
      missing.push("Institution type differs from your stated preference.");
    }

    if (prefs.hostel === "yes") {
      if (college.hostelAvailable === "Yes") {
        score += 10;
        reasons.push("Hostel availability is listed as Yes in this dataset.");
      } else if (college.hostelAvailable === "Unknown") {
        score += 4;
        missing.push("Hostel availability is unknown for this record.");
      } else {
        missing.push("Hostel is not listed as available.");
      }
    } else {
      score += 6;
    }

    if (prefs.womenOnly && !college.womenOnly) {
      score -= 8;
      missing.push("You asked for a women-only campus and this record is not labelled as such.");
    } else if (prefs.womenOnly && college.womenOnly) {
      score += 6;
      reasons.push("Listed as a women-only campus in this dataset.");
    }

    if (college.tuitionFee == null) missing.push("Confirm current AFRC / university fee before budgeting.");
    if (!college.accreditation) missing.push("Accreditation is not verified in this dataset.");
    if (college.placementMedianLpa == null) missing.push("Verified placement statistics are not available.");
    if (prefs.rank) {
      missing.push(
        "Official year-specific closing ranks are not in this dataset, so a rank of " +
          prefs.rank +
          " cannot confirm admission eligibility."
      );
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    var label = "Needs Eligibility Verification";
    if (score >= 78) label = "Strong Preference Match";
    else if (score >= 52) label = "Possible Match";

    return {
      college: college,
      score: score,
      label: label,
      matchedBranches: matchedBranches,
      reasons: reasons,
      missing: unique(missing),
      budgetFit: college.tuitionFee == null ? "unknown" : (budget && college.tuitionFee <= budget ? "within" : (budget ? "above" : "unknown"))
    };
  }

  function recommend(colleges, prefs) {
    return (colleges || [])
      .map(function (c) { return scoreCollege(c, prefs); })
      .sort(function (a, b) { return b.score - a.score; });
  }

  function format(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function unique(list) {
    var seen = {};
    return list.filter(function (item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }

  global.EduRecommend = {
    scoreCollege: scoreCollege,
    recommend: recommend
  };
})(window);
