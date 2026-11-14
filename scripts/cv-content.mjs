/**
 * What the CV says, once in English and once in Georgian. scripts/cv.mjs
 * lays both out the same way and prints them as PDFs (`npm run cv`).
 *
 * To change the CV, change the words here and run `npm run cv` again. Keep
 * the two versions saying the same things.
 */

const reach = (place) => [
  { text: place },
  { text: '+995 599 25 18 40', href: 'tel:+995599251840' },
  { text: 'giorgi.khvichia18@gmail.com', href: 'mailto:giorgi.khvichia18@gmail.com' },
  { text: 'khvichia.giorgi22@gtu.ge', href: 'mailto:khvichia.giorgi22@gtu.ge' },
  { text: 'github.com/GioGio2004', href: 'https://github.com/GioGio2004' },
  { text: 'linkedin.com/in/giorgi-khvichia-a73755254', href: 'https://www.linkedin.com/in/giorgi-khvichia-a73755254/' },
  { text: 'khvichia.shemoqmedi.space', href: 'https://khvichia.shemoqmedi.space' },
]

const TECH = 'Next.js, TypeScript, Convex, Clerk, MCP.'

export const cv = {
  en: {
    lang: 'en',
    file: 'Giorgi-Khvichia-CV.pdf',
    name: 'Giorgi Khvichia',
    role: 'Full-Stack Software Engineer',
    sub: 'Master’s student in Computer Systems and Network Technologies',
    footer: 'Giorgi Khvichia · Full-Stack Engineer',
    reach: reach('Tbilisi, Georgia'),
    profile: {
      label: 'Profile',
      text: 'Full-stack engineer working in modern web architecture, real-time databases, AI integrations and EdTech platforms. Graduate of the English-language Computer Science programme at the Georgian Technical University, and now a master’s student there. Bank of Georgia scholarship holder and winner of the “AI for Businesses” hackathon.',
    },
    experience: {
      label: 'Experience',
      title: 'Full-Stack Engineer',
      meta: 'Individual entrepreneur',
      date: '2025 – present',
      points: [
        {
          lead: 'Voloostore',
          link: 'voloostore.ge',
          text: 'Designed and run the architecture of an e-commerce platform; integrated the Flitt payment system, an order-management panel and the server infrastructure.',
        },
        {
          lead: 'System architecture',
          text: 'Designed multi-subdomain web systems in which public platforms, admin panels and specialised tools run isolated from one another and securely.',
        },
        {
          lead: 'Kenchogroup',
          link: 'kenchogroup.ge',
          text: 'Designed and maintain the digital platform of an interior design studio, and an interactive web interface for planning furniture.',
        },
      ],
    },
    projects: {
      label: 'Projects',
      techLabel: 'Technologies',
      items: [
        {
          title: 'Kalami',
          link: 'kalami.space',
          date: '2026 – ongoing',
          meta: 'Author and system architect',
          text: 'An interactive platform and code sandbox built for university teaching: course management, practical assignments completed in real time, automated checking and academic-integrity verification. In active development.',
          tech: TECH,
        },
        {
          title: 'shemoqmedi',
          link: 'shemoqmedi.space',
          date: '2026',
          meta: 'Founder and lead developer',
          text: 'An AI virtual assistant for online menus: interactive navigation, personalised choices and automated service. Winning project of the Georgian Chamber of Commerce and Industry hackathon.',
        },
      ],
    },
    education: {
      label: 'Education',
      items: [
        {
          title: 'Georgian Technical University',
          date: 'September 2026 – present',
          lines: ['Master’s degree · Computer Systems and Network Technologies'],
        },
        {
          title: 'Georgian Technical University',
          date: '2022 – 2026',
          lines: ['Bachelor of Computer Science', 'English-language programme'],
        },
      ],
    },
    awards: {
      label: 'Awards and international experience',
      items: [
        {
          title: 'Winner · “AI for Businesses” hackathon',
          date: '2026',
          text: 'Two-week hackathon of the Georgian Chamber of Commerce and Industry. Winning project: shemoqmedi.space, an intelligent AI assistant for online menus.',
        },
        {
          title: 'Bank of Georgia scholarship holder',
          text: 'Study scholarship at the Georgian Technical University for high academic performance and activity in technology.',
        },
        {
          title: 'GITEX AI Europe · Berlin, Germany',
          date: 'June – July 2026',
          text: 'Participant in the international technology and artificial intelligence conference.',
        },
        {
          title: 'TechCrunch Startup Battlefield',
          date: '2025',
          text: 'Participant in the regional startup competition and holder of its official certificate.',
        },
      ],
    },
    skills: {
      label: 'Technical skills',
      rows: [
        ['Languages', 'TypeScript, JavaScript (ES6+), Python, C++, HTML5, CSS3.'],
        ['Frontend', 'Next.js (App Router), React.js, Tailwind CSS, shadcn/ui; responsive and interactive UI architecture.'],
        ['Backend and cloud', 'Node.js, Convex, Supabase, MongoDB Atlas, Clerk Authentication, RESTful APIs, Vercel.'],
        ['AI and protocols', 'Model Context Protocol (MCP), LLM API integration, Google AI Studio, prompt engineering, agentic workflows.'],
        ['Networks and security', 'Linux (Kali), network diagnostics, Nmap, FTP protocols, web application security.'],
        ['Engineering and prototyping', 'Git/GitHub, Figma, CAD/CAM digital fabrication, hardware prototyping, LightBurn, LaserGRBL.'],
      ],
    },
    languages: {
      label: 'Languages',
      rows: [
        ['Georgian', 'Native.'],
        ['English', 'Fluent (C1), academic and professional level.'],
      ],
    },
  },

  ka: {
    lang: 'ka',
    file: 'Giorgi-Khvichia-CV-KA.pdf',
    name: 'გიორგი ხვიჩია',
    role: 'Full-Stack პროგრამული უზრუნველყოფის ინჟინერი',
    sub: 'კომპიუტერული სისტემებისა და ქსელური ტექნოლოგიების მაგისტრანტი',
    footer: 'გიორგი ხვიჩია · Full-Stack ინჟინერი',
    /** Sections that start a new page (the Georgian text runs longer, and Education would otherwise be cut in two). */
    newPage: ['education'],
    reach: reach('თბილისი, საქართველო'),
    profile: {
      label: 'პროფესიული პროფილი',
      text: 'Full-Stack ინჟინერი თანამედროვე ვებ-არქიტექტურის, რეალურ დროში მომუშავე მონაცემთა ბაზების, AI ინტეგრაციებისა და EdTech პლატფორმების მიმართულებით. სტუ-ის ინგლისურენოვანი კომპიუტერული მეცნიერებების პროგრამის კურსდამთავრებული და მაგისტრანტი. საქართველოს ბანკის სტიპენდიანტი და ჰაკათონის „AI ბიზნესებისთვის“ გამარჯვებული.',
    },
    experience: {
      label: 'პროფესიული გამოცდილება',
      title: 'Full-Stack ინჟინერი',
      meta: 'ინდივიდუალური მეწარმე',
      date: '2025 – დღემდე',
      points: [
        {
          lead: 'Voloostore',
          link: 'voloostore.ge',
          text: 'ელექტრონული კომერციის პლატფორმის არქიტექტურის შექმნა და მართვა; Flitt-ის გადახდის სისტემის, შეკვეთების მართვის პანელისა და სერვერული ინფრასტრუქტურის ინტეგრაცია.',
        },
        {
          lead: 'სისტემური არქიტექტურა',
          text: 'მულტი-სუბდომენური ვებ-სისტემების პროექტირება საჯარო პლატფორმების, ადმინისტრაციული პანელებისა და სპეციალიზებული ხელსაწყოების იზოლირებული და უსაფრთხო მუშაობისთვის.',
        },
        {
          lead: 'Kenchogroup',
          link: 'kenchogroup.ge',
          text: 'ინტერიერის დიზაინის სტუდიის ციფრული პლატფორმისა და ავეჯის დაგეგმარების ინტერაქტიული ვებ-ინტერფეისის პროექტირება და ტექნიკური უზრუნველყოფა.',
        },
      ],
    },
    projects: {
      label: 'საგანმანათლებლო და ინოვაციური პროექტები',
      techLabel: 'ტექნოლოგიები',
      items: [
        {
          title: 'Kalami',
          link: 'kalami.space',
          date: '2026 – მიმდინარე',
          meta: 'ავტორი და სისტემური არქიტექტორი',
          text: 'საუნივერსიტეტო სასწავლო პროცესისთვის შექმნილი ინტერაქტიული პლატფორმა და კოდის სენდბოქსი. კურსების მართვა, პრაქტიკული დავალებების რეალურ დროში შესრულება, ავტომატიზებული შემოწმება და აკადემიური კეთილსინდისიერების ვერიფიკაცია. პროექტი აქტიური განვითარების ეტაპზეა.',
          tech: TECH,
        },
        {
          title: 'shemoqmedi',
          link: 'shemoqmedi.space',
          date: '2026',
          meta: 'დამფუძნებელი და მთავარი დეველოპერი',
          text: 'ონლაინ მენიუების AI ვირტუალური ასისტენტი: ინტერაქტიული ნავიგაცია, პერსონალიზებული არჩევანი და მომსახურების ავტომატიზაცია. საქართველოს სავაჭრო-სამრეწველო პალატის ჰაკათონის გამარჯვებული პროექტი.',
        },
      ],
    },
    education: {
      label: 'განათლება',
      items: [
        {
          title: 'საქართველოს ტექნიკური უნივერსიტეტი',
          date: 'სექტემბერი 2026 – დღემდე',
          lines: ['მაგისტრატურა · კომპიუტერული სისტემები და ქსელური ტექნოლოგიები'],
        },
        {
          title: 'საქართველოს ტექნიკური უნივერსიტეტი',
          date: '2022 – 2026',
          lines: ['კომპიუტერული მეცნიერებების ბაკალავრი', 'ინგლისურენოვანი პროგრამა'],
        },
      ],
    },
    awards: {
      label: 'ჯილდოები და საერთაშორისო გამოცდილება',
      items: [
        {
          title: 'გამარჯვებული · ჰაკათონი „AI ბიზნესებისთვის“',
          date: '2026',
          text: 'საქართველოს სავაჭრო-სამრეწველო პალატის ორკვირიანი ჰაკათონი. გამარჯვებული პროექტი: shemoqmedi.space - ონლაინ მენიუების ინტელექტუალური AI ასისტენტი.',
        },
        {
          title: 'საქართველოს ბანკის სტიპენდიანტი',
          text: 'სტუ-ში სასწავლო სტიპენდიის მფლობელი მაღალი აკადემიური მოსწრებისა და ტექნოლოგიური აქტივობისთვის.',
        },
        {
          title: 'GITEX AI Europe · ბერლინი, გერმანია',
          date: 'ივნისი – ივლისი 2026',
          text: 'საერთაშორისო ტექნოლოგიური და ხელოვნური ინტელექტის კონფერენციის მონაწილე.',
        },
        {
          title: 'TechCrunch Startup Battlefield',
          date: '2025',
          text: 'რეგიონული სტარტაპ-კონკურსის მონაწილე და ოფიციალური სერტიფიკატის მფლობელი.',
        },
      ],
    },
    skills: {
      label: 'ტექნიკური უნარები',
      rows: [
        ['პროგრამირების ენები', 'TypeScript, JavaScript (ES6+), Python, C++, HTML5, CSS3.'],
        ['Frontend', 'Next.js (App Router), React.js, Tailwind CSS, shadcn/ui; ადაპტიური და ინტერაქტიული UI არქიტექტურა.'],
        ['Backend და ღრუბლოვანი სისტემები', 'Node.js, Convex, Supabase, MongoDB Atlas, Clerk Authentication, RESTful APIs, Vercel.'],
        ['AI და პროტოკოლები', 'Model Context Protocol (MCP), LLM API ინტეგრაცია, Google AI Studio, Prompt Engineering, Agentic Workflows.'],
        ['ქსელები და უსაფრთხოება', 'Linux (Kali), ქსელური დიაგნოსტიკა, Nmap, FTP პროტოკოლები, ვებ-აპლიკაციების უსაფრთხოება.'],
        ['ინჟინერია და პროტოტიპირება', 'Git/GitHub, Figma, CAD/CAM ციფრული ფაბრიკაცია, აპარატურული პროტოტიპირება, LightBurn, LaserGRBL.'],
      ],
    },
    languages: {
      label: 'ენები',
      rows: [
        ['ქართული', 'მშობლიური.'],
        ['ინგლისური', 'თავისუფლად (C1) - აკადემიური და პროფესიული დონე.'],
      ],
    },
  },
}
