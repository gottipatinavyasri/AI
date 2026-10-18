# EduPath AI Automated Validation Test Suite

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   EduPath AI - Hackathon Validation Test Suite  " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$script:testResults = @()
function Assert-Check {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$Detail
    )
    if ($Condition) {
        Write-Host " [PASS] $TestName" -ForegroundColor Green
        $script:testResults += [PSCustomObject]@{ Test = $TestName; Status = "PASS"; Detail = $Detail }
    } else {
        Write-Host " [FAIL] $TestName - $Detail" -ForegroundColor Red
        $script:testResults += [PSCustomObject]@{ Test = $TestName; Status = "FAIL"; Detail = $Detail }
    }
}

# 1. File Structure Checks
Assert-Check "index.html exists at root" (Test-Path "index.html") "Root index.html verified"
Assert-Check "index.html exists in edupath-ai" (Test-Path "edupath-ai/index.html") "edupath-ai/index.html verified"
Assert-Check "package.json exists" (Test-Path "package.json") "Root package.json verified"
Assert-Check "vercel.json exists" (Test-Path "vercel.json") "Root vercel.json verified"
Assert-Check "netlify.toml exists" (Test-Path "netlify.toml") "Root netlify.toml verified"
Assert-Check ".gitignore exists" (Test-Path ".gitignore") "Root .gitignore verified"
Assert-Check ".env.example exists" (Test-Path ".env.example") "Root .env.example verified"

# 2. Content & Mandatory String Checks in index.html
$content = Get-Content "index.html" -Raw

Assert-Check "Mandatory Hero Headline matches" ($content.Contains("Your future deserves a decision") -and $content.Contains("made together.")) "Headline found"
Assert-Check "Mandatory Project Tagline matches" ($content.Contains("One Decision. Two Perspectives. One Better Future.")) "Tagline found"
Assert-Check "Mandatory Primary CTA exists" ($content.Contains("Build My College Shortlist")) "Primary CTA found"
Assert-Check "Mandatory Secondary CTA exists" ($content.Contains("Explore How It Works")) "Secondary CTA found"

# 3. Value Propositions & How-It-Works
Assert-Check "Value Prop 1: Better College Matches" ($content.Contains("Better College Matches")) "Better Matches found"
Assert-Check "Value Prop 2: Financial Clarity" ($content.Contains("Financial Clarity")) "Financial Clarity found"
Assert-Check "Value Prop 3: Family Alignment" ($content.Contains("Family Alignment")) "Family Alignment found"
Assert-Check "How-It-Works section exists" ($content.Contains("How EduPath AI Guides Your Family")) "How it works found"

# 4. Core Features Checks
Assert-Check "Feature 1: Student Profile Form" ($content.Contains("profileForm") -and $content.Contains("examSelect") -and $content.Contains("rankSlider")) "Profile form found"
Assert-Check "Feature 2: Smart College Matching" ($content.Contains("targetCollegesContainer") -and $content.Contains("reachCollegesContainer") -and $content.Contains("safeCollegesContainer")) "3-tier matching found"
Assert-Check "Feature 3: College Discovery Directory" ($content.Contains("discoverySearchInput") -and $content.Contains("discoveryTypeFilter")) "Search and filter directory found"
Assert-Check "Feature 4: Side-by-Side Comparison with Highlights" ($content.Contains("bestAffordableName") -and $content.Contains("bestCareerName") -and $content.Contains("bestBalancedName")) "Comparison with 3 best-fit badges found"
Assert-Check "Feature 5: Family Decision Room with Pros/Cons" ($content.Contains("family-room") -and $content.Contains("prosConsContainer") -and $content.Contains("checklistContainer") -and $content.Contains("readinessProgressBar")) "Family Decision Room with pros & cons found"
Assert-Check "Feature 6: Budget and Scholarship Planner" ($content.Contains("financial-planner") -and $content.Contains("calculateFinances") -and $content.Contains("Tuition Fee Waiver Scheme")) "Budget & Scholarship planner found"
Assert-Check "Feature 7: Explainable Scoring Methodology" ($content.Contains("methodologyModal") -and $content.Contains("calculateCollegeScore")) "Scoring formula found"
Assert-Check "Feature 8: Try Demo 1-Click Feature" ($content.Contains("loadDemoScenario")) "Demo function found"
Assert-Check "Feature 9: Palette and Styling Polish" ($content.Contains("forest-") -and $content.Contains("ivory-") -and $content.Contains("sage-") -and $content.Contains("amber-")) "Refined palette found"
Assert-Check "Feature 10: Responsible Data Handling Disclaimer" ($content.Contains("DEMO DATA") -and $content.Contains("Responsible Data Handling")) "Disclaimer found"

# 5. JSON Validation
try {
    $pkg = Get-Content "package.json" -Raw | ConvertFrom-Json
    Assert-Check "package.json is valid JSON" ($pkg.name -eq "edupath-ai") "Valid JSON syntax"
} catch {
    Assert-Check "package.json is valid JSON" $false $_.Exception.Message
}

try {
    $vcl = Get-Content "vercel.json" -Raw | ConvertFrom-Json
    Assert-Check "vercel.json is valid JSON" ($vcl.version -eq 2) "Valid Vercel configuration"
} catch {
    Assert-Check "vercel.json is valid JSON" $false $_.Exception.Message
}

Write-Host "-------------------------------------------------" -ForegroundColor Cyan
$passCount = ($script:testResults | Where-Object { $_.Status -eq "PASS" }).Count
$totalCount = $script:testResults.Count
Write-Host "Result: $passCount of $totalCount tests passed successfully." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
