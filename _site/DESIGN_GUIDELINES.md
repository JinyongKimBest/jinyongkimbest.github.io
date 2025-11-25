# Website Design Guidelines for kbgtax.github.io

## Overview
This is a Jekyll-based tax accountant website (김병규 세무회계 - BG Tax & Accounting) with Bootstrap 5. The site serves a Korean tax accountant office located in Goyang City, near Jichuk Station.

**Site Owner:** 김병규 세무사 (Tax Accountant Kim Byung-gyu)  
**Location:** 경기 고양시 덕양구 지축1로 73 505호 (JS스퀘어빌딩)  
**Phone:** 02-381-1355  
**Email:** kbgycn63@naver.com

---

## File Structure

```
kbgtax.github.io/
├── _config.yml              # Jekyll configuration
├── _layouts/
│   ├── default.html         # Main layout wrapper (includes head, nav, footer)
│   └── post.html            # Blog post layout with hero and article
├── _includes/
│   ├── head.html            # Meta tags, CSS links (Bootstrap 5, Pretendard font)
│   ├── nav.html             # Navigation bar with active state logic
│   └── footer.html          # Footer with contact info and hashtags
├── _posts/                  # Blog posts in Markdown format
│   ├── 2025-02-18-2025-tax-update.md
│   ├── 2025-02-18-inheritance-tax.md
│   └── 2025-11-25-inheritance-gift-tax-reform-2025.md
├── css/
│   └── custom.css           # All custom styles (primary stylesheet)
├── assets/
│   └── img/                 # Images (main.jpg, logo.png, BG.jpg, etc.)
├── index.html               # Homepage
├── area.html                # Services page (주요 업무)
├── bg.html                  # About page (김병규 세무사)
├── blog.html                # Blog listing page
├── to.html                  # Contact & Directions page (오시는 길)
└── gallary.html             # Gallery page
```

---

## Color Palette

```css
:root {
    --primary-green: #1a472a;        /* Main brand color - Dark forest green */
    --primary-green-light: #2d5a3d;  /* Lighter green variant */
    --gold: #d4af37;                 /* Accent/highlight color */
    --gold-light: #e8c65c;           /* Light gold for hero subtitle */
    --light-bg: #f8f9fa;             /* Light background sections */
    --dark-text: #212529;            /* Body text color */
    
    /* Gradients */
    --accent-gradient: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-light) 100%);
    
    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
}
```

---

## Typography

**Font:** Pretendard Variable (Korean-optimized)

```html
<!-- In head.html -->
<link rel="stylesheet" as="style" crossorigin
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css" />
```

**Font Weights:**
- Body text: 400
- Lead text: 400-500
- Card titles: 700
- Headings: 700-800
- Navbar brand: 700

**Font Sizes:**
- h1: 2.5rem (hero: 2.75rem)
- h2: 2rem (section headers: 2.5rem)
- h3: 1.75rem
- h4: 1.5rem
- h5: 1.25rem
- Body: 1rem
- Lead: 1.2rem
- Post content: 1.15rem

**Line Heights:**
- Body: 1.7
- Lead: 1.8
- Post content: 1.9

---

## Layout Structure

### default.html (Main Layout)
```html
<!DOCTYPE html>
<html lang="en">
<head>{% include head.html %}</head>
<body>
    {% include nav.html %}
    {{ content }}
    {% include footer.html %}
</body>
</html>
```

### Navigation Bar (nav.html)
```html
<nav class="navbar navbar-expand-lg navbar-dark bg-green">
    <div class="container">
        <a class="navbar-brand fw-bold" href="/">지축대표세무사 - 김병규 세무회계</a>
        <!-- Toggler for mobile -->
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <!-- Nav items with active state logic -->
                <li class="nav-item">
                    <a class="nav-link {% if page.url == '/' %}active{% endif %}" href="/">Home</a>
                </li>
                <!-- More nav items... -->
            </ul>
        </div>
    </div>
</nav>
```

**Nav Items:**
- Home (/)
- 주요 업무 (/area.html)
- 김병규 세무사 (/bg.html)
- 블로그 (/blog.html)
- 오시는 길 (/to.html)
- 갤러리 (/gallary.html)

---

## Hero Section

### CSS (bg-image-full)
```css
.bg-image-full {
    background-size: cover;
    background-position: center 70%;  /* Shows mountain/landscape features */
    background-repeat: no-repeat;
    background-attachment: fixed;     /* Parallax effect */
    position: relative;
    min-height: 400px;
    height: 45vh;
    max-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Light overlay for better image visibility */
.bg-image-full::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.15) 100%);
}
```

### Hero Text Box
```css
.hero-text-box {
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(8px);
    padding: 3rem 5rem;
    border-radius: 20px;
    text-align: center;
    position: relative;
    z-index: 1;
    border: 1px solid rgba(255, 255, 255, 0.15);
    animation: fadeInUp 0.8s ease-out;
}

.hero-text-box h1 {
    color: white;
    font-size: 2.75rem;
    font-weight: 800;
}

.hero-text-box p {
    color: var(--gold-light);  /* Gold subtitle */
    font-size: 1.25rem;
    letter-spacing: 2px;
    text-transform: uppercase;
}
```

### HTML Pattern
```html
<header class="bg-image-full" style="background-image: url('{{ '/assets/img/main.jpg' | relative_url }}');">
    <div class="hero-text-box">
        <h1>페이지 제목</h1>
        <p>English Subtitle</p>
        <!-- Optional: CTA buttons on homepage -->
        <div class="mt-4">
            <a href="/area.html" class="btn btn-gold btn-lg px-4 me-2">주요 업무 보기</a>
            <a href="/to.html" class="btn btn-outline-light btn-lg px-4">상담 예약</a>
        </div>
    </div>
</header>
```

---

## Section Patterns

### Section Header
```html
<div class="section-header">
    <span class="badge-custom mb-3 d-inline-block">Badge Text</span>
    <h2>섹션 제목</h2>
    <p>섹션 설명 텍스트</p>
</div>
```

```css
.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

.badge-custom {
    background: var(--accent-gradient);
    color: white;
    padding: 0.5em 1em;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
}
```

### Divider
```html
<div class="divider-custom mx-auto mb-4"></div>
```

```css
.divider-custom {
    width: 100px;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-green), var(--gold));
    border-radius: 3px;
}

/* Optional decorative dots */
.divider-custom::before,
.divider-custom::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    background: var(--gold);
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
}
```

### Section Backgrounds
```css
section {
    padding: 5rem 0;
}

section.bg-light {
    background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%) !important;
}

section.bg-white {
    background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%) !important;
}
```

---

## Card Patterns

### Basic Card
```html
<div class="card h-100 shadow-sm">
    <div class="card-body p-4">
        <h5 class="card-title">제목</h5>
        <p class="card-text text-muted">설명</p>
    </div>
</div>
```

### Icon Card (for Services)
```html
<div class="card icon-card h-100">
    <div class="icon-wrapper">💰</div>
    <h5 class="card-title">양도소득세</h5>
    <p class="card-text text-muted">설명 텍스트</p>
</div>
```

```css
.card {
    border: none;
    border-radius: 20px;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg) !important;
}

.icon-card {
    text-align: center;
    padding: 2.5rem 2rem;
}

.icon-card .icon-wrapper {
    width: 80px;
    height: 80px;
    background: var(--accent-gradient);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
}

.card:hover .icon-wrapper {
    transform: scale(1.1) rotate(5deg);
}
```

### Service Card (area.html pattern)
```html
<div class="card h-100 shadow-sm p-4">
    <div class="mb-3 text-primary-custom" style="font-size: 2.5rem;">📋</div>
    <h5 class="card-title">서비스명</h5>
    <p class="text-muted small mb-2">English Name</p>
    <p class="card-text">서비스 설명</p>
</div>
```

### Gallery Card
```html
<div class="card shadow-sm border-0 overflow-hidden">
    <img class="card-img-top" src="image.jpg" alt="설명" style="height: 400px; object-fit: cover;">
    <div class="card-body p-4">
        <h5 class="card-title">🏔️ 제목</h5>
        <p class="card-text">설명</p>
    </div>
</div>
```

### Stat Card (Homepage 2x2 grid)
```html
<div class="card text-center p-4 h-100">
    <div class="display-4 text-primary-custom mb-2">30+</div>
    <div class="text-muted">년 경력</div>
</div>
```

---

## Button Styles

### Primary Button (Green Gradient)
```html
<a href="#" class="btn btn-primary-custom">버튼 텍스트 →</a>
```

```css
.btn-primary-custom {
    background: var(--accent-gradient);
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(26, 71, 42, 0.3);
}

.btn-primary-custom:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(26, 71, 42, 0.4);
}
```

### Outline Button
```html
<a href="#" class="btn btn-outline-primary-custom">버튼 텍스트 →</a>
```

```css
.btn-outline-primary-custom {
    color: var(--primary-green);
    border: 2px solid var(--primary-green);
    background: transparent;
}

.btn-outline-primary-custom:hover {
    background: var(--accent-gradient);
    color: white;
    transform: translateY(-3px);
}
```

### Gold Button (CTA)
```html
<a href="tel:02-381-1355" class="btn btn-gold btn-lg px-5">📞 02-381-1355</a>
```

```css
.btn-gold {
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%);
    border: none;
    color: #1a1a1a;
    font-weight: 700;
}
```

### Common Button Properties
```css
.btn {
    font-weight: 600;
    border-radius: 12px;
    padding: 0.75rem 2rem;
    transition: all 0.3s ease;
}
```

---

## Footer Structure

```html
<footer class="py-5 bg-green text-white">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-3 text-center mb-4 mb-lg-0">
                <img src="/assets/img/logo.png" alt="Logo" class="img-fluid" style="max-height: 200px;">
            </div>
            <div class="col-lg-9">
                <h5 class="fw-bold mb-3">지축대표세무사 - 김병규 세무회계</h5>
                <p class="mb-1">경기 고양시 덕양구 지축1로 73 505호(지축동, JS스퀘어빌딩)</p>
                <p class="mb-1">E-mail: kbgycn63@naver.com</p>
                <p class="mb-3">TEL: 02-381-1355</p>
                <div class="small">
                    <span class="badge bg-light text-dark me-1">#국립세무대학</span>
                    <span class="badge bg-light text-dark me-1">#불복청구</span>
                    <!-- More hashtag badges -->
                </div>
            </div>
        </div>
    </div>
</footer>
```

---

## Blog Post Format

### Front Matter
```yaml
---
layout: post
title: "포스트 제목"
date: 2025-11-25
image: /assets/img/post1.png  # Optional featured image
excerpt: "메타 설명용 요약 텍스트"
---
```

### Post Content Structure
```html
<p>도입 문단</p>

<h4 class="bold">1. 첫 번째 섹션</h4>
<p>섹션 내용</p>
<ul>
    <li><strong>키포인트:</strong> 설명</li>
</ul>

<h4 class="bold">2. 두 번째 섹션</h4>
<p>섹션 내용</p>

<!-- Alert/Callout box -->
<div class="alert bg-light border-start border-5 border-success p-4 my-5">
    <h5 class="fw-bold mb-3">📞 상담 안내</h5>
    <p class="mb-0">연락처 정보...</p>
</div>
```

### Post Layout (post.html)
```html
<header class="bg-image-full" style="background-image: url('/assets/img/main.jpg');">
    <div class="hero-text-box shadowText">
        <h1>{{ page.title }}</h1>
        <p>{{ page.date | date: "%Y년 %m월 %d일" }}</p>
    </div>
</header>

<article class="bg-white">
    <div class="container py-5">
        <div class="post-content">
            {% if page.image %}
            <img src="{{ page.image }}" alt="{{ page.title }}" class="img-fluid mb-5 shadow-lg rounded-4">
            {% endif %}
            {{ content }}
            <hr class="my-5">
            <div class="text-center">
                <a href="/blog.html" class="btn btn-outline-primary-custom btn-lg">← 블로그 목록으로 돌아가기</a>
            </div>
        </div>
    </div>
</article>
```

---

## Responsive Design

### Mobile Breakpoints
```css
@media (max-width: 768px) {
    .hero-text-box h1 {
        font-size: 1.75rem;
        white-space: normal;  /* Allow text wrapping */
    }

    .hero-text-box p {
        font-size: 0.95rem;
        letter-spacing: 1px;
    }

    .hero-text-box {
        padding: 2rem 1.5rem;
        margin: 0 1rem;
    }

    section {
        padding: 3rem 0;
    }
    
    section h2 {
        font-size: 1.75rem;
    }
}

@media (max-width: 576px) {
    .bg-image-full {
        min-height: 350px;
        background-attachment: scroll;  /* Disable parallax on mobile */
    }
    
    .hero-text-box h1 {
        font-size: 1.5rem;
    }
}
```

---

## Animations

### Keyframes
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

### Button Shine Effect
```css
.btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.5s;
}

.btn:hover::before {
    left: 100%;
}
```

---

## Page-Specific Patterns

### Homepage (index.html)
1. Hero with CTA buttons
2. Welcome section (2-column: text + stat cards)
3. Services section (3-column icon cards)
4. Blog section (2 latest posts)
5. News section (announcements)
6. CTA section (phone number)

### Services Page (area.html)
1. Hero
2. Introduction text with divider
3. 8 service cards in 3-column grid
4. Contact CTA box

### About Page (bg.html)
1. Hero
2. Profile section (photo + credentials)
3. Career cards (2x2 grid)
4. Awards section

### Contact Page (to.html)
1. Hero
2. Contact cards (address, email, phone) in 3-column
3. Directions with images
4. Office photos (2-column)

### Blog Page (blog.html)
1. Hero
2. Post cards (2-column grid)
3. Empty state if no posts

### Gallery Page (gallary.html)
1. Hero
2. Photo cards (2-column grid)

---

## Key Design Principles

1. **Consistency**: All hero sections use the same height (45vh, min 400px, max 500px)
2. **Visibility**: Keep overlays light (15-20%) so background images are clearly visible
3. **Hierarchy**: Use badges → headings → dividers → content
4. **Interactivity**: Subtle hover effects (translateY, scale, shadow changes)
5. **Korean Typography**: Pretendard font for optimal Korean text rendering
6. **Professional**: Green/gold color scheme conveys trust and expertise
7. **Mobile-First**: Responsive breakpoints at 768px and 576px

---

## Important Notes

- **_site/ folder** is auto-generated by Jekyll - never edit files there directly
- **Background image** (main.jpg) is Yosemite - position at 70% to show mountains
- **Primary CTA phone number**: 02-381-1355 (always prominent)
- **Jekyll templating**: Use `{{ '/path' | relative_url }}` for all internal links
- **Active nav states**: Use Liquid conditionals to highlight current page
