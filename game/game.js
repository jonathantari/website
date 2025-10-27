const root = document.documentElement;
const body = document.body;
const sessionStatus = document.querySelector('.session-status');
const sceneTitle = document.getElementById('scene-title');
const sceneDescription = document.querySelector('.scene-description');
const promptLabel = document.querySelector('.prompt-text');
const promptForm = document.querySelector('.prompt-form');
const promptInput = document.getElementById('player-response');
const promptButton = promptForm.querySelector('button[type="submit"]');
const progress = document.querySelector('.progress');
const progressFill = document.querySelector('.progress-fill');
const chatLog = document.querySelector('.chat-log');
const bubbleTemplate = document.getElementById('chat-bubble');
const artifacts = document.querySelector('.artifacts');

const journeyState = {
  name: 'Traveler',
  responses: [],
  moments: [],
};

const scenes = [
  {
    id: 'arrival',
    title: 'Hall of Quiet Footsteps',
    description: 'Walls of misted glass breathe slowly. The companion waits with patient light.',
    prompt: 'What name should the labyrinth whisper for you?',
    placeholder: 'Share the name you carry tonight',
    intro: 'An antechamber hums as you approach. The companion tilts its head, ready to learn you.',
    status: 'Listening',
    environment: { hue: 220, saturation: '64%', lightness: '18%', artifact: 'columns' },
    onAnswer(value, state) {
      const trimmed = value.trim();
      state.name = trimmed || 'Traveler';
      state.responses.push({ id: this.id, answer: state.name });
      return {
        museum: `A circular plinth lights up. Letters form and hover: ${state.name}. The blob companion nods, absorbing the sound.`,
        system: 'A walkway unfurls ahead, stretching toward an unseen turn.',
        status: 'Echo recorded',
        environment: { hue: 218, saturation: '68%', lightness: '16%', artifact: 'wave' },
      };
    },
  },
  {
    id: 'wonder',
    title: 'Gallery of Small Wonders',
    description: 'Transparent columns hold suspended droplets of frozen dawn. Each droplet remembers a tender fragment.',
    prompt: 'Describe something small you once cherished.',
    placeholder: 'A pebble, a whisper, a chord... anything',
    intro: 'As you step forward, a chamber of gentle chimes assembles itself around your path.',
    status: 'Listening',
    environment: { hue: 214, saturation: '70%', lightness: '20%', artifact: 'glimmer' },
    onAnswer(value, state) {
      const cherished = value.trim();
      state.responses.push({ id: this.id, answer: cherished });
      state.moments.push({ type: 'wonder', content: cherished });
      const display = cherished
        ? `Glass threads knit together, sculpting the memory of ${cherished}. A slow orbit begins around you.`
        : 'The chamber offers an empty cradle, waiting for a future glimmer to arrive.';
      return {
        museum: display,
        system: 'Echoes ripple through distant rooms as if inviting you onward.',
        status: 'Emotion catalogued',
        environment: { hue: 212, saturation: '66%', lightness: '18%', artifact: 'fragments' },
      };
    },
  },
  {
    id: 'regret',
    title: 'Corridor of Honest Weight',
    description: 'Slate panels line the walls, each carved with unspoken messages drifting in cold vapor.',
    prompt: 'What do you regret not saying?',
    placeholder: 'Let the walls hold it for a while',
    intro: 'The path narrows. Electric veins pulse beneath the floor, urging truth to surface.',
    status: 'Listening',
    environment: { hue: 348, saturation: '58%', lightness: '16%', artifact: 'horizon' },
    onAnswer(value, state) {
      const regret = value.trim();
      state.responses.push({ id: this.id, answer: regret });
      state.moments.push({ type: 'regret', content: regret });
      const display = regret
        ? `A high wall writes the unsent words: "${regret}". The letters glow warm, refusing to fade.`
        : 'An empty panel remains clear, honoring the choice to stay silent.';
      return {
        museum: display,
        system: 'The blob companion brushes the panel, collecting the warmth into its outline.',
        status: 'Confession kept',
        environment: { hue: 332, saturation: '60%', lightness: '18%', artifact: 'seed' },
      };
    },
  },
  {
    id: 'resilience',
    title: 'Atrium of Stillness',
    description: 'A pool mirrors the ceiling. Subtle rings travel outward each time you breathe.',
    prompt: 'When the world felt motionless, what kept you moving?',
    placeholder: 'Name the force, person, or impulse',
    intro: 'Mist curls around the walkway, framing the companion in a halo of diffused light.',
    status: 'Listening',
    environment: { hue: 178, saturation: '52%', lightness: '18%', artifact: 'wave' },
    onAnswer(value, state) {
      const anchor = value.trim();
      state.responses.push({ id: this.id, answer: anchor });
      state.moments.push({ type: 'anchor', content: anchor });
      const display = anchor
        ? `Within the water, a figure shaped from ${anchor} rises and walks beside your companion.`
        : 'The pool remains calm, offering silent company without shape.';
      return {
        museum: display,
        system: 'Ripples become a low hum that pushes you gently forward.',
        status: 'Strength honored',
        environment: { hue: 182, saturation: '48%', lightness: '20%', artifact: 'columns' },
      };
    },
  },
  {
    id: 'promise',
    title: 'Nave of Gentle Pledges',
    description: 'A corridor of suspended ribbons waits for new vows. Each ribbon vibrates with soft resonance.',
    prompt: 'Offer a promise to the figure walking ahead.',
    placeholder: 'The promise can be small',
    intro: 'Your steps drum a steady beat that the ribbons imitate, as if learning your rhythm.',
    status: 'Listening',
    environment: { hue: 260, saturation: '58%', lightness: '22%', artifact: 'glimmer' },
    onAnswer(value, state) {
      const promise = value.trim();
      state.responses.push({ id: this.id, answer: promise });
      state.moments.push({ type: 'promise', content: promise });
      const display = promise
        ? `One ribbon folds around the words "${promise}" and ties itself to the companion.`
        : 'A ribbon falls softly beside your feet, untied yet hopeful.';
      return {
        museum: display,
        system: 'The companion glows brighter, storing the vow under its surface.',
        status: 'Promise archived',
        environment: { hue: 246, saturation: '60%', lightness: '20%', artifact: 'glimmer' },
      };
    },
  },
  {
    id: 'memory',
    title: 'Gallery of Returning Light',
    description: 'The corridor opens into a horizon of dim stars. Each star echoes the steps you have taken.',
    prompt: 'Before you depart, what do you want to remember about this walk?',
    placeholder: 'Capture the image, sound, or feeling',
    intro: 'The labyrinth slows. Even the walls appear to inhale, giving you room to choose.',
    status: 'Listening',
    environment: { hue: 205, saturation: '58%', lightness: '20%', artifact: 'horizon' },
    onAnswer(value, state) {
      const memory = value.trim();
      state.responses.push({ id: this.id, answer: memory });
      state.moments.push({ type: 'memory', content: memory });
      const remembered = memory || 'a quiet stride shared in low light';
      const fragments = buildSummary(state);
      return {
        museum: `Stars arrange themselves into a corridor spelling "${remembered}". The lights flicker in gratitude.`,
        system: fragments,
        status: 'Journey complete',
        environment: { hue: 210, saturation: '54%', lightness: '18%', artifact: 'horizon' },
        finished: true,
      };
    },
  },
];

let currentIndex = 0;
let busy = false;

function buildSummary(state) {
  const parts = [];
  if (state.name) {
    parts.push(`${state.name} walks onward with a steadier pulse.`);
  }
  const regretMoment = state.moments.find((m) => m.type === 'regret' && m.content);
  if (regretMoment) {
    parts.push(`The unsent words rest safely within the corridor.`);
  }
  const anchorMoment = state.moments.find((m) => m.type === 'anchor' && m.content);
  if (anchorMoment) {
    parts.push(`Resilience shaped like ${anchorMoment.content} keeps close to your companion.`);
  }
  const promiseMoment = state.moments.find((m) => m.type === 'promise' && m.content);
  if (promiseMoment) {
    parts.push(`Your promise loops around the companion, humming in sync with each step.`);
  }
  if (!parts.length) {
    parts.push('The labyrinth stores the quiet between your breaths.');
  }
  return parts.join(' ');
}

function addBubble(text, speaker = 'system') {
  if (!text) return;
  const fragment = bubbleTemplate.content.firstElementChild.cloneNode(true);
  fragment.dataset.speaker = speaker;
  fragment.querySelector('p').textContent = text;
  chatLog.appendChild(fragment);
  requestAnimationFrame(() => {
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });
  });
}

function updateEnvironment(environment = {}) {
  const { hue, saturation, lightness, artifact } = environment;
  if (typeof hue !== 'undefined') {
    root.style.setProperty('--scene-hue', hue);
  }
  if (typeof saturation !== 'undefined') {
    root.style.setProperty('--scene-saturation', saturation);
  }
  if (typeof lightness !== 'undefined') {
    root.style.setProperty('--scene-lightness', lightness);
  }
  if (artifact) {
    artifacts.dataset.variant = artifact;
  }
}

function updateProgress() {
  const percent = Math.round((currentIndex / scenes.length) * 100);
  progress.setAttribute('aria-valuenow', String(percent));
  progressFill.style.width = `${percent}%`;
}

function presentScene(scene) {
  updateEnvironment(scene.environment);
  sceneTitle.textContent = scene.title;
  sceneDescription.textContent = scene.description;
  promptLabel.textContent = scene.prompt;
  promptInput.placeholder = scene.placeholder || 'Type your reply';
  promptInput.value = '';
  promptInput.disabled = false;
  promptButton.disabled = false;
  promptForm.classList.remove('complete');
  promptInput.focus({ preventScroll: true });
  sessionStatus.textContent = scene.status || 'Listening';
  updateProgress();
  if (scene.intro) {
    addBubble(scene.intro, 'system');
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (busy) return;
  const scene = scenes[currentIndex];
  const rawValue = promptInput.value;
  const value = rawValue.trim();
  busy = true;
  promptInput.value = '';
  promptInput.disabled = true;
  promptButton.disabled = true;
  const playerDisplay = value || '...';
  addBubble(playerDisplay, 'player');
  sessionStatus.textContent = 'Walking';
  body.classList.add('is-moving');
  await delay(scene.walkDuration || 2300);
  body.classList.remove('is-moving');
  const response = scene.onAnswer(value, journeyState) || {};
  updateEnvironment(response.environment);
  sessionStatus.textContent = response.status || 'Arrived';
  addBubble(response.museum, 'museum');
  if (response.system) {
    addBubble(response.system, 'system');
  }
  await delay(600);

  if (response.finished) {
    sessionStatus.textContent = 'You can linger or return home';
    promptForm.classList.add('complete');
    promptInput.disabled = true;
    promptButton.disabled = true;
    addBubble('The companion bows slightly and waits near the exit.', 'museum');
    addBubble('Thank you for walking with such open steps.', 'system');
    updateProgressToEnd();
    busy = false;
    return;
  }

  currentIndex += 1;
  presentScene(scenes[currentIndex]);
  busy = false;
}

function updateProgressToEnd() {
  progress.setAttribute('aria-valuenow', '100');
  progressFill.style.width = '100%';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

promptForm.addEventListener('submit', handleSubmit);

addBubble('Your footsteps echo softly as you arrive.', 'system');
presentScene(scenes[currentIndex]);
