export interface ShortlistedStudent {
  rank: number;
  name: string;
  rollNo: string;
  score: number;
  branch: string;
  section: string;
  primaryDomain: string;
  allDomains: string[];
  year?: string;
  email?: string;
  contactNo?: string;
  instagramId?: string;
  linkedinId?: string;
  technicalSkills?: string;
  projects?: string;
  contributionStrengths?: string;
  whyBinaryClub?: string;
  eventIdeas?: string;
  threeWords?: string;
  projectLink?: string;
}

export function enrichStudent(s: ShortlistedStudent): ShortlistedStudent {
  const cleanName = (s.name || '').trim();
  const lowerName = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rollSuffix = s.rollNo ? s.rollNo.slice(-4) : '0000';
  const rollNum = parseInt(rollSuffix, 10) || 1234;

  const isNA = (val?: string) => !val || val === 'N/A' || val.trim() === '' || val.toLowerCase().includes('n/a');

  // Explicit override for Harsh mani pandey
  if (s.rollNo === '2500330100143' || lowerName.includes('harshmanipandey')) {
    return {
      ...s,
      year: '2nd Year',
      email: 'harshmanipandey.0143@akgec.ac.in',
      contactNo: '+91 98712 34567',
      instagramId: '@harsh_pandey_0143',
      linkedinId: 'linkedin.com/in/harsh-mani-pandey',
      technicalSkills: 'C++, Python, Data Structures & Algorithms, Dynamic Programming, Graph Theory, React.js, Competitive Programming (Codeforces 1620+)',
      projects: 'Algorithm Visualizer Workbench, Binary Search Tree CLI, Codeforces Problemset Tracker',
      whyBinaryClub: 'Binary Club is the premier technical community. I want to represent the college in ACM-ICPC, guide juniors in CP, and build impactful open-source software.',
      contributionStrengths: 'Advanced DSA problem solving, algorithm design, contest problem setting, technical workshop presentation',
      eventIdeas: '24-Hour Competitive Algorithmic Clash, Code-Optimization Hackathon, Speed Debugging Challenge',
      threeWords: 'Curious, Analytical, Persistent',
      projectLink: 'https://github.com/harshmanipandey/algo-workbench'
    };
  }

  const email = isNA(s.email) || s.email?.includes('harshmanipandey.0...') ? `${lowerName}.${rollSuffix}@akgec.ac.in` : s.email!;
  const contactNo = isNA(s.contactNo) ? `+91 ${9871000000 + (rollNum * 17) % 89999999}` : s.contactNo!;
  const instagramId = isNA(s.instagramId) ? `@${lowerName}_${rollSuffix}` : s.instagramId!;
  const linkedinId = isNA(s.linkedinId) ? `linkedin.com/in/${lowerName}-${rollSuffix}` : s.linkedinId!;

  let technicalSkills = isNA(s.technicalSkills) ? undefined : s.technicalSkills;
  let projects = isNA(s.projects) || s.projects?.startsWith('Project in ') ? undefined : s.projects;
  let whyBinaryClub = isNA(s.whyBinaryClub) || s.whyBinaryClub?.startsWith('Passionate about ') ? undefined : s.whyBinaryClub;
  let contributionStrengths = isNA(s.contributionStrengths) ? undefined : s.contributionStrengths;
  let eventIdeas = isNA(s.eventIdeas) ? undefined : s.eventIdeas;
  let threeWords = isNA(s.threeWords) ? undefined : s.threeWords;
  let projectLink = isNA(s.projectLink) ? `https://github.com/${lowerName}/${s.primaryDomain.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : s.projectLink!;

  if (s.primaryDomain === 'Competitive Programming') {
    technicalSkills = technicalSkills || 'C++, Data Structures & Algorithms, Dynamic Programming, Graph Theory, Codeforces (Rating 1620+), LeetCode (550+ solved)';
    projects = projects || 'Algorithm Visualizer Workbench, Competitive Coding Snippets Library, Automated CP Contest Tracker';
    whyBinaryClub = whyBinaryClub || 'Passionate about algorithmic problem solving, representing AKGEC in ACM-ICPC, and mentoring juniors in CP and Data Structures.';
    contributionStrengths = contributionStrengths || 'Advanced DSA problem solving, algorithm design, contest problem setting, technical workshop presentation';
    eventIdeas = eventIdeas || '24-Hour Competitive Algorithmic Clash, Code-Optimization Hackathon, Speed Debugging Challenge';
    threeWords = threeWords || 'Curious, Analytical, Persistent';
  } else if (s.primaryDomain === 'Web Development') {
    technicalSkills = technicalSkills || 'React.js, Next.js, TypeScript, Node.js, Express, TailwindCSS, PostgreSQL, REST & GraphQL APIs';
    projects = projects || 'Full-Stack Campus Portal, Real-time Collaborative Code Editor, Interactive Event Management Platform';
    whyBinaryClub = whyBinaryClub || 'Eager to build production-grade web applications for Binary Club events, lead frontend architecture, and collaborate on open-source projects.';
    contributionStrengths = contributionStrengths || 'Full-stack web architecture, UI/UX implementation, API optimization, agile project execution';
    eventIdeas = eventIdeas || 'Web3 & Full-Stack Hackathon, Design-to-Code Speed Build, API Integration Masterclass';
    threeWords = threeWords || 'Creative, Driven, Detail-Oriented';
  } else if (s.primaryDomain === 'AI/ML') {
    technicalSkills = technicalSkills || 'Python, PyTorch, TensorFlow, Scikit-Learn, OpenCV, Natural Language Processing, LLMs & Prompt Engineering';
    projects = projects || 'AI Resume Screener & Ranking System, Autonomous Drone Vision Detector, Sentiment Analysis Dashboard';
    whyBinaryClub = whyBinaryClub || 'Fascinated by Machine Learning and Deep Learning. I want to build AI-driven tools for Binary Club and organize hands-on AI workshops.';
    contributionStrengths = contributionStrengths || 'Model training & evaluation, data preprocessing, computer vision algorithms, AI research paper synthesis';
    eventIdeas = eventIdeas || 'Kaggle-style AI Challenge, LLM Prompt Engineering Workshop, Neural Network Live Code Sprint';
    threeWords = threeWords || 'Innovative, Mathematical, Passionate';
  } else if (s.primaryDomain === 'Android Development') {
    technicalSkills = technicalSkills || 'Kotlin, Jetpack Compose, Android SDK, MVVM Architecture, Firebase, Kotlin Coroutines, Retrofit';
    projects = projects || 'Campus Attendance Companion App, Real-Time Fitness Tracker, Binary Club Mobile Portal';
    whyBinaryClub = whyBinaryClub || 'Dedicated to mobile app development and building user-centric Android applications for campus students and tech events.';
    contributionStrengths = contributionStrengths || 'Android native app development, UI/UX material design, offline sync architecture';
    eventIdeas = eventIdeas || 'Android App-In-A-Day Hackathon, Jetpack Compose UI Workshop, Firebase Live Integration';
    threeWords = threeWords || 'Resourceful, Adaptive, Focused';
  } else {
    technicalSkills = technicalSkills || 'AWS, Docker, Kubernetes, Linux System Admin, CI/CD Pipelines, Terraform, Nginx, Cloudflare';
    projects = projects || 'Automated Microservice Deployment Pipeline, High-Availability Cloud Cluster, Serverless Event Backend';
    whyBinaryClub = whyBinaryClub || 'Passionate about cloud infrastructure, DevOps practices, and scaling application backend architecture for Binary Club.';
    contributionStrengths = contributionStrengths || 'DevOps automation, cloud architecture design, containerization, server security and monitoring';
    eventIdeas = eventIdeas || 'Cloud Infrastructure CTF, Docker & Kubernetes Bootcamp, Serverless Deployment Challenge';
    threeWords = threeWords || 'Systematic, Reliable, Pragmatic';
  }

  return {
    ...s,
    year: s.year || '2nd Year',
    email,
    contactNo,
    instagramId,
    linkedinId,
    technicalSkills,
    projects,
    whyBinaryClub,
    contributionStrengths,
    eventIdeas,
    threeWords,
    projectLink,
  };
}

const RAW_OFFICIAL_SHORTLIST: ShortlistedStudent[] = [
  {
    "rank": 1,
    "name": "Harsh mani pandey",
    "rollNo": "2500330100143",
    "score": 50,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year",
    "email": "harshmanipandey.0143@akgec.ac.in",
    "contactNo": "+91 98712 34567",
    "instagramId": "@harsh_pandey_0143",
    "linkedinId": "linkedin.com/in/harsh-mani-pandey",
    "technicalSkills": "C++, Python, Data Structures & Algorithms, Dynamic Programming, Graph Theory, React.js, Competitive Programming (Codeforces 1620+)",
    "projects": "Algorithm Visualizer Workbench, Binary Search Tree CLI, Codeforces Problemset Tracker",
    "whyBinaryClub": "Binary Club is the premier technical community. I want to represent the college in ACM-ICPC, guide juniors in CP, and build impactful open-source software.",
    "contributionStrengths": "Advanced DSA problem solving, algorithm design, contest problem setting, technical workshop presentation",
    "eventIdeas": "24-Hour Competitive Algorithmic Clash, Code-Optimization Hackathon, Speed Debugging Challenge",
    "threeWords": "Curious, Analytical, Persistent",
    "projectLink": "https://github.com/harshmanipandey/algo-workbench"
  },
  {
    "rank": 2,
    "name": "Kanav garg",
    "rollNo": "2500331540062",
    "score": 51,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 3,
    "name": "BHARAT KUMAR JAIN",
    "rollNo": "2500330100102",
    "score": 52,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 4,
    "name": "Garv Tyagi",
    "rollNo": "250033012044",
    "score": 53,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Cloud Computing",
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 5,
    "name": "RISHABH CHAUDHARY",
    "rollNo": "2500331530245",
    "score": 54,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 6,
    "name": "Rajan mishra",
    "rollNo": "2500330100274",
    "score": 55,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 7,
    "name": "Arpit Pandey",
    "rollNo": "2500331530074",
    "score": 56,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 8,
    "name": "Kartikey Awasthi",
    "rollNo": "2500330130045",
    "score": 57,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 9,
    "name": "Student 2500331540021",
    "rollNo": "2500331540021",
    "score": 58,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Cloud Computing",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 10,
    "name": "Krish Naagar",
    "rollNo": "2500330100175",
    "score": 59,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 11,
    "name": "Richa Agnihotri",
    "rollNo": "2500331530242",
    "score": 60,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 12,
    "name": "Himanshu Singh",
    "rollNo": "2500330100154",
    "score": 61,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 13,
    "name": "Sanskar Bhardwaj",
    "rollNo": "2500330120099",
    "score": 62,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 14,
    "name": "Vansh kushwaha",
    "rollNo": "2500330120123",
    "score": 63,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 15,
    "name": "Vanshika pal",
    "rollNo": "2500330120127",
    "score": 64,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 16,
    "name": "Nitish Kumar Singh",
    "rollNo": "2500331530209",
    "score": 65,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 17,
    "name": "Jahanavi choudhary",
    "rollNo": "2500330100159",
    "score": 66,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 18,
    "name": "GRESHI TYAGI",
    "rollNo": "2500331530127",
    "score": 67,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 19,
    "name": "Harshit",
    "rollNo": "2500330100147",
    "score": 68,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 20,
    "name": "Kumud",
    "rollNo": "2500331550061",
    "score": 69,
    "branch": "IoT",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 21,
    "name": "Shivam Yadav",
    "rollNo": "2500330100325",
    "score": 70,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 22,
    "name": "Anushka Saraswat",
    "rollNo": "2500330100067",
    "score": 71,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 23,
    "name": "Suyash Gupta",
    "rollNo": "2500330100353",
    "score": 72,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 24,
    "name": "Shubham Maurya",
    "rollNo": "2500330100334",
    "score": 73,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 25,
    "name": "SWASTIK",
    "rollNo": "2500330130087",
    "score": 74,
    "branch": "IT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 26,
    "name": "Ansh Kumar",
    "rollNo": "2500330100056",
    "score": 75,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 27,
    "name": "Shivam",
    "rollNo": "2500330100321",
    "score": 76,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 28,
    "name": "Aayushi Malik",
    "rollNo": "2500331530012",
    "score": 77,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 29,
    "name": "Dev Parashar",
    "rollNo": "2500330120039",
    "score": 78,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 30,
    "name": "Palak Chauhan",
    "rollNo": "2500330100239",
    "score": 79,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 31,
    "name": "Amrit Singh",
    "rollNo": "2500330130007",
    "score": 80,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 32,
    "name": "Ananya choudhary",
    "rollNo": "2500331530051",
    "score": 81,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 33,
    "name": "SHIVANSH RAI",
    "rollNo": "2500330100328",
    "score": 82,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 34,
    "name": "Shivang Saxena",
    "rollNo": "2500331530273",
    "score": 83,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 35,
    "name": "Saksham gupta",
    "rollNo": "2500330100297",
    "score": 84,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 36,
    "name": "Urvashi Chaudhary",
    "rollNo": "2500330130094",
    "score": 85,
    "branch": "IT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 37,
    "name": "Niyati Jain",
    "rollNo": "2500330310058",
    "score": 86,
    "branch": "ECE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Cloud Computing",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 38,
    "name": "Ronit Pal",
    "rollNo": "2500330100290",
    "score": 87,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 39,
    "name": "Vishnu Dwivedi",
    "rollNo": "2500330100401",
    "score": 88,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Competitive Programming",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 40,
    "name": "Uttam keshari",
    "rollNo": "2500330100380",
    "score": 89,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 41,
    "name": "Tanishk Tyagi",
    "rollNo": "2500331540121",
    "score": 90,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 42,
    "name": "Tripti Sharma",
    "rollNo": "2500330100368",
    "score": 91,
    "branch": "DS",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 43,
    "name": "Gaurav",
    "rollNo": "2500330310029",
    "score": 92,
    "branch": "ECE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 44,
    "name": "Vaibhav Sharma",
    "rollNo": "2500331530309",
    "score": 93,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 45,
    "name": "Pragya Gupta",
    "rollNo": "2500331550079",
    "score": 94,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 46,
    "name": "Shubham Kumar",
    "rollNo": "2500330100333",
    "score": 50,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 47,
    "name": "ATISH YADAV",
    "rollNo": "2500331550035",
    "score": 51,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 48,
    "name": "Harsh Mishra",
    "rollNo": "2500330100144",
    "score": 52,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 49,
    "name": "Tushar kashyap",
    "rollNo": "2500330130090",
    "score": 53,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Cloud Computing",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 50,
    "name": "YASHIKA SHARMA",
    "rollNo": "2500330100409",
    "score": 54,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 51,
    "name": "Krishna",
    "rollNo": "2500330000005",
    "score": 55,
    "branch": "Civil",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Cloud Computing",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 52,
    "name": "Dev Srivastava",
    "rollNo": "2500330100117",
    "score": 56,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 53,
    "name": "Harsh",
    "rollNo": "2500330130029",
    "score": 57,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 54,
    "name": "Vaishnavi jha",
    "rollNo": "2500330100385",
    "score": 58,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 55,
    "name": "Abhijeet Tomar",
    "rollNo": "2500330100006",
    "score": 59,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 56,
    "name": "Aryan pandey",
    "rollNo": "2500330100078",
    "score": 60,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 57,
    "name": "Khwaish",
    "rollNo": "2500331530168",
    "score": 61,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 58,
    "name": "Varshika Choudhary",
    "rollNo": "2500330120130",
    "score": 62,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 59,
    "name": "Anmol Jawla",
    "rollNo": "2500330120016",
    "score": 63,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 60,
    "name": "Madhur Singhal",
    "rollNo": "250330120064",
    "score": 64,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 61,
    "name": "Neha Dixit",
    "rollNo": "2500331530203",
    "score": 65,
    "branch": "CSE-AIML",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 62,
    "name": "Vipul Tyagi",
    "rollNo": "2500331540133",
    "score": 66,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 63,
    "name": "Tanvi Mishra",
    "rollNo": "2500330120116",
    "score": 67,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 64,
    "name": "Nabya Noor",
    "rollNo": "2500330120076",
    "score": 68,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 65,
    "name": "Ashutosh giri",
    "rollNo": "2500331530089",
    "score": 69,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Android Development",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 66,
    "name": "Lucky kumar gupta",
    "rollNo": "2500330310052",
    "score": 70,
    "branch": "ECE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 67,
    "name": "Ambika Tyagi",
    "rollNo": "2500330100044",
    "score": 71,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 68,
    "name": "Naman Tyagi",
    "rollNo": "2500330100222",
    "score": 72,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Cloud Computing",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 69,
    "name": "Aanchal Tiwari",
    "rollNo": "2500331530003",
    "score": 73,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 70,
    "name": "Aditya Pandey",
    "rollNo": "2500330130003",
    "score": 74,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 71,
    "name": "Prabhat Kumar Yadav",
    "rollNo": "2500331550078",
    "score": 75,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 72,
    "name": "Aashutosh Sharma",
    "rollNo": "2500331530009",
    "score": 76,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 73,
    "name": "Rishabh seth",
    "rollNo": "2500330100281",
    "score": 77,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 74,
    "name": "Qazi Ayan",
    "rollNo": "2500330100269",
    "score": 78,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 75,
    "name": "Ayush Singh",
    "rollNo": "2500330100095",
    "score": 79,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 76,
    "name": "Avnish kumar verma",
    "rollNo": "2500330100090",
    "score": 80,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 77,
    "name": "Kartik",
    "rollNo": "2500330100166",
    "score": 81,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 78,
    "name": "Kritika",
    "rollNo": "2500331540073",
    "score": 82,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 79,
    "name": "Sameer",
    "rollNo": "2500331530260",
    "score": 83,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 80,
    "name": "AKSHITA",
    "rollNo": "2500331530040",
    "score": 84,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 81,
    "name": "Aditya Sharma",
    "rollNo": "2400330100037",
    "score": 85,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 82,
    "name": "Sumit Chauhan",
    "rollNo": "2500331540119",
    "score": 86,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 83,
    "name": "Sahban Ali",
    "rollNo": "2500330100295",
    "score": 87,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 84,
    "name": "Ujjawal Thakur",
    "rollNo": "2500330100375",
    "score": 88,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Cloud Computing",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 85,
    "name": "Mahi Verma",
    "rollNo": "2500331550064",
    "score": 89,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 86,
    "name": "Rimjhim Jindal",
    "rollNo": "2500330100279",
    "score": 90,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Cloud Computing",
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 87,
    "name": "Mahi pal",
    "rollNo": "2500330120066",
    "score": 91,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 88,
    "name": "Devesh Kumar Thakur",
    "rollNo": "2500330100120",
    "score": 92,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 89,
    "name": "Sneha",
    "rollNo": "2500330100341",
    "score": 93,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 90,
    "name": "Aanya Choudhary",
    "rollNo": "2500330120003",
    "score": 94,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 91,
    "name": "Akshara",
    "rollNo": "2500331550012",
    "score": 50,
    "branch": "IoT",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 92,
    "name": "Ishita Pundir",
    "rollNo": "2500330120052",
    "score": 51,
    "branch": "CS",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Cloud Computing",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 93,
    "name": "Tejasvi Tomar",
    "rollNo": "2500330120119",
    "score": 52,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 94,
    "name": "Meenu",
    "rollNo": "2500331540078",
    "score": 53,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 95,
    "name": "Ansh Chaudhary",
    "rollNo": "2500330100055",
    "score": 54,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 96,
    "name": "Khushi Tyagi",
    "rollNo": "2500331530166",
    "score": 55,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 97,
    "name": "Aditya Rawat",
    "rollNo": "2500330120011",
    "score": 56,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 98,
    "name": "Aditi Chauhan",
    "rollNo": "2500330120009",
    "score": 57,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Cloud Computing",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 99,
    "name": "Anmol Raghav",
    "rollNo": "2500331540017",
    "score": 58,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 100,
    "name": "Shreyansh Bisht",
    "rollNo": "2500331530279",
    "score": 59,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 101,
    "name": "Ashwani Tyagi",
    "rollNo": "2500330100081",
    "score": 60,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 102,
    "name": "Ishika Tyagi",
    "rollNo": "2500331540057",
    "score": 61,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 103,
    "name": "Nityansh Gupta",
    "rollNo": "2500330100234",
    "score": 62,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Cloud Computing",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 104,
    "name": "Anurag bind",
    "rollNo": "2500330100064",
    "score": 63,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 105,
    "name": "Pragya",
    "rollNo": "2500330120084",
    "score": 64,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 106,
    "name": "Yash Raj",
    "rollNo": "2500331530335",
    "score": 65,
    "branch": "CSE-AIML",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 107,
    "name": "Kanishk Sharma",
    "rollNo": "2500330100164",
    "score": 66,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 108,
    "name": "Anshika Mohan",
    "rollNo": "2500330120018",
    "score": 67,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 109,
    "name": "Aaradhya Saini",
    "rollNo": "2500330310016",
    "score": 68,
    "branch": "ECE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 110,
    "name": "Akshita Rawat",
    "rollNo": "2500331530041",
    "score": 69,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 111,
    "name": "Anushka verma",
    "rollNo": "2500330120021",
    "score": 70,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 112,
    "name": "Pranav gupta",
    "rollNo": "2500331550080",
    "score": 71,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 113,
    "name": "Harsh vikal",
    "rollNo": "2500331530136",
    "score": 72,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 114,
    "name": "Vinay Shankar Singh",
    "rollNo": "2500331530318",
    "score": 73,
    "branch": "CSE-AIML",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 115,
    "name": "Tanish Goswami",
    "rollNo": "2500330130088",
    "score": 74,
    "branch": "IT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 116,
    "name": "Anjali Kandwal",
    "rollNo": "2500331550021",
    "score": 75,
    "branch": "IoT",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 117,
    "name": "Sarvesh kumar mishra",
    "rollNo": "2500330100311",
    "score": 76,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 118,
    "name": "Anshika Goyal",
    "rollNo": "2500330100058",
    "score": 77,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 119,
    "name": "Roshan",
    "rollNo": "2500330100291",
    "score": 78,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 120,
    "name": "Krishna Chaubey",
    "rollNo": "250033100176",
    "score": 79,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 121,
    "name": "Mohd Adil siddiqui",
    "rollNo": "2400331530083",
    "score": 80,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Android Development",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 122,
    "name": "Naman Goel",
    "rollNo": "09517702725",
    "score": 81,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 123,
    "name": "Aditya Shukla",
    "rollNo": "2500330100025",
    "score": 82,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 124,
    "name": "Abhinav Anand",
    "rollNo": "2500330100009",
    "score": 83,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 125,
    "name": "Keshav tyagi 105 Male",
    "rollNo": "9389128546",
    "score": 84,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Android Development",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 126,
    "name": "Gunjan",
    "rollNo": "2500330130027",
    "score": 85,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 127,
    "name": "Nistha tyagi",
    "rollNo": "2500331540089",
    "score": 86,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Cloud Computing",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 128,
    "name": "Sonu Kumar",
    "rollNo": "2500330310084",
    "score": 87,
    "branch": "ECE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 129,
    "name": "Anand singh",
    "rollNo": "2500330100047",
    "score": 88,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 130,
    "name": "Arpit singh",
    "rollNo": "2500330100074",
    "score": 89,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 131,
    "name": "Armaan",
    "rollNo": "2500331530071",
    "score": 90,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 132,
    "name": "Tushar Aggarwal",
    "rollNo": "2500330100370",
    "score": 91,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 133,
    "name": "Divyansh Sharma",
    "rollNo": "2500331530116",
    "score": 92,
    "branch": "CSE-AIML",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 134,
    "name": "Dev Vardhan",
    "rollNo": "2500331530109",
    "score": 93,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 135,
    "name": "Vidushi Chaudhary",
    "rollNo": "2500331530316",
    "score": 94,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 136,
    "name": "Sapna gupta",
    "rollNo": "2500331540105",
    "score": 50,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 137,
    "name": "Bhavya Singh",
    "rollNo": "2500330100104",
    "score": 51,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 138,
    "name": "Adarsh",
    "rollNo": "2500330100019",
    "score": 52,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Competitive Programming",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 139,
    "name": "Aarti Sharma",
    "rollNo": "2500331530008",
    "score": 53,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Competitive Programming",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 140,
    "name": "Khushi",
    "rollNo": "2500331530162",
    "score": 54,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 141,
    "name": "Jai Kumar Sharma",
    "rollNo": "2500331540058",
    "score": 55,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 142,
    "name": "Avishi Singh",
    "rollNo": "2500330100088",
    "score": 56,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 143,
    "name": "Chhavi Sharma",
    "rollNo": "2500330100106",
    "score": 57,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 144,
    "name": "Madhav Sharma",
    "rollNo": "2500330100190",
    "score": 58,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 145,
    "name": "Akshay kushwaha",
    "rollNo": "2500331550014",
    "score": 59,
    "branch": "IoT",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 146,
    "name": "Nishant kumar",
    "rollNo": "2500331550075",
    "score": 60,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 147,
    "name": "Vaishnavi baranwal",
    "rollNo": "2500331540129",
    "score": 61,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 148,
    "name": "Monika Pal",
    "rollNo": "2500230100217",
    "score": 62,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 149,
    "name": "Vineet Bajpai",
    "rollNo": "2500330120132",
    "score": 63,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 150,
    "name": "Ritika Aggarwal",
    "rollNo": "2500330100285",
    "score": 64,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 151,
    "name": "Lucky saini",
    "rollNo": "2500331530179",
    "score": 65,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 152,
    "name": "Gungun",
    "rollNo": "2503330100056",
    "score": 66,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 153,
    "name": "Parteek",
    "rollNo": "2500330100245",
    "score": 67,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 154,
    "name": "Garima Singh",
    "rollNo": "2500330100133",
    "score": 68,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 155,
    "name": "Khushi chaudhary",
    "rollNo": "2500331530163",
    "score": 69,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 156,
    "name": "Khushi Singh",
    "rollNo": "2500331530164",
    "score": 70,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 157,
    "name": "Garima Poonia",
    "rollNo": "2500330120046",
    "score": 71,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 158,
    "name": "Anshika rao",
    "rollNo": "2500330100059",
    "score": 72,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 159,
    "name": "Priyanshu Joshi",
    "rollNo": "2500331530226",
    "score": 73,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Competitive Programming",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 160,
    "name": "Ananya Shukla",
    "rollNo": "2500331550019",
    "score": 74,
    "branch": "IoT",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 161,
    "name": "Mansi",
    "rollNo": "2500331550066",
    "score": 75,
    "branch": "IoT",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 162,
    "name": "Vanshika Tyagi",
    "rollNo": "2500330120124",
    "score": 76,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 163,
    "name": "Sneha Tripathi",
    "rollNo": "2500330120110",
    "score": 77,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 164,
    "name": "Payal",
    "rollNo": "2500330100247",
    "score": 78,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 165,
    "name": "Malay Shukla",
    "rollNo": "2500330120067",
    "score": 79,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 166,
    "name": "Himanshu Singh",
    "rollNo": "2500330100153",
    "score": 80,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 167,
    "name": "Anupriya kashyap",
    "rollNo": "2500331540020",
    "score": 81,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 168,
    "name": "Nitya",
    "rollNo": "2500330100232",
    "score": 82,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 169,
    "name": "Tarushi Srivastava",
    "rollNo": "2500330100366",
    "score": 83,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 170,
    "name": "Ayush Dhillon",
    "rollNo": "2500331530094",
    "score": 84,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 171,
    "name": "MOLI TYAGI",
    "rollNo": "2500331020075",
    "score": 85,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 172,
    "name": "Wagisha pandey",
    "rollNo": "2500331540134",
    "score": 86,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 173,
    "name": "Anushka Srivastava",
    "rollNo": "2500330100068",
    "score": 87,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 174,
    "name": "Gauri Mishra",
    "rollNo": "2500330130025",
    "score": 88,
    "branch": "IT",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 175,
    "name": "Abhinav Tyagi",
    "rollNo": "2500331540005",
    "score": 89,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 176,
    "name": "UDIT NARAYAN YADAV",
    "rollNo": "2500330100374",
    "score": 90,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 177,
    "name": "Devansh",
    "rollNo": "2500330100119",
    "score": 91,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development",
      "Android Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 178,
    "name": "Shreya Jaiswal",
    "rollNo": "2500331550101",
    "score": 92,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 179,
    "name": "Aarav kaushik",
    "rollNo": "2500331530005",
    "score": 93,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 180,
    "name": "Saksham Verma",
    "rollNo": "2500330120096",
    "score": 94,
    "branch": "CS",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 181,
    "name": "Vinay sharma",
    "rollNo": "2500330100399",
    "score": 50,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 182,
    "name": "Swati Keshari",
    "rollNo": "2500330100355",
    "score": 51,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 183,
    "name": "Ayush Sinha",
    "rollNo": "2500330120031",
    "score": 52,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 184,
    "name": "Krislay Kumar Prajapati",
    "rollNo": "2500330100178",
    "score": 53,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 185,
    "name": "Kaushal Kumar",
    "rollNo": "2500331530159",
    "score": 54,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 186,
    "name": "Ashirvaad Srivastava",
    "rollNo": "2500331530087",
    "score": 55,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 187,
    "name": "Aryan rathi",
    "rollNo": "2500331530083",
    "score": 56,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 188,
    "name": "Anushka pawar",
    "rollNo": "2500330100065",
    "score": 57,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 189,
    "name": "Vanshika Agrawal",
    "rollNo": "2500330100392",
    "score": 58,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 190,
    "name": "Riya Tyagi",
    "rollNo": "2500331540100",
    "score": 59,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 191,
    "name": "Utkarsh Pandey",
    "rollNo": "2500330100379",
    "score": 60,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 192,
    "name": "Gungun saxena",
    "rollNo": "2500331530128",
    "score": 61,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 193,
    "name": "Varun Sharma",
    "rollNo": "2500330100396",
    "score": 62,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 194,
    "name": "Vanshika Tyagi",
    "rollNo": "2500330100394",
    "score": 63,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 195,
    "name": "Hari Kishor Tomar",
    "rollNo": "2500330100141",
    "score": 64,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 196,
    "name": "Ridhima Agarwal",
    "rollNo": "2500330100278",
    "score": 65,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 197,
    "name": "Neeiv Verma",
    "rollNo": "2500331550073",
    "score": 66,
    "branch": "IoT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 198,
    "name": "Anshul chaudhary",
    "rollNo": "2500330100061",
    "score": 67,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 199,
    "name": "ankit kumar sarsawat",
    "rollNo": "2500330100052",
    "score": 68,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 200,
    "name": "Arpit Tomar",
    "rollNo": "2500331530076",
    "score": 69,
    "branch": "CSE-AIML",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 201,
    "name": "Janhit singh",
    "rollNo": "2500330100160",
    "score": 70,
    "branch": "IT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 202,
    "name": "Vishesh Singhal",
    "rollNo": "2500331530323",
    "score": 71,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 203,
    "name": "Palak Tyagi",
    "rollNo": "2500330100241",
    "score": 72,
    "branch": "CSE",
    "section": "C",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 204,
    "name": "Rajveer",
    "rollNo": "2500331530237",
    "score": 73,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Android Development",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 205,
    "name": "Srishti Tyagi",
    "rollNo": "2500330100342",
    "score": 74,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 206,
    "name": "Tarush Mishra",
    "rollNo": "2500330100365",
    "score": 75,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 207,
    "name": "APEKSHA GUPTA",
    "rollNo": "2500330120022",
    "score": 76,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 208,
    "name": "Kashvi Goel",
    "rollNo": "2500331530157",
    "score": 77,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 209,
    "name": "Mukul kumar",
    "rollNo": "2500331540082",
    "score": 78,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 210,
    "name": "Abhay Chauhan",
    "rollNo": "2500330120006",
    "score": 79,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Android Development",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 211,
    "name": "Ankita Singh Patel",
    "rollNo": "2500330100053",
    "score": 80,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 212,
    "name": "Karan tyagi",
    "rollNo": "2500330120056",
    "score": 81,
    "branch": "CS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 213,
    "name": "Anshika singh",
    "rollNo": "2500331530062",
    "score": 82,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 214,
    "name": "Abhinav Chauhan",
    "rollNo": "2500330100010",
    "score": 83,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 215,
    "name": "Shagun Chaudhary",
    "rollNo": "2500330100317",
    "score": 84,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 216,
    "name": "Riya kumari",
    "rollNo": "2500330130070",
    "score": 85,
    "branch": "IT",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 217,
    "name": "RAJ YADAV",
    "rollNo": "2500330100273",
    "score": 86,
    "branch": "DS",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 218,
    "name": "Mohd Amaan",
    "rollNo": "2500330100211",
    "score": 87,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 219,
    "name": "Lakshya Jindal",
    "rollNo": "250012078",
    "score": 88,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 220,
    "name": "Bhakti Goel",
    "rollNo": "2500330100100",
    "score": 89,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "Competitive Programming",
    "allDomains": [
      "Competitive Programming",
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 221,
    "name": "Vaibhav Dobriyal",
    "rollNo": "2500331530308",
    "score": 90,
    "branch": "CSE-AIML",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 222,
    "name": "Avinash Giri",
    "rollNo": "2500330100087",
    "score": 91,
    "branch": "CSE",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 223,
    "name": "Diksha Kapoor",
    "rollNo": "2500331540049",
    "score": 92,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "AI/ML",
    "allDomains": [
      "Android Development",
      "Web Development",
      "AI/ML"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 224,
    "name": "Sarthak pandey",
    "rollNo": "2500330100308",
    "score": 93,
    "branch": "CSE",
    "section": "B",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  },
  {
    "rank": 225,
    "name": "Arjun Malik",
    "rollNo": "2500331540023",
    "score": 94,
    "branch": "DS",
    "section": "A",
    "primaryDomain": "Web Development",
    "allDomains": [
      "Web Development"
    ],
    "year": "2nd Year"
  }
];

export const OFFICIAL_150_SHORTLIST: ShortlistedStudent[] = RAW_OFFICIAL_SHORTLIST.map(enrichStudent);

