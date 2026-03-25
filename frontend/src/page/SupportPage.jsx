import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

// ─── Translations (4 languages) ───────────────────────────────────────────────
export const SUPPORT_TRANSLATIONS = {
  en: {
    support: "Help & Support",
    subtitle: "We're here to help you 24/7",
    searchPlaceholder: "Search for help topics…",
    categories: "Browse by Category",
    popularTopics: "Popular Topics",
    aiBot: "Ask AI Assistant",
    aiBotSubtitle: "Get instant answers powered by AI",
    aiPlaceholder: "Ask me anything about SoundWave…",
    aiGreeting: "Hi! I'm your SoundWave assistant 👋 I can help you with account issues, playback problems, billing, and more. What can I help you with today?",
    send: "Send",
    typing: "AI is typing…",
    contactUs: "Contact Support",
    contactSubtitle: "Couldn't find what you need? Reach out directly.",
    email: "Email Support",
    emailDesc: "Response within 24 hours",
    liveChat: "Live Chat",
    liveChatDesc: "Available 9AM–9PM IST",
    community: "Community Forum",
    communityDesc: "Get help from other users",
    faq: "Frequently Asked Questions",
    stillNeedHelp: "Still need help?",
    reportBug: "Report a Bug",
    reportBugDesc: "Found something broken? Let us know",
    suggestFeature: "Suggest a Feature",
    suggestFeatureDesc: "Help us improve SoundWave",
    systemStatus: "System Status",
    systemStatusDesc: "Check if services are running",
    allOperational: "All Systems Operational",
    quickActions: "Quick Actions",
    back: "Back",
    helpful: "Was this helpful?",
    yes: "Yes", no: "No",
    suggestedQ: "Suggested Questions",
  },
  hi: {
    support: "सहायता केंद्र",
    subtitle: "हम आपकी मदद के लिए 24/7 उपलब्ध हैं",
    searchPlaceholder: "सहायता विषय खोजें…",
    categories: "श्रेणी द्वारा ब्राउज़ करें",
    popularTopics: "लोकप्रिय विषय",
    aiBot: "AI असिस्टेंट से पूछें",
    aiBotSubtitle: "AI द्वारा तुरंत उत्तर पाएं",
    aiPlaceholder: "SoundWave के बारे में कुछ भी पूछें…",
    aiGreeting: "नमस्ते! मैं आपका SoundWave असिस्टेंट हूँ 👋 मैं अकाउंट, प्लेबैक, बिलिंग और अधिक में मदद कर सकता हूँ।",
    send: "भेजें",
    typing: "AI टाइप कर रहा है…",
    contactUs: "सहायता से संपर्क करें",
    contactSubtitle: "जो चाहिए वो नहीं मिला? सीधे संपर्क करें।",
    email: "ईमेल सहायता",
    emailDesc: "24 घंटे में जवाब",
    liveChat: "लाइव चैट",
    liveChatDesc: "सुबह 9 से रात 9 बजे IST",
    community: "कम्युनिटी फोरम",
    communityDesc: "अन्य उपयोगकर्ताओं से मदद",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    stillNeedHelp: "अभी भी मदद चाहिए?",
    reportBug: "बग रिपोर्ट करें",
    reportBugDesc: "कुछ टूटा हुआ मिला? बताएं",
    suggestFeature: "फीचर सुझाएं",
    suggestFeatureDesc: "SoundWave को बेहतर बनाएं",
    systemStatus: "सिस्टम स्थिति",
    systemStatusDesc: "सेवाएं चल रही हैं या नहीं",
    allOperational: "सभी सिस्टम चालू हैं",
    quickActions: "त्वरित कार्य",
    back: "वापस",
    helpful: "क्या यह मददगार था?",
    yes: "हाँ", no: "नहीं",
    suggestedQ: "सुझाए गए प्रश्न",
  },
  mr: {
    support: "मदत केंद्र",
    subtitle: "आम्ही 24/7 आपल्यासाठी उपलब्ध आहोत",
    searchPlaceholder: "मदत विषय शोधा…",
    categories: "श्रेणीनुसार ब्राउज करा",
    popularTopics: "लोकप्रिय विषय",
    aiBot: "AI सहाय्यकाला विचारा",
    aiBotSubtitle: "AI द्वारे त्वरित उत्तरे मिळवा",
    aiPlaceholder: "SoundWave बद्दल काहीही विचारा…",
    aiGreeting: "नमस्कार! मी तुमचा SoundWave सहाय्यक आहे 👋 खाते, प्लेबॅक, बिलिंग आणि अधिकसाठी मदत करू शकतो।",
    send: "पाठवा",
    typing: "AI टाइप करत आहे…",
    contactUs: "सहाय्याशी संपर्क साधा",
    contactSubtitle: "हवे ते सापडले नाही? थेट संपर्क करा.",
    email: "ईमेल सहाय्य",
    emailDesc: "24 तासांत उत्तर",
    liveChat: "लाइव्ह चॅट",
    liveChatDesc: "सकाळी 9 ते रात्री 9 IST",
    community: "कम्युनिटी फोरम",
    communityDesc: "इतर वापरकर्त्यांकडून मदत",
    faq: "वारंवार विचारले जाणारे प्रश्न",
    stillNeedHelp: "अजूनही मदत हवी आहे?",
    reportBug: "बग नोंदवा",
    reportBugDesc: "काही तुटलेले आढळले? कळवा",
    suggestFeature: "फीचर सुचवा",
    suggestFeatureDesc: "SoundWave सुधारण्यास मदत करा",
    systemStatus: "सिस्टम स्थिती",
    systemStatusDesc: "सेवा चालू आहेत का ते तपासा",
    allOperational: "सर्व सिस्टम कार्यरत आहेत",
    quickActions: "त्वरित क्रिया",
    back: "मागे",
    helpful: "हे उपयुक्त होते का?",
    yes: "होय", no: "नाही",
    suggestedQ: "सुचवलेले प्रश्न",
  },
  te: {
    support: "సహాయ కేంద్రం",
    subtitle: "మేము 24/7 మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాము",
    searchPlaceholder: "సహాయ అంశాలు వెతకండి…",
    categories: "వర్గం ద్వారా బ్రౌజ్ చేయండి",
    popularTopics: "ప్రముఖ అంశాలు",
    aiBot: "AI అసిస్టెంట్‌ని అడగండి",
    aiBotSubtitle: "AI ద్వారా తక్షణ సమాధానాలు పొందండి",
    aiPlaceholder: "SoundWave గురించి ఏదైనా అడగండి…",
    aiGreeting: "హాయ్! నేను మీ SoundWave అసిస్టెంట్ 👋 ఖాతా, ప్లేబ్యాక్, బిల్లింగ్ మరియు మరింత సహాయం చేయగలను।",
    send: "పంపండి",
    typing: "AI టైప్ చేస్తోంది…",
    contactUs: "సపోర్ట్‌ని సంప్రదించండి",
    contactSubtitle: "కావలసింది కనుగొనలేదా? నేరుగా సంప్రదించండి.",
    email: "ఇమెయిల్ సపోర్ట్",
    emailDesc: "24 గంటల్లో సమాధానం",
    liveChat: "లైవ్ చాట్",
    liveChatDesc: "ఉదయం 9 నుండి రాత్రి 9 IST",
    community: "కమ్యూనిటీ ఫోరమ్",
    communityDesc: "ఇతర వినియోగదారుల నుండి సహాయం",
    faq: "తరచుగా అడిగే ప్రశ్నలు",
    stillNeedHelp: "ఇంకా సహాయం కావాలా?",
    reportBug: "బగ్ నివేదించండి",
    reportBugDesc: "ఏదైనా విరిగింది? మాకు తెలియజేయండి",
    suggestFeature: "ఫీచర్ సూచించండి",
    suggestFeatureDesc: "SoundWave మెరుగుపరచడంలో సహాయపడండి",
    systemStatus: "సిస్టమ్ స్థితి",
    systemStatusDesc: "సేవలు నడుస్తున్నాయో లేదో తనిఖీ చేయండి",
    allOperational: "అన్ని సిస్టమ్‌లు నడుస్తున్నాయి",
    quickActions: "త్వరిత చర్యలు",
    back: "వెనక్కి",
    helpful: "ఇది సహాయకరంగా ఉందా?",
    yes: "అవును", no: "కాదు",
    suggestedQ: "సూచించిన ప్రశ్నలు",
  },
};

// ─── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQ_DATA = {
  en: [
    {
      category: "Account & Profile",
      icon: "👤",
      color: "#6c63ff",
      questions: [
        { q: "How do I change my profile picture?", a: "Go to Settings → Edit Profile → tap your avatar to upload a new photo. Supported formats: JPG, PNG, WebP (max 5MB)." },
        { q: "How do I change my username or display name?", a: "Navigate to Settings → Edit Profile → tap 'Display Name' field, update it and press Save." },
        { q: "How do I reset my password?", a: "Go to Settings → Account → Change Password. Enter your current password and then set a new one. If you forgot your password, use 'Forgot Password' on the login screen." },
        { q: "How do I delete my account permanently?", a: "Go to Settings → Account → Delete Account. Note: This action is irreversible and will remove all your playlists, history and saved songs." },
        { q: "How do I enable Two-Factor Authentication?", a: "Go to Settings → Privacy & Security → Two-Factor Auth. Toggle it ON and follow the setup steps using your authenticator app." },
      ],
    },
    {
      category: "Playback & Music",
      icon: "🎵",
      color: "#00d4ff",
      questions: [
        { q: "Why is my music buffering or lagging?", a: "Try switching to a lower playback quality in Settings → Sound → Playback Quality. Also check your internet connection or enable Data Saver mode." },
        { q: "How does Crossfade work?", a: "Crossfade creates smooth transitions between songs. Adjust the duration (0–12 seconds) in Settings → Sound → Crossfade." },
        { q: "What is Private Session?", a: "Private Session prevents your listening history from being updated. Enable it in Settings → Privacy & Security → Private Session." },
        { q: "How do I use the Equalizer?", a: "The Equalizer feature is coming soon! Stay tuned for updates to customize your audio experience." },
        { q: "Why does Autoplay keep playing songs I don't like?", a: "Autoplay uses your listening history to suggest similar songs. Disable it in Settings → Sound → Autoplay, or train your recommendations by liking/disliking songs." },
      ],
    },
    {
      category: "Subscription & Billing",
      icon: "💳",
      color: "#1db954",
      questions: [
        { q: "What's included in the Free Plan?", a: "Free Plan includes ad-supported listening, shuffle play, limited skips, and standard audio quality. Upgrade to Premium for unlimited skips, offline mode, and high quality audio." },
        { q: "How do I upgrade to Premium?", a: "Tap your profile → Upgrade to Premium. Choose a plan and complete payment. Your account upgrades instantly." },
        { q: "How do I cancel my subscription?", a: "Go to your Profile → Subscription → Cancel Plan. Your Premium benefits continue until the end of the billing period." },
        { q: "Why was I charged twice?", a: "Duplicate charges can happen due to payment processor delays. Contact our billing support at billing@soundwave.app with your transaction ID." },
      ],
    },
    {
      category: "App & Technical",
      icon: "⚙️",
      color: "#ff6b35",
      questions: [
        { q: "The app keeps crashing. What do I do?", a: "Try: 1) Clear cache in Settings → Storage → Clear Cache. 2) Restart the app. 3) Update to the latest version. 4) Reinstall the app if issues persist." },
        { q: "How do I clear the cache?", a: "Go to Settings → Storage → Clear Cache. This removes temporary files while keeping your preferences, playlists and saved songs." },
        { q: "Why is the app not showing my playlists?", a: "Pull down to refresh on the Home screen. If the issue persists, log out and back in. Check your internet connection and ensure you're on the latest app version." },
        { q: "The app UI looks broken or misaligned.", a: "Try clearing the cache first. If using a browser, try a hard refresh (Ctrl+Shift+R). Switching between dark and light mode in Settings → Appearance can also help reset the UI." },
        { q: "How do I change the app language?", a: "Go to Settings → Language → Select Language. SoundWave supports English, Hindi, Marathi, and Telugu. The app will update immediately." },
      ],
    },
    {
      category: "Notifications",
      icon: "🔔",
      color: "#ff4d6d",
      questions: [
        { q: "How do I turn off push notifications?", a: "Go to Settings → Notifications → Push Notifications and toggle it OFF. You can also control new release and email notification preferences separately." },
        { q: "Why am I not getting new release notifications?", a: "Make sure 'New Releases' is toggled ON in Settings → Notifications. Also check that your device's notification permissions for SoundWave are enabled." },
      ],
    },
  ],
  hi: [
    {
      category: "अकाउंट और प्रोफ़ाइल",
      icon: "👤", color: "#6c63ff",
      questions: [
        { q: "प्रोफ़ाइल फोटो कैसे बदलें?", a: "Settings → Edit Profile → अपने अवतार पर टैप करें और नई फोटो अपलोड करें। समर्थित फ़ॉर्मेट: JPG, PNG, WebP (अधिकतम 5MB)।" },
        { q: "पासवर्ड कैसे बदलें?", a: "Settings → Account → Change Password पर जाएं। वर्तमान पासवर्ड डालें और नया पासवर्ड सेट करें।" },
        { q: "अकाउंट कैसे डिलीट करें?", a: "Settings → Account → Delete Account पर जाएं। यह क्रिया अपरिवर्तनीय है।" },
        { q: "Two-Factor Auth कैसे चालू करें?", a: "Settings → Privacy & Security → Two-Factor Auth पर जाएं और ON करें।" },
      ],
    },
    {
      category: "प्लेबैक और संगीत",
      icon: "🎵", color: "#00d4ff",
      questions: [
        { q: "संगीत बफर क्यों हो रहा है?", a: "Settings → Sound → Playback Quality में कम गुणवत्ता चुनें या Data Saver मोड चालू करें।" },
        { q: "Private Session क्या है?", a: "यह आपकी सुनने का इतिहास अपडेट होने से रोकता है। Settings → Privacy & Security में चालू करें।" },
      ],
    },
    {
      category: "सब्सक्रिप्शन और बिलिंग",
      icon: "💳", color: "#1db954",
      questions: [
        { q: "Free Plan में क्या शामिल है?", a: "विज्ञापन-समर्थित सुनना, शफल प्ले, सीमित स्किप और मानक ऑडियो गुणवत्ता।" },
        { q: "Premium कैसे लें?", a: "प्रोफ़ाइल → Upgrade to Premium पर टैप करें और प्लान चुनें।" },
      ],
    },
    {
      category: "ऐप और तकनीकी",
      icon: "⚙️", color: "#ff6b35",
      questions: [
        { q: "ऐप क्रैश हो रही है, क्या करें?", a: "Settings → Storage → Clear Cache करें, फिर ऐप रीस्टार्ट करें।" },
        { q: "भाषा कैसे बदलें?", a: "Settings → Language → Select Language पर जाएं।" },
      ],
    },
  ],
  mr: [
    {
      category: "खाते आणि प्रोफाइल",
      icon: "👤", color: "#6c63ff",
      questions: [
        { q: "प्रोफाइल फोटो कसा बदलायचा?", a: "Settings → Edit Profile → अवतारवर टॅप करा आणि नवीन फोटो अपलोड करा।" },
        { q: "पासवर्ड कसा बदलायचा?", a: "Settings → Account → Change Password वर जा।" },
      ],
    },
    {
      category: "प्लेबॅक आणि संगीत",
      icon: "🎵", color: "#00d4ff",
      questions: [
        { q: "संगीत बफर का होत आहे?", a: "Settings → Sound → Playback Quality मध्ये कमी गुणवत्ता निवडा किंवा Data Saver चालू करा।" },
      ],
    },
    {
      category: "सदस्यता आणि बिलिंग",
      icon: "💳", color: "#1db954",
      questions: [
        { q: "Free Plan मध्ये काय समाविष्ट आहे?", a: "जाहिरात-समर्थित ऐकणे, शफल प्ले, मर्यादित स्किप आणि मानक ऑडिओ गुणवत्ता।" },
      ],
    },
    {
      category: "अॅप आणि तांत्रिक",
      icon: "⚙️", color: "#ff6b35",
      questions: [
        { q: "अॅप क्रॅश होत आहे, काय करायचे?", a: "Settings → Storage → Clear Cache करा, नंतर अॅप रीस्टार्ट करा।" },
      ],
    },
  ],
  te: [
    {
      category: "ఖాతా మరియు ప్రొఫైల్",
      icon: "👤", color: "#6c63ff",
      questions: [
        { q: "ప్రొఫైల్ ఫోటో ఎలా మార్చాలి?", a: "Settings → Edit Profile → మీ అవతార్‌ని ట్యాప్ చేయండి మరియు కొత్త ఫోటో అప్‌లోడ్ చేయండి।" },
        { q: "పాస్‌వర్డ్ ఎలా మార్చాలి?", a: "Settings → Account → Change Password కి వెళ్ళండి।" },
      ],
    },
    {
      category: "ప్లేబ్యాక్ మరియు సంగీతం",
      icon: "🎵", color: "#00d4ff",
      questions: [
        { q: "సంగీతం బఫర్ అవుతున్నదా?", a: "Settings → Sound → Playback Quality లో తక్కువ నాణ్యత ఎంచుకోండి లేదా Data Saver ఆన్ చేయండి।" },
      ],
    },
    {
      category: "సభ్యత్వం మరియు బిల్లింగ్",
      icon: "💳", color: "#1db954",
      questions: [
        { q: "Free Plan లో ఏమి ఉంటుంది?", a: "ప్రకటన-మద్దతు వినడం, షఫిల్ ప్లే, పరిమిత స్కిప్‌లు మరియు ప్రమాణ ఆడియో నాణ్యత।" },
      ],
    },
    {
      category: "యాప్ మరియు సాంకేతిక",
      icon: "⚙️", color: "#ff6b35",
      questions: [
        { q: "యాప్ క్రాష్ అవుతోంది, ఏమి చేయాలి?", a: "Settings → Storage → Clear Cache చేయండి, తర్వాత యాప్‌ని రీస్టార్ట్ చేయండి।" },
      ],
    },
  ],
};

// ─── AI Suggested Questions ────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = {
  en: [
    "How do I reset my password?",
    "Why is my music not playing?",
    "How to cancel Premium subscription?",
    "How to download songs for offline?",
    "Why are my playlists missing?",
    "How to change app language?",
    "What is Private Session mode?",
    "How to report a problem?",
  ],
  hi: [
    "पासवर्ड कैसे रीसेट करें?",
    "संगीत क्यों नहीं चल रहा?",
    "Premium कैसे कैंसिल करें?",
    "ऑफलाइन गाने कैसे डाउनलोड करें?",
    "भाषा कैसे बदलें?",
  ],
  mr: [
    "पासवर्ड कसा रीसेट करायचा?",
    "संगीत का चालत नाही?",
    "भाषा कशी बदलायची?",
  ],
  te: [
    "పాస్‌వర్డ్ ఎలా రీసెట్ చేయాలి?",
    "సంగీతం ఎందుకు ప్లే కావడం లేదు?",
    "భాష ఎలా మార్చాలి?",
  ],
};

// ─── AI Knowledge Base for bot answers ────────────────────────────────────────
const AI_KNOWLEDGE = {
  password: "To reset your password: Go to Settings → Account → Change Password. If you forgot your password, tap 'Forgot Password' on the login screen and follow the email instructions.",
  music: "If music isn't playing: 1) Check your internet connection 2) Try lowering playback quality in Settings → Sound 3) Clear cache in Settings → Storage 4) Restart the app.",
  playlist: "If playlists are missing: Pull down to refresh on Home screen. Log out and back in. Make sure you're connected to the internet.",
  language: "To change language: Go to Settings → Language → Select Language. We support English, Hindi, Marathi, and Telugu.",
  premium: "To manage your Premium subscription: Go to your Profile → Subscription. You can upgrade, downgrade or cancel from there.",
  offline: "Offline downloads are available on Premium plan. Tap the download icon (⬇️) on any song, album or playlist while connected to WiFi.",
  crash: "If the app keeps crashing: 1) Clear cache in Settings → Storage → Clear Cache 2) Restart the app 3) Update to the latest version 4) Reinstall if needed.",
  notification: "To manage notifications: Settings → Notifications. You can control Push Notifications, New Releases, and Email Updates separately.",
  private: "Private Session hides your listening activity from history and recommendations. Enable it in Settings → Privacy & Security → Private Session.",
  quality: "Adjust audio quality in Settings → Sound → Playback Quality. Choose High, Medium, or Low based on your connection.",
  profile: "To edit your profile: Go to Settings → tap 'Edit Profile' button. You can change your display name and profile picture.",
  billing: "For billing issues, email us at billing@soundwave.app with your transaction ID. Duplicate charges are usually reversed within 3-5 business days.",
  default: "I understand you need help with that. Here are your options:\n\n1️⃣ Browse our FAQ sections above\n2️⃣ Contact our support team via email\n3️⃣ Chat with a live agent (9AM-9PM IST)\n\nFor urgent issues, live chat is the fastest way to get help!",
};

function getAIResponse(question) {
  const q = question.toLowerCase();
  if (q.includes("password") || q.includes("पासवर्ड") || q.includes("పాస్‌వర్డ్")) return AI_KNOWLEDGE.password;
  if (q.includes("play") || q.includes("music") || q.includes("song") || q.includes("संगीत") || q.includes("సంగీత")) return AI_KNOWLEDGE.music;
  if (q.includes("playlist") || q.includes("प्लेलिस्ट")) return AI_KNOWLEDGE.playlist;
  if (q.includes("language") || q.includes("भाषा") || q.includes("భాష")) return AI_KNOWLEDGE.language;
  if (q.includes("premium") || q.includes("cancel") || q.includes("subscription") || q.includes("billing")) return AI_KNOWLEDGE.premium;
  if (q.includes("offline") || q.includes("download")) return AI_KNOWLEDGE.offline;
  if (q.includes("crash") || q.includes("slow") || q.includes("bug") || q.includes("freeze")) return AI_KNOWLEDGE.crash;
  if (q.includes("notif") || q.includes("सूचना")) return AI_KNOWLEDGE.notification;
  if (q.includes("private") || q.includes("session")) return AI_KNOWLEDGE.private;
  if (q.includes("quality") || q.includes("buffering") || q.includes("lagging")) return AI_KNOWLEDGE.quality;
  if (q.includes("profile") || q.includes("picture") || q.includes("avatar") || q.includes("name")) return AI_KNOWLEDGE.profile;
  if (q.includes("charge") || q.includes("pay") || q.includes("bill")) return AI_KNOWLEDGE.billing;
  return AI_KNOWLEDGE.default;
}

// ─── Components ────────────────────────────────────────────────────────────────
const StatusDot = ({ color = "#1db954" }) => (
  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%",
    background: color, boxShadow: `0 0 6px ${color}`, marginRight: 6, flexShrink: 0 }} />
);

const Chip = ({ children, accent, onClick, active }) => (
  <button onClick={onClick}
    style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
      border: `1px solid ${active ? accent : "rgba(255,255,255,0.1)"}`,
      background: active ? `${accent}20` : "rgba(255,255,255,0.04)",
      color: active ? accent : "rgba(255,255,255,0.6)",
      cursor: "pointer", outline: "none", transition: "all 0.15s", whiteSpace: "nowrap" }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
    {children}
  </button>
);

// ─── Main SupportPage ──────────────────────────────────────────────────────────
export default function SupportPage() {
  const navigate = useNavigate();
  const { accent = "#6c63ff", lang = "en", isDark = true } = useApp?.() || {};
  const t = SUPPORT_TRANSLATIONS[lang] || SUPPORT_TRANSLATIONS.en;
  const faqData = FAQ_DATA[lang] || FAQ_DATA.en;
  const suggestedQs = SUGGESTED_QUESTIONS[lang] || SUGGESTED_QUESTIONS.en;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [activeTab, setActiveTab] = useState("faq"); // faq | ai | contact

  // AI Bot state
  const [messages, setMessages] = useState([
    { role: "ai", text: t.aiGreeting, time: new Date() }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const bg = isDark ? "#0a0c12" : "#f0f2f5";
  const card = isDark ? "#13151f" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#f0f0f0" : "#111";
  const muted = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Update greeting when lang changes
  useEffect(() => {
    setMessages([{ role: "ai", text: t.aiGreeting, time: new Date() }]);
  }, [lang]);

  const sendMessage = (text) => {
    const userMsg = text || inputValue.trim();
    if (!userMsg) return;
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", text: userMsg, time: new Date() }]);
    setIsTyping(true);
    setTimeout(() => {
      const response = getAIResponse(userMsg);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "ai", text: response, time: new Date() }]);
    }, 1000 + Math.random() * 800);
  };

  const filteredFaq = faqData.map(cat => ({
    ...cat,
    questions: cat.questions.filter(({ q, a }) =>
      !searchQuery || q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat =>
    (!activeCategory || cat.category === activeCategory) && cat.questions.length > 0
  );

  const formatTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const vars = {
    "--sp-bg": bg, "--sp-card": card, "--sp-border": border,
    "--sp-text": text, "--sp-muted": muted,
  };

  return (
    <>
      <style>{`
        @keyframes spFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes spPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.15); } }
        @keyframes spDot { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
        @keyframes spSlide { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .sp-tab-btn { transition: all 0.18s; }
        .sp-tab-btn:hover { background: rgba(255,255,255,0.05) !important; }
        .sp-faq-item { transition: background 0.15s; }
        .sp-faq-item:hover { background: rgba(255,255,255,0.03) !important; }
        .sp-contact-card { transition: transform 0.2s, box-shadow 0.2s; }
        .sp-contact-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important; }
        .sp-msg-bubble { animation: spSlide 0.25s ease; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, paddingTop: 80, paddingBottom: 80,
        transition: "background 0.3s", ...vars }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px" }}>

          {/* ── Header ── */}
          <div style={{ animation: "spFadeUp 0.4s ease", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button onClick={() => navigate(-1)}
                style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${border}`,
                  background: card, color: text, cursor: "pointer", fontSize: 18, display: "flex",
                  alignItems: "center", justifyContent: "center", outline: "none" }}>‹</button>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusDot />
                <span style={{ fontSize: 11, color: "#1db954", fontWeight: 600 }}>{t.allOperational}</span>
              </div>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: text, margin: 0,
              background: `linear-gradient(135deg, ${text}, ${accent})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.support}</h1>
            <p style={{ color: muted, fontSize: 15, margin: "6px 0 0" }}>{t.subtitle}</p>
          </div>

          {/* ── Search ── */}
          <div style={{ animation: "spFadeUp 0.45s ease", marginBottom: 28 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                fontSize: 18, pointerEvents: "none" }}>🔍</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 14,
                  border: `1.5px solid ${searchQuery ? accent : border}`,
                  background: card, color: text, fontSize: 14, outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box",
                  boxShadow: searchQuery ? `0 0 0 3px ${accent}18` : "none" }} />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 18 }}>×</button>
              )}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: 4, background: card, borderRadius: 14, padding: 4,
            border: `1px solid ${border}`, marginBottom: 28, animation: "spFadeUp 0.5s ease" }}>
            {[
              { id: "faq", label: `📚 ${t.faq}` },
              { id: "ai", label: `🤖 ${t.aiBot}` },
              { id: "contact", label: `📞 ${t.contactUs}` },
            ].map(tab => (
              <button key={tab.id} className="sp-tab-btn" onClick={() => setActiveTab(tab.id)}
                style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                  background: activeTab === tab.id ? accent : "transparent",
                  color: activeTab === tab.id ? "#fff" : muted,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 13, cursor: "pointer", outline: "none", transition: "all 0.18s" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════
              TAB: FAQ
          ══════════════════════════════════════════════════ */}
          {activeTab === "faq" && (
            <div style={{ animation: "spFadeUp 0.3s ease" }}>

              {/* Category chips */}
              {!searchQuery && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  <Chip accent={accent} active={!activeCategory} onClick={() => setActiveCategory(null)}>
                    All
                  </Chip>
                  {faqData.map(cat => (
                    <Chip key={cat.category} accent={accent}
                      active={activeCategory === cat.category}
                      onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}>
                      {cat.icon} {cat.category}
                    </Chip>
                  ))}
                </div>
              )}

              {filteredFaq.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", color: muted }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: text, marginBottom: 6 }}>No results found</div>
                  <div style={{ fontSize: 13 }}>Try different keywords or ask our AI assistant</div>
                  <button onClick={() => setActiveTab("ai")}
                    style={{ marginTop: 16, padding: "10px 24px", borderRadius: 100,
                      background: accent, color: "#fff", border: "none", cursor: "pointer",
                      fontSize: 13, fontWeight: 600 }}>Ask AI</button>
                </div>
              ) : (
                filteredFaq.map((cat, ci) => (
                  <div key={ci} style={{ background: card, borderRadius: 16,
                    border: `1px solid ${border}`, marginBottom: 16, overflow: "hidden" }}>
                    {/* Category header */}
                    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${border}`,
                      display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${cat.color}18`, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 18 }}>{cat.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cat.color,
                        textTransform: "uppercase", letterSpacing: "0.07em" }}>{cat.category}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: muted,
                        background: `${cat.color}15`, padding: "2px 8px", borderRadius: 100,
                        fontWeight: 600 }}>{cat.questions.length}</span>
                    </div>

                    {/* Questions */}
                    {cat.questions.map((item, qi) => {
                      const key = `${ci}-${qi}`;
                      const isOpen = expandedQ === key;
                      return (
                        <div key={qi} className="sp-faq-item"
                          style={{ borderTop: qi > 0 ? `1px solid ${border}` : "none" }}>
                          <button onClick={() => setExpandedQ(isOpen ? null : key)}
                            style={{ width: "100%", display: "flex", alignItems: "center",
                              gap: 12, padding: "14px 20px", background: "none", border: "none",
                              cursor: "pointer", textAlign: "left", outline: "none" }}>
                            <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: text,
                              lineHeight: 1.4 }}>{item.q}</div>
                            <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                              background: isOpen ? `${accent}20` : "rgba(255,255,255,0.06)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: isOpen ? accent : muted, fontSize: 14, fontWeight: 700,
                              transition: "all 0.2s", transform: isOpen ? "rotate(45deg)" : "none" }}>+</div>
                          </button>

                          {isOpen && (
                            <div style={{ padding: "0 20px 18px 20px", animation: "spFadeUp 0.2s ease" }}>
                              <div style={{ background: `${accent}08`, borderLeft: `3px solid ${accent}`,
                                borderRadius: "0 10px 10px 0", padding: "12px 16px",
                                fontSize: 13, color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.65)",
                                lineHeight: 1.65 }}>{item.a}</div>
                              {/* Helpful votes */}
                              <div style={{ display: "flex", alignItems: "center", gap: 12,
                                marginTop: 12, fontSize: 12, color: muted }}>
                                <span>{t.helpful}</span>
                                {helpfulVotes[key] ? (
                                  <span style={{ color: "#1db954", fontWeight: 600 }}>
                                    {helpfulVotes[key] === "yes" ? "👍 Thanks!" : "👎 We'll improve this"}
                                  </span>
                                ) : (
                                  <>
                                    <button onClick={() => setHelpfulVotes(p => ({ ...p, [key]: "yes" }))}
                                      style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12,
                                        border: `1px solid rgba(29,185,84,0.3)`, background: "rgba(29,185,84,0.08)",
                                        color: "#1db954", cursor: "pointer", outline: "none", fontWeight: 600 }}>
                                      👍 {t.yes}
                                    </button>
                                    <button onClick={() => setHelpfulVotes(p => ({ ...p, [key]: "no" }))}
                                      style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12,
                                        border: `1px solid rgba(255,77,109,0.3)`, background: "rgba(255,77,109,0.08)",
                                        color: "#ff4d6d", cursor: "pointer", outline: "none", fontWeight: 600 }}>
                                      👎 {t.no}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              {/* Quick Actions */}
              <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`,
                padding: 20, marginTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: 14 }}>{t.quickActions}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "🐞", label: t.reportBug, desc: t.reportBugDesc, color: "#ff4d6d" },
                    { icon: "💡", label: t.suggestFeature, desc: t.suggestFeatureDesc, color: "#ffd700" },
                    { icon: "📊", label: t.systemStatus, desc: t.systemStatusDesc, color: "#1db954" },
                    { icon: "💬", label: t.community, desc: t.communityDesc, color: "#00d4ff" },
                  ].map((item, i) => (
                    <button key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "12px 14px", borderRadius: 12,
                      border: `1px solid ${border}`, background: "rgba(255,255,255,0.02)",
                      cursor: "pointer", textAlign: "left", outline: "none", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + "44"; e.currentTarget.style.background = item.color + "08"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: text }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: muted, marginTop: 2, lineHeight: 1.3 }}>{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: AI BOT
          ══════════════════════════════════════════════════ */}
          {activeTab === "ai" && (
            <div style={{ animation: "spFadeUp 0.3s ease" }}>

              {/* AI Header card */}
              <div style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}08)`,
                border: `1px solid ${accent}30`, borderRadius: 16, padding: "16px 20px",
                marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14,
                  background: `linear-gradient(135deg, ${accent}, #ff4d6d)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0, animation: "spPulse 3s infinite" }}>🤖</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: text }}>{t.aiBot}</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>{t.aiBotSubtitle}</div>
                  <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                    <StatusDot /> <span style={{ fontSize: 11, color: "#1db954", fontWeight: 600 }}>Online</span>
                  </div>
                </div>
              </div>

              {/* Chat window */}
              <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`,
                height: 420, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
                  {messages.map((msg, i) => (
                    <div key={i} className="sp-msg-bubble"
                      style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: 12, gap: 8, alignItems: "flex-end" }}>
                      {msg.role === "ai" && (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg, ${accent}, #ff4d6d)`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                      )}
                      <div style={{ maxWidth: "72%" }}>
                        <div style={{ padding: "10px 14px", borderRadius:
                            msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: msg.role === "user" ? accent : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                          color: msg.role === "user" ? "#fff" : text,
                          fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line",
                          boxShadow: msg.role === "user" ? `0 4px 16px ${accent}44` : "none" }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: 10, color: muted, marginTop: 4,
                          textAlign: msg.role === "user" ? "right" : "left" }}>
                          {formatTime(msg.time)}
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: accent, display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700 }}>U</div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%",
                        background: `linear-gradient(135deg, ${accent}, #ff4d6d)`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                      <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
                        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        display: "flex", gap: 5, alignItems: "center" }}>
                        {[0, 150, 300].map(delay => (
                          <span key={delay} style={{ width: 7, height: 7, borderRadius: "50%",
                            background: muted, display: "inline-block",
                            animation: `spDot 1.2s ${delay}ms infinite` }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: muted }}>{t.typing}</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "12px 12px", borderTop: `1px solid ${border}`,
                  display: "flex", gap: 8, alignItems: "center" }}>
                  <input value={inputValue} onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={t.aiPlaceholder}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 24,
                      border: `1.5px solid ${inputValue ? accent : border}`,
                      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      color: text, fontSize: 13, outline: "none", transition: "border-color 0.2s" }} />
                  <button onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    style={{ width: 40, height: 40, borderRadius: "50%",
                      background: inputValue.trim() && !isTyping ? accent : "rgba(255,255,255,0.1)",
                      border: "none", cursor: inputValue.trim() && !isTyping ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, transition: "all 0.2s", flexShrink: 0,
                      boxShadow: inputValue.trim() && !isTyping ? `0 4px 16px ${accent}55` : "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggested Questions */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: muted,
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  {t.suggestedQ}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {suggestedQs.map((q, i) => (
                    <button key={i} onClick={() => { setInputValue(q); setTimeout(() => sendMessage(q), 10); }}
                      style={{ padding: "8px 14px", borderRadius: 100,
                        border: `1px solid ${border}`, background: card,
                        color: text, fontSize: 12, cursor: "pointer", outline: "none",
                        transition: "all 0.15s", fontWeight: 500 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = accent + "66"; e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text; }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: CONTACT
          ══════════════════════════════════════════════════ */}
          {activeTab === "contact" && (
            <div style={{ animation: "spFadeUp 0.3s ease" }}>
              <p style={{ color: muted, fontSize: 14, marginBottom: 20 }}>{t.contactSubtitle}</p>

              {/* Contact Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                {[
                  { icon: "📧", label: t.email, desc: t.emailDesc, color: accent,
                    action: () => window.open("mailto:support@soundwave.app") },
                  { icon: "💬", label: t.liveChat, desc: t.liveChatDesc, color: "#00d4ff",
                    action: () => setActiveTab("ai") },
                  { icon: "👥", label: t.community, desc: t.communityDesc, color: "#1db954",
                    action: () => {} },
                  { icon: "🐞", label: t.reportBug, desc: t.reportBugDesc, color: "#ff4d6d",
                    action: () => window.open("mailto:bugs@soundwave.app") },
                ].map((item, i) => (
                  <button key={i} className="sp-contact-card" onClick={item.action}
                    style={{ display: "flex", flexDirection: "column", alignItems: "flex-start",
                      gap: 10, padding: "20px", borderRadius: 16,
                      border: `1px solid ${border}`, background: card,
                      cursor: "pointer", textAlign: "left", outline: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12,
                      background: `${item.color}15`, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 22 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: muted, marginTop: 4, lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                    <div style={{ fontSize: 12, color: item.color, fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 4 }}>
                      Open <span>›</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* System Status */}
              <div style={{ background: card, borderRadius: 16, border: `1px solid ${border}`, padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accent,
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                  {t.systemStatus}
                </div>
                {[
                  { name: "Music Streaming", status: "Operational", color: "#1db954" },
                  { name: "Search & Discovery", status: "Operational", color: "#1db954" },
                  { name: "User Authentication", status: "Operational", color: "#1db954" },
                  { name: "Payments & Billing", status: "Operational", color: "#1db954" },
                  { name: "Push Notifications", status: "Degraded", color: "#ffd700" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: i < 4 ? `1px solid ${border}` : "none" }}>
                    <span style={{ fontSize: 13, color: text }}>{s.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <StatusDot color={s.color} />
                      <span style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer info */}
              <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 14,
                background: `${accent}08`, border: `1px solid ${accent}20`,
                display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>⏱️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: text }}>Average Response Time</div>
                  <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                    Email: ~18 hours · Live Chat: ~2 minutes · Community: ~4 hours
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}