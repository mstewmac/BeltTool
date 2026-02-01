# BeltTool — Project Context

## What This Is

A belt designer and order tool for **Deep Cove Leather Workshop**. Built with React 19, TypeScript, and Vite 7. Generates 11x17 landscape PDFs with 1:1 scale cutting templates for production use.

Live at: Netlify (connected to GitHub repo `mstewmac/BeltTool`)

---

## Architecture

- **Frontend only** — no backend, no database
- Orders saved to `localStorage` for history
- PDFs generated client-side with `jsPDF`
- Static hosting on Netlify, auto-deploys from `main` branch

### Key Files

| File | Purpose |
|------|---------|
| `src/types.ts` | All TypeScript types (BeltDesign, BeltOrder, etc.) |
| `src/constants.ts` | Belt specs, leather colors, buckle options, pricing |
| `src/App.tsx` | Main layout, state management, waist sizing |
| `src/utils/pdfGenerator.ts` | Full PDF generation (page 1 summary + page 2 templates) |
| `src/utils/pricing.ts` | Price calculation logic |
| `src/utils/orderUtils.ts` | Order number generation, localStorage persistence |
| `src/components/BeltPreview/` | Live SVG preview with leather textures |
| `src/components/DesignControls/` | All design option controls |
| `src/components/CustomerInfo/` | Customer name, phone, email, notes |
| `src/components/PriceDisplay/` | Price breakdown display |
| `src/components/OrderHistory/` | Order history panel (from localStorage) |

### Reference Images

- `referenceImages/EndReferences/` — SVG end shapes (Round, Square, SquareTaper, Spear)
- `referenceImages/BuckleTemplateReference/` — SVG buckle template proportions
- `referenceImages/LeatherImages/` — Source leather texture photos
- `referenceImages/BuckleImages/` — Source buckle photos
- `public/leather/` and `public/buckles/` — Production copies served by the app

---

## Features Built

### Design Options
- **Belt width**: 1", 1.25", 1.5", 1.75"
- **Leather colors**: Black Saddle, Light Brown, Dark Brown, Old World Brown (real texture images)
- **Leather finish**: Smooth, Matte, Oiled, Waxed
- **Belt style**: Casual, Dress, Western
- **End shapes**: Round, Square, Square Taper, Spear (from reference SVGs)
- **Buckles**: Square Brass, Round Silver (with photos)
- **Buckle attachment**: Additional Piece or Integrated

### Measurements
- **Pant Waist Size** — drives all template calculations
- **Actual Waist Size** — optional reference measurement for production
- Total length = waist + 6" buckle allowance + 5" hole allowance (+2.5" fold-back if integrated)

### Belt Specs (in `constants.ts`)
- 8 holes, 1" spacing, first hole 5" from tip
- Hole diameter: 5/32"
- Buckle slot: 3/4" x 3/16"

### PDF Output (11x17 Landscape)
- **Page 1**: Order summary — customer info, spec table, belt illustration, pricing, lead time
- **Page 2**: 1:1 scale cutting templates
  - **Template A**: Tip end with holes marked
  - **Template B**: Buckle end piece
    - *Additional*: symmetrical with end shape on both sides, slot centered, fold line, rivet holes, snap holes, alt stitch lines
    - *Integrated*: dashed left edge (belt body continues), end shape on right, slot centered

### SVG Path Rendering
- SVG path parser (`parseSVGPathForPDF`) converts SVG `d` attributes to jsPDF `doc.lines()` segments
- Supports M, m, L, l, H, h, V, v, C, c, Z commands
- Mirrored path rendering for right-side end shapes (negates x components)
- Separate "outline" paths (without closing vertical edge) for seamless strokes
- Paths scaled by actual content height (76 units) not viewBox (78) with y-offset correction

### UI
- Clean white/light theme
- Responsive — mobile-friendly with price/generate at bottom of page
- Sticky top bar with Orders and New Order buttons
- Toast notifications for actions

---

## Deployment

1. Push to `main` on GitHub (`mstewmac/BeltTool`)
2. Netlify auto-builds (`npm run build`, publishes `dist/`)
3. Custom subdomain via CNAME record pointing to Netlify

---

## Future Ideas

### Email Order Submission

Replace the current "Generate PDF" download with an email-based order flow:

**What it would do:**
- Customer fills in design + contact info on the site
- Hits "Submit Order"
- PDF is generated client-side, sent to a serverless function
- Email sent to **both** the shop (Michael) and the customer
- Email includes order summary and PDF attachment

**Recommended approach: Resend + Netlify Functions**
- [Resend](https://resend.com) — email API, free tier: 100 emails/day
- Netlify Functions — serverless endpoint, included free with Netlify
- API key stays server-side (secure)
- Emails come from your own domain (professional)
- No attachment size limits

**Setup steps:**
1. Sign up at resend.com, verify your domain (DNS record)
2. Create a Netlify Function (`netlify/functions/send-order.ts`)
3. Function receives PDF blob + order data, sends via Resend API
4. Store Resend API key as Netlify environment variable
5. Frontend calls the function instead of downloading directly

**Why not EmailJS:** Free tier has 50KB attachment limit (PDFs exceed this), 200 emails/month cap, emails come from their servers not your domain.

**Additional considerations for a public-facing version:**
- Rate limiting to prevent spam submissions
- CAPTCHA or honeypot on the form
- Remove direct PDF download so customers can't self-serve templates
- Order confirmation page after submission
- Possibly store orders in a database (Supabase, Planetscale) instead of localStorage

### Bag Designer Tool

A future version of this tool adapted for custom bag orders. Would share the same architecture but with different:
- Design parameters (bag dimensions, pocket config, strap style, hardware)
- Template system (panel patterns instead of belt strips)
- PDF layout (multiple pattern pieces, assembly notes)
- Likely its own repo/subdomain (e.g. `bags.deepcoveleather.com`)

Could share common code: customer info, order management, PDF generation utilities, email infrastructure, UI components.
