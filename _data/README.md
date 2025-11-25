# 📝 Data Files for Easy Content Updates

This folder contains YAML data files that make it easy to update content on the website without editing HTML files directly.

## 📁 File Structure

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `team.yml` | Team member profiles | When members join/leave |
| `research.yml` | Research areas & sectors | When adding new research |
| `publications.yml` | Publication list | When papers are published |
| `news.yml` | Lab news items | Regular updates |
| `gallery.yml` | Photo gallery | After events |
| `projects.yml` | Research projects | When projects start/end |
| `equipment.yml` | Lab equipment & software | When acquiring new tools |

---

## 👥 Team Members (`team.yml`)

### Adding a New Student
```yaml
phd_students:  # or ms_students, undergraduate_students
  - name_en: "English Name"
    name_kr: "한글이름"
    position: "MS/Ph.D Student"
    start_date: "2025.3~"
    email: "email@hanyang.ac.kr"
    front_image: "assets/img/formal_photo.jpg"
    back_image: "assets/img/casual_photo.jpg"  # For hover effect
    google_scholar: "https://scholar.google.com/..."  # Optional
    research_interests:
      - "Research Topic 1"
      - "Research Topic 2"
```

### Adding Alumni
```yaml
alumni:
  - name_en: "Graduate Name"
    name_kr: "한글이름"
    degree: "MS"  # or "PhD"
    graduation_year: 2025
    current_position: "Job Title"
    company: "Company Name"
    thesis_title: "Thesis Title"
```

---

## 🔬 Research Areas (`research.yml`)

### Adding a New Research Sector
```yaml
sectors:
  - id: "new-sector-id"
    title: "Sector Title"
    title_kr: "한글 제목"
    icon: "🔋"  # Emoji icon
    color: "#0d6efd"  # Card accent color
    image: "assets/img/sector_image.jpg"
    
    description:
      en: "English description..."
      kr: "한글 설명..."
    
    capabilities:
      - "Capability 1"
      - "Capability 2"
    
    tools:
      - "Software/Tool 1"
      - "Software/Tool 2"
    
    past_projects:
      - name: "Project Name"
        sponsor: "Sponsor"
        year: "2024-Present"
        description: "Brief description"
    
    publications:
      - title: "Paper Title"
        authors: "Author1, Author2"
        journal: "Journal Name"
        year: 2024
```

---

## 📚 Publications (`publications.yml`)

### Adding a New Publication
```yaml
battery_publications:  # or fuelcell_publications
  - title: "Full Paper Title"
    authors: "J. Kim*, Author2, Author3"
    journal: "Journal Name"
    year: 2025
    doi: "https://doi.org/..."  # Optional
    category: battery
```

---

## 📰 News (`news.yml`)

### Adding a News Item
```yaml
news_items:
  - title: "뉴스 제목"
    date: "2025-12-01"
    image: "assets/img/news_image.jpg"
    summary: "카드에 표시될 짧은 요약"
    content: "모달에 표시될 전체 내용<br>줄바꿈은 <br> 사용"
```

---

## 🖼️ Gallery (`gallery.yml`)

### Adding a Gallery Item
```yaml
gallery_items:
  - title: "이벤트 제목"
    date: "2025-12-01"
    image: "assets/img/gallery_image.jpg"
    description: "설명<br>줄바꿈은 <br> 사용"
    page: 1  # Gallery page number (1, 2, or 3)
```

---

## 📋 Projects (`projects.yml`)

### Adding a New Project
```yaml
ongoing_projects:
  - id: "project-id"
    title_en: "Project Title"
    title_kr: "프로젝트 제목"
    sponsor: "Funding Agency"
    role: "Role in Project"
    period: "2025.01 - Present"
    pi: "Prof. Jinyong Kim"
    description:
      en: "English description"
      kr: "한글 설명"
    related_sectors:
      - "thermal-runaway"
    team_members:
      - "Student Name 1"
      - "Student Name 2"
```

---

## 🔧 Equipment (`equipment.yml`)

### Adding New Equipment
```yaml
experimental:
  electrochemical:
    - name: "Equipment Name"
      model: "Model Number"
      specifications:
        - "Spec 1"
        - "Spec 2"
      use_cases:
        - "Use case 1"
        - "Use case 2"
```

---

## 📌 Important Notes

1. **Image paths**: All images should be placed in `assets/img/` folder
2. **Date format**: Use `YYYY-MM-DD` format for news/gallery, `YYYY.MM~` for team
3. **Line breaks**: Use `<br>` for line breaks in descriptions
4. **Special characters**: Wrap text with special characters in quotes
5. **Order matters**: Items are displayed in the order they appear in the file
6. **Korean & English**: Provide both `_en` and `_kr` versions when applicable

## 🔄 After Updating

Changes will be reflected:
- **Locally**: After Jekyll rebuilds (automatic with `jekyll serve`)
- **Production**: After pushing to GitHub (GitHub Pages will rebuild)

---

*Last updated: November 2025*

