import { UserProfile, CareerPlanState, SkillItem, RoadmapPhase, Mission, ProjectRecommendation } from '../types/career';
import { calculateReadiness, determinePriority } from './readiness';

export interface CareerPreset {
  title: string;
  category: string;
  description: string;
  sampleProfile: UserProfile;
}

export const CAREER_PRESETS: CareerPreset[] = [
  {
    title: 'ML Engineer',
    category: 'AI & Data',
    description: 'Design and deploy production-grade machine learning models and pipelines.',
    sampleProfile: {
      targetCareer: 'ML Engineer',
      currentSkills: [
        { name: 'Python', level: 7 },
        { name: 'SQL', level: 5 },
        { name: 'Statistics', level: 3 },
        { name: 'Machine Learning', level: 3 },
        { name: 'Git', level: 4 },
        { name: 'PyTorch', level: 1 },
      ],
      hoursPerDay: 1.5,
      timeRemaining: '6 months',
      experience: 'Computer Science student, comfortable with object-oriented programming',
      projects: '2 Python projects (basic web scraper and CLI budget manager)',
      learningPreferences: 'Hands-on practical code with mathematical intuition',
    },
  },
  {
    title: 'Cybersecurity Engineer',
    category: 'Security & Infrastructure',
    description: 'Secure enterprise networks, detect vulnerabilities, and defend cloud infrastructure.',
    sampleProfile: {
      targetCareer: 'Cybersecurity Engineer',
      currentSkills: [
        { name: 'Networking (TCP/IP)', level: 4 },
        { name: 'Linux Administration', level: 5 },
        { name: 'Python Scripting', level: 4 },
        { name: 'Web Security / OWASP', level: 2 },
        { name: 'Threat Analysis & SIEM', level: 1 },
        { name: 'Cloud Security (AWS)', level: 1 },
      ],
      hoursPerDay: 2,
      timeRemaining: '5 months',
      experience: 'IT Support technician looking to pivot to offensive & defensive cyber ops',
      projects: 'Configured local Ubuntu home-lab server, set up Pi-hole DNS',
      learningPreferences: 'Lab-driven challenges, capture the flag exercises',
    },
  },
  {
    title: 'Game Developer',
    category: 'Game & Graphics',
    description: 'Build interactive game mechanics, physics systems, and 3D graphics in modern engines.',
    sampleProfile: {
      targetCareer: 'Game Developer',
      currentSkills: [
        { name: 'C# Programming', level: 5 },
        { name: 'Unity Engine', level: 4 },
        { name: '3D Math & Vectors', level: 3 },
        { name: 'Game Physics & AI', level: 2 },
        { name: 'Shaders & Rendering', level: 1 },
        { name: 'Git & Version Control', level: 4 },
      ],
      hoursPerDay: 2,
      timeRemaining: '4 months',
      experience: 'Self-taught programmer with 1 casual 2D game published on itch.io',
      projects: '2D Platformer in Unity with custom player controller and tilemap',
      learningPreferences: 'Project-first, visual debugging, rapid prototypes',
    },
  },
  {
    title: 'Data Analyst',
    category: 'Analytics & BI',
    description: 'Transform complex business data into strategic dashboards and automated reports.',
    sampleProfile: {
      targetCareer: 'Data Analyst',
      currentSkills: [
        { name: 'Excel / Spreadsheets', level: 6 },
        { name: 'SQL', level: 4 },
        { name: 'Data Visualization (Tableau)', level: 3 },
        { name: 'Python (Pandas)', level: 3 },
        { name: 'Business Metrics & KPI', level: 4 },
      ],
      hoursPerDay: 1,
      timeRemaining: '3 months',
      experience: 'Operations associate preparing weekly Excel reports',
      projects: 'Sales tracker in Excel with pivot tables and automated formulas',
      learningPreferences: 'Real-world business case studies',
    },
  },
  {
    title: 'Backend Developer',
    category: 'Web & Systems',
    description: 'Architect scalable APIs, manage relational databases, and build distributed backend services.',
    sampleProfile: {
      targetCareer: 'Backend Developer',
      currentSkills: [
        { name: 'JavaScript / Node.js', level: 6 },
        { name: 'PostgreSQL / SQL', level: 4 },
        { name: 'REST APIs & Express', level: 5 },
        { name: 'Docker & Containers', level: 2 },
        { name: 'System Design', level: 2 },
      ],
      hoursPerDay: 1.5,
      timeRemaining: '5 months',
      experience: 'Junior frontend developer transitioning to full backend engineering',
      projects: 'Built basic CRUD API with Express and SQLite',
      learningPreferences: 'Deep dives into internals, architectural patterns',
    },
  },
];

export const POPULAR_CAREER_SUGGESTIONS = [
  'ML Engineer',
  'Cybersecurity Engineer',
  'Game Developer',
  'Data Analyst',
  'Backend Developer',
  'Cloud Engineer',
  'Robotics Engineer',
  'UI/UX Designer',
  'Product Manager',
  'DevOps Engineer',
];

/**
 * Builds a pristine initial plan for the default ML Engineer profile
 */
export function getDefaultMLPlan(): CareerPlanState {
  const defaultPreset = CAREER_PRESETS[0];
  const profile = defaultPreset.sampleProfile;

  const rawSkills = [
    { name: 'Python', current: 7, required: 8, importance: 9 },
    { name: 'SQL', current: 5, required: 6, importance: 7 },
    { name: 'Statistics', current: 3, required: 8, importance: 9 },
    { name: 'Machine Learning', current: 3, required: 8, importance: 10 },
    { name: 'PyTorch', current: 1, required: 7, importance: 9 },
    { name: 'Git', current: 4, required: 6, importance: 6 },
    { name: 'Model Deployment (FastAPI/Docker)', current: 0, required: 6, importance: 8 },
  ];

  const skills: SkillItem[] = rawSkills.map((s, idx) => ({
    id: `skill-${idx + 1}`,
    name: s.name,
    currentLevel: s.current,
    requiredLevel: s.required,
    importance: s.importance,
    gap: Math.max(0, s.required - s.current),
    priority: determinePriority(s.current, s.required, s.importance),
  }));

  const readinessScore = calculateReadiness(skills);

  const phases: RoadmapPhase[] = [
    {
      id: 'phase-1',
      name: 'Phase 1 — Foundations: Probability & Advanced Statistics',
      duration: '3 weeks',
      durationWeeks: 3,
      skills: ['Statistics', 'Probability', 'NumPy & Linear Algebra'],
      objectives: [
        'Master continuous and discrete probability distributions (Normal, Poisson, Bernoulli)',
        'Understand hypothesis testing, p-values, confidence intervals, and Central Limit Theorem',
        'Implement vectorized matrix operations and covariance matrices from scratch',
      ],
      practicalWork: [
        'Build a probabilistic simulation of customer churn in NumPy',
        'Perform A/B test analysis with statistical significance validation',
      ],
      expectedOutcome: 'Confidently interpret mathematical assumptions behind ML algorithms.',
      completed: false,
      progress: 25,
    },
    {
      id: 'phase-2',
      name: 'Phase 2 — Core Machine Learning & Feature Engineering',
      duration: '5 weeks',
      durationWeeks: 5,
      skills: ['Machine Learning', 'Scikit-Learn', 'Feature Engineering'],
      objectives: [
        'Master supervised regression, logistic classification, decision trees, and ensemble forests',
        'Implement rigorous cross-validation and hyperparameter tuning (GridSearch / Optuna)',
        'Diagnose bias vs. variance using learning curves and ROC-AUC / Precision-Recall curves',
      ],
      practicalWork: [
        'Develop end-to-end predictive housing valuation model with engineered features',
        'Conduct error analysis identifying high-leverage data transformations',
      ],
      expectedOutcome: 'Able to construct reliable tabular ML pipelines that avoid data leakage.',
      completed: false,
      progress: 0,
    },
    {
      id: 'phase-3',
      name: 'Phase 3 — Deep Learning & PyTorch Architecture',
      duration: '6 weeks',
      durationWeeks: 6,
      skills: ['PyTorch', 'Neural Networks', 'Computer Vision / NLP Basics'],
      objectives: [
        'Understand backpropagation, autodiff tensors, and activation dynamics',
        'Construct custom PyTorch Datasets, DataLoaders, and training loops with early stopping',
        'Fine-tune pre-trained Transformer or ResNet backbones using transfer learning',
      ],
      practicalWork: [
        'Implement a convolutional classifier on medical imaging or satellite data',
        'Instrument training loss and gradient tracking with TensorBoard / Weights & Biases',
      ],
      expectedOutcome: 'Fluency in building and training custom deep learning models with PyTorch.',
      completed: false,
      progress: 0,
    },
    {
      id: 'phase-4',
      name: 'Phase 4 — Production ML, Deployment & Portfolio Capstone',
      duration: '4 weeks',
      durationWeeks: 4,
      skills: ['Model Deployment', 'FastAPI', 'Docker', 'MLOps Basics'],
      objectives: [
        'Package trained models into sub-50ms REST inference endpoints with FastAPI',
        'Containerize the application with multi-stage Docker builds',
        'Document model cards, trade-offs, and latency benchmarks for interview defense',
      ],
      practicalWork: [
        'Deploy a live containerized ML API with automated smoke tests',
        'Create interactive demo frontend and write an engineering technical write-up',
      ],
      expectedOutcome: 'A deployable, production-ready portfolio project highlighting engineering maturity.',
      completed: false,
      progress: 0,
    },
  ];

  const currentMission: Mission = {
    id: 'mission-1',
    title: 'Master Probability Distributions & Hypothesis Testing',
    timeMinutes: 60,
    why: 'Statistics is currently your largest gap (3/10 → 8/10) and is the mathematical cornerstone for Machine Learning evaluation.',
    tasks: [
      'Review Normal, Binomial, and Poisson distributions and their variance properties',
      'Code a 15-line Python script verifying the Central Limit Theorem with random sampling',
      'Compute a two-sample t-test comparing synthetic model error distributions',
    ],
    phaseId: 'phase-1',
    completed: false,
  };

  const suggestions: string[] = [
    'You already have strong Python fundamentals (7/10). Avoid spending another two weeks on syntax basics—jump straight to scientific computing.',
    'Statistics is currently your largest gap. Focus here before attempting multi-layer neural networks to avoid memorizing formulas without understanding.',
    'At 1.5 hours/day over 6 months, you have ~230 study hours. Keep project scope tightly focused on 2 high-quality implementations rather than 5 half-finished repos.',
  ];

  const projects: ProjectRecommendation[] = [
    {
      id: 'proj-1',
      title: 'Real-Time Inference API with Feature Store',
      skillsDeveloped: ['PyTorch', 'FastAPI', 'Docker', 'Feature Engineering'],
      difficulty: 'Intermediate',
      estimatedTime: '3 weeks',
      whyItHelps: 'Hiring managers look for software engineering hygiene applied to ML. Demonstrates that your models run reliably outside of Jupyter Notebooks.',
      deliverable: 'Containerized REST service with /predict endpoint, request payload validation, and latency logging under 40ms.',
    },
    {
      id: 'proj-2',
      title: 'Tabular Fraud Detection with Extreme Class Imbalance',
      skillsDeveloped: ['Scikit-Learn', 'Statistics', 'PR Curves', 'SHAP Explainability'],
      difficulty: 'Intermediate',
      estimatedTime: '2.5 weeks',
      whyItHelps: 'Real-world data is rarely balanced. Proves you know why accuracy is a deceptive metric and how to optimize for business recall constraints.',
      deliverable: 'Reproducible benchmark comparing XGBoost vs LightGBM with SHAP feature importance charts.',
    },
    {
      id: 'proj-3',
      title: 'Fine-Tuned Domain Classifier with Model Card',
      skillsDeveloped: ['PyTorch / HuggingFace', 'Transfer Learning', 'MLOps'],
      difficulty: 'Advanced',
      estimatedTime: '3.5 weeks',
      whyItHelps: 'Showcases contemporary transfer learning expertise and ethical model governance expected in modern tech organizations.',
      deliverable: 'Trained checkpoint hosted on Hugging Face or Cloud Run with comprehensive evaluation benchmark report.',
    },
  ];

  return {
    profile,
    skills,
    readinessScore,
    phases,
    currentMission,
    completedMissions: [],
    suggestions,
    projects,
    lastAdaptation: null,
    adaptationHistory: [],
    progress: {
      completedMissionsCount: 0,
      totalLearningHours: 1.5,
      currentStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedPhasesCount: 0,
    },
    lastUpdated: new Date().toISOString(),
    isGenerated: true,
  };
}
