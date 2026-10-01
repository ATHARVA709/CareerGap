import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn('GEMINI_API_KEY is not set in environment. App will use intelligent local synthesis fallback.');
}

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

/**
 * Endpoint 1: Career Blueprint
 * Given ANY target career (e.g. "Robotics Engineer", "ML Engineer", "Game Developer"),
 * returns structured blueprint with required skills, importance, required levels,
 * recommended projects, and typical learning sequence.
 */
app.post('/api/career/blueprint', async (req, res) => {
  const { career } = req.body;
  if (!career || typeof career !== 'string') {
    return res.status(400).json({ error: 'Target career name is required.' });
  }

  const cleanCareer = career.trim();

  if (!aiClient) {
    return res.json(getLocalBlueprintFallback(cleanCareer));
  }

  try {
    const prompt = `You are an expert career intelligence engine for modern technology careers.
Analyze the target career: "${cleanCareer}".
Provide a structured career blueprint with the top 5 to 7 essential skills required for high readiness in this role,
realistic required skill proficiency levels (scale 1-10, where 10 is staff/principal), importance ratings (1-10),
recommended practical projects, and a typical learning sequence.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            career: { type: Type.STRING },
            description: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  importance: { type: Type.INTEGER, description: 'Importance from 1 to 10' },
                  required_level: { type: Type.INTEGER, description: 'Target proficiency level from 1 to 10' },
                },
                required: ['name', 'importance', 'required_level'],
              },
            },
            recommended_projects: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            typical_learning_sequence: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['career', 'description', 'skills', 'recommended_projects', 'typical_learning_sequence'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating career blueprint with Gemini:', err?.message || err);
    return res.json(getLocalBlueprintFallback(cleanCareer));
  }
});

/**
 * Endpoint 2: Complete Career Analysis & Roadmap Generation
 * Takes user profile (target career, current skills & levels, hours/day, time remaining, experience, projects, preferences).
 * Generates skill gap evaluation, structured time-constrained phases, single next mission,
 * AI suggestions, and practical project recommendations.
 */
app.post('/api/career/analyze-and-plan', async (req, res) => {
  const { profile } = req.body;
  if (!profile || !profile.targetCareer) {
    return res.status(400).json({ error: 'Valid user profile with target career is required.' });
  }

  if (!aiClient) {
    return res.json(getLocalPlanFallback(profile));
  }

  try {
    const prompt = `You are CareerGap, an elite career intelligence and progression engine.
Analyze this student profile and generate a realistic, tailored, time-constrained career progression roadmap.

STUDENT PROFILE:
- Target Career: ${profile.targetCareer}
- Current Skills & Levels: ${JSON.stringify(profile.currentSkills || [])}
- Available Study Time: ${profile.hoursPerDay} hours/day
- Time Remaining to Goal: ${profile.timeRemaining}
- Current Education / Experience: ${profile.experience || 'None specified'}
- Past Projects: ${profile.projects || 'None specified'}
- Learning Preferences: ${profile.learningPreferences || 'Hands-on practical work'}

INSTRUCTIONS:
1. Determine required skills for "${profile.targetCareer}" with required levels (1-10) and importance (1-10).
2. Compare with current skills to identify gaps.
3. Build a realistic 4-phase sequential roadmap that fits within the available study time (${profile.hoursPerDay} hrs/day, ${profile.timeRemaining}). Do not create an enormous generic curriculum.
4. Each phase must show duration, skills focused on, 2-3 concrete objectives, 2 practical works, and expected outcome.
5. Create ONE immediate next mission ("TODAY'S MISSION") addressing the highest leverage skill gap. It must have title, estimated time (minutes), why it matters, and 3 specific actionable tasks.
6. Provide 3 personalized AI suggestions based on their actual background (e.g. what they can skip because they know it, what to focus on first, project pacing).
7. Recommend 2 to 3 practical, resume-worthy projects tailored to their career goal with skills developed, difficulty, estimated time, why it helps, and deliverable.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            requiredSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  requiredLevel: { type: Type.INTEGER },
                  importance: { type: Type.INTEGER },
                  category: { type: Type.STRING },
                },
                required: ['name', 'requiredLevel', 'importance'],
              },
            },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  practicalWork: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  expectedOutcome: { type: Type.STRING },
                },
                required: ['id', 'name', 'duration', 'skills', 'objectives', 'practicalWork', 'expectedOutcome'],
              },
            },
            currentMission: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                timeMinutes: { type: Type.INTEGER },
                why: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['id', 'title', 'timeMinutes', 'why', 'tasks'],
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            projectRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  skillsDeveloped: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  difficulty: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  whyItHelps: { type: Type.STRING },
                  deliverable: { type: Type.STRING },
                },
                required: ['id', 'title', 'skillsDeveloped', 'difficulty', 'estimatedTime', 'whyItHelps', 'deliverable'],
              },
            },
          },
          required: ['requiredSkills', 'phases', 'currentMission', 'suggestions', 'projectRecommendations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating plan with Gemini:', err?.message || err);
    return res.json(getLocalPlanFallback(profile));
  }
});

/**
 * Endpoint 3: Adaptive Roadmap Engine
 * When student updates available hours/day, time remaining, skill level, or completed work,
 * Gemini intelligently adjusts the roadmap:
 * - Reduces low-priority material
 * - Extends or compresses phases
 * - Removes redundant learning
 * - Preserves high-value practical work
 * - Returns explicit "what changed, why it changed, what to do next"
 */
app.post('/api/career/adapt', async (req, res) => {
  const { currentPlan, updatedProfile, changeReason } = req.body;

  if (!updatedProfile || !updatedProfile.targetCareer) {
    return res.status(400).json({ error: 'Updated profile is required for adaptation.' });
  }

  if (!aiClient) {
    return res.json(getLocalAdaptationFallback(currentPlan, updatedProfile, changeReason));
  }

  try {
    const prompt = `You are CareerGap's Adaptive Career Planner.
The student has updated their parameters. Reassess and intelligently adapt their roadmap.

CHANGE EVENT:
${changeReason || 'Profile or constraint parameters were modified'}

PREVIOUS CONSTRAINTS:
- Target Career: ${currentPlan?.profile?.targetCareer || updatedProfile.targetCareer}
- Previous Hours/Day: ${currentPlan?.profile?.hoursPerDay}
- Previous Time Remaining: ${currentPlan?.profile?.timeRemaining}

NEW CONSTRAINTS:
- Updated Hours/Day: ${updatedProfile.hoursPerDay}
- Updated Time Remaining: ${updatedProfile.timeRemaining}
- Updated Current Skills: ${JSON.stringify(updatedProfile.currentSkills || [])}

CURRENT PHASES TO ADAPT:
${JSON.stringify(currentPlan?.phases || [])}

CURRENT MISSION:
${JSON.stringify(currentPlan?.currentMission || {})}

ADAPTATION RULES:
1. If available hours/day decreased: reduce low-priority material, lengthen durations, preserve core high-value practical work.
2. If available hours/day increased: add deeper specialization, accelerate phases.
3. If skills were marked higher/mastered: eliminate redundant introductory learning, reallocate time to larger gaps.
4. Produce a clear adaptation notice:
   - title: "Roadmap Updated"
   - whatChanged: concise description of changes (e.g. "Available study time decreased from 1.5h/day to 45m/day. Phase durations adjusted and non-essential modules pruned.")
   - whyItChanged: reason explaining the trade-off.
   - nextSteps: clear immediate guidance for the student.
5. Return the updated phases, updated next mission, and updated suggestions.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adaptationNotice: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                whatChanged: { type: Type.STRING },
                whyItChanged: { type: Type.STRING },
                nextSteps: { type: Type.STRING },
              },
              required: ['title', 'whatChanged', 'whyItChanged', 'nextSteps'],
            },
            updatedPhases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  objectives: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  practicalWork: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  expectedOutcome: { type: Type.STRING },
                  progress: { type: Type.INTEGER },
                },
                required: ['id', 'name', 'duration', 'skills', 'objectives', 'practicalWork', 'expectedOutcome'],
              },
            },
            updatedMission: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                timeMinutes: { type: Type.INTEGER },
                why: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['id', 'title', 'timeMinutes', 'why', 'tasks'],
            },
            updatedSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['adaptationNotice', 'updatedPhases', 'updatedMission', 'updatedSuggestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error adapting roadmap with Gemini:', err?.message || err);
    return res.json(getLocalAdaptationFallback(currentPlan, updatedProfile, changeReason));
  }
});

// Fallback generators to ensure zero downtime and robust resilience
function getLocalBlueprintFallback(career: string) {
  const c = career.toLowerCase();
  if (c.includes('cyber') || c.includes('security')) {
    return {
      career,
      description: 'Defend systems, analyze network traffic, and mitigate security vulnerabilities.',
      skills: [
        { name: 'Networking (TCP/IP)', importance: 9, required_level: 8 },
        { name: 'Linux Administration', importance: 9, required_level: 8 },
        { name: 'Python Scripting', importance: 8, required_level: 7 },
        { name: 'Web Security / OWASP', importance: 9, required_level: 8 },
        { name: 'SIEM & Threat Analysis', importance: 8, required_level: 7 },
        { name: 'Cloud Security (AWS/Azure)', importance: 8, required_level: 7 },
      ],
      recommended_projects: ['Build Home-Lab SIEM with Wazuh', 'OWASP Juice Shop Penetration Report'],
      typical_learning_sequence: ['Networking & Linux', 'Security Principles', 'Vulnerability Assessment', 'Incident Response'],
    };
  }

  if (c.includes('game')) {
    return {
      career,
      description: 'Develop engaging video games, engine mechanics, physics, and gameplay systems.',
      skills: [
        { name: 'C# Programming', importance: 9, required_level: 8 },
        { name: 'Unity Engine', importance: 9, required_level: 8 },
        { name: '3D Math & Vectors', importance: 8, required_level: 7 },
        { name: 'Game Physics & AI', importance: 8, required_level: 7 },
        { name: 'Shaders & Rendering', importance: 7, required_level: 6 },
        { name: 'Git & Version Control', importance: 7, required_level: 7 },
      ],
      recommended_projects: ['Polished 2D Action Platformer', '3D Physics Puzzle Prototype'],
      typical_learning_sequence: ['C# Core', 'Unity Basics', 'Physics & Gameplay Scripting', 'Polishing & Optimization'],
    };
  }

  // Default / ML / Generic fallback
  return {
    career,
    description: `Professional engineering path for ${career}.`,
    skills: [
      { name: 'Core Language (Python/TypeScript)', importance: 9, required_level: 8 },
      { name: 'Domain Architecture', importance: 9, required_level: 8 },
      { name: 'Data & Databases', importance: 8, required_level: 7 },
      { name: 'Testing & Verification', importance: 8, required_level: 7 },
      { name: 'Deployment & DevOps', importance: 7, required_level: 6 },
    ],
    recommended_projects: [`End-to-End ${career} Capstone Application`, 'Automated CI/CD Pipeline'],
    typical_learning_sequence: ['Fundamentals', 'Applied Architecture', 'Real-World Tooling', 'Production Capstone'],
  };
}

function getLocalPlanFallback(profile: any) {
  const career = profile.targetCareer;
  const currentSkills = profile.currentSkills || [];
  const hours = profile.hoursPerDay || 1.5;

  // Synthesize required skills based on current skills + standard role requirements
  const requiredSkills = [
    { name: 'Core Programming', requiredLevel: 8, importance: 9, category: 'Engineering' },
    { name: 'System Architecture', requiredLevel: 7, importance: 8, category: 'Design' },
    { name: 'Domain Specialization', requiredLevel: 8, importance: 10, category: 'Core' },
    { name: 'Testing & Tooling', requiredLevel: 6, importance: 7, category: 'Operations' },
    { name: 'Deployment & CI/CD', requiredLevel: 6, importance: 7, category: 'Production' },
  ];

  // Merge any user provided skills
  currentSkills.forEach((s: any) => {
    if (!requiredSkills.find(r => r.name.toLowerCase() === s.name.toLowerCase())) {
      requiredSkills.push({
        name: s.name,
        requiredLevel: Math.max(6, s.level + 2),
        importance: 8,
        category: 'Applied',
      });
    }
  });

  return {
    requiredSkills,
    phases: [
      {
        id: 'phase-1',
        name: 'Phase 1 — Foundations & Core Principles',
        duration: '3 weeks',
        skills: [requiredSkills[0]?.name || 'Core Programming', 'Fundamental Concepts'],
        objectives: ['Master syntax and foundational paradigms', 'Establish automated test harness'],
        practicalWork: ['Build CLI utility with unit tests', 'Implement algorithmic data structures'],
        expectedOutcome: 'Rock-solid confidence with core syntax and software hygiene.',
      },
      {
        id: 'phase-2',
        name: 'Phase 2 — Core Domain Specialization',
        duration: '4 weeks',
        skills: [requiredSkills[2]?.name || 'Domain Specialization', 'APIs & Frameworks'],
        objectives: ['Deep dive into primary libraries', 'Construct end-to-end prototype'],
        practicalWork: ['Implement core business logic module', 'Connect to persistent data layer'],
        expectedOutcome: 'Able to build domain-specific modules independently.',
      },
      {
        id: 'phase-3',
        name: 'Phase 3 — Advanced Systems & Performance',
        duration: '4 weeks',
        skills: ['Architecture', 'Performance Tuning'],
        objectives: ['Optimize latency and throughput', 'Handle edge cases and failures'],
        practicalWork: ['Profile execution bottlenecks', 'Add caching and asynchronous pipelines'],
        expectedOutcome: 'Robust understanding of production-level performance.',
      },
      {
        id: 'phase-4',
        name: 'Phase 4 — Production Capstone & Deployment',
        duration: '3 weeks',
        skills: ['Deployment', 'Docker', 'Portfolio Defense'],
        objectives: ['Deploy live service to cloud', 'Prepare resume-ready documentation'],
        practicalWork: ['Package container and configure CI/CD', 'Record walkthrough demo'],
        expectedOutcome: 'A live, demonstrable project showcasing end-to-end readiness.',
      },
    ],
    currentMission: {
      id: 'mission-local-1',
      title: `Build Core Foundation for ${career}`,
      timeMinutes: Math.round(hours * 60),
      why: `Establishes momentum on your primary goal: ${career}.`,
      tasks: [
        'Review core architectural principles',
        'Create a GitHub repository with README and automated tests',
        'Implement first practical coding exercise',
      ],
    },
    suggestions: [
      `With ${hours} hours/day over ${profile.timeRemaining}, focus your efforts on finishing 2 substantial projects rather than skimming tutorials.`,
      'Review your largest skill gaps first before jumping to complex frameworks.',
      'Document your design decisions publicly in GitHub issues to build interview credibility.',
    ],
    projectRecommendations: [
      {
        id: 'proj-fallback-1',
        title: `${career} Production Service`,
        skillsDeveloped: ['Core Architecture', 'Testing', 'Deployment'],
        difficulty: 'Intermediate',
        estimatedTime: '3 weeks',
        whyItHelps: `Proves practical readiness for ${career} roles with real deliverables.`,
        deliverable: 'Tested, containerized application with live documentation.',
      },
      {
        id: 'proj-fallback-2',
        title: 'Performance Benchmark & Optimization Harness',
        skillsDeveloped: ['Profiling', 'System Tuning'],
        difficulty: 'Intermediate',
        estimatedTime: '2 weeks',
        whyItHelps: 'Demonstrates deep analytical rigor and understanding of trade-offs.',
        deliverable: 'Benchmark suite with interactive comparative charts.',
      },
    ],
  };
}

function getLocalAdaptationFallback(currentPlan: any, updatedProfile: any, changeReason: string) {
  const oldHours = currentPlan?.profile?.hoursPerDay || 1.5;
  const newHours = updatedProfile.hoursPerDay || 1.0;
  const decreased = newHours < oldHours;

  const whatChanged = decreased
    ? `Available study time adjusted from ${oldHours}h/day to ${newHours}h/day. Phases streamlined to focus strictly on highest-leverage skills.`
    : `Available study time updated to ${newHours}h/day. Phase velocity accelerated and practical scope expanded.`;

  const whyItChanged = decreased
    ? 'To ensure you hit your timeline without burnout, non-essential theoretical modules were trimmed in favor of practical capstones.'
    : 'With more available hours, deeper hands-on depth and advanced architectures can be mastered safely.';

  const updatedPhases = (currentPlan?.phases || []).map((p: any, idx: number) => ({
    ...p,
    duration: decreased ? `${Math.max(2, (idx + 1) * 2)} weeks` : `${Math.max(1, idx + 1)} weeks`,
  }));

  return {
    adaptationNotice: {
      title: 'Roadmap Updated',
      whatChanged,
      whyItChanged,
      nextSteps: 'Review your updated phase timeline and begin today\'s focused mission.',
    },
    updatedPhases,
    updatedMission: currentPlan?.currentMission || {
      id: 'mission-adapted',
      title: 'Targeted High-Impact Study Session',
      timeMinutes: Math.round(newHours * 60),
      why: 'Aligned with your newly adjusted daily schedule.',
      tasks: ['Complete core concept review', 'Build targeted exercise', 'Review progress'],
    },
    updatedSuggestions: [
      `Your schedule is now tuned for ${newHours} hours/day. Consistency will matter more than marathon sessions.`,
      'Focus strictly on the current phase objectives before looking ahead.',
    ],
  };
}

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CareerGap application running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting CareerGap server:', err);
});
