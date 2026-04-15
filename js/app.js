/* ============================================
   HLD Interview Prep — Main Application JS
   ============================================ */

// --- Theme Management ---
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('hld-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.set(theme);
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hld-theme', theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '\u2600' : '\u263E';
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    this.set(current === 'dark' ? 'light' : 'dark');
  }
};

// --- Search / Filter (Home Page) ---
const SearchFilter = {
  init() {
    const searchInput = document.getElementById('search-input');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.problem-card');

    if (!cards.length) return;

    // Sync both search inputs
    const syncAndFilter = (source) => {
      if (searchInput && source !== searchInput) searchInput.value = source.value;
      if (searchInputMobile && source !== searchInputMobile) searchInputMobile.value = source.value;
      this.filter(source, cards);
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => syncAndFilter(searchInput));
    }
    if (searchInputMobile) {
      searchInputMobile.addEventListener('input', () => syncAndFilter(searchInputMobile));
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter(searchInput || searchInputMobile || { value: '' }, cards);
      });
    });
  },

  filter(searchInput, cards) {
    const query = (searchInput?.value || '').toLowerCase().trim();
    const activeFilter = document.querySelector('.filter-btn.active');
    const category = activeFilter ? activeFilter.dataset.category : 'all';

    cards.forEach(card => {
      const title = card.dataset.title?.toLowerCase() || '';
      const tags = card.dataset.tags?.toLowerCase() || '';
      const cat = card.dataset.category || '';

      const matchesSearch = !query || title.includes(query) || tags.includes(query);
      const matchesCategory = category === 'all' || cat === category;

      card.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
  }
};

// --- Table of Contents (Problem Pages) ---
const TOC = {
  init() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    const sections = document.querySelectorAll('.section-anchor');

    if (!tocLinks.length || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tocLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
  }
};

// --- Revision Checklist Persistence ---
const Checklist = {
  init() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    if (!checkboxes.length) return;

    const page = window.location.pathname;

    checkboxes.forEach((cb, i) => {
      const key = `hld-check-${page}-${i}`;
      cb.checked = localStorage.getItem(key) === 'true';

      cb.addEventListener('change', () => {
        localStorage.setItem(key, cb.checked);
        this.updateProgress();
      });
    });

    this.updateProgress();
  },

  updateProgress() {
    const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
    const progressFill = document.querySelector('.progress-fill');
    if (!progressFill || !checkboxes.length) return;

    const checked = document.querySelectorAll('.checklist input[type="checkbox"]:checked').length;
    const pct = (checked / checkboxes.length) * 100;
    progressFill.style.width = `${pct}%`;
  }
};

// --- Keyboard Shortcuts ---
const Shortcuts = {
  init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('search-input');
        if (input) {
          // On mobile, open search bar first
          const mobileBar = document.querySelector('.mobile-search-bar');
          if (mobileBar && !mobileBar.classList.contains('active')) {
            MobileUI.toggleSearch();
          }
          input.focus();
        }
      }

      // Escape to close drawers/overlays
      if (e.key === 'Escape') {
        MobileUI.closeSidebar();
        MobileUI.closeSearch();
        const input = document.getElementById('search-input');
        if (input && document.activeElement === input) {
          input.blur();
        }
      }
    });
  }
};

// --- Mobile UI (sidebar drawer, search bar) ---
const MobileUI = {
  init() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const searchBtn = document.getElementById('mobile-search-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebar = document.querySelector('.sidebar');

    if (menuBtn) {
      menuBtn.addEventListener('click', () => this.toggleSidebar());
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => this.toggleSearch());
    }

    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => this.closeSidebar());
    }

    // Close sidebar when a TOC link is clicked on mobile
    if (sidebar) {
      sidebar.querySelectorAll('.toc-list a').forEach(link => {
        link.addEventListener('click', () => this.closeSidebar());
      });
    }
  },

  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      this.closeSidebar();
    } else {
      sidebar.classList.add('open');
      overlay?.classList.add('active');
      menuBtn?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const menuBtn = document.getElementById('mobile-menu-btn');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    menuBtn?.classList.remove('active');
    document.body.style.overflow = '';
  },

  toggleSearch() {
    const bar = document.querySelector('.mobile-search-bar');
    const btn = document.getElementById('mobile-search-btn');
    if (!bar) return;

    const isActive = bar.classList.contains('active');
    if (isActive) {
      this.closeSearch();
    } else {
      bar.classList.add('active');
      btn?.classList.add('active');
      const input = bar.querySelector('input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  },

  closeSearch() {
    const bar = document.querySelector('.mobile-search-bar');
    const btn = document.getElementById('mobile-search-btn');
    bar?.classList.remove('active');
    btn?.classList.remove('active');
  }
};

// --- Mermaid Diagram Support ---
const MermaidManager = {
  initialized: false,

  getTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    return current === 'dark' ? 'dark' : 'default';
  },

  async init() {
    if (typeof mermaid === 'undefined') return;
    if (!document.querySelectorAll('.mermaid').length) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 60,
        rankSpacing: 60
      },
      sequence: {
        useMaxWidth: false,
        diagramMarginX: 30,
        diagramMarginY: 30,
        actorMargin: 80,
        messageMargin: 50,
        boxTextMargin: 10,
        noteMargin: 15,
        mirrorActors: false,
        fontSize: 15
      },
      themeVariables: this.getThemeVars()
    });

    await this.render();
    this.initialized = true;
  },

  getThemeVars() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      return {
        primaryColor: '#1e3a5f',
        primaryTextColor: '#e5e7eb',
        primaryBorderColor: '#3b82f6',
        lineColor: '#6b7280',
        secondaryColor: '#1a2a1a',
        tertiaryColor: '#2a1a2a',
        background: '#161922',
        mainBkg: '#1e3a5f',
        nodeBorder: '#3b82f6',
        clusterBkg: '#1a1f2e',
        clusterBorder: '#374151',
        titleColor: '#e5e7eb',
        edgeLabelBackground: '#1f2535',
        nodeTextColor: '#e5e7eb',
        // cScale colors — mermaid cycles these for subgraph fills & node classes
        cScale0: '#1e3a5f', cScale0Text: '#e5e7eb',
        cScale1: '#1a3320', cScale1Text: '#e5e7eb',
        cScale2: '#3b1f1f', cScale2Text: '#e5e7eb',
        cScale3: '#2a1f3a', cScale3Text: '#e5e7eb',
        cScale4: '#2a2a10', cScale4Text: '#e5e7eb',
        cScale5: '#1a2e2e', cScale5Text: '#e5e7eb',
        cScale6: '#2e1a1a', cScale6Text: '#e5e7eb',
        cScale7: '#1e2a3a', cScale7Text: '#e5e7eb',
        // Node fill palette used by classDef
        fillType0: '#1e3a5f', fillType1: '#1a3320',
        fillType2: '#3b1f1f', fillType3: '#2a1f3a',
        fillType4: '#2a2a10', fillType5: '#1a2e2e',
        fillType6: '#2e1a1a', fillType7: '#1e2a3a'
      };
    }
    return {
      primaryColor: '#dbeafe',
      primaryTextColor: '#1a1d23',
      primaryBorderColor: '#2563eb',
      lineColor: '#6b7280',
      secondaryColor: '#dcfce7',
      tertiaryColor: '#fce7f3',
      background: '#ffffff',
      mainBkg: '#dbeafe',
      nodeBorder: '#2563eb',
      clusterBkg: '#f8faff',
      clusterBorder: '#d1d5db',
      titleColor: '#1a1d23',
      edgeLabelBackground: '#f9fafb',
      nodeTextColor: '#1a1d23',
      // cScale colors — mermaid cycles these for subgraph fills & node classes
      cScale0: '#dbeafe', cScale0Text: '#1e3a5f',
      cScale1: '#dcfce7', cScale1Text: '#14532d',
      cScale2: '#fef3c7', cScale2Text: '#78350f',
      cScale3: '#f3e8ff', cScale3Text: '#581c87',
      cScale4: '#fff7ed', cScale4Text: '#7c2d12',
      cScale5: '#ccfbf1', cScale5Text: '#134e4a',
      cScale6: '#fce7f3', cScale6Text: '#831843',
      cScale7: '#e0f2fe', cScale7Text: '#075985',
      // Node fill palette used by classDef
      fillType0: '#dbeafe', fillType1: '#dcfce7',
      fillType2: '#fef3c7', fillType3: '#f3e8ff',
      fillType4: '#fff7ed', fillType5: '#ccfbf1',
      fillType6: '#fce7f3', fillType7: '#e0f2fe'
    };
  },

  async render() {
    if (typeof mermaid === 'undefined') return;

    const diagrams = document.querySelectorAll('.mermaid');
    for (let i = 0; i < diagrams.length; i++) {
      const el = diagrams[i];
      // Store original source on first render
      if (!el.dataset.source) {
        el.dataset.source = el.textContent;
      }
      el.removeAttribute('data-processed');
      el.innerHTML = el.dataset.source;
    }

    // Re-init with current theme
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        padding: 20,
        nodeSpacing: 60,
        rankSpacing: 60
      },
      sequence: {
        useMaxWidth: false,
        diagramMarginX: 30,
        diagramMarginY: 30,
        actorMargin: 80,
        messageMargin: 50,
        fontSize: 15
      },
      themeVariables: this.getThemeVars()
    });

    await mermaid.run({ querySelector: '.mermaid' });
    this.colorizeNodes();
  },

  colorizeNodes() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const lightPalette = [
      { fill: '#dbeafe', stroke: '#2563eb', text: '#1e3a5f' }, // blue
      { fill: '#dcfce7', stroke: '#16a34a', text: '#14532d' }, // green
      { fill: '#fef3c7', stroke: '#d97706', text: '#78350f' }, // amber
      { fill: '#f3e8ff', stroke: '#9333ea', text: '#581c87' }, // purple
      { fill: '#fff7ed', stroke: '#ea580c', text: '#7c2d12' }, // orange
      { fill: '#ccfbf1', stroke: '#0d9488', text: '#134e4a' }, // teal
      { fill: '#fce7f3', stroke: '#db2777', text: '#831843' }, // pink
      { fill: '#e0f2fe', stroke: '#0284c7', text: '#075985' }, // sky
    ];
    const darkPalette = [
      { fill: '#1e3a5f', stroke: '#3b82f6', text: '#bfdbfe' }, // blue
      { fill: '#14532d', stroke: '#22c55e', text: '#bbf7d0' }, // green
      { fill: '#78350f', stroke: '#f59e0b', text: '#fde68a' }, // amber
      { fill: '#3b0764', stroke: '#a855f7', text: '#e9d5ff' }, // purple
      { fill: '#7c2d12', stroke: '#f97316', text: '#fed7aa' }, // orange
      { fill: '#134e4a', stroke: '#14b8a6', text: '#99f6e4' }, // teal
      { fill: '#831843', stroke: '#ec4899', text: '#fbcfe8' }, // pink
      { fill: '#075985', stroke: '#38bdf8', text: '#bae6fd' }, // sky
    ];
    const palette = isDark ? darkPalette : lightPalette;

    document.querySelectorAll('.mermaid svg').forEach(svg => {
      // Remove fixed width so CSS can size it
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width = '100%';
      svg.style.height = 'auto';

      // Color flowchart nodes (rect inside .node groups)
      const nodeGroups = svg.querySelectorAll('.node, .nodeLabel');
      const rects = svg.querySelectorAll('.node rect, .node polygon, .node circle, .node ellipse');
      rects.forEach((rect, i) => {
        const c = palette[i % palette.length];
        rect.style.fill = c.fill;
        rect.style.stroke = c.stroke;
        rect.style.strokeWidth = '2px';
        // Color the label too
        const label = rect.closest('.node')?.querySelector('.nodeLabel, text');
        if (label) label.style.fill = c.text;
      });

      // Color sequence diagram actors
      const actors = svg.querySelectorAll('.actor');
      actors.forEach((actor, i) => {
        const c = palette[i % palette.length];
        actor.style.fill = c.fill;
        actor.style.stroke = c.stroke;
      });

      // Color subgraph cluster backgrounds with subtle tint
      const clusters = svg.querySelectorAll('.cluster rect');
      clusters.forEach((rect, i) => {
        const c = palette[(i + 3) % palette.length];
        const alpha = isDark ? '33' : '55'; // ~20-33% opacity hex
        rect.style.fill = c.fill + alpha;
        rect.style.stroke = c.stroke + '88';
      });
    });
  }
};

// --- Scroll Progress ---
const ScrollProgress = {
  init() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    }, { passive: true });
  }
};

// --- Fullscreen Mermaid ---
const FullscreenMermaid = {
  overlay: null,

  init() {
    const containers = document.querySelectorAll('.mermaid-container');
    if (!containers.length) return;

    // Create overlay once
    this.overlay = document.createElement('div');
    this.overlay.className = 'mermaid-fullscreen-overlay';
    this.overlay.innerHTML = `
      <div class="overlay-content">
        <button class="close-btn" aria-label="Close fullscreen">&times;</button>
        <div class="overlay-title"></div>
        <div class="overlay-diagram"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.overlay.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Inject buttons and click handler into each container
    containers.forEach((container) => {
      const btn = document.createElement('button');
      btn.className = 'fullscreen-btn';
      btn.setAttribute('aria-label', 'View fullscreen');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`;
      container.appendChild(btn);

      container.addEventListener('click', () => this.open(container));
    });
  },

  open(container) {
    const mermaidEl = container.querySelector('.mermaid');
    const titleEl = container.querySelector('.mermaid-title');
    if (!mermaidEl) return;

    const overlayTitle = this.overlay.querySelector('.overlay-title');
    const overlayDiagram = this.overlay.querySelector('.overlay-diagram');
    overlayTitle.textContent = titleEl ? titleEl.textContent : '';

    // Clone the SVG for the overlay
    const svg = mermaidEl.querySelector('svg');
    if (svg) {
      overlayDiagram.innerHTML = '';
      const cloned = svg.cloneNode(true);
      cloned.style.maxWidth = '100%';
      cloned.style.height = 'auto';
      overlayDiagram.appendChild(cloned);
    }

    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ESC key handler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && FullscreenMermaid.overlay?.classList.contains('active')) {
    FullscreenMermaid.close();
  }
});

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  SearchFilter.init();
  TOC.init();
  Checklist.init();
  Shortcuts.init();
  MermaidManager.init();
  ScrollProgress.init();
  FullscreenMermaid.init();
  MobileUI.init();

  // Theme toggle button
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      ThemeManager.toggle();
      // Re-render mermaid diagrams with new theme
      setTimeout(() => MermaidManager.render(), 100);
    });
  }
});
