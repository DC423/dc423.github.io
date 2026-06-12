from pathlib import Path
import textwrap
import urllib.request


desktop = Path.home() / "Desktop"
site = desktop / "pineislandlodge_site"
assets = site / "assets"
assets.mkdir(parents=True, exist_ok=True)

index_html = r'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Pine Island Lodge is a remote Canadian wilderness fishing destination on the Winnipeg River in Whiteshell Provincial Park, Manitoba.">
  <title>Pine Island Lodge | Manitoba Wilderness Fishing</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" data-header>
    <nav class="nav" aria-label="Main navigation">
      <a class="brand" href="#top" aria-label="Pine Island Lodge home">
        <img class="brand-logo" src="assets/pine-island-lodge-logo.png" alt="Pine Island Lodge logo">
        <span><strong>Pine Island Lodge</strong><small>Landing memories since 1950</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
      <div id="nav-links" class="nav-links">
        <a href="#about">About</a>
        <a href="#fishing">Fishing</a>
        <a href="#lodging">Lodging</a>
        <a href="recipes.html">Recipes</a>
        <a href="#rates">Packages</a>
        <a href="#contact">Contact</a>
        <a class="button button-small" href="mailto:stay@pineislandlodge.com?subject=Pine%20Island%20Lodge%20Reservation">Book now</a>
      </div>
    </nav>
  </header>

  <main id="main">
    <section id="top" class="hero section-pad">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <p class="eyebrow">Whiteshell Provincial Park, Manitoba</p>
          <h1>Remote island fishing, warm hospitality, and room to breathe.</h1>
          <p class="lead">A modern standalone refresh for Pine Island Lodge: a private-island Winnipeg River destination known for world-class angling, secluded cabins, hearty meals, and friendly guides.</p>
          <div class="hero-actions">
            <a class="button" href="#rates">View packages</a>
            <a class="button button-ghost" href="#contact">Plan your trip</a>
          </div>
        </div>
        <aside class="reservation-card reveal" aria-label="Reservation highlight">
          <span class="card-kicker">Now taking reservations</span>
          <strong>2026 season</strong>
          <p>Bring your group for trophy Walleye, Northern Pike, Smallmouth Bass, quiet cabins, and riverside meals.</p>
          <a href="tel:+12044708897">204-470-8897</a>
        </aside>
      </div>
    </section>

    <section class="section-pad archive-callout">
      <div class="container contact-card reveal">
        <div>
          <p class="eyebrow">From the old lodge archive</p>
          <h2>Camp-favorite recipes are back.</h2>
          <p>The older Pine Island Lodge site included a recipe page with guest and guide favorites. I restored those recipes into a new standalone page so the refreshed site keeps more of the original lodge personality.</p>
        </div>
        <div class="contact-actions">
          <a class="button" href="recipes.html">View recipes</a>
        </div>
      </div>
    </section>

    <section id="about" class="section-pad about-section">
      <div class="container split">
        <div class="reveal">
          <p class="eyebrow">Family-owned wilderness lodge</p>
          <h2>Landing memories since 1950.</h2>
          <p>Located on a private island along the Winnipeg River, Pine Island Lodge is a remote Canadian wilderness fishing destination northeast of Winnipeg. The island is accessible by float plane or river cruise and supported by Lake of the Woods Sports headquarters for gear and supplies.</p>
          <p>Expect breathtaking views, clean secluded cabins, heartwarming meals, outstanding hospitality, and the kind of quiet that only comes from being surrounded by water, spruce, birch, and sky.</p>
        </div>
        <div class="feature-panel reveal">
          <div><strong>40</strong><span>guest capacity</span></div>
          <div><strong>2–8</strong><span>guests per cabin</span></div>
          <div><strong>5+</strong><span>target species</span></div>
          <div><strong>1950</strong><span>welcoming anglers since</span></div>
        </div>
      </div>
    </section>

    <section id="fishing" class="section-pad dark-section">
      <div class="container">
        <div class="section-heading reveal">
          <p class="eyebrow">An unforgettable angling experience</p>
          <h2>Prime Winnipeg River fishing with professional guides.</h2>
          <p>The river offers an endless variety of structure: lake-like areas, island-studded bays, rocky reefs, weed beds, submerged gravel bars, coves, inlets, lily pads, and wild rice.</p>
        </div>
        <div class="cards four-cards">
          <article class="card reveal"><span>01</span><h3>Professional guides</h3><p>Friendly local knowledge to help with lure selection, safe travel, and finding active water.</p></article>
          <article class="card reveal"><span>02</span><h3>Walleye</h3><p>Classic Canadian fishing with shore-lunch potential and memorable evening bites.</p></article>
          <article class="card reveal"><span>03</span><h3>Northern Pike</h3><p>Chase aggressive strikes around weed beds, bays, and shallow structure.</p></article>
          <article class="card reveal"><span>04</span><h3>Smallmouth Bass</h3><p>Work rocky shorelines and reefs for hard-fighting bronze backs.</p></article>
        </div>
        <blockquote class="quote reveal">“Enjoy rewarding fishing in one of the most beautiful and serene settings on earth.” <cite>— Roger Mattson, Colorado</cite></blockquote>
      </div>
    </section>

    <section id="lodging" class="section-pad">
      <div class="container split reverse">
        <div class="photo-stack reveal" aria-label="Decorative lodge landscape illustration">
          <div class="lake-card lake-card-one"></div>
          <div class="lake-card lake-card-two"></div>
        </div>
        <div class="reveal">
          <p class="eyebrow">Cabins, meals, and island life</p>
          <h2>Secluded cabins close to the main lodge.</h2>
          <p>Cabins accommodate groups of 2 to 8 guests, with twin and single beds in private rooms. Most have river views, and all are fully modern with hot and cold running water, showers, flush toilets, electric lighting, and propane furnaces.</p>
          <p>Screened porches and river-view decks give you a relaxed place for morning coffee, happy hour, or swapping fish stories after a day on the water.</p>
          <ul class="check-list">
            <li>Riverfront dining room and lounge area</li>
            <li>Fresh coffee delivered to your cabin</li>
            <li>Hearty breakfasts, shore lunches, and Canadian home cooking</li>
            <li>Optional kitchen cabins with barbecue for self-catering</li>
          </ul>
        </div>
      </div>
    </section>

    <section id="rates" class="section-pad rates-section">
      <div class="container">
        <div class="section-heading reveal">
          <p class="eyebrow">Flexible trip planning</p>
          <h2>Choose the lodge experience that fits your group.</h2>
          <p>This standalone refresh keeps package details general so the lodge can update pricing seasonally without changing the design.</p>
        </div>
        <div class="cards three-cards">
          <article class="package reveal"><h3>Guided fishing plan</h3><p>For anglers who want local expertise, productive water, and a classic guided river adventure.</p><ul><li>Guide support</li><li>Boat days</li><li>Meal-plan options</li></ul></article>
          <article class="package featured reveal"><h3>Full lodge plan</h3><p>The easiest all-around stay: cabin comfort, prepared meals, island hospitality, and fishing focus.</p><ul><li>Cabin lodging</li><li>Dining room meals</li><li>Shore lunch experience</li></ul></article>
          <article class="package reveal"><h3>Housekeeping cabin</h3><p>For groups who prefer a kitchen cabin, barbecue, flexible schedules, and self-directed days.</p><ul><li>Modern cabin</li><li>Kitchen access</li><li>Relaxed pace</li></ul></article>
        </div>
      </div>
    </section>

    <section class="section-pad gallery-section" aria-label="Lodge highlights">
      <div class="container gallery-grid reveal">
        <div><span>World-class fishing</span></div>
        <div><span>Private island setting</span></div>
        <div><span>Warm meals</span></div>
        <div><span>Remote relaxation</span></div>
      </div>
    </section>

    <section id="contact" class="section-pad contact-section">
      <div class="container contact-card reveal">
        <div>
          <p class="eyebrow">Ready to book?</p>
          <h2>Start planning your Pine Island Lodge trip.</h2>
          <p>Pine Island Lodge, Whiteshell Provincial Park, Manitoba, Canada</p>
          <p>P.O. Box 1818, Stonewall, Manitoba, R0C 2Z0, Canada</p>
        </div>
        <div class="contact-actions">
          <a class="button" href="mailto:stay@pineislandlodge.com">stay@pineislandlodge.com</a>
          <a class="button button-ghost light" href="tel:+12044708897">204-470-8897</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-grid">
      <p>© <span data-year></span> Pine Island Lodge. Static website refresh.</p>
      <p>No frameworks. No server dependencies. HTML, CSS, and client-side JavaScript only.</p>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>
'''

recipes_html = r'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Archived Pine Island Lodge camp-favorite recipes restored in a modern standalone page.">
  <title>Camp Recipes | Pine Island Lodge</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-header>
    <nav class="nav" aria-label="Main navigation">
      <a class="brand" href="index.html" aria-label="Pine Island Lodge home">
        <img class="brand-logo" src="assets/pine-island-lodge-logo.png" alt="Pine Island Lodge logo">
        <span><strong>Pine Island Lodge</strong><small>Archive recipes</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu</button>
      <div id="nav-links" class="nav-links">
        <a href="index.html#about">About</a>
        <a href="index.html#fishing">Fishing</a>
        <a href="index.html#lodging">Lodging</a>
        <a href="recipes.html">Recipes</a>
        <a class="button button-small" href="index.html#contact">Book now</a>
      </div>
    </nav>
  </header>

  <main id="main">
    <section class="subhero section-pad">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container hero-copy reveal">
        <p class="eyebrow">Restored from the old Pine Island Lodge website</p>
        <h1>Camp-favorite recipes.</h1>
        <p class="lead">The 2015 archive preserved a lodge recipe page. These recipes have been cleaned up, organized, and carried into the new standalone site.</p>
      </div>
    </section>

    <section class="section-pad recipes-section">
      <div class="container recipe-layout">
        <aside class="recipe-note reveal">
          <p class="eyebrow">Archive note</p>
          <h2>Food was part of the story.</h2>
          <p>The old site introduced these as “a few of our camp-favourite recipes.” Keeping them gives the new site more lodge character than a generic brochure page.</p>
          <a class="button" href="index.html">Back to main site</a>
        </aside>
        <div class="recipe-list">
          <article class="recipe-card reveal"><h2>Hollywood Dave’s Famous Wings</h2><h3>Ingredients</h3><ul><li>2 cups flour</li><li>1 cup Montreal chicken spice</li><li>1/2 cup Montreal steak spice</li><li>1/3 cup each garlic powder, onion powder, and chili powder</li><li>1/4 cup each curry powder, cayenne pepper, and sweet smoked paprika</li></ul><h3>Method</h3><p>Mix together, place in a bag with wings and shake. Deep fry until brown. Makes for a fun evening.</p><p class="source-note">Archive note: recipe developed by Chef Scott Savoie.</p></article>
          <article class="recipe-card reveal"><h2>Guide Andrew Smart’s Quesadillas</h2><p>Chop together a variety of colourful peppers, green onions, and chicken, beef, or pork. Add to shredded cheese, place on a 10-inch tortilla, and fold when it begins to brown. Delicious.</p></article>
          <article class="recipe-card reveal"><h2>Guide Roger’s Fresh Salsa</h2><ul><li>Green onions</li><li>Cilantro</li><li>Tomatoes</li><li>Green pepper</li><li>2 tbsp sugar</li><li>2 tbsp vinegar or lemon juice</li></ul><p>Chop together the vegetables and herbs. Add sugar and vinegar or lemon juice. Serve with tortilla chips.</p></article>
          <article class="recipe-card reveal"><h2>Guide Roger’s Cheese Sauce</h2><ul><li>4 tbsp butter</li><li>1/2 cup flour</li><li>1 cup milk</li><li>2 cups shredded cheese</li><li>Pinch of salt</li></ul><p>Prepare as a simple cheese sauce and serve with fresh broccoli and/or cauliflower.</p></article>
          <article class="recipe-card reveal"><h2>Andrea’s Best-Ever Brownies</h2><h3>Brownies</h3><ul><li>1 cup butter</li><li>2 cups sugar</li><li>4 heaping tbsp cocoa</li><li>4 eggs, beaten</li><li>1 cup flour</li><li>1 cup chopped walnuts</li><li>1 tsp vanilla</li></ul><p>Bake in a 9x13 pan for 40 minutes at 350°F. The top will appear underdone, but do not overcook; they should be moist and chewy.</p><h3>Icing</h3><ul><li>2 cups icing sugar</li><li>2 tbsp butter</li><li>2 tbsp cocoa</li><li>2 tbsp boiling water</li><li>2 tsp vanilla</li></ul><p>Add icing while brownies are still warm so it melts into a shiny glaze.</p></article>
          <article class="recipe-card reveal"><h2>Lillian’s Wild Rice</h2><ul><li>2 cups wild rice, washed and cooked</li><li>Salt and pepper</li><li>1 tsp beef bouillon</li><li>1 fry pan full chopped and cooked bacon</li><li>2 stalks celery, chopped</li><li>2 green peppers, chopped</li><li>2 large onions, chopped</li><li>2 cans mushrooms</li><li>3 carrots, shredded</li></ul><p>Sauté all vegetables and add to rice. Serve immediately. Serves 16 people.</p></article>
          <article class="recipe-card reveal"><h2>Broccoli Chicken Casserole</h2><h3>Casserole</h3><ul><li>2 10-oz packages frozen or fresh broccoli</li><li>1 can cream of mushroom soup</li><li>1 can cream of chicken soup</li><li>2 cans chopped chicken</li><li>2 eggs</li><li>1 cup mayonnaise</li><li>2 1/4 cups grated cheddar cheese</li></ul><p>Place in a 9x13 casserole dish and bake at 350°F for 20 minutes.</p><h3>Topping</h3><ul><li>1 sleeve Ritz crackers, crushed</li><li>1 stick butter</li></ul><p>Remove casserole from oven and top with cracker crumbs and melted butter. Bake 20 minutes longer. Serves 16–18 people.</p></article>
          <article class="recipe-card reveal"><h2>Chef Scott’s Cinnamon-Crusted Salmon Appetizers</h2><p>Cut salmon into small pieces. Sauté in garlic and butter. Roll in cinnamon and serve while piping hot. Simple and savoury.</p></article>
          <article class="recipe-card reveal"><h2>Barb’s Key Lime Pie</h2><ul><li>3 cans condensed milk</li><li>1 cup key lime juice, bottled or fresh</li><li>8 egg yolks</li><li>2 tsp cream of tartar</li><li>Prepared graham crust</li><li>Whipped cream and lime wedge for topping</li></ul><p>Mix and place in prepared graham crust. Bake for 10 minutes to set. Cool and freeze for a minimum of two hours. Top with whipped cream and a wedge of lime. Makes one large pie for approximately 15 people.</p></article>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer"><div class="container footer-grid"><p>© <span data-year></span> Pine Island Lodge. Archive recipes restored.</p><p>Standalone HTML, CSS, local SVG, and client-side JavaScript.</p></div></footer>
  <script src="app.js"></script>
</body>
</html>
'''

styles_css = r''':root {
  --pine: #12352a;
  --pine-2: #1d4d3f;
  --lake: #2f7ea4;
  --sky: #dff3ff;
  --sand: #f4ead8;
  --gold: #d89a3a;
  --ink: #17211d;
  --muted: #5b6a63;
  --white: #ffffff;
  --shadow: 0 24px 70px rgba(10, 32, 28, .18);
  --radius: 28px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  color: var(--ink);
  background: #fbf8f0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
}
a { color: inherit; }
.skip-link { position: absolute; left: -999px; top: 0; background: var(--pine); color: white; padding: .75rem 1rem; z-index: 10; }
.skip-link:focus { left: 1rem; top: 1rem; }
.container { width: min(1120px, calc(100% - 36px)); margin: 0 auto; }
.section-pad { padding: 96px 0; }

.site-header {
  position: fixed; inset: 0 0 auto 0; z-index: 20;
  background: rgba(18, 53, 42, .78); backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,.14); color: white;
}
.nav { width: min(1180px, calc(100% - 28px)); margin: auto; min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.brand { display: flex; gap: .8rem; align-items: center; text-decoration: none; }
.brand-logo { width: 58px; height: 58px; object-fit: contain; display: block; filter: drop-shadow(0 6px 14px rgba(0,0,0,.24)); }
.brand small { display: block; opacity: .78; font-size: .78rem; margin-top: -.1rem; }
.nav-links { display: flex; align-items: center; gap: 1.1rem; }
.nav-links a { text-decoration: none; font-weight: 700; font-size: .94rem; opacity: .92; }
.nav-links a:hover { opacity: 1; color: #f5d184; }
.nav-toggle { display: none; border: 1px solid rgba(255,255,255,.35); background: transparent; color: white; border-radius: 999px; padding: .55rem .9rem; }

.button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: .85rem 1.25rem; border-radius: 999px; background: var(--gold); color: #1d2115; text-decoration: none; font-weight: 900; box-shadow: 0 12px 28px rgba(216,154,58,.25); border: 2px solid transparent; }
.button:hover { transform: translateY(-1px); }
.button-small { min-height: 38px; padding: .55rem .9rem; }
.button-ghost { background: rgba(255,255,255,.12); color: white; border-color: rgba(255,255,255,.55); box-shadow: none; }
.button-ghost.light { color: white; }

.hero { position: relative; min-height: 760px; display: grid; align-items: center; color: white; overflow: hidden; padding-top: 160px; }
.hero-bg { position: absolute; inset: 0; background: radial-gradient(circle at 80% 25%, rgba(216,154,58,.28), transparent 28%), linear-gradient(180deg, rgba(10,38,38,.35), rgba(10,38,38,.82)), url('assets/lodge-landscape.svg') center/cover no-repeat; transform: scale(1.02); }
.hero-grid { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 2.5rem; align-items: end; }
.eyebrow { color: var(--gold); text-transform: uppercase; letter-spacing: .14em; font-size: .78rem; font-weight: 900; margin: 0 0 .7rem; }
h1, h2, h3 { line-height: 1.05; margin: 0 0 1rem; }
h1 { font-size: clamp(3rem, 7vw, 6.8rem); letter-spacing: -.07em; max-width: 900px; }
h2 { font-size: clamp(2.2rem, 4vw, 4.2rem); letter-spacing: -.045em; }
h3 { font-size: 1.35rem; }
.lead { font-size: clamp(1.1rem, 2vw, 1.35rem); max-width: 720px; opacity: .94; }
.hero-actions { display: flex; gap: .9rem; flex-wrap: wrap; margin-top: 2rem; }
.reservation-card { background: rgba(255,255,255,.94); color: var(--pine); border-radius: var(--radius); padding: 1.6rem; box-shadow: var(--shadow); }
.reservation-card strong { display: block; font-size: 2.2rem; line-height: 1; letter-spacing: -.04em; margin: .25rem 0 .85rem; }
.card-kicker { text-transform: uppercase; color: var(--lake); font-weight: 900; letter-spacing: .08em; font-size: .75rem; }
.reservation-card a { color: var(--pine); font-weight: 900; }

.split { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.split.reverse { grid-template-columns: .85fr 1.15fr; }
.feature-panel { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.feature-panel div { min-height: 165px; border-radius: 24px; padding: 1.25rem; background: white; box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: end; }
.feature-panel strong { font-size: 3rem; color: var(--lake); line-height: .9; }
.feature-panel span { color: var(--muted); font-weight: 800; }
.dark-section { background: linear-gradient(135deg, var(--pine), #0c211d); color: white; }
.section-heading { max-width: 800px; margin-bottom: 2.5rem; }
.section-heading p:not(.eyebrow) { color: rgba(255,255,255,.78); font-size: 1.1rem; }
.cards { display: grid; gap: 1rem; }
.four-cards { grid-template-columns: repeat(4, 1fr); }
.three-cards { grid-template-columns: repeat(3, 1fr); }
.card, .package { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.13); border-radius: 24px; padding: 1.35rem; }
.card span { color: var(--gold); font-weight: 900; }
.card p { color: rgba(255,255,255,.74); }
.quote { margin: 2rem 0 0; padding: 2rem; border-left: 6px solid var(--gold); background: rgba(255,255,255,.08); border-radius: 0 22px 22px 0; font-size: 1.4rem; }
.quote cite { display: block; font-size: 1rem; opacity: .75; margin-top: .7rem; }

.photo-stack { min-height: 430px; position: relative; }
.lake-card { position: absolute; border-radius: var(--radius); box-shadow: var(--shadow); background: url('assets/cabin-card.svg') center/cover no-repeat; }
.lake-card-one { inset: 20px 70px 70px 0; }
.lake-card-two { inset: 130px 0 0 110px; background-image: url('assets/fishing-card.svg'); border: 10px solid #fbf8f0; }
.check-list { list-style: none; padding: 0; margin: 1.5rem 0 0; }
.check-list li { margin: .7rem 0; padding-left: 1.9rem; position: relative; font-weight: 700; }
.check-list li::before { content: '✓'; position: absolute; left: 0; top: 0; color: var(--lake); font-weight: 900; }
.rates-section { background: var(--sand); }
.rates-section .section-heading p:not(.eyebrow) { color: var(--muted); }
.package { background: white; border: 0; box-shadow: var(--shadow); }
.package.featured { background: var(--pine); color: white; transform: translateY(-14px); }
.package ul { padding-left: 1.2rem; color: var(--muted); }
.package.featured ul, .package.featured p { color: rgba(255,255,255,.78); }
.gallery-section { padding-top: 0; background: var(--sand); }
.gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.gallery-grid div { min-height: 210px; border-radius: 24px; display: flex; align-items: end; padding: 1rem; color: white; font-weight: 900; background: linear-gradient(180deg, transparent, rgba(0,0,0,.58)), url('assets/lodge-landscape.svg') center/cover; }
.gallery-grid div:nth-child(2) { background-image: linear-gradient(180deg, transparent, rgba(0,0,0,.58)), url('assets/cabin-card.svg'); }
.gallery-grid div:nth-child(3) { background-image: linear-gradient(180deg, transparent, rgba(0,0,0,.58)), url('assets/meal-card.svg'); }
.gallery-grid div:nth-child(4) { background-image: linear-gradient(180deg, transparent, rgba(0,0,0,.58)), url('assets/fishing-card.svg'); }
.contact-section { background: linear-gradient(135deg, #235f79, var(--pine)); color: white; }
.archive-callout { background: #fbf8f0; padding-bottom: 0; }
.archive-callout .contact-card { background: linear-gradient(135deg, var(--pine), #235f79); color: white; }
.contact-card { display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: center; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16); border-radius: var(--radius); padding: clamp(1.5rem, 4vw, 3rem); }
.contact-actions { display: flex; gap: .8rem; flex-wrap: wrap; justify-content: flex-end; }
.footer { background: #071511; color: rgba(255,255,255,.74); padding: 1.5rem 0; font-size: .92rem; }
.footer-grid { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s ease, transform .7s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.subhero { position: relative; min-height: 520px; display: grid; align-items: end; color: white; overflow: hidden; padding-top: 160px; }
.recipes-section { background: var(--sand); }
.recipe-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 1.2rem; align-items: start; }
.recipe-note { position: sticky; top: 100px; background: var(--pine); color: white; border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow); }
.recipe-list { display: grid; gap: 1rem; }
.recipe-card { background: white; border-radius: 24px; padding: clamp(1.1rem, 3vw, 2rem); box-shadow: var(--shadow); }
.recipe-card h2 { font-size: clamp(1.6rem, 3vw, 2.6rem); }
.recipe-card h3 { margin-top: 1.25rem; font-size: 1rem; color: var(--lake); text-transform: uppercase; letter-spacing: .08em; }
.recipe-card ul { columns: 2; column-gap: 2rem; padding-left: 1.2rem; }
.source-note { color: var(--muted); font-style: italic; }

@media (max-width: 900px) {
  .nav-toggle { display: inline-flex; }
  .nav-links { position: absolute; top: 76px; left: 14px; right: 14px; display: none; flex-direction: column; align-items: stretch; background: var(--pine); border-radius: 18px; padding: 1rem; box-shadow: var(--shadow); }
  .nav-links.open { display: flex; }
  .hero-grid, .split, .split.reverse, .contact-card { grid-template-columns: 1fr; }
  .recipe-layout { grid-template-columns: 1fr; }
  .recipe-note { position: static; }
  .four-cards, .three-cards, .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .reservation-card { max-width: 460px; }
}
@media (max-width: 620px) {
  .section-pad { padding: 72px 0; }
  .hero { min-height: 720px; }
  .four-cards, .three-cards, .gallery-grid, .feature-panel { grid-template-columns: 1fr; }
  .photo-stack { min-height: 320px; }
  .lake-card-one { inset: 0 40px 80px 0; }
  .lake-card-two { inset: 120px 0 0 40px; }
  .contact-actions { justify-content: flex-start; }
  .recipe-card ul { columns: 1; }
}
'''

app_js = r'''const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', event => {
    if (event.target.matches('a')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
'''

def write(path: Path, content: str):
    path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")

write(site / "index.html", index_html)
write(site / "recipes.html", recipes_html)
write(site / "styles.css", styles_css)
write(site / "app.js", app_js)

svg_base = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
<defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#9bd2ee"/><stop offset="1" stop-color="#f7e6bd"/></linearGradient><linearGradient id="water" x1="0" x2="1"><stop stop-color="#235f79"/><stop offset="1" stop-color="#4aa1b8"/></linearGradient></defs>
<rect width="1200" height="800" fill="url(#sky)"/><circle cx="935" cy="132" r="82" fill="#f2c76e" opacity=".9"/><path d="M0 418 C180 300 330 385 520 258 C720 120 870 292 1200 182 L1200 520 L0 520Z" fill="#143b31"/><path d="M0 470 C260 360 410 468 622 332 C800 220 1000 360 1200 270 L1200 800 L0 800Z" fill="#1f5946"/><rect y="515" width="1200" height="285" fill="url(#water)"/><path d="M0 610 C185 570 320 650 520 600 C740 544 898 630 1200 560" fill="none" stroke="#dff3ff" stroke-width="10" opacity=".45"/><path d="M0 710 C240 670 410 748 650 695 C840 653 1030 722 1200 675" fill="none" stroke="#dff3ff" stroke-width="8" opacity=".25"/><g fill="#16352b"><path d="M218 456 l56 -96 l56 96z"/><path d="M278 456 l70 -120 l70 120z"/><path d="M930 426 l62 -106 l62 106z"/></g></svg>'''
write(assets / "lodge-landscape.svg", svg_base)

write(assets / "cabin-card.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#dff3ff"/><rect y="400" width="900" height="250" fill="#2f7ea4"/><path d="M0 330 C150 230 260 320 430 210 C610 96 730 260 900 180 L900 430 L0 430Z" fill="#1d4d3f"/><path d="M285 345 h300 v180 h-300z" fill="#7b4f2a"/><path d="M250 350 l185 -130 l185 130z" fill="#5b3320"/><rect x="330" y="410" width="70" height="75" fill="#f4ead8"/><rect x="470" y="405" width="70" height="120" fill="#12352a"/></svg>''')
write(assets / "fishing-card.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#b9e0f0"/><rect y="330" width="900" height="320" fill="#2f7ea4"/><path d="M0 300 C200 190 305 275 470 160 C640 42 760 185 900 120 L900 360 L0 360Z" fill="#12352a"/><path d="M160 430 C310 390 435 470 610 430 C720 405 780 415 860 390" fill="none" stroke="#f4ead8" stroke-width="16" opacity=".55"/><path d="M340 375 h230 l-55 55 h-130z" fill="#f4ead8"/><path d="M430 260 l90 115 h-180z" fill="#d89a3a"/></svg>''')
write(assets / "meal-card.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="#f4ead8"/><circle cx="450" cy="325" r="210" fill="#fff"/><circle cx="450" cy="325" r="150" fill="#d89a3a" opacity=".85"/><path d="M270 350 C360 285 520 420 640 295" fill="none" stroke="#12352a" stroke-width="34" stroke-linecap="round"/><path d="M250 135 v380 M650 135 v380" stroke="#6f7f78" stroke-width="18" stroke-linecap="round"/></svg>''')
write(assets / "favicon.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#12352a"/><path d="M10 42 C22 31 31 42 42 31 C50 23 56 27 62 23 V64 H10Z" fill="#2f7ea4"/><path d="M30 41 l8 -14 l8 14z" fill="#d89a3a"/><text x="11" y="25" font-family="Arial" font-size="18" font-weight="900" fill="#fff">PI</text></svg>''')

logo_path = assets / "pine-island-lodge-logo.png"
if not logo_path.exists():
    logo_url = "https://images.squarespace-cdn.com/content/v1/654a99c9c425d02f21ec7129/13cd50e2-b04d-455b-89b1-1eee6f86f699/PIL.png?format=1500w"
    logo_path.write_bytes(urllib.request.urlopen(logo_url, timeout=60).read())

write(site / "README.txt", '''Pine Island Lodge static website refresh

Open index.html in any modern browser. This site is standalone and uses only local HTML, CSS, SVG assets, and client-side JavaScript.

Source inspiration/content came from pineislandlodge.com and the 2017 Internet Archive version requested by the user.
''')

print(site)
print("Created files:")
for p in sorted(site.rglob("*")):
    print(" -", p.relative_to(site))