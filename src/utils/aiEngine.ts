import { Task, ScheduleBlock, PriorityLevel, RiskLevel, AppSettings, DailyReport, SubTask } from '../types';

// ==========================================
// 1. DYNAMIC PRIORITY ENGINE (Heuristic)
// ==========================================
export function calculateTaskPriority(
  title: string,
  deadlineStr: string,
  estimatedHours: number,
  isOverdue: boolean,
  notes?: string
): { score: number; level: PriorityLevel; explanation: string } {
  const now = new Date();
  const deadline = new Date(deadlineStr);
  
  // Hours remaining until deadline
  const msDiff = deadline.getTime() - now.getTime();
  const hoursRemaining = msDiff / (1000 * 60 * 60);

  let score = 30; // base score

  // 1. Deadline Proximity impact (up to 40 points)
  if (hoursRemaining <= 0) {
    score += 40; // Overdue is critical
  } else if (hoursRemaining <= 12) {
    score += 38;
  } else if (hoursRemaining <= 24) {
    score += 32;
  } else if (hoursRemaining <= 48) {
    score += 20;
  } else if (hoursRemaining <= 168) { // 1 week
    score += 10;
  }

  // 2. Effort / Estimated Hours impact (up to 20 points)
  // Tasks that require a lot of time get higher priority because they need to be started early
  if (estimatedHours >= 10) {
    score += 20;
  } else if (estimatedHours >= 5) {
    score += 15;
  } else if (estimatedHours >= 2) {
    score += 10;
  } else if (estimatedHours > 0) {
    score += 5;
  }

  // 3. Keyword Keywords in title or notes (up to 15 points)
  const urgentKeywords = ['exam', 'final', 'boss', 'client', 'payment', 'bill', 'tax', 'interview', 'presentation', 'critical', 'submit'];
  const textToSearch = `${title} ${notes || ''}`.toLowerCase();
  const matchesKeyword = urgentKeywords.some(keyword => textToSearch.includes(keyword));
  if (matchesKeyword) {
    score += 15;
  }

  // Cap score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // Determine Level
  let level: PriorityLevel = 'Low';
  if (score >= 85) level = 'Critical';
  else if (score >= 65) level = 'High';
  else if (score >= 40) level = 'Medium';

  // Generate Explanation
  let explanation = '';
  if (hoursRemaining <= 0) {
    explanation = `"${title}" was due on ${deadline.toLocaleDateString()}. It is now overdue. Complete immediately!`;
  } else if (hoursRemaining <= 24) {
    explanation = `"${title}" is due in ${Math.round(hoursRemaining)} hours and requires ${estimatedHours} hours of focus. With very little buffer time left, this is marked as ${level}.`;
  } else {
    explanation = `"${title}" requires ${estimatedHours} hours and is due on ${deadline.toLocaleDateString()} (${Math.round(hoursRemaining / 24)} days left). It has a ${level} priority score of ${score}/100.`;
  }

  return { score, level, explanation };
}

// ==========================================
// 2. DEADLINE RISK PREDICTOR (Heuristic)
// ==========================================
export function predictDeadlineRisk(
  deadlineStr: string,
  estimatedHours: number,
  completed: boolean
): { probability: number; level: RiskLevel; reason: string } {
  if (completed) {
    return {
      probability: 0,
      level: 'Safe',
      reason: 'Task is already completed! Nice work.'
    };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const msDiff = deadline.getTime() - now.getTime();
  const hoursRemaining = msDiff / (1000 * 60 * 60);

  if (hoursRemaining <= 0) {
    return {
      probability: 100,
      level: 'Critical Risk',
      reason: 'The deadline has already passed.'
    };
  }

  // Workable hours: Assume user is awake and can work 8 hours per day max.
  // Let's check available calendar hours before the deadline.
  // Simplification: assume they can dedicate about 60% of their awake hours to work.
  // Awake hours: 16 hours a day. Workable = 9.6 hours per day.
  const daysRemaining = hoursRemaining / 24;
  const totalWorkableHours = Math.max(0.5, daysRemaining * 8.5);

  let probability = 10;

  if (hoursRemaining < estimatedHours) {
    // Math physically impossible without sleep deprivation / skipping tasks
    probability = 95;
  } else {
    const ratio = estimatedHours / totalWorkableHours;
    if (ratio > 1.2) {
      probability = 90; // Extremely overloaded
    } else if (ratio > 0.8) {
      probability = 75; // High overload
    } else if (ratio > 0.5) {
      probability = 50; // Moderate overload
    } else if (ratio > 0.2) {
      probability = 25; // Safe under ordinary conditions
    } else {
      probability = 12; // Very safe
    }
  }

  // Add procrastination adjustments
  if (hoursRemaining < 24 && probability < 90) {
    probability = Math.min(88, probability + 15);
  }

  let level: RiskLevel = 'Safe';
  if (probability >= 80) level = 'Critical Risk';
  else if (probability >= 50) level = 'High Risk';
  else if (probability >= 25) level = 'Moderate Risk';

  let reason = '';
  if (probability >= 80) {
    if (hoursRemaining < estimatedHours) {
      reason = `You only have ${Math.round(hoursRemaining)} hours before the deadline, but the task requires ${estimatedHours} hours. You are mathematically out of time.`;
    } else {
      reason = `You have ${Math.round(hoursRemaining)} hours left, but only ~${Math.round(totalWorkableHours)} of them are realistic work hours. The estimated effort (${estimatedHours}h) takes up almost your entire available time.`;
    }
  } else if (probability >= 50) {
    reason = `Tight timeline. The effort of ${estimatedHours}h consumes a significant portion of your active hours before the deadline (${Math.round(hoursRemaining)}h remaining).`;
  } else if (probability >= 25) {
    reason = `Moderate risk. You have ample time (${Math.round(hoursRemaining)}h), but procrastination or other commitments could compress your schedule.`;
  } else {
    reason = `Plenty of buffer time. You have ${Math.round(hoursRemaining)} hours to complete ${estimatedHours} hours of work.`;
  }

  return { probability, level, reason };
}

// ==========================================
// 3. DETERMINISTIC AUTO-SCHEDULER
// ==========================================
export function generateDailySchedule(
  tasks: Task[],
  dateStr: string, // YYYY-MM-DD
  settings: AppSettings
): ScheduleBlock[] {
  const blocks: ScheduleBlock[] = [];
  
  // Filter active (incomplete) tasks that are not overdue
  const activeTasks = tasks
    .filter(t => !t.completed && new Date(t.deadline).getTime() > new Date().getTime())
    // Sort by priority score descending, then deadline ascending
    .sort((a, b) => b.priorityScore - a.priorityScore || new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (activeTasks.length === 0) {
    return [];
  }

  const [startHour, startMin] = settings.workStartTime.split(':').map(Number);
  const [endHour, endMin] = settings.workEndTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;

  let taskIndex = 0;
  let blockIdCounter = 1;

  // Let's create blocks in 30-minute intervals
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    if (taskIndex >= activeTasks.length) {
      break; // No more tasks to schedule
    }

    const currentTask = activeTasks[taskIndex];
    
    // Format times
    const startStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    
    // Add 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentHour += 1;
      currentMin -= 60;
    }
    
    const endStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    // Add task focus block
    blocks.push({
      id: `block-${dateStr}-${blockIdCounter++}`,
      taskId: currentTask.id,
      title: `Focus: ${currentTask.title}`,
      startTime: startStr,
      endTime: endStr,
      date: dateStr,
      category: currentTask.category,
      isBreak: false
    });

    // Subtask simulation tracking (reduce estimated hours temporarily during scheduling)
    currentTask.estimatedHours -= 0.5;
    if (currentTask.estimatedHours <= 0) {
      taskIndex++; // Move to next task
    }

    // Add a 30-min break after every 1.5 hours of work (3 blocks of 30 mins)
    if (blockIdCounter > 1 && blockIdCounter % 4 === 0 && taskIndex < activeTasks.length) {
      const breakStart = endStr;
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
      
      const breakEnd = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      blocks.push({
        id: `block-${dateStr}-${blockIdCounter++}`,
        title: 'Recharge Break ☕',
        startTime: breakStart,
        endTime: breakEnd,
        date: dateStr,
        category: 'break',
        isBreak: true
      });
    }
  }

  return blocks;
}

// ==========================================
// 4. REAL LLM / LOCAL MOCK AI ENGINE
// ==========================================

// Helper to query Gemini API
async function queryGemini(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API error: ${err}`);
    }
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error, falling back...", error);
    throw error;
  }
}

// Helper to query OpenAI API
async function queryOpenAI(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      })
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${err}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error, falling back...", error);
    throw error;
  }
}

// Generates subtasks for a task
export async function getSubtaskBreakdown(
  title: string,
  description: string,
  category: string,
  settings: AppSettings
): Promise<string[]> {
  const prompt = `You are a productivity expert. Break down the task "${title}" (${description}) under category "${category}" into 5 to 8 concrete, sequential, and highly actionable subtasks. Output a JSON object containing a single key "subtasks" which is an array of strings. Do not include any markdown styling. Example output format: { "subtasks": ["Research design", "Create mockups"] }`;

  if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
    try {
      const res = await queryGemini(prompt, settings.geminiApiKey);
      const parsed = JSON.parse(res);
      return parsed.subtasks || [];
    } catch {
      // fallback
    }
  } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
    try {
      const res = await queryOpenAI(prompt, settings.openaiApiKey);
      const parsed = JSON.parse(res);
      return parsed.subtasks || [];
    } catch {
      // fallback
    }
  }

  // Heuristic fallbacks for offline / mock mode
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('web') || text.includes('portfolio') || text.includes('app') || category.toLowerCase() === 'coding') {
    return [
      'Research inspiration and references',
      'Create layout wireframes & structure',
      'Design core UI/UX style and branding',
      'Implement CSS design system and landing section',
      'Code main content layouts and components',
      'Add mock database state or API connections',
      'Review layout responsiveness on mobile',
      'Run builds & deploy application'
    ];
  }

  if (text.includes('exam') || text.includes('study') || text.includes('read') || text.includes('assignment') || category.toLowerCase() === 'study') {
    return [
      'Review assignment instructions and syllabus',
      'Collect reference textbooks, PDFs, and notes',
      'Draft a detailed outline of key chapters/questions',
      'Study core concepts (spend 45 mins)',
      'Draft solutions / write the paper draft',
      'Double check math/citations against rubric',
      'Perform formatting check and export file',
      'Submit file before final deadline'
    ];
  }

  if (text.includes('bill') || text.includes('pay') || text.includes('rent') || text.includes('finance')) {
    return [
      'Locate recent statements and invoice numbers',
      'Check current bank balances for sufficient funds',
      'Log into payment portals or open banking app',
      'Execute direct transfer or credit payment',
      'Verify transaction confirmation screenshot',
      'File receipt in finance folders'
    ];
  }

  if (text.includes('workout') || text.includes('exercise') || text.includes('gym')) {
    return [
      'Choose target muscles or activity type',
      'Prep exercise gear, clothes, and water bottle',
      'Perform a 5-minute dynamic warm-up',
      'Complete main exercise sets (30-45 mins)',
      'Perform light stretching and cooldown',
      'Log workouts and recovery notes'
    ];
  }

  return [
    'Define the ultimate objective of the task',
    'Gather necessary tools, references, and credentials',
    'Execute phase 1: Initial draft or setup (30 mins)',
    'Review progress and iterate based on initial output',
    'Polishing, styling, and refining final details',
    'Verify against success criteria and submit/finish'
  ];
}

// Generates Morning and Evening AI Reports
export async function getDailyReport(
  tasks: Task[],
  dateStr: string,
  settings: AppSettings,
  reportType: 'morning' | 'evening',
  mood?: string
): Promise<DailyReport> {
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  const taskSummary = incompleteTasks.map(t => `- [${t.priorityLevel}] ${t.title} (Est: ${t.estimatedHours}h, Due: ${new Date(t.deadline).toLocaleString()}, Risk: ${t.riskProbability}%)`).join('\n');
  const completedSummary = completedTasks.map(t => `- ${t.title}`).join('\n');

  if (reportType === 'morning') {
    const prompt = `You are a strict, supportive productivity coach. Generate a Morning Briefing for ${dateStr}.
    Incomplete tasks:
    ${taskSummary}
    
    Current mood profile: ${mood || 'Neutral'}
    
    Output a JSON object with:
    - "overview": A concise paragraph analyzing today's focus (2-3 sentences max).
    - "priorities": An array of the top 3 items to complete today.
    - "risks": A list of items at high risk of being missed with brief explanations.
    - "suggestions": Active recommendations to avoid burning out or procrastinating.
    Do not include markdown tags, output clean JSON.`;

    if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
      try {
        const res = await queryGemini(prompt, settings.geminiApiKey);
        const parsed = JSON.parse(res);
        return { date: dateStr, morningBriefing: parsed };
      } catch {}
    } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
      try {
        const res = await queryOpenAI(prompt, settings.openaiApiKey);
        const parsed = JSON.parse(res);
        return { date: dateStr, morningBriefing: parsed };
      } catch {}
    }

    // Mock Fallback
    const highRiskCount = incompleteTasks.filter(t => t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk').length;
    const moodAdj = mood === '😫' ? "Since you are feeling stressed today, we should focus on high impact items and defer smaller tasks." : "Your energy levels are good today, a great opportunity to clear out large tasks!";
    return {
      date: dateStr,
      morningBriefing: {
        overview: `Good morning! You have ${incompleteTasks.length} active tasks on your plate today. ${highRiskCount} tasks carry an elevated risk of missing their deadlines. ${moodAdj}`,
        priorities: incompleteTasks.slice(0, 3).map(t => t.title).concat(incompleteTasks.length === 0 ? ['No active tasks - take a breather!'] : []),
        risks: incompleteTasks
          .filter(t => t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk')
          .slice(0, 2)
          .map(t => `${t.title} (${t.riskProbability}% risk: ${t.riskExplanation})`),
        suggestions: [
          'Work on your highest priority task first thing this morning.',
          'Take a 10-minute walk after 90 minutes of focus work to keep mental clarity.',
          'Turn off notifications during scheduled work blocks.'
        ]
      }
    };
  } else {
    // Evening report
    const prompt = `You are a supportive productivity analyst. Generate an Evening Report for ${dateStr}.
    Completed today:
    ${completedSummary}
    
    Remaining tasks:
    ${taskSummary}
    
    Output a JSON object with:
    - "completedCount": Number of tasks completed today.
    - "productivityScore": An integer rating today's progress from 0 to 100.
    - "timeSpent": Estimation of total focus hours spent today (number).
    - "summary": A brief supportive paragraph summarizing the day (2-3 sentences).
    - "suggestionsTomorrow": List of 2 suggestions to make tomorrow even better.
    Output clean JSON.`;

    if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
      try {
        const res = await queryGemini(prompt, settings.geminiApiKey);
        const parsed = JSON.parse(res);
        return { date: dateStr, eveningReport: parsed };
      } catch {}
    } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
      try {
        const res = await queryOpenAI(prompt, settings.openaiApiKey);
        const parsed = JSON.parse(res);
        return { date: dateStr, eveningReport: parsed };
      } catch {}
    }

    // Mock Fallback
    const compCount = completedTasks.length;
    const totalTime = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
    const score = Math.min(100, Math.max(10, compCount * 25 + (compCount > 0 ? 20 : 0)));
    return {
      date: dateStr,
      eveningReport: {
        completedCount: compCount,
        productivityScore: score,
        timeSpent: totalTime > 0 ? totalTime : 2,
        summary: compCount > 0 
          ? `Outstanding! You checked off ${compCount} tasks today, logging approximately ${totalTime || 2} hours of focus time. This progress keeps you in control.` 
          : "You didn't check off any tasks today, but that's alright. Tomorrow is a fresh start to reorganize, push forward, and smash those deadlines.",
        suggestionsTomorrow: [
          'Write down your top 3 tasks tonight so you can wake up and execute immediately.',
          'Start with a quick 15-minute "win" task to build positive momentum.'
        ]
      }
    };
  }
}

// Emergency Rescue Mode planner
export function generateDeadlineRescuePlan(task: Task): { time: string; action: string; duration: number }[] {
  const steps: { time: string; action: string; duration: number }[] = [];
  
  // Total hours required
  const effort = task.estimatedHours;
  
  // Create an hourly countdown plan
  steps.push({ time: "0-30m", action: `Review prompt instructions, outline final goal structure, remove distracting devices`, duration: 30 });
  
  let hoursLeft = effort;
  let part = 1;
  while (hoursLeft > 0) {
    const chunk = Math.min(1.5, hoursLeft);
    steps.push({ time: `Focus Block ${part}`, action: `Implement primary phase ${part} for ${task.title} (Coding, drafting, or calculation)`, duration: chunk * 60 });
    
    hoursLeft -= chunk;
    part++;
    
    if (hoursLeft > 0) {
      steps.push({ time: "Break", action: "Quick recharge: Stand up, stretch, drink water, absolute tech-free zone", duration: 15 });
    }
  }

  steps.push({ time: "Final 30m", action: `Double check requirements, clean up formatting, test logic, package submission files`, duration: 30 });
  steps.push({ time: "Submission", action: `SUBMIT ${task.title}! DO NOT WAIT.`, duration: 5 });

  return steps;
}

// Conversational AI Coach
export async function getAIChatResponse(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  tasks: Task[],
  settings: AppSettings,
  mood?: string
): Promise<string> {
  const activeTasks = tasks.filter(t => !t.completed);
  const overdueTasks = tasks.filter(t => !t.completed && new Date(t.deadline).getTime() < new Date().getTime());
  
  const ctxPrompt = `You are LastMinute AI, an empathetic, direct, and action-oriented productivity coach.
Your job is to help the user complete tasks on time, avoid procrastination, manage burnout, and schedule effectively.
Here is the user's workload:
- ${activeTasks.length} active tasks.
- ${overdueTasks.length} overdue tasks.
- Current Mood: ${mood || 'Neutral'}

List of tasks:
${activeTasks.map(t => `- ${t.title} (${t.estimatedHours}h, Due: ${new Date(t.deadline).toLocaleString()}, Risk: ${t.riskLevel})`).join('\n')}

Chat History:
${history.map(h => `${h.role === 'user' ? 'User' : 'Coach'}: ${h.content}`).join('\n')}
User: ${message}
Coach:`;

  if (settings.aiProvider === 'gemini' && settings.geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: ctxPrompt }] }]
          })
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    } catch {}
  } else if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: ctxPrompt }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch {}
  }

  // Local fallback response engine
  const msg = message.toLowerCase();
  if (msg.includes('next') || msg.includes('what should i do')) {
    if (activeTasks.length === 0) {
      return "You have no active tasks left! Amazing! Use this free time to relax or start logging long-term goals.";
    }
    const nextTask = activeTasks.sort((a, b) => b.priorityScore - a.priorityScore)[0];
    return `Based on priority and deadlines, your next focus should be **"${nextTask.title}"**. It has a **${nextTask.priorityLevel}** priority rating and there is a **${nextTask.riskProbability}%** risk of missing it. I recommend starting right now for ${nextTask.estimatedHours} hours. Ready to start focus mode?`;
  }
  
  if (msg.includes('reschedule') || msg.includes('organize') || msg.includes('reorganize')) {
    return "I can reorganize your day! I will optimize your schedule slots to fit your high-priority items first, shift lower-priority items to tomorrow, and create 30-minute buffers around your calendar commitments. Check the Calendar or click 'Reschedule Work' on the dashboard!";
  }

  if (msg.includes('risk') || msg.includes('likely to miss') || msg.includes('deadline')) {
    const highRisk = activeTasks.filter(t => t.riskLevel === 'Critical Risk' || t.riskLevel === 'High Risk');
    if (highRisk.length === 0) {
      return "All your tasks look safe! You have enough buffer time for your active workload. Keep up this steady pace.";
    }
    return `You have **${highRisk.length}** tasks at high risk of being missed:\n${highRisk.map(t => `- **${t.title}** (${t.riskProbability}% risk: ${t.riskExplanation})`).join('\n')}\nWould you like me to build an emergency Rescue Plan for one of these?`;
  }

  if (msg.includes('stress') || msg.includes('tired') || msg.includes('burnout') || mood === '😫') {
    return "I hear you, and it's completely valid to feel overwhelmed. Productivity isn't about working until exhaustion. Let's make an adjustment: I suggest focusing only on **one single core task** today and rescheduling everything else. Take regular 15-minute breaks. Remember to drink water and do a light physical stretch right now.";
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hello! I'm LastMinute AI, your proactive productivity coach. I track your workloads, calculate deadline risks, and generate optimized day plans. How can I help you today? You can ask me "What should I do next?", "Do I have any deadline risks?", or tell me how you are feeling!`;
  }

  return "I'm here to support you! Let's get through this list. I recommend starting Focus Mode on your top priority task. Or, if you need help, I can break down a large project into subtasks for you. What would you like to tackle next?";
}
