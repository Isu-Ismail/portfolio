export const data = {
  name: "A.M. Ismail",
  role: "System Architect & Developer",
  resume: "./assets/resume_ismail.pdf",
  gamePath: [
      { "Dino": "./games/dino/dino.html" },
      { "Pacman": "./games/pacman/pacman.html" },
      { "Tetris": "./games/tetris/tetris.html" }
    ],
  // REPLACE THESE LINKS WITH YOUR ACTUAL IMAGE PATHS (e.g., './assets/me.jpg')
  images: {
    profile: "./assets/me.jpeg", 
    hero: "./assets/hero.jpeg"
  },
  contact: {
    email: "ismailsims1@gmail.com",
    phone: "81248 14896",
    location: "Chennai, India",
    github: "https://github.com/Isu-Ismail",
    linkedin: "https://www.linkedin.com/in/ismail-am" 
  },
  about: "Production Engineering student focused on System Architecture and Rapid Prototyping. I specialize in designing distributed systems and utilize AI-augmented workflows to execute complex implementations efficiently. Tech-agnostic problem solver capable of deploying robust solutions across multiple environments.",
  education: [
    {
      degree: "B.E. Production Engineering",
      institution: "Madras Institute of Technology",
      period: "Aug 2023 - Present",
      description: "CGPA: 7.61/10. Currently in III Year."
    },
    {
      degree: "Higher Secondary (HSC)",
      institution: "L K Higher Secondary School",
      period: "2022 - 2023",
      description: "Score: 90% (Bio-Maths)"
    }
  ],
  skills: [
    "System Architecture", "Git", "Github(pages,actions)","CI/CD", "AI-Augmented Dev", "Docker", "Nginx", "Linux", "Python", "Flutter",  "Rapid Prototyping",  "System Integration",
  ],
  interests: ["3D Printing", "Home Server Administration", "Karting", "Tech Exploration"],
  certificates: [
    {
      title: "RUSA 2.0 AI in Smart BMS",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // Replace with ./assets/cert-ai.jpg
      desc: "Hands-on training on AI applications in Smart Battery Management Systems."
    },
    {
      title: "Arduino Bootcamp",
      image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80", // Replace with ./assets/cert-arduino.jpg
      desc: "Comprehensive bootcamp on microcontroller programming and hardware interaction."
    },
    {
      title: "Python for Data Science",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Replace with ./assets/cert-python.jpg
      desc: "Foundational course on Python libraries including Pandas and NumPy by IBM."
    }
  ],
  projects: [
    {
      title: "Ct Ski (Local Colab)",
      description: "Architected a distributed cloud computing platform using college infrastructure. Utilized Docker, NFS, and NextJS to handle heavy ML workloads for students.",
      tags: ["Distributed Systems", "Docker", "NextJS"],
      link: "https://github.com/Isu-Ismail/local-colab-v2"
    },
    {
      title: "CWM (CLI Workspace Manager)",
      description: "A Python-based CLI tool to automate developer workspace setup. Features session management (Tmux), command tracking, and project organization.",
      tags: ["Python", "CLI", "Productivity"],
      link: "https://github.com/Isu-Ismail/CWM"
    },
    {
      title: "Anna University App",
      description: "Contributed to the frontend development of the official e-Governance app using Flutter. Assisted in UI/UX implementation for large-scale user adoption.",
      tags: ["Flutter", "Dart", "Mobile"],
      link: "https://play.google.com/store/apps/details?id=com.cegov.AUeGov"
    },
    {
      title: "Virtual Lab for Metrology",
      description: "Designed a high-concurrency Virtual Lab suite with a Profile Projector simulator. Optimized for 100+ RPS using Nginx and Dockerized React containers.",
      tags: ["React", "Nginx", "Simulation"],
      link: "https://github.com/Isu-Ismail/virtual_lab"
    },
    {
       title: "Chemical Treatment Plant Automation project(SRI enegry)",
       description: "Automated a chemical treatment plant for SRI Energy. Developed a prototype model using Arduino and sensors to monitor and control the crane movement",
       tags: ["Automation", "Hardware", "Prototype"],
       link: "#"
    },
    {
      title: "Attender App",
      description: "Mobile application to streamline attendance tracking for academic environments with a local database(hive) combined with the Google Drive API to ensure offline functionality as well as a cloud dashboard",
      tags: ["Flutter", "Hive", "Utility", "Google Drive API"],
      link: "https://github.com/Isu-Ismail/ATTENDER_APP"
    },
    {
      title: "MITONAUR Motorsports",
      description: "Designed chassis parts for the team go-kart. Participated in TNKC and KEC 2025 championships with focus on structural analysis.",
      tags: ["Mechanical Design", "Automotive"],
      link: "#"
    }
  ]
};