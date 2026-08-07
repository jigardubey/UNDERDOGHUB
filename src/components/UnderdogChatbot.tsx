import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Flame, X, Send, Sparkles, Trophy, Calendar, CheckCircle2, 
  HelpCircle, ShieldCheck, User, ExternalLink, Bookmark, Minimize2, RefreshCw
} from 'lucide-react';
import { Tournament, CustomMatch, UserProfile } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickActions?: string[];
  links?: { label: string; url: string }[];
}

interface UnderdogChatbotProps {
  tournaments: Tournament[];
  savedIds: string[];
  customMatches: CustomMatch[];
  userProfile: UserProfile;
  verificationFee: number;
  onNavigateTab: (tab: string) => void;
  onOpenVerificationModal: () => void;
}

export const UnderdogChatbot: React.FC<UnderdogChatbotProps> = ({
  tournaments,
  savedIds,
  customMatches,
  userProfile,
  verificationFee,
  onNavigateTab,
  onOpenVerificationModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Default welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Booyah! 👋 I am UNDERDOG AI, your Free Fire Esports assistant. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        '🔥 Live Tournaments',
        '🏆 When is my next match?',
        '📌 Saved Tournaments',
        '📝 Submit Tournament',
        '✔ How to get Verified?'
      ]
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // AI Response processing
    setTimeout(() => {
      const botResponse = generateBotResponse(query.toLowerCase());
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 600);
  };

  const generateBotResponse = (q: string): Message => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Live Tournaments
    if (q.includes('live') || q.includes('active match') || q.includes('ongoing')) {
      const liveList = tournaments.filter((t) => t.status === 'live');
      if (liveList.length === 0) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "I couldn't find any live tournaments right now. Check back soon or view upcoming tournaments on the Tournaments page!",
          timestamp: nowTime,
          quickActions: ['📅 Upcoming Tournaments', '📌 My Schedule']
        };
      }

      const listText = liveList
        .map(
          (t, idx) =>
            `${idx + 1}. **${t.name}**\n• Organizer: ${t.organizer} ${t.isVerified ? '✔' : ''}\n• Prize Pool: ${t.prizePool} | Format: ${t.matchFormat}`
        )
        .join('\n\n');

      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🔥 Here are the current **LIVE Tournaments** on UNDERDOG HUB:\n\n${listText}`,
        timestamp: nowTime,
        quickActions: ['🏆 When is my next match?', '📌 View Saved']
      };
    }

    // 2. Next Match / My Tournaments / Saved Tournaments
    if (
      q.includes('next match') || 
      q.includes('my tournament') || 
      q.includes('saved') || 
      q.includes('my schedule') ||
      q.includes('when is my')
    ) {
      const savedTourneys = tournaments.filter((t) => savedIds.includes(t.id));
      const activeCustom = customMatches.filter((cm) => !cm.isCompleted);

      if (savedTourneys.length === 0 && activeCustom.length === 0) {
        return {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `You don't have any saved tournaments or upcoming custom matches yet! Click the Bookmark icon on any tournament to add it to your schedule.`,
          timestamp: nowTime,
          quickActions: ['🔥 Explore Tournaments', '➕ Add Custom Match']
        };
      }

      let responseText = `🎮 **Your Upcoming Match Schedule:**\n\n`;

      if (savedTourneys.length > 0) {
        responseText += `**Saved Platform Tournaments:**\n`;
        savedTourneys.forEach((t) => {
          responseText += `• **${t.name}**\n  📅 Date: ${t.startDate} at ${t.startTime}\n  ORG: ${t.organizer}\n`;
        });
      }

      if (activeCustom.length > 0) {
        responseText += `\n**Logged Custom Scrims:**\n`;
        activeCustom.forEach((cm) => {
          responseText += `• **${cm.tournamentName}**\n  📅 Date: ${cm.matchDate} at ${cm.matchTime}\n  Notes: ${cm.notes || 'No extra notes'}\n`;
        });
      }

      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: responseText,
        timestamp: nowTime,
        quickActions: ['📅 Export ICS Calendar', '🔍 Find More Tournaments']
      };
    }

    // 3. How to Submit Tournament / Approval Process
    if (q.includes('submit') || q.includes('host') || q.includes('add tournament') || q.includes('organizer submit')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📝 **How to Submit a Tournament:**\n\n1. Click on **Submit Tournament** in the top navigation.\n2. Fill in the tournament name, organizer name, prize pool, registration URL, date/time, and match rules.\n3. Click **Submit for Approval**.\n\n*All submitted tournaments go to the Admin review queue. Once approved by the Admin, your tournament will be published instantly on the platform!*`,
        timestamp: nowTime,
        quickActions: ['📝 Open Submit Page', '✔ Apply for Verification']
      };
    }

    // 4. Verification & Verified Badge
    if (
      q.includes('verifi') || 
      q.includes('badge') || 
      q.includes('verified organizer') || 
      q.includes('blue tick') ||
      q.includes('verification fee')
    ) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `✔ **Verified Organizer Badge System:**\n\nOrganizers can apply for official verification to build trust with Free Fire squads!\n\n• **Application Fee:** ₹${verificationFee} (one-time processing fee)\n• **Required Details:** Organizer Name, Email, Phone, Social Links, Experience & Reason.\n• **Status Flow:** Payment Completed → Pending Review → Admin Approval.\n\nOnce approved, your ✔ **Verified Badge** will display on your profile, tournament cards, details, and search results!`,
        timestamp: nowTime,
        quickActions: ['✔ Apply for Verification Now', '📝 Submit Tournament']
      };
    }

    // 5. Owner & Instagram Info
    if (q.includes('owner') || q.includes('creator') || q.includes('jigar') || q.includes('instagram') || q.includes('contact')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `👑 **UNDERDOG HUB Brand & Owner Info:**\n\n• **Owner:** Jigar Dubey\n• **Instagram:** [@ig_jigardubey](https://instagram.com/ig_jigardubey)\n\nFeel free to follow on Instagram for official platform updates, esports announcements, and organizer partnerships!`,
        timestamp: nowTime,
        quickActions: ['🔥 Live Tournaments', '📝 Submit Tournament']
      };
    }

    // 6. Profile / Account / Login / Edit Profile
    if (q.includes('profile') || q.includes('account') || q.includes('login') || q.includes('edit profile') || q.includes('in-game id')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `👤 **User Profile & Account Info:**\n\n• Currently logged in as: **${userProfile.name}** (${userProfile.email})\n• In-Game ID: **${userProfile.inGameId || 'Not set'}**\n• Squad Name: **${userProfile.squadName || 'Not set'}**\n• Role: **${userProfile.role.toUpperCase()}**\n\nTo edit your profile or update your Free Fire In-Game ID, click the Profile avatar icon in the top right header!`,
        timestamp: nowTime,
        quickActions: ['👤 Edit Profile', '🏆 My Tournaments']
      };
    }

    // 6. Rules, Format, Entry Fee, Solo, Duo, Squad
    if (q.includes('rules') || q.includes('format') || q.includes('solo') || q.includes('duo') || q.includes('squad') || q.includes('entry fee')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🎮 **Free Fire Formats on UNDERDOG HUB:**\n\n• **Battle Royale Squad (4v4):** 12 squads drop in Bermuda/Purgatory/Kalahari.\n• **Clash Squad (4v4):** Fast-paced 7-round tactical purchasing knockouts.\n• **Duo (2v2) & Solo:** Lone survivor and partner tactical cups.\n• **Entry Fees:** Both Free entry cups and Paid prize pool scrims are listed with clear tags.`,
        timestamp: nowTime,
        quickActions: ['🔥 Explore Tournaments', '❓ How to Register']
      };
    }

    // 7. How to Register / Registration Links
    if (q.includes('register') || q.includes('how to join') || q.includes('registration link')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `📌 **How to Register for a Tournament:**\n\n1. Browse the **Tournaments** page.\n2. Click **Details** or **Register** on any active tournament card.\n3. Click **Register Now on Organizer Portal** to open the organizer's official Google Form, Discord server, or tournament portal directly!`,
        timestamp: nowTime,
        quickActions: ['🔥 View Active Tournaments', '🏆 My Schedule']
      };
    }

    // 8. Specific Tournament Search Query
    // Search in tournament database
    const matchedTournaments = tournaments.filter(
      (t) =>
        q.includes(t.name.toLowerCase()) ||
        t.name.toLowerCase().includes(q) ||
        t.organizer.toLowerCase().includes(q)
    );

    if (matchedTournaments.length > 0) {
      const t = matchedTournaments[0];
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `🏆 **Found Tournament Details:**\n\n• **Name:** ${t.name}\n• **Organizer:** ${t.organizer} ${t.isVerified ? '✔ (Verified)' : ''}\n• **Prize Pool:** ${t.prizePool} | **Entry Fee:** ${t.entryFee}\n• **Format:** ${t.matchFormat}\n• **Start Date:** ${t.startDate} (${t.startTime})\n• **Slots:** ${t.slotsFilled}/${t.slotsTotal} filled\n• **Status:** ${t.status.toUpperCase()}\n\nDescription: ${t.description}`,
        timestamp: nowTime,
        quickActions: ['📌 Save to My Schedule', '🔥 Explore All Tournaments']
      };
    }

    // 9. STRICT FALLBACK MANDATE: If query is specific to tournament/data not in DB
    if (q.includes('tournament') || q.includes('cup') || q.includes('scrim') || q.includes('organizer') || q.includes('match') || q.includes('prize')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "I couldn't find that information.",
        timestamp: nowTime,
        quickActions: ['🔥 View Live Tournaments', '📝 Submit Tournament', '✔ Verification Info']
      };
    }

    // Standard platform overview
    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `UNDERDOG HUB is the ultimate Free Fire esports discovery engine. You can discover verified tournaments, track live cups, save match schedules, download calendar alerts, and log private custom scrims!`,
      timestamp: nowTime,
      quickActions: ['🔥 Live Tournaments', '🏆 My Schedule', '✔ Verification Info']
    };
  };

  const handleQuickAction = (action: string) => {
    if (action.includes('Submit Tournament') || action.includes('Submit Page')) {
      onNavigateTab('submit');
    } else if (action.includes('Verification')) {
      onOpenVerificationModal();
    } else if (action.includes('My Schedule') || action.includes('Saved') || action.includes('next match')) {
      onNavigateTab('my-tournaments');
    } else if (action.includes('Tournaments') || action.includes('Explore')) {
      onNavigateTab('tournaments');
    }
    handleSend(action);
  };

  return (
    <>
      {/* Floating Widget Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black shadow-2xl shadow-[#FF7A00]/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group font-extrabold text-xs"
          title="Open UNDERDOG AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 stroke-[2.5]" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 absolute -top-1 -right-1 border-2 border-black animate-pulse" />
          </div>
          <span className="font-black italic uppercase tracking-wider font-[#Sora] hidden sm:inline">
            UNDERDOG AI
          </span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[540px] max-h-[85vh] rounded-2xl bg-[#16161D] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Drawer Header */}
          <div className="px-4 py-3 bg.gradient-to-r from-[#16161D] via-[#1F202B] to-[#16161D] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF7A00] flex items-center justify-center text-black font-black shadow-md shadow-[#FF7A00]/20">
                <Bot className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white italic font-[#Sora]">UNDERDOG AI</span>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-white/50 block font-mono">Free Fire Esports Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                title="Minimize Chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0B0F]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-[#FF7A00] text-black font-semibold rounded-br-none'
                      : 'bg-[#1C1D26] text-white border border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Quick Action Pills on Bot Messages */}
                {msg.sender === 'bot' && msg.quickActions && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.quickActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(act)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#FF7A00]/20 text-[#FF7A00] hover:text-[#FF7A00] border border-[#FF7A00]/30 text-[10px] font-bold transition-all hover:scale-[1.02]"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-white/30 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-white/50 text-xs bg-[#1C1D26] p-3 rounded-2xl w-fit border border-white/5">
                <Bot className="w-4 h-4 text-[#FF7A00] animate-bounce" />
                <span className="font-mono text-[11px]">UNDERDOG AI is thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-[#16161D] border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about tournaments, matches, rules..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0B0B0F] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#FF7A00]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-[#FF7A00] hover:bg-[#FF8A1F] text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-[#FF7A00]/20"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
