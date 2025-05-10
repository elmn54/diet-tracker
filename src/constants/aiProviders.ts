export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
};

export const AI_PROVIDER_NAMES = {
  [AI_PROVIDERS.OPENAI]: 'OpenAI',
  [AI_PROVIDERS.GEMINI]: 'Google Gemini',
  [AI_PROVIDERS.CLAUDE]: 'Claude',
};

export const AI_PROVIDER_ENDPOINTS = {
  [AI_PROVIDERS.OPENAI]: 'https://api.openai.com/v1/chat/completions',
  [AI_PROVIDERS.GEMINI]: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent',
  [AI_PROVIDERS.CLAUDE]: 'https://api.anthropic.com/v1/messages',
};

export const AI_PROVIDER_ICONS = {
  [AI_PROVIDERS.OPENAI]: 'brain',
  [AI_PROVIDERS.GEMINI]: 'google',
  [AI_PROVIDERS.CLAUDE]: 'robot',
}; 