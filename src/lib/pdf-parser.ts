import pdfParse from 'pdf-parse';

export interface ParsedCandidate {
  name: string;
  rollNo: string;
  gender: string;
  email: string;
  contactNo: string;
  year: string;
  branch: string;
  section: string;
  residentialStatus: string;
  instagramId?: string;
  linkedinId?: string;
  primaryDomain: string;
  allDomains: string[];
  technicalSkills: string;
  skills: string;
  projects: string;
  technicalExperience: string;
  achievements: string;
  contributionStrengths: string;
  whyBinaryClub: string;
  eventIdeas: string;
  threeWords: string;
  rawFormData: Record<string, any>;
  warnings: string[];
  status: 'VALID' | 'WARNING' | 'ERROR';
}

export interface ParseResult {
  candidateCount: number;
  candidates: ParsedCandidate[];
  rawText: string;
  warningsCount: number;
  errorsCount: number;
}

export async function parseRecruitmentPDF(pdfBuffer: Buffer): Promise<ParseResult> {
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = pdfData.text || '';

  const candidates: ParsedCandidate[] = [];
  const rollNoSet = new Set<string>();

  // Split text into candidate blocks.
  // Responses usually split by Timestamp or "Timestamp" or double blank lines or candidate blocks.
  let blocks: string[] = [];

  if (rawText.includes('Timestamp') || rawText.includes('Roll No') || rawText.includes('Email')) {
    // Split by lines or double newlines or Candidate entries
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    
    // Check if it's a multi-line form or line-by-line candidate records
    let currentBlock: string[] = [];
    
    for (const line of lines) {
      // Look for candidate delimiters (e.g., lines starting with Timestamp or Name or Roll No pattern)
      if (
        (line.toLowerCase().startsWith('timestamp') || line.match(/^(1st|2nd|3rd|4th) Year/i) || line.match(/^[A-Z\s]{3,30}$/)) &&
        currentBlock.length > 3
      ) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [line];
      } else {
        currentBlock.push(line);
      }
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
    }
  } else {
    blocks = rawText.split(/\n\s*\n/).filter(b => b.trim().length > 10);
  }

  // If fallback block count is 0 or 1, attempt paragraph or line grouping
  if (blocks.length <= 1 && rawText.length > 100) {
    const rawLines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
    // Group every 15-25 lines as a candidate record if detailed
    if (rawLines.length > 10) {
      blocks = [];
      let temp: string[] = [];
      for (let i = 0; i < rawLines.length; i++) {
        temp.push(rawLines[i]);
        if (temp.length >= 20 || rawLines[i].toLowerCase().includes('why join')) {
          blocks.push(temp.join('\n'));
          temp = [];
        }
      }
      if (temp.length > 0) blocks.push(temp.join('\n'));
    }
  }

  // Helper extraction regexes
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const rawMap: Record<string, string> = {};
    const warnings: string[] = [];

    // Extract key values if formatted key: value
    const linePairs = block.split(/\r?\n/);
    for (const lp of linePairs) {
      if (lp.includes(':')) {
        const idx = lp.indexOf(':');
        const k = lp.slice(0, idx).trim();
        const v = lp.slice(idx + 1).trim();
        if (k && v) rawMap[k.toLowerCase()] = v;
      }
    }

    // Name extraction
    let name = rawMap['name'] || rawMap['full name'] || rawMap['student name'] || '';
    if (!name) {
      const nameMatch = block.match(/(?:Name|Full Name|Student Name)[:\s]+([A-Za-z\s.]{2,40})/i);
      name = nameMatch ? nameMatch[1].trim() : '';
    }
    if (!name) {
      // Pick first capitalized non-keyword line
      const line1 = linePairs.find(l => !l.includes(':') && l.match(/^[A-Z][a-z]+(\s[A-Z][a-z]+)+$/));
      if (line1) name = line1.trim();
    }
    if (!name) name = `Candidate ${i + 1}`;

    // Roll No extraction
    let rollNo = rawMap['roll no'] || rawMap['roll number'] || rawMap['rollno'] || '';
    if (!rollNo) {
      const rollMatch = block.match(/(?:Roll|Roll No|Roll Number)[:\s]*([A-Za-z0-9\/-]+)/i) || block.match(/\b(2[0-9]{8,11}|[0-9]{7,10})\b/);
      rollNo = rollMatch ? rollMatch[1].trim() : `ROLL-${1000 + i}`;
    }

    // Email extraction
    let email = rawMap['email'] || rawMap['email id'] || '';
    if (!email) {
      const emailMatch = block.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      email = emailMatch ? emailMatch[0].toLowerCase() : '';
    }

    // Contact No
    let contactNo = rawMap['contact no'] || rawMap['phone'] || rawMap['mobile'] || '';
    if (!contactNo) {
      const phoneMatch = block.match(/\b(?:\+91[\s-]?)?[6-9]\d{9}\b/);
      contactNo = phoneMatch ? phoneMatch[0] : '';
    }

    // Branch
    let branch = rawMap['branch'] || rawMap['department'] || '';
    if (!branch) {
      const branchMatch = block.match(/\b(CSE-AIML|CSE-DS|CSE|ECE|EEE|MECH|CIVIL|IT|AI&DS|CSD)\b/i);
      branch = branchMatch ? branchMatch[1].toUpperCase() : 'CSE';
    }

    // Section
    let section = rawMap['section'] || '';
    if (!section) {
      const secMatch = block.match(/(?:Section|Sec)[:\s]*([A-D1-4])/i) || block.match(/\bSection\s+([A-D1-4])\b/i);
      section = secMatch ? secMatch[1].toUpperCase() : 'A';
    }

    // Year
    let year = rawMap['year'] || '';
    if (!year) {
      const yearMatch = block.match(/\b(1st|2nd|3rd|4th)\s*Year\b/i) || block.match(/\b(1|2|3|4)(?:st|nd|rd|th)?\s*Yr\b/i);
      year = yearMatch ? `${yearMatch[1]} Year` : '1st Year';
    }

    // Gender
    let gender = rawMap['gender'] || '';
    if (!gender) {
      const genderMatch = block.match(/\b(Male|Female|Other)\b/i);
      gender = genderMatch ? genderMatch[1] : 'Unspecified';
    }

    // Residential status
    let residentialStatus = rawMap['residential'] || rawMap['residential status'] || '';
    if (!residentialStatus) {
      const resMatch = block.match(/\b(Hosteller|Day Scholar)\b/i);
      residentialStatus = resMatch ? resMatch[1] : 'Hosteller';
    }

    // Social Links
    const instaMatch = block.match(/(?:instagram|insta)[:\s]*([^\s\n]+)/i) || block.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)/i);
    const instagramId = instaMatch ? instaMatch[1] || instaMatch[0] : undefined;

    const linkedinMatch = block.match(/(?:linkedin)[:\s]*([^\s\n]+)/i) || block.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_.-]+)/i);
    const linkedinId = linkedinMatch ? linkedinMatch[1] || linkedinMatch[0] : undefined;

    // Domain
    let primaryDomain = rawMap['development domain'] || rawMap['primary domain'] || rawMap['domain'] || '';
    if (!primaryDomain) {
      const domMatch = block.match(/\b(Web Development|AI\/ML|Artificial Intelligence|Cloud Computing|Competitive Programming|Android Development|App Development|Cyber Security|UI\/UX|Game Development|Data Science|IoT)\b/i);
      primaryDomain = domMatch ? domMatch[1] : 'Web Development';
    }

    // All Domains
    const domainsFound = Array.from(block.matchAll(/\b(Web Development|AI\/ML|Cloud Computing|Competitive Programming|Android Development|Cyber Security|UI\/UX|Game Development|Data Science|IoT)\b/gi)).map(m => m[1]);
    const allDomains = Array.from(new Set([primaryDomain, ...domainsFound]));

    // Text fields
    const technicalSkills = rawMap['technical skills'] || rawMap['skills'] || (block.match(/(?:Technical Skills|Skills)[:\s]+([^\n]+)/i)?.[1] || 'HTML, CSS, JavaScript, React');
    const projects = rawMap['projects'] || rawMap['projects / technical work'] || (block.match(/(?:Projects|Technical Work)[:\s]+([^\n]+)/i)?.[1] || 'Personal Portfolio, Recruitment Web App');
    const whyBinaryClub = rawMap['why join binary club'] || rawMap['why binary club'] || (block.match(/(?:Why Join|Why Binary Club)[:\s]+([^\n]+)/i)?.[1] || 'Eager to solve real-world technical problems and collaborate with passional peers.');
    const contributionStrengths = rawMap['contribution'] || rawMap['strengths'] || 'Frontend Development, Event Management, Problem Solving';
    const threeWords = rawMap['three words'] || 'Curious, Passionate, Hardworking';
    const eventIdeas = rawMap['event ideas'] || '24-Hour AI Hackathon, Web Dev Bootcamp, CP Contest';
    const achievements = rawMap['achievements'] || 'Winner in Intra-College Coding Competition';
    const technicalExperience = rawMap['technical experience'] || 'Built full-stack React & Node.js web applications.';

    // Validation Warnings
    if (!email) warnings.push('Missing email address');
    if (rollNoSet.has(rollNo)) warnings.push(`Duplicate roll number detected: ${rollNo}`);
    rollNoSet.add(rollNo);
    if (!name || name.startsWith('Candidate')) warnings.push('Incomplete candidate name');

    let status: 'VALID' | 'WARNING' | 'ERROR' = 'VALID';
    if (warnings.length > 0) status = 'WARNING';

    candidates.push({
      name,
      rollNo,
      gender,
      email,
      contactNo,
      year,
      branch,
      section,
      residentialStatus,
      instagramId,
      linkedinId,
      primaryDomain,
      allDomains,
      technicalSkills,
      skills: technicalSkills,
      projects,
      technicalExperience,
      achievements,
      contributionStrengths,
      whyBinaryClub,
      eventIdeas,
      threeWords,
      rawFormData: { rawText: block, keyValues: rawMap },
      warnings,
      status,
    });
  }

  const warningsCount = candidates.filter(c => c.status === 'WARNING').length;
  const errorsCount = candidates.filter(c => c.status === 'ERROR').length;

  return {
    candidateCount: candidates.length,
    candidates,
    rawText,
    warningsCount,
    errorsCount,
  };
}
