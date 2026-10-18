(function (global) {
  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatInr(amount) {
    if (amount == null || amount === "" || Number.isNaN(Number(amount))) return "Not available";
    return "₹" + Number(amount).toLocaleString("en-IN");
  }

  function branchLabel(id) {
    return (global.EDUPATH_BRANCH_LABELS && global.EDUPATH_BRANCH_LABELS[id]) || id;
  }

  function na(value) {
    if (value == null || value === "" || value === "Unknown") return "Not available";
    return value;
  }

  function statusClass(status) {
    if (status === "Verified") return "badge-verified";
    if (status === "Partially Verified") return "badge-partial";
    return "badge-demo";
  }

  function typeLabel(college) {
    return college.typeGroup === "government" ? "Government" : "Private";
  }

  function completeness(college) {
    var fields = [
      college.officialName,
      college.district,
      college.city,
      college.institutionType,
      college.branches && college.branches.length,
      college.tuitionFee != null,
      college.hostelAvailable && college.hostelAvailable !== "Unknown",
      college.websiteUrl,
      college.affiliation,
      college.accreditation
    ];
    var filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  global.EduHelpers = {
    escapeHtml: escapeHtml,
    formatInr: formatInr,
    branchLabel: branchLabel,
    na: na,
    statusClass: statusClass,
    typeLabel: typeLabel,
    completeness: completeness,
    debounce: debounce
  };
})(window);
