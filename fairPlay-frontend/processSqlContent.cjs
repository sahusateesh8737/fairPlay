const fs = require('fs');

function processFile(filePath, outputPath) {
    let html = fs.readFileSync(filePath, 'utf8');

    // Replace Google Fonts link
    html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^>]+>/g, '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">');

    // Replace font-family in CSS
    html = html.replace(/font-family:\s*'DM Sans',\s*sans-serif;/g, "font-family: 'Inter', system-ui, sans-serif;");
    html = html.replace(/font-family:\s*'Syne',\s*sans-serif;/g, "font-family: 'Inter', system-ui, sans-serif;");
    html = html.replace(/font-family:\s*'JetBrains Mono',\s*monospace;/g, "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;");

    /* UNIFIED DARK THEME */
    const unifiedTheme = `
<style>
    :root {
        /* Primary Backgrounds */
        --bg: #080b14 !important;
        --bg-from: #080b14 !important;
        --bg-to: #080b14 !important;
        --bg2: #0c101d !important;
        --bg-secondary: #0c101d !important;
        --bg3: #111626 !important;
        
        /* Surface & Cards */
        --surface: rgba(255,255,255,0.04) !important;
        --bg-card: rgba(255,255,255,0.04) !important;
        --card-bg: rgba(255,255,255,0.04) !important;
        --card: #0f1423 !important;
        --card2: #161c2e !important;
        --glass: rgba(255,255,255,0.06) !important;
        
        /* Borders */
        --border: rgba(255,255,255,0.08) !important;
        --glass-border: rgba(255,255,255,0.1) !important;
        --border2: rgba(255,255,255,0.15) !important;
        
        /* Text */
        --text: #e2e8f0 !important;
        --text-primary: #e2e8f0 !important;
        --text-secondary: #94a3b8 !important;
        --text-muted: #64748b !important;
        --muted: #64748b !important;
        
        /* Brand & Accents */
        --primary: #5B9CFF !important;
        --primary-dark: #3B7DE8 !important;
        --accent: #22d3ee !important;
        --cyan: #22d3ee !important;
        --accent-cyan: #22d3ee !important;
        --purple: #a855f7 !important;
        --accent-purple: #a855f7 !important;
        --emerald: #34d399 !important;
        --accent-green: #34d399 !important;
        --rose: #fb7185 !important;
        --accent-pink: #fb7185 !important;
        --amber: #fbbf24 !important;
        --accent-yellow: #fbbf24 !important;
    }

    /* GLOBAL TEXT OVERRIDES */
    h1, h2, h3, h4, h5, h6, p, li, span, div, section, article {
        color: var(--text);
    }
    
    .text-secondary, .subtitle, .muted, .section-desc, .hero-subtitle {
        color: var(--text-secondary) !important;
    }

    /* FIX GRADIENT TITLES (Like in Day 5) */
    .hero-title, [class*="title"] {
        background: linear-gradient(135deg, #fff 0%, var(--primary) 50%, var(--purple) 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
    }

    /* FIX HARDCODED LIGHT CARDS & BADGES */
    .type-card, .mistake-card, .flow-box, .badge, .float-card, .card, .thinking-box, .flow-visual, .practice-card, .interview-q, .flow-inner, .flow-output {
        background: var(--bg2) !important;
        border: 1px solid var(--border) !important;
        color: var(--text) !important;
    }

    .type-card-blue, .badge-blue, .flow-inner, .practice-card { 
        background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04)) !important; 
        border: 1px solid rgba(59,130,246,0.3) !important;
    }
    .type-card-purple, .badge-purple, .flow-output, .interview-q { 
        background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04)) !important; 
        border: 1px solid rgba(168,85,247,0.3) !important;
    }
    .type-card-green, .badge-green { 
        background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.04)) !important; 
        border: 1px solid rgba(52,211,153,0.3) !important;
    }
    .type-card-orange { 
        background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04)) !important; 
        border: 1px solid rgba(245,158,11,0.3) !important;
    }
    
    .pnum, .iq-toggle {
        color: var(--primary) !important;
    }

    .iq-q, .iq-answer, .practice-card p {
        color: var(--text) !important;
    }
    
    /* Ensure code blocks stay dark */
    .code-block {
        background: #000 !important;
        border: 1px solid var(--border) !important;
    }

    h4[style*="color"], .pnum[style*="color"] {
        color: var(--primary) !important;
    }

    /* FIX TABS & PAGING (Restoring nav tabs but keeping them clean) */
    .nav { 
        display: flex !important; 
        position: relative !important;
        background: transparent !important; 
        border: none !important; 
        padding: 20px 24px 0 !important;
        justify-content: center !important;
        z-index: 100 !important;
    }
    
    .nav-logo, .nav-progress, .nav-inner > *:not(.nav-tabs), .nav > *:not(.nav-tabs) { 
        display: none !important; 
    }

    .nav-tabs { 
        display: flex !important;
        flex-wrap: wrap !important; 
        gap: 8px !important;
        justify-content: center !important;
        background: var(--surface) !important;
        padding: 6px !important;
        border-radius: 99px !important;
        border: 1px solid var(--border) !important;
    }

    .nav-tab {
        white-space: nowrap !important;
    }

    html { 
        font-size: 18px !important; 
    }

    .page {
        max-width: 1300px !important;
        padding: 60px 40px 100px !important;
    }

    body { 
        padding-top: 0 !important; 
        background: var(--bg) !important;
        color: var(--text) !important;
    }
    body::before { display: none !important; }
</style>
`;
    html = html.replace('</head>', unifiedTheme + '</head>');

    if (!fs.existsSync('public/content')) {
        fs.mkdirSync('public/content', { recursive: true });
    }

    fs.writeFileSync(outputPath, html);
    console.log(`Processed ${filePath} -> ${outputPath}`);
}

processFile('/Users/sateeshsahu/Documents/fairPlay/SQL Basics Interactive Day 1.html', 'public/content/sql-day-1.html');
processFile('/Users/sateeshsahu/Documents/fairPlay/SQL Where Clause Day 2.html', 'public/content/sql-day-2.html');
processFile('/Users/sateeshsahu/Documents/fairPlay/SQL Day 3 Aggregate (1).html', 'public/content/sql-day-3.html');
processFile('/Users/sateeshsahu/Documents/fairPlay/SQL Joins Day 4.html', 'public/content/sql-day-4.html');
processFile('/Users/sateeshsahu/Documents/fairPlay/Day 5 Subqueries (1).html', 'public/content/sql-day-5.html');
processFile('/Users/sateeshsahu/Documents/fairPlay/Day 6 Window Functions.html', 'public/content/sql-day-6.html');
