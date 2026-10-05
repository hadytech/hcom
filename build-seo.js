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
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap">`;
const head = ({ title, desc, url, depth, type = 'website', extra = '', lang = 'en' }) => {
  const up = '../'.repeat(depth);
  return `<!doctype html>
<html lang="${lang}">
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
<link rel="alternate" type="application/rss+xml" title="OSEC.uz Blog" href="${SITE}/feed.xml">
${FONTS}
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
    <a href="${up}services/index.html">Services</a>
    <a href="${up}uz/index.html" hreflang="uz" lang="uz">O'zbekcha</a>
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


// ---------- /services/ ----------
const services = JSON.parse(fs.readFileSync('services.json', 'utf8'));
const svcNode = sv => ({
  '@type': 'Service', '@id': `${SITE}/services/${sv.slug}/#service`, name: sv.name, serviceType: sv.name,
  description: sv.desc, url: `${SITE}/services/${sv.slug}/`, provider: { '@id': ORG }, areaServed: 'UZ'
});
const li = a => a.map(x => `        <li>${esc(x)}</li>`).join('\n');
fs.mkdirSync('services', { recursive: true });
let sh = head({
  title: 'Offensive Security Services | OSEC.uz', depth: 1, url: `${SITE}/services/`,
  desc: 'Penetration testing, red teaming, attack surface validation and vulnerability research from the OSEC.uz team in Uzbekistan.',
  extra: ld({ '@context': 'https://schema.org', '@graph': [orgNode, websiteNode, ...services.map(svcNode), crumbs([['OSEC.uz', `${SITE}/`], ['Services', `${SITE}/services/`]])] })
});
sh += `<section class="profile-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../index.html">OSEC.uz</a> / <span>Services</span></nav>
  <div class="label"><span class="red">SERVICES</span> / OSEC.uz</div>
  <h1>Offensive security services.</h1>
  <p class="profile-lead">Evidence-based security testing from a small team of practitioners in Uzbekistan.</p>
  <ul class="profile-list svc-list">
${services.map(sv => `    <li><a href="${sv.slug}/"><strong>${esc(sv.name)}</strong></a><span>${esc(sv.desc)}</span></li>`).join('\n')}
  </ul>
</div></section>
`;
sh += foot(1);
fs.writeFileSync('services/index.html', sh);
services.forEach(sv => {
  const url = `${SITE}/services/${sv.slug}/`;
  fs.mkdirSync(`services/${sv.slug}`, { recursive: true });
  let h = head({
    title: sv.title, desc: sv.desc, url, depth: 2,
    extra: ld({ '@context': 'https://schema.org', '@graph': [orgNode, websiteNode, svcNode(sv), { '@type': 'WebPage', '@id': `${url}#page`, url, name: sv.title, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${url}#service` } }, crumbs([['OSEC.uz', `${SITE}/`], ['Services', `${SITE}/services/`], [sv.name, url]])] })
  });
  h += `<section class="profile-hero"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="../../index.html">OSEC.uz</a> / <a href="../index.html">Services</a> / <span>${esc(sv.name)}</span></nav>
  <div class="label"><span class="red">SERVICE</span> / ${esc(sv.name)}</div>
  <h1>${esc(sv.h1)}</h1>
  <p class="profile-lead">${esc(sv.lead)}</p>
  <div class="svc-cols">
    <div><h2 class="profile-h">What we test</h2><ul class="profile-list">
${li(sv.covers)}
    </ul></div>
    <div><h2 class="profile-h">What you get</h2><ul class="profile-list">
${li(sv.gets)}
    </ul></div>
  </div>
${sv.related.length ? `  <h2 class="profile-h">From our research</h2>
  <ul class="profile-list">${sv.related.map(([t, u]) => `<li><a href="../../${u}">${esc(t)}</a></li>`).join('')}</ul>
` : ''}  <div class="profile-more">
    <a href="mailto:offseckh@icloud.com">Request an assessment →</a>
    <a href="https://t.me/osecuz" target="_blank" rel="noopener">Telegram</a>
    <a href="../../tribe/index.html">Meet the tribe</a>
    <a href="../index.html">All services</a>
  </div>
</div></section>
`;
  h += foot(2);
  fs.writeFileSync(`services/${sv.slug}/index.html`, h);
});

// ---------- /uz/ (Uzbek) ----------
const uzUrl = `${SITE}/uz/`;
fs.mkdirSync('uz', { recursive: true });
let uh = head({
  lang: 'uz', depth: 1, url: uzUrl,
  title: "OSEC.uz — O'zbekistondagi kiberxavfsizlik jamoasi | Pentest va Red Team",
  desc: "OSEC.uz — O'zbekistondan hujumkor kiberxavfsizlik jamoasi: penetratsion testlash (pentest), red team, hujum yuzasini tekshirish va zaifliklarni tadqiq qilish.",
  extra: `<link rel="alternate" hreflang="en" href="${SITE}/">\n<link rel="alternate" hreflang="uz" href="${uzUrl}">\n<link rel="alternate" hreflang="x-default" href="${SITE}/">\n` + ld({ '@context': 'https://schema.org', '@graph': [{ ...orgNode, description: "OSEC.uz — O'zbekistondan hujumkor kiberxavfsizlik jamoasi.", inLanguage: 'uz' }, { ...websiteNode, inLanguage: ['en', 'uz'] }, ...tribe.map(person), crumbs([['OSEC.uz', `${SITE}/`], ["O'zbekcha", uzUrl]])] })
});
uh += `<section class="profile-hero"><div class="wrap">
  <div class="label"><span class="red">OSEC.uz</span> / Kiberxavfsizlik</div>
  <h1>Tizimingiz qanchalik himoyalangan?</h1>
  <p class="profile-lead">OSEC.uz — O'zbekistondan hujumkor kiberxavfsizlik jamoasi. Biz penetratsion testlash (pentest), red team baholash, hujum yuzasini tekshirish va zaifliklarni tadqiq qilish bilan shug'ullanamiz. Har bir topilma dalil va aniq tuzatish yo'li bilan taqdim etiladi.</p>
  <h2 class="profile-h">Xizmatlar</h2>
  <ul class="profile-list svc-list">
${services.map(sv => `    <li><a href="../services/${sv.slug}/"><strong>${esc(sv.uz[0])}</strong></a><span>${esc(sv.uz[1])}</span></li>`).join('\n')}
  </ul>
  <h2 class="profile-h">Jamoa</h2>
  <ul class="profile-list svc-list">
${tribe.map(m => `    <li><a href="../tribe/${m.slug}/"><strong>${esc(m.name)}</strong></a><span>${esc(m.role)} — ${esc(m.uz)}</span></li>`).join('\n')}
  </ul>
  <h2 class="profile-h">Aloqa</h2>
  <div class="profile-more">
    <a href="mailto:offseckh@icloud.com">Baholash so'rash →</a>
    <a href="https://t.me/osecuz" target="_blank" rel="noopener">Telegram</a>
    <a href="../index.html" hreflang="en" lang="en">English</a>
  </div>
</div></section>
`;
uh += foot(1);
fs.writeFileSync('uz/index.html', uh);

// ---------- feed.xml ----------
const rfc = d => new Date(d + 'T00:00:00Z').toUTCString();
fs.writeFileSync('feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>OSEC.uz Blog</title>\n  <link>${SITE}/blog/</link>\n  <description>Offensive security research, tradecraft and advisories from OSEC.uz.</description>\n  <language>en</language>\n  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>\n${posts.map(p => `  <item><title>${esc(p.title)}</title><link>${SITE}/blog/${p.id}.html</link><guid isPermaLink="true">${SITE}/blog/${p.id}.html</guid><pubDate>${rfc(p.date)}</pubDate><description>${esc(p.summary || '')}</description></item>`).join('\n')}\n</channel>\n</rss>\n`);

// ---------- security.txt, 404 ----------
fs.mkdirSync('.well-known', { recursive: true });
fs.writeFileSync('.well-known/security.txt', `Contact: mailto:offseckh@icloud.com\nExpires: 2027-10-05T00:00:00.000Z\nPreferred-Languages: en, uz\nCanonical: ${SITE}/.well-known/security.txt\n`);
let nf = head({ title: 'Page not found — OSEC.uz', desc: 'This page does not exist.', url: `${SITE}/404.html`, depth: 0, extra: '<meta name="robots" content="noindex">' }).replace(/<meta name="robots" content="index[^>]*>\n/, '').replace('href="style.css"', 'href="/style.css"').replace(/href="index\.html/g, 'href="/index.html').replace(/href="blog\/index/g, 'href="/blog/index').replace(/href="tribe\/index/g, 'href="/tribe/index');
nf += `<section class="profile-hero"><div class="wrap"><div class="label"><span class="red">404</span> / NOT FOUND</div><h1>Nothing here.</h1><p class="profile-lead">The page you requested does not exist.</p><div class="profile-more"><a href="/index.html">Home</a><a href="/tribe/index.html">Our Tribe</a><a href="/services/index.html">Services</a><a href="/blog/index.html">Blog</a></div></div></section>\n` + foot(0).replace(/href="index\.html/g, 'href="/index.html').replace(/href="(blog|tribe|services|uz)\//g, 'href="/$1/');
fs.writeFileSync('404.html', nf);

// ---------- sitemap.xml + robots.txt ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [
  [`${SITE}/`, null, '1.0'], [`${SITE}/tribe/`, null, '0.9'],
  ...tribe.map(m => [`${SITE}/tribe/${m.slug}/`, null, '0.8']),
  [`${SITE}/uz/`, null, '0.8'], [`${SITE}/services/`, null, '0.8'],
  ...services.map(sv => [`${SITE}/services/${sv.slug}/`, null, '0.8']),
  [`${SITE}/blog/`, posts[0]?.date || today, '0.8'],
  ...posts.map(p => [`${SITE}/blog/${p.id}.html`, p.date || today, '0.7'])
];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([l, d, p]) => `  <url><loc>${esc(l)}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}<priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`built ${tribe.length + 1} tribe pages, sitemap with ${urls.length} URLs`);
