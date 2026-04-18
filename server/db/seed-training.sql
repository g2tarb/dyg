-- ==========================================
-- DYG Training — 3 tracks, 9 exercises, 45 tips
-- ==========================================

-- Track 1: HTML/CSS Fundamentals
INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('t1000000-0000-0000-0000-000000000001',
 'HTML/CSS Fundamentals',
 'Build beautiful static pages from scratch. Master semantic HTML, flexbox, grid, and responsive design.',
 1, 1);

-- Track 2: HTML/CSS Multi-page
INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('t2000000-0000-0000-0000-000000000001',
 'HTML/CSS Multi-page Sites',
 'Build complete multi-page websites with navigation, consistent design systems, and polished UX.',
 2, 2);

-- Track 3: HTML/CSS E-commerce
INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('t3000000-0000-0000-0000-000000000001',
 'HTML/CSS E-commerce',
 'Build production-grade e-commerce interfaces with product grids, galleries, carts, and checkout flows.',
 3, 3);

-- ==========================================
-- EXERCISES — Track 1: Fundamentals
-- ==========================================

-- Exercise 1.1: Landing Page
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e1000000-0000-0000-0000-000000000001',
 't1000000-0000-0000-0000-000000000001',
 'Landing Page — App Fitness',
 'Create a stunning one-page landing for a fitness app. Hero section, features, testimonials, CTA.',
 'Build a single-page landing page for a fictional fitness app called "FitPulse":

1. **Hero section**: Full-width background (gradient or image), app name, tagline, CTA button
2. **Features section**: 3 cards in a row (icon, title, description) using flexbox
3. **Testimonials**: 2-3 user quotes with avatar, name, and rating stars
4. **CTA section**: Final call-to-action with email input and button
5. **Footer**: Links, social icons, copyright

Requirements:
- Mobile responsive (looks good on 375px and 1440px)
- Smooth scroll between sections
- At least 2 Google Fonts
- CSS custom properties for colors
- No JavaScript, pure HTML/CSS',
 'A polished, responsive landing page that could pass as a real product page. Clean typography, consistent spacing, professional color scheme.',
 1, 1, '{"code","craft"}');

-- Exercise 1.2: Portfolio Card
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e1000000-0000-0000-0000-000000000002',
 't1000000-0000-0000-0000-000000000001',
 'Developer Portfolio Card',
 'Design a profile card component with CSS animations, hover effects, and a dark theme.',
 'Build a standalone developer profile card (like a trading card):

1. **Card layout**: Fixed width (350px), rounded corners, subtle shadow
2. **Avatar section**: Circular image, colored border based on "archetype"
3. **Info section**: Name, role, 3 skill tags
4. **Stats bar**: 3 stats (projects, stars, level) in a row
5. **Hover effect**: Card lifts, shadow grows, subtle glow
6. **Dark theme**: Dark background, light text, accent color

Bonus:
- CSS-only flip animation (front/back)
- Gradient border effect
- Skeleton loading state (CSS animation)',
 'A card component that looks like it belongs in a premium UI kit. Smooth animations, pixel-perfect alignment.',
 1, 2, '{"craft","creativity"}');

-- Exercise 1.3: Responsive Grid Gallery
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e1000000-0000-0000-0000-000000000003',
 't1000000-0000-0000-0000-000000000001',
 'Responsive Photo Gallery',
 'Build a masonry-style photo gallery with CSS Grid. Responsive from mobile to desktop.',
 'Build a photo gallery page for a fictional photographer "Luna Studio":

1. **Header**: Logo + navigation (Home, Gallery, About, Contact)
2. **Gallery grid**: CSS Grid with auto-fill, varying card heights (masonry-like)
3. **Photo cards**: Image, title overlay on hover (gradient + text)
4. **Filter bar**: Category buttons (All, Nature, Urban, Portrait) — just visual, no JS
5. **Responsive**: 1 column mobile, 2 tablet, 3-4 desktop

Requirements:
- Use CSS Grid (not flexbox for the gallery)
- object-fit for consistent image display
- Hover transition on every card (opacity, scale, or overlay)
- Min 8 placeholder images (use picsum.photos)',
 'A gallery that looks professional. Smooth hover transitions, clean grid layout, works on all screen sizes.',
 1, 3, '{"code","versatility"}');

-- ==========================================
-- EXERCISES — Track 2: Multi-page
-- ==========================================

-- Exercise 2.1: Restaurant Site
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e2000000-0000-0000-0000-000000000001',
 't2000000-0000-0000-0000-000000000001',
 'Restaurant Website — 3 Pages',
 'Build a complete restaurant website with home, menu, and contact pages. Consistent design across pages.',
 'Build a 3-page website for a fictional restaurant "Ember & Oak":

**Page 1 — Home**:
- Hero with background image, restaurant name, "Reserve a Table" CTA
- About section (story of the restaurant)
- 3 featured dishes with photos

**Page 2 — Menu**:
- Menu divided by categories (Starters, Mains, Desserts, Drinks)
- Each item: name, description, price, dietary icons (V, GF)
- Elegant typography

**Page 3 — Contact**:
- Address + map placeholder (just a gray box with "Map" text)
- Opening hours table
- Contact form (name, email, message, submit button) — no backend needed

**Shared across all pages**:
- Same header with navigation (active state on current page)
- Same footer
- Consistent color scheme and typography
- Mobile responsive',
 'A restaurant website you could show to a real restaurant owner. Consistent design, professional look, easy navigation.',
 2, 1, '{"code","craft","autonomy"}');

-- Exercise 2.2: Blog
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e2000000-0000-0000-0000-000000000002',
 't2000000-0000-0000-0000-000000000001',
 'Tech Blog — 5 Pages',
 'Build a complete tech blog with homepage, article list, single article, about, and contact.',
 'Build a 5-page tech blog called "ByteSize":

**Page 1 — Home**: Hero, 3 featured articles (card with image, title, excerpt, date)
**Page 2 — Articles**: List of 6+ article cards, sidebar with categories and "Popular" list
**Page 3 — Single Article**: Full article with title, author, date, content, code blocks styled, related articles
**Page 4 — About**: Author bio, photo, tech stack, social links
**Page 5 — Contact**: Form + social links

Design system:
- Use CSS custom properties for all colors, spacing, radius
- Dark mode toggle (CSS-only using checkbox hack)
- Code blocks with monospace font and dark background
- Tag/category badges
- Reading time estimate (just hardcode it)
- Mobile responsive',
 'A blog that looks like it runs on Ghost or Medium. Clean reading experience, proper typography hierarchy, dark mode.',
 2, 2, '{"code","craft","versatility"}');

-- Exercise 2.3: Agency Portfolio
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e2000000-0000-0000-0000-000000000003',
 't2000000-0000-0000-0000-000000000001',
 'Creative Agency — 4 Pages',
 'Build a creative agency portfolio with animations, case studies, and a team page.',
 'Build a 4-page site for "Neon Studio" creative agency:

**Page 1 — Home**: Animated hero (CSS keyframes), services (4 cards with icons), client logos row, CTA
**Page 2 — Work**: Grid of 6 case studies (image, title, category). Hover: overlay with "View Project"
**Page 3 — Team**: Team grid (photo, name, role, social links). Hover: grayscale to color
**Page 4 — Contact**: Split layout (form left, info right), styled inputs with focus states

Advanced CSS:
- CSS animations on scroll (use animation-delay to stagger elements)
- Smooth page transitions feeling (consistent header)
- Custom cursor or selection color
- At least one clip-path shape
- Scroll-based progress bar (CSS-only using gradient background on body)',
 'An agency site that demonstrates CSS mastery. Animations, transitions, clip-paths, and a polished design system.',
 2, 3, '{"craft","creativity","autonomy"}');

-- ==========================================
-- EXERCISES — Track 3: E-commerce
-- ==========================================

-- Exercise 3.1: Product Page
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e3000000-0000-0000-0000-000000000001',
 't3000000-0000-0000-0000-000000000001',
 'Product Page — Sneaker Store',
 'Build a detailed product page with image gallery, size selector, and add-to-cart UI.',
 'Build a product detail page for a sneaker called "AeroX 3000":

1. **Image gallery**: Main image + 4 thumbnails (click thumbnail = changes main image, CSS-only with radio hack)
2. **Product info**: Name, price (with old price crossed out), rating stars, color swatches (3 colors), size selector (grid of buttons)
3. **Add to cart**: Quantity selector (+/-), "Add to Cart" button with hover animation
4. **Description tabs**: 3 tabs (Description, Specifications, Reviews) — CSS-only tab switching with radio inputs
5. **Related products**: 4 product cards at the bottom

No JavaScript. Use CSS :checked, :target, or radio/checkbox hacks for interactivity.
Mobile responsive.',
 'A product page that rivals Nike.com or Adidas. Interactive without a single line of JS.',
 3, 1, '{"code","craft","creativity"}');

-- Exercise 3.2: Product Catalog
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e3000000-0000-0000-0000-000000000002',
 't3000000-0000-0000-0000-000000000001',
 'Product Catalog — Fashion Store',
 'Build a full product catalog with grid, filters sidebar, and sorting UI.',
 'Build the catalog page for "Velvet" fashion store:

1. **Header**: Logo, search bar (styled input), cart icon with badge
2. **Sidebar filters**: Categories (checkboxes), Price range (styled range input), Colors (circle swatches), Sizes (button group)
3. **Product grid**: 8-12 products in responsive grid (image, name, price, "Add" button)
4. **Sort bar**: "Sort by: Price / Name / New" buttons above the grid
5. **Product cards**: Hover effect (quick view overlay), sale badge on some products, wishlist heart icon
6. **Pagination**: Page numbers at the bottom (1, 2, 3, Next)

All visual — filters and sort don''t need to actually work (no JS).
But they must LOOK like they work (proper states, active styles).
Mobile: filters collapse above the grid.',
 'A catalog page that looks like a real Shopify store. Every element styled, every state designed.',
 3, 2, '{"code","craft","versatility"}');

-- Exercise 3.3: Full E-commerce
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e3000000-0000-0000-0000-000000000003',
 't3000000-0000-0000-0000-000000000001',
 'Full E-commerce — Tech Store',
 'Build a complete 5-page e-commerce site. The final boss of HTML/CSS.',
 'Build a complete e-commerce site for "Pixel Store" (tech/gadgets):

**Page 1 — Home**: Hero slider (CSS-only animation), featured categories (4 cards), bestsellers (4 products), newsletter signup
**Page 2 — Catalog**: Full catalog with sidebar filters, grid, sort, pagination (from previous exercise, improved)
**Page 3 — Product**: Full product page with gallery, tabs, reviews (from previous exercise, improved)
**Page 4 — Cart**: Cart table (product image, name, quantity, price, remove button), coupon code input, order summary sidebar, "Checkout" CTA
**Page 5 — Checkout**: 3-step form (Shipping info → Payment → Confirmation), progress bar at top, form validation states (CSS :valid/:invalid)

Design requirements:
- Consistent design system (variables, components reused across pages)
- Dark/light mode toggle
- Micro-interactions on every button and input
- Skeleton loading states
- Print stylesheet for order confirmation
- Fully responsive (375px, 768px, 1440px)
- Accessibility: focus states, skip-to-content, proper heading hierarchy

This is the hardest exercise. Take your time.',
 'A complete e-commerce experience indistinguishable from a real store. This single project proves you can build production-grade UI.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');

-- ==========================================
-- TIPS (5 per exercise = 45 tips)
-- ==========================================

-- Tips for Exercise 1.1 (Landing Page)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1000000-0000-0000-0000-000000000001', 1, 'Start with the HTML structure first. Use semantic tags: <header>, <main>, <section>, <footer>. Each section gets its own <section> with a unique class.'),
('e1000000-0000-0000-0000-000000000001', 2, 'For the hero, use min-height: 100vh, display: flex, align-items: center, justify-content: center. Background: linear-gradient or a dark overlay on an image.'),
('e1000000-0000-0000-0000-000000000001', 3, 'Feature cards: use display: flex with gap on the parent. Each card gets flex: 1 so they share space equally. Add padding and a subtle border or box-shadow.'),
('e1000000-0000-0000-0000-000000000001', 4, 'For responsive, use a single media query at max-width: 768px. Stack the feature cards with flex-direction: column. Make the hero text smaller with clamp().'),
('e1000000-0000-0000-0000-000000000001', 5, 'CTA button: use padding, no border, border-radius, background color, and a :hover with transform: translateY(-2px) and box-shadow. Add transition: all 0.2s ease.');

-- Tips for Exercise 1.2 (Portfolio Card)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1000000-0000-0000-0000-000000000002', 1, 'Card structure: a single <div class="card"> with fixed width: 350px. Inside: .card__avatar, .card__info, .card__stats. Use BEM naming.'),
('e1000000-0000-0000-0000-000000000002', 2, 'Circular avatar: width/height equal, border-radius: 50%, border: 3px solid var(--accent-color), object-fit: cover.'),
('e1000000-0000-0000-0000-000000000002', 3, 'Hover lift: .card:hover { transform: translateY(-8px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); } Add transition: all 0.3s ease on .card.'),
('e1000000-0000-0000-0000-000000000002', 4, 'For the flip effect: use two divs (front/back) inside a wrapper. The wrapper gets perspective: 1000px. On hover, rotate the inner container: transform: rotateY(180deg). Back face: backface-visibility: hidden.'),
('e1000000-0000-0000-0000-000000000002', 5, 'Skeleton loading: create a @keyframes shimmer that moves a gradient from left to right. Apply it to placeholder divs with background: linear-gradient(90deg, #1a1a2e 25%, #2a2a4e 50%, #1a1a2e 75%) and background-size: 200% 100%.');

-- Tips for Exercise 1.3 (Gallery)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1000000-0000-0000-0000-000000000003', 1, 'CSS Grid setup: display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px. This auto-adapts to screen width.'),
('e1000000-0000-0000-0000-000000000003', 2, 'For masonry-like heights, make some cards span 2 rows: .card:nth-child(3n) { grid-row: span 2; } The image inside needs height: 100% and object-fit: cover.'),
('e1000000-0000-0000-0000-000000000003', 3, 'Hover overlay: position the card as relative. Add a ::after pseudo-element with position: absolute, inset: 0, background: linear-gradient(transparent 50%, rgba(0,0,0,0.7)), opacity: 0 → 1 on hover.'),
('e1000000-0000-0000-0000-000000000003', 4, 'Text on hover: put the title inside the card, position: absolute, bottom: 16px, left: 16px. Start with opacity: 0, transform: translateY(10px). On hover: opacity: 1, translateY(0).'),
('e1000000-0000-0000-0000-000000000003', 5, 'Images from picsum: use <img src="https://picsum.photos/400/300?random=1"> (change the number for each). Add loading="lazy" for performance.');

-- Tips for Exercise 2.1 (Restaurant)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2000000-0000-0000-0000-000000000001', 1, 'Start with the shared layout. Create header.html and footer.html mentally — use the same HTML in all 3 files. Same <nav>, same <footer>, same CSS file.'),
('e2000000-0000-0000-0000-000000000001', 2, 'Active nav state: on each page, add class="active" to the current nav link. Style .nav-link.active with border-bottom or color change.'),
('e2000000-0000-0000-0000-000000000001', 3, 'Menu layout: use a <dl> (definition list) with <dt> for dish name+price and <dd> for description. Or a simple flexbox row with justify-content: space-between for name and price.'),
('e2000000-0000-0000-0000-000000000001', 4, 'Contact form: style inputs with padding, border, border-radius. Use :focus with border-color change and box-shadow. Label above each input with small font-size and text-transform: uppercase.'),
('e2000000-0000-0000-0000-000000000001', 5, 'Typography matters for restaurants. Use a serif font for headings (Playfair Display), sans-serif for body (Lato). Big headings, generous line-height (1.6+), muted text colors.');

-- Tips for Exercise 2.2 (Blog)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2000000-0000-0000-0000-000000000002', 1, 'Blog layout: main content (70%) + sidebar (30%) using CSS Grid: grid-template-columns: 1fr 300px. On mobile, stack with grid-template-columns: 1fr.'),
('e2000000-0000-0000-0000-000000000002', 2, 'Dark mode toggle: use a hidden checkbox + label. When checked, add a class on :root or body. Use CSS: input:checked ~ .page { --bg: #111; --text: #eee; } Requires the checkbox before the page wrapper in HTML.'),
('e2000000-0000-0000-0000-000000000002', 3, 'Code blocks: use <pre><code> with background: #1e1e2e, padding: 16px, border-radius: 8px, overflow-x: auto, font-family: monospace. Add a colored left border for accent.'),
('e2000000-0000-0000-0000-000000000002', 4, 'Article cards: image on top, content below. Use aspect-ratio: 16/9 on the image wrapper and object-fit: cover on the img. Add a category badge positioned absolute on the image.'),
('e2000000-0000-0000-0000-000000000002', 5, 'Reading time: just hardcode "5 min read" next to the date. Style it with a dot separator: "Apr 19, 2026 · 5 min read" using a span with opacity: 0.6.');

-- Tips for Exercise 2.3 (Agency)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2000000-0000-0000-0000-000000000003', 1, 'Stagger animations: give each element an animation-delay. .card:nth-child(1) { animation-delay: 0ms } .card:nth-child(2) { animation-delay: 100ms } etc. Use @keyframes fadeUp { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }'),
('e2000000-0000-0000-0000-000000000003', 2, 'Clip-path: use clip-path: polygon() on the hero for an angular cut. Example: clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%). Experiment with CSS clip-path maker tools online.'),
('e2000000-0000-0000-0000-000000000003', 3, 'Team grayscale: img { filter: grayscale(100%); transition: filter 0.3s; } img:hover { filter: grayscale(0%); } Simple but impressive effect.'),
('e2000000-0000-0000-0000-000000000003', 4, 'Scroll progress bar: body { background: linear-gradient(to right, var(--accent) var(--scroll), transparent 0); background-size: 100% 3px; background-repeat: no-repeat; } Set --scroll with a tiny JS or just hardcode 60% for the demo.'),
('e2000000-0000-0000-0000-000000000003', 5, 'Split layout contact: display: grid; grid-template-columns: 1fr 1fr. Form on left, info (address, phone, hours, map placeholder) on right. On mobile: grid-template-columns: 1fr.');

-- Tips for Exercise 3.1 (Product Page)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e3000000-0000-0000-0000-000000000001', 1, 'Image gallery CSS-only: use hidden radio inputs. Each thumbnail is a <label for="img1">. When radio is :checked, show the corresponding main image. #img1:checked ~ .gallery .main-img-1 { display: block; }'),
('e3000000-0000-0000-0000-000000000001', 2, 'Size selector: use a grid of <label> elements wrapping hidden radio inputs. Style the label as a button. input:checked + label { border-color: var(--accent); background: var(--accent); color: white; }'),
('e3000000-0000-0000-0000-000000000001', 3, 'Color swatches: small circles (24px) with background-color. Use the same radio trick as sizes. Add a ring on selected: box-shadow: 0 0 0 2px white, 0 0 0 4px var(--color).'),
('e3000000-0000-0000-0000-000000000001', 4, 'Tabs CSS-only: same radio trick. 3 radio inputs (hidden) + 3 labels (tab headers) + 3 content divs. Only show the content div that matches the checked radio. Use ~ combinator.'),
('e3000000-0000-0000-0000-000000000001', 5, 'Price styling: old price with text-decoration: line-through and opacity: 0.5. New price with larger font-size, font-weight: bold, color: var(--accent). Put them side by side with gap.');

-- Tips for Exercise 3.2 (Catalog)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e3000000-0000-0000-0000-000000000002', 1, 'Page layout: CSS Grid with grid-template-columns: 250px 1fr. Sidebar on left (fixed width), product grid on right (fluid). On mobile: grid-template-columns: 1fr, sidebar stacks on top.'),
('e3000000-0000-0000-0000-000000000002', 2, 'Product card hover: wrap the image in a container with overflow: hidden. On hover, scale the image: img:hover { transform: scale(1.05); } The container clips the overflow. Add a "Quick View" overlay with opacity transition.'),
('e3000000-0000-0000-0000-000000000002', 3, 'Sale badge: position: absolute on the card (position: relative). Top-right corner. Background red, white text, padding, border-radius or clip-path for a ribbon effect.'),
('e3000000-0000-0000-0000-000000000002', 4, 'Wishlist heart: use the CSS entity ♡ (&#9825;) and ♥ (&#9829;). Toggle with checkbox hack: input:checked + label { color: red; } label::before { content: "♡"; } input:checked + label::before { content: "♥"; }'),
('e3000000-0000-0000-0000-000000000002', 5, 'Filter checkboxes: style them custom. Hide the default checkbox (opacity: 0, position: absolute). Style the label with a custom box: label::before { content: ""; width: 18px; height: 18px; border: 2px solid; border-radius: 3px; } input:checked + label::before { background: var(--accent); }');

-- Tips for Exercise 3.3 (Full E-commerce)
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e3000000-0000-0000-0000-000000000003', 1, 'Design system first: before coding any page, define all your CSS custom properties: --color-primary, --color-bg, --color-text, --radius-sm/md/lg, --space-xs/sm/md/lg/xl, --font-heading, --font-body. Import the same CSS file on every page.'),
('e3000000-0000-0000-0000-000000000003', 2, 'Cart table: use a real <table> with columns for product image, name, quantity, unit price, total. Quantity: a simple input[type=number] styled. Remove button: a small "×" icon. Order summary: position: sticky on desktop sidebar.'),
('e3000000-0000-0000-0000-000000000003', 3, 'Checkout progress bar: 3 steps. Use a flexbox row of circles + lines. Active step: filled circle. Completed: checkmark. Future: empty circle. The connecting line changes color up to the active step.'),
('e3000000-0000-0000-0000-000000000003', 4, 'Form validation CSS: use :valid and :invalid pseudo-classes on inputs with required attribute. input:valid { border-color: green; } input:invalid:not(:placeholder-shown) { border-color: red; } The :not(:placeholder-shown) trick prevents red borders on empty untouched fields.'),
('e3000000-0000-0000-0000-000000000003', 5, 'Print stylesheet: add <link rel="stylesheet" href="print.css" media="print">. In print.css: hide nav, footer, buttons. Show only the order summary. Use @page { margin: 2cm; } for proper print margins.');
