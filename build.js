const fs = require('fs');
const path = require('path');
const marked = require('./assets/marked.min.js');

const renderer = {
  code(token) {
    const text = typeof token === 'object' ? token.text : token;
    const lang = (typeof token === 'object' ? token.lang : arguments[1]) || 'BASH';
    return `<div class="code-block"><div class="code-header"><span>${lang.toUpperCase()}</span><span>COMMAND / CODE</span></div><pre><code>${text}</code></pre></div>\n`;
  },
  blockquote(token) {
    const text = typeof token === 'object' ? token.text : token;
    return `<div class="advisory-box">${text}</div>\n`;
  },
  image(token) {
    const href = typeof token === 'object' ? token.href : token;
    const text = (typeof token === 'object' ? token.text : arguments[2]) || 'Research Image';
    return `<figure class="img-figure"><img src="${href}" alt="${text}"><figcaption class="img-caption">${text}</figcaption></figure>\n`;
  }
};

marked.use({ renderer, gfm: true, breaks: false });

const posts = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

posts.forEach(post => {
  let fullPost = post;
  const postFile = path.join('posts', `${post.id}.json`);
  if (fs.existsSync(postFile)) {
    fullPost = JSON.parse(fs.readFileSync(postFile, 'utf8'));
  }

  const postHtmlContent = marked.parse(fullPost.content || fullPost.summary || '');
  const pageTitle = `${fullPost.title} — OSEC Blog`;
  const postUrl = `https://osec.uz/blog/${fullPost.id}.html`;
  const cleanSummary = (fullPost.summary || fullPost.title).replace(/"/g, '&quot;');
  const displayDate = (fullPost.date || '').replace(/-/g, '.');
  const catName = fullPost.categoryName || fullPost.category?.toUpperCase() || 'BLOG';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#090909">
<title>${pageTitle}</title>
<meta name="description" content="${cleanSummary}">
<meta name="author" content="${fullPost.author || 'OSEC RESEARCH TEAM'}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<link rel="canonical" href="${postUrl}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article">
<meta property="og:url" content="${postUrl}">
<meta property="og:title" content="${pageTitle}">
<meta property="og:description" content="${cleanSummary}">
<meta property="og:site_name" content="OSEC.uz">
<meta property="article:published_time" content="${fullPost.date}">
<meta property="article:author" content="${fullPost.author || 'OSEC RESEARCH TEAM'}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${postUrl}">
<meta name="twitter:title" content="${pageTitle}">
<meta name="twitter:description" content="${cleanSummary}">
<meta name="twitter:creator" content="@hidoyatiyy">

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${fullPost.title.replace(/"/g, '\\"')}",
  "description": "${cleanSummary.replace(/"/g, '\\"')}",
  "datePublished": "${fullPost.date}",
  "mainEntityOfPage": "${postUrl}",
  "author": {
    "@type": "Person",
    "name": "${fullPost.author || 'OSEC RESEARCH TEAM'}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "OSEC.uz",
    "url": "https://osec.uz/"
  }
}
</script>

<link rel="stylesheet" href="../style.css">
</head>

<body>
<header>
<div class="wrap nav">
  <a href="../index.html" class="logo">OSEC<span>.uz</span></a>
  <div class="nav-center">OSEC BLOG / ${catName}</div>
  <div class="nav-right">
    <a href="../index.html#surface">Explore</a>
    <a href="index.html" class="active nav-accent">Blog</a>
    <a href="../index.html#contact">Engage →</a>
  </div>
</div>
</header>

<main>
<article>
<div class="article-header">
  <div class="wrap">
    <a href="index.html" class="back-link">← Back to Blog Archive</a>
    <div class="label"><span class="red">BLOG</span> / ${catName}</div>
    <h1 style="margin-top:20px">${fullPost.title}</h1>
    <div class="article-meta-bar">
      <span>DATE: <strong>${displayDate}</strong></span>
      <span class="dot">/</span>
      <span>CATEGORY: <strong class="red">${catName}</strong></span>
      <span class="dot">/</span>
      <span>READ TIME: <strong>${fullPost.readTime || '5 MIN READ'}</strong></span>
      <span class="dot">/</span>
      <span>AUTHOR: <strong>${fullPost.author || 'OSEC RESEARCH TEAM'}</strong></span>
    </div>
  </div>
</div>

<div class="wrap article-layout">
  <div class="article-body">
    ${postHtmlContent}
  </div>

  <aside class="sidebar-sticky">
    <div class="side-panel">
      <h4>METADATA & ATT&CK</h4>
      <ul>
        <li><strong>TACTIC:</strong> <span>${fullPost.tactic || 'Security Research'}</span></li>
        <li><strong>TECHNIQUE:</strong> <span>${fullPost.technique || 'MITRE ATT&CK'}</span></li>
        <li><strong>SEVERITY:</strong> <span class="red">${fullPost.severity || 'HIGH'}</span></li>
        <li><strong>STATUS:</strong> <span>Verified & Reproducible</span></li>
      </ul>
    </div>

    <div class="side-panel">
      <h4>TECHNICAL SCOPE</h4>
      <p style="font-size:0.75rem; color:#888; line-height:1.6">
        ${fullPost.summary || 'Offensive security validation, forensic artifact extraction, and adversary emulation.'}
      </p>
    </div>
  </aside>
</div>
</article>
</main>

<footer>
<div class="wrap footer">
  <div>© 2026 OSEC.uz · Offensive security & security validation</div>
  <div class="footer-links">
    <a href="index.html">Blog</a>
    <a href="../index.html">Home</a>
    <a href="../admin/index.html" class="mono" style="opacity:0.6">[Admin]</a>
    <a href="mailto:offseckh@icloud.com">Secure mail</a>
  </div>
</div>
</footer>
</body>
</html>`;

  const destPath = path.join('blog', `${fullPost.id}.html`);
  fs.writeFileSync(destPath, html, 'utf8');
  console.log(`Generated: ${destPath}`);
});

console.log('All static pages generated successfully!');
