# EduPath AI — Find the Right College. Build the Right Future.

**AI-Enabled Family Decision-Support Platform for Engineering Education**

EduPath AI brings college discovery and family decision support into **one single-page application**. The landing page, district-wise college directory, explainable recommendations, college comparison, Family Decision Room, shortlist, and affordability planner are modules of the same website—not separate websites.

## Features

- Premium campus-image hero and responsive forest-green/ivory design.
- College directory with search and available filters.
- Preference-based, explainable college recommendations.
- College detail pages, comparison, and shortlist.
- Family Decision Room for student/parent priorities and notes.
- Affordability planner and data-source/limitations section.
- Demo mode, local-browser persistence, and CSV/JSON import support where implemented.

## Run locally

This is a static HTML/CSS/JavaScript application. Easiest: open `index.html` in a modern browser. For a local server, from this folder run:

```bash
npx serve . -l 3000
```

Then open `http://localhost:3000`.

## Deploy

The project includes Vercel and Netlify configuration files. Import this folder/repository into Vercel or Netlify as a static site. No build command is required for the plain static app; publish the project root.

## Data accuracy disclaimer

College records included for demonstration may be incomplete or illustrative. A `Verified` label should only be used when the field has been checked against a reliable official source. Do not rely on demo values for admission or financial decisions. Confirm fees, courses, cutoffs, placement statistics, accreditation, and scholarships directly with the respective official institution or admissions authority. The directory only covers records currently present in the dataset; it does not guarantee that every college in every district is included.

Suggested official sources to check and cite when adding records:
- Andhra Pradesh EAPCET college directory: https://eapcet-sche.aptonline.in/EAPCET/collegeMaster
- Andhra Pradesh EAPCET institution profiles: https://eapcet-sche.aptonline.in/EAPCET/instProfile
- AISHE directory: https://dashboard.aishe.gov.in/

## Project structure

- `index.html` — the single application entry point
- `styles.css` — shared visual design system
- `js/app.js` — navigation and UI rendering
- `js/data/` — district and college data
- `js/lib/` — filtering, recommendation, import, storage, and helpers
- `images/` — campus and supporting images
- `data/` — sample import data
- `tests/` — available logic checks

## Privacy

Shortlists, family notes, and imported records may be stored in the current browser only. This is not cloud synchronization between users or devices.
