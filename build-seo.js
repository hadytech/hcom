// Generates SEO assets: /tribe/ pages, sitemap.xml, robots.txt, and the
// JSON-LD + static blog cards inside index.html. Run: node build-seo.js
const fs = require('fs');
const SITE = 'https://osec.uz';
const ORG = `${SITE}/#organization`;
const tribe = JSON.parse(fs.readFileSync('tribe.json', 'utf8'));
const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 2).replace(/</g, '\\u003c')}\n</script>`;
const personId = m => `${SITE}/tribe/${m.slug}/#person`;

function person(m) {
  const p = {
    '@type': 'Person',
    '@id': personId(m),
    name: m.name,
    url: `${SITE}/tribe/${m.slug}/`,
    image: `${SITE}/${m.photo}`,
    jobTitle: m.role,
    description: m.long,
    knowsAbout: m.knowsAbout,
    memberOf: { '@id': ORG }
  };
  if (m.alternateName && m.alternateName.length) p.alternateName = m.alternateName;
  if (m.worksFor) p.worksFor = { '@type': 'Organization', name: m.worksFor };
  if (m.certificate) p.hasCredential = {
    '@type': 'EducationalOccupationalCredential',
    name: m.certificate.name,
    credentialCategory: 'certificate',
    recognizedBy: { '@type': 'Organization', name: m.certificate.issuer },
    dateCreated: m.certificate.date
  };
  return p;
}

const orgNode = {
  '@type': 'Organization',
  '@id': ORG,
  name: 'OSEC.uz',
  alternateName: ['OSEC', 'OSEC Uzbekistan', 'osec.uz'],
  url: `${SITE}/`,
  logo: `${SITE}/assets/images/og-cover.png`,
  image: `${SITE}/assets/images/og-cover.png`,
  description: 'OSEC.uz is an offensive security team from Uzbekistan: red teaming, penetration testing, attack surface validation, exploit development and vulnerability research.',
  areaServed: 'UZ',
  knowsAbout: ['Offensive security', 'Red teaming', 'Penetration testing', 'Attack surface validation', 'Exploit development', 'Vulnerability research'],
  member: tribe.map(m => ({ '@id': personId(m) })),
  sameAs: ['https://t.me/osecuz', 'https://t.me/hidoyatiyy']
};
const websiteNode = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'OSEC.uz', publisher: { '@id': ORG }, inLanguage: 'en' };

// ---------- shared page chrome ----------
const head = ({ title, desc, url, depth, type = 'website', extra = '' }) => {
  const up = '../'.repeat(depth);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#090909">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="author" content="OSEC.uz">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:site_name" content="OSEC.uz">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="${SITE}/assets/images/og-cover.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${SITE}/assets/images/og-cover.png">
${extra}
<link rel="stylesheet" href="${up}style.css">
</head>
<body>
<header>
<div class="wrap nav">
  <a href="${up}index.html" class="logo">OSEC<span>.uz</span></a>
  <div class="nav-center">OFFENSIVE SECURITY / 01</div>
  <div class="nav-right">
    <a href="${up}index.html#surface">Explore</a>
    <a href="${up}blog/index.html" class="nav-accent">Blog</a>
    <a href="${up}tribe/index.html">Our Tribe</a>
    <a href="${up}index.html#contact">Engage →</a>
  </div>
</div>
</header>
<main>
`;
};
const foot = depth => {
  const up = '../'.repeat(depth);
  return `</main>
<footer>
<div class="wrap footer">
  <div>© 2026 OSEC.uz · Offensive security & security validation</div>
  <div class="footer-links">
    <a href="${up}index.html">Home</a>
    <a href="${up}blog/index.html">Blog</a>
    <a href="${up}tribe/index.html">Our Tribe</a>
    <a href="https://t.me/osecuz" target="_blank" rel="noopener">Telegram</a>
    <a href="mailto:offseckh@icloud.com">Secure mail</a>
  </div>
</div>
</footer>
</body>
</html>
`;
};
const crumbs = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url }))
});

// ---------- /tribe/ ----------
const tribeDesc = `Meet the OSEC.uz tribe: ${tribe.map(m => m.name).join(', ')}. Penetration testers, AppSec engineers and security developers from Uzbekistan.`;
let html = head({
  title: 'OSEC.uz Tribe — Offensive Security Team from Uzbekistan',
  desc: tribeDesc, url: `${SITE}/tribe/`, depth: 1,
  extra: ld({ '@context': 'https://schema.org', '@graph': [
    orgNode, websiteNode, ...tribe.map(person),
    { '@type': 'CollectionPage', '@id': `${SITE}/tribe/#page`, url: `${SITE}/tribe/`, name: 'OSEC.uz Tribe', isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': ORG },
      mainEntity: { '@type': 'ItemList', itemListElement: tribe.map((m, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/tribe/${m.slug}/`, name: m.name })) } },
    crumbs([['OSEC.uz', `${SITE}/`], ['Our Tribe', `${SITE}/tribe/`]])
  ] })
});
html += `<section class="profile-hero">
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html">OSEC.uz</a> / <span>Our Tribe</span></nav>
  <div class="label"><span class="red">TRIBE</span> / OSEC.uz</div>
  <h1>The OSEC.uz tribe.</h1>
  <p class="profile-lead">OSEC.uz is a small, focused collective of offensive security practitioners from Uzbekistan: penetration testers, AppSec engineers and security developers.</p>
</div>
</section>
<section class="tribe tribe-page">
<div class="wrap">
  <div class="tribe-grid">
${tribe.map((m, i) => `    <article class="tribe-card"><a class="tribe-photo-link" href="${m.slug}/"><img class="tribe-photo" src="../${m.photo}" alt="${esc(m.name)}, ${esc(m.role)} at OSEC.uz" width="800" height="800"></a><h2 class="tribe-name"><a href="${m.slug}/">${esc(m.name)}</a></h2><span class="tribe-role">${esc(m.role)}</span><p>${esc(m.bio)}</p><a class="tribe-cert" href="${m.slug}/">View profile →</a></article>`).join('\n')}
  </div>
</div>
</section>
`;
html += foot(1);
fs.mkdirSync('tribe', { recursive: true });
fs.writeFileSync('tribe/index.html', html);

// ---------- /tribe/<slug>/ ----------
tribe.forEach(m => {
  const url = `${SITE}/tribe/${m.slug}/`;
  const title = `${m.name} — ${m.role} | OSEC.uz Tribe`;
  const desc = m.long.length > 200 ? m.long.slice(0, 197).replace(/\s+\S*$/, '') + '…' : m.long;
  const others = tribe.filter(o => o !== m);
  let h = head({
    title, desc, url, depth: 2, type: 'profile',
    extra: ld({ '@context': 'https://schema.org', '@graph': [
      orgNode, websiteNode, ...tribe.map(person),
      { '@type': 'ProfilePage', '@id': `${url}#page`, url, name: title, isPartOf: { '@id': `${SITE}/#website` }, mainEntity: { '@id': personId(m) } },
      crumbs([['OSEC.uz', `${SITE}/`], ['Our Tribe', `${SITE}/tribe/`], [m.name, url]])
    ] })
  });
  h += `<section class="profile-hero">
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../../index.html">OSEC.uz</a> / <a href="../index.html">Our Tribe</a> / <span>${esc(m.name)}</span></nav>
  <div class="profile-grid">
    <img class="profile-photo" src="../../${m.photo}" alt="${esc(m.name)}, ${esc(m.role)} at OSEC.uz" width="800" height="800">
    <div>
      <div class="label"><span class="red">OSEC.uz TRIBE</span> / ${esc(m.role)}</div>
      <h1>${esc(m.name)}</h1>
      <p class="profile-role">${esc(m.role)}</p>
      <p class="profile-lead">${esc(m.long)}</p>
      <h2 class="profile-h">Experience</h2>
      <ul class="profile-list">
${m.experience.map(e => `        <li>${esc(e)}</li>`).join('\n')}
      </ul>
${m.certificate ? `      <h2 class="profile-h">Certifications</h2>
      <ul class="profile-list"><li><a href="../../${m.certificate.image}" target="_blank" rel="noopener">${esc(m.certificate.name)}</a> · ${esc(m.certificate.issuer)} · ${m.certificate.date}</li></ul>
` : ''}      <h2 class="profile-h">Focus areas</h2>
      <p class="profile-tags">${m.knowsAbout.map(k => `<span>${esc(k)}</span>`).join('')}</p>
    </div>
  </div>
  <div class="profile-more">
    <span>More from the tribe:</span>
${others.map(o => `    <a href="../${o.slug}/">${esc(o.name)}</a>`).join('\n')}
    <a href="../index.html">Everyone →</a>
  </div>
</div>
</section>
`;
  h += foot(2);
  fs.mkdirSync(`tribe/${m.slug}`, { recursive: true });
  fs.writeFileSync(`tribe/${m.slug}/index.html`, h);
});

// ---------- index.html: JSON-LD + static blog cards + tribe links ----------
let idx = fs.readFileSync('index.html', 'utf8');
const swap = (name, body) => {
  const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`);
  if (!re.test(idx)) throw new Error(`marker ${name} missing in index.html`);
  idx = idx.replace(re, (_, a, b) => `${a}\n${body}\n${b}`);
};
swap('LD', ld({ '@context': 'https://schema.org', '@graph': [orgNode, websiteNode, ...tribe.map(person)] }));
swap('BLOG', posts.slice(0, 3).map(p => `    <a href="blog/${encodeURIComponent(p.id)}.html" class="blog-card"><div><div class="blog-card-meta"><span class="blog-badge ${p.category || 'exploit'}">${esc(p.categoryName || 'BLOG')}</span><span class="blog-date">${esc((p.date || '').replace(/-/g, '.'))}</span></div><div class="blog-card-content"><h3>${esc(p.title)}</h3><p>${esc(p.summary || '')}</p></div></div><div class="blog-card-footer"><span>${esc(p.readTime || '5 MIN READ')}</span><span class="read-arrow">Read article →</span></div></a>`).join('\n'));
swap('TRIBE', tribe.map((m, i) => `    <article class="tribe-card"><a class="tribe-photo-link" href="tribe/${m.slug}/"><img class="tribe-photo" src="${m.photo}" alt="${esc(m.name)}, ${esc(m.role)} at OSEC.uz" width="800" height="800"></a><h3><a href="tribe/${m.slug}/">${esc(m.name)}</a></h3><span class="tribe-role">${esc(m.role)}</span><p>${esc(m.bio)}</p>${m.certificate ? `<a class="tribe-cert" href="${m.certificate.image}" target="_blank" rel="noopener">${esc(m.certificate.name)} ↗</a>` : ''}</article>`).join('\n'));
fs.writeFileSync('index.html', idx);

// ---------- sitemap.xml + robots.txt ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [
  [`${SITE}/`, today, '1.0'], [`${SITE}/tribe/`, today, '0.9'],
  ...tribe.map(m => [`${SITE}/tribe/${m.slug}/`, today, '0.8']),
  [`${SITE}/blog/`, posts[0]?.date || today, '0.8'],
  ...posts.map(p => [`${SITE}/blog/${p.id}.html`, p.date || today, '0.7'])
];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([l, d, p]) => `  <url><loc>${esc(l)}</loc><lastmod>${d}</lastmod><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`built ${tribe.length + 1} tribe pages, sitemap with ${urls.length} URLs`);
