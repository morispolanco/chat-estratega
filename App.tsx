
import React, { useState, useRef, useEffect } from 'react';
import { OracleMode, Message, CombinatoriaState, UserProfile, OracleStyle } from './types';
import { generateOracleResponse } from './geminiService';
import { Ornament, SharpButton, AcutePanel, OracleMessageRenderer } from './components/BaroqueUI';

const STORAGE_KEY_USER = 'oracle_user_profile';
const STORAGE_KEY_HISTORY = 'oracle_chat_history';

type View = 'onboarding' | 'home' | 'chat';

const App: React.FC = () => {
  const [view, setView] = useState<View>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userNameInput, setUserNameInput] = useState('');
  const [userBioInput, setUserBioInput] = useState('');
  const [userGoalInput, setUserGoalInput] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<OracleMode>(OracleMode.AUTO);
  const [style, setStyle] = useState<OracleStyle>('profesional');
  const [combinatoria, setCombinatoria] = useState<CombinatoriaState>({
    industry1: '',
    industry2: '',
    industry3: ''
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence management
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('home');
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (view === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, view]);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim() || !userBioInput.trim() || !userGoalInput.trim()) return;

    const newUser: UserProfile = { 
      name: userNameInput.trim(),
      bio: userBioInput.trim(),
      professionalGoal: userGoalInput.trim()
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setView('home');
  };

  const startNewConversation = () => {
    const initialMessage: Message = { 
      role: 'assistant', 
      content: `Habla, ${user?.name}. Plantea tu nudo estratégico o elige una plataforma de difusión. Como arbitrajista intelectual, buscaré el hallazgo en lo inesperado para acercarte a tu meta: ${user?.professionalGoal}.` 
    };
    setMessages([initialMessage]);
    setView('chat');
  };

  const resumeConversation = () => {
    setView('chat');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const oracleContent = await generateOracleResponse(
        newMessages, 
        mode, 
        user || undefined,
        mode === OracleMode.COMBINATORIA ? combinatoria : undefined,
        style
      );
      setMessages(prev => [...prev, { role: 'assistant', content: oracleContent }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "El Oráculo ha tenido un síncope intelectual. Intenta refrescar tu visión." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("¿Deseas borrar el historial de este arbitraje intelectual?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      if (view === 'chat') setView('home');
    }
  };

  const getModeIcon = (m: OracleMode) => {
    switch (m) {
      case OracleMode.AUTO: return 'brain';
      case OracleMode.TOPICA: return 'magnifying-glass';
      case OracleMode.ABDUCCION: return 'bolt-lightning';
      case OracleMode.PIVOTE: return 'arrow-right-arrow-left';
      case OracleMode.COMBINATORIA: return 'shuffle';
      case OracleMode.KAIROS: return 'clock';
      case OracleMode.FACEBOOK: return 'facebook';
      case OracleMode.LINKEDIN: return 'linkedin';
      case OracleMode.TWITTER: return 'x-twitter';
      case OracleMode.BLOG: return 'blog';
      default: return 'circle';
    }
  };

  const isWriterMode = [OracleMode.FACEBOOK, OracleMode.LINKEDIN, OracleMode.TWITTER, OracleMode.BLOG].includes(mode);

  // ONBOARDING VIEW
  if (view === 'onboarding') {
    return (
      <div className="min-h-screen baroque-gradient flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <AcutePanel title="Iniciación">
            <div className="text-center space-y-4">
              <i className="fas fa-eye text-4xl accent-text mb-2"></i>
              <p className="serif italic text-lg text-gray-300">
                "Para desatar el nudo, primero debemos conocer la mano que lo sostiene."
              </p>
              <form onSubmit={handleOnboardingSubmit} className="space-y-6 text-left">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">¿Cuál es tu nombre?</label>
                  <input
                    autoFocus
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    className="w-full bg-black/60 border accent-border p-3 text-sm focus:bg-zinc-900 transition-all outline-none rounded-sm"
                    placeholder="Tu nombre o alias..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Perfil del Buscador</label>
                  <textarea
                    rows={2}
                    value={userBioInput}
                    onChange={(e) => setUserBioInput(e.target.value)}
                    className="w-full bg-black/60 border accent-border p-3 text-sm focus:bg-zinc-900 transition-all outline-none rounded-sm resize-none"
                    placeholder="Tu industria, rol o desafío actual..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">¿Cuál es tu meta profesional?</label>
                  <textarea
                    rows={3}
                    value={userGoalInput}
                    onChange={(e) => setUserGoalInput(e.target.value)}
                    className="w-full bg-black/60 border accent-border p-3 text-sm focus:bg-zinc-900 transition-all outline-none rounded-sm resize-none"
                    placeholder="Ej: Ser reconocido como líder de opinión en sostenibilidad..."
                  />
                  <p className="text-[9px] text-gray-600 mt-2 italic uppercase">
                    El Oráculo diseñará cada respuesta y post para impulsarte hacia este objetivo.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!userNameInput.trim() || !userBioInput.trim() || !userGoalInput.trim()}
                  className="w-full bg-[#c5a059] text-black font-bold py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#d4b47a] transition-colors rounded-sm disabled:opacity-30"
                >
                  Entrar al Oráculo
                </button>
              </form>
            </div>
          </AcutePanel>
        </div>
      </div>
    );
  }

  // HOME VIEW
  if (view === 'home') {
    return (
      <div className="min-h-screen baroque-gradient flex flex-col items-center justify-center p-6 text-center">
        <header className="mb-12">
          <h1 className="text-5xl md:text-7xl accent-text font-bold tracking-tighter mb-2">NI MAGIA NI MÉTODO</h1>
          <p className="text-gray-400 text-sm uppercase tracking-[0.3em] serif italic">El Templo de la Agudeza</p>
          <Ornament />
        </header>

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <AcutePanel title="Buscador Actual">
              <div className="text-left space-y-4">
                <div>
                  <p className="accent-text serif text-2xl italic">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Perfil:</p>
                  <p className="text-xs text-gray-400 leading-relaxed italic">{user?.bio}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#c5a059] uppercase tracking-widest">Meta Profesional:</p>
                  <p className="text-sm text-gray-300 leading-relaxed font-semibold">{user?.professionalGoal}</p>
                </div>
                <button 
                  onClick={() => { localStorage.clear(); window.location.reload(); }}
                  className="text-[10px] text-gray-600 hover:text-gray-300 mt-2 uppercase tracking-widest border-b border-gray-800 pb-1"
                >
                  Reiniciar Perfil
                </button>
              </div>
            </AcutePanel>

            <button 
              onClick={startNewConversation}
              className="w-full bg-[#c5a059] text-black font-bold py-6 text-sm uppercase tracking-[0.2em] hover:bg-[#d4b47a] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg flex flex-col items-center gap-2"
            >
              <i className="fas fa-plus text-xl"></i>
              Iniciar Nueva Consulta
            </button>
          </div>

          <div className="flex flex-col">
            <AcutePanel title="Historial de Revelaciones">
              {messages.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Últimas Interacciones</p>
                  <div className="text-left space-y-3">
                    {messages.slice(-3).map((m, i) => (
                      <div key={i} className="border-l border-[#c5a05933] pl-3 py-1">
                        <p className="text-[10px] text-[#c5a059] uppercase opacity-50">{m.role === 'user' ? 'Tú' : 'Oráculo'}</p>
                        <p className="text-xs text-gray-400 line-clamp-2 italic serif">{m.content}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={resumeConversation}
                    className="w-full mt-6 py-3 border border-[#c5a05966] text-[#c5a059] text-xs uppercase tracking-widest hover:bg-[#c5a05911] transition-colors"
                  >
                    Continuar Diálogo
                  </button>
                </div>
              ) : (
                <div className="py-12 text-gray-600 italic serif text-sm text-center">
                  Aún no has planteado nudos al Oráculo.
                </div>
              )}
            </AcutePanel>
          </div>
        </div>

        <footer className="mt-16 text-gray-600 text-[10px] uppercase tracking-[0.4em] opacity-40">
          "El hallazgo es superior al seguimiento."
        </footer>
      </div>
    );
  }

  // CHAT VIEW
  return (
    <div className="min-h-screen baroque-gradient flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl flex flex-col items-center mb-8 relative">
        <button 
          onClick={() => setView('home')}
          className="absolute left-0 top-0 text-[10px] text-gray-500 hover:text-[#c5a059] uppercase tracking-widest flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-chevron-left"></i> Volver al Templo
        </button>
        <h1 className="text-3xl md:text-5xl accent-text font-bold text-center tracking-tighter">NI MAGIA NI MÉTODO</h1>
        <Ornament />
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-250px)]">
        <aside className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar">
          <AcutePanel title="Marco Estratégico">
            <div className="flex flex-col space-y-1">
              {[OracleMode.AUTO, OracleMode.TOPICA, OracleMode.ABDUCCION, OracleMode.PIVOTE, OracleMode.COMBINATORIA, OracleMode.KAIROS].map((m) => (
                <SharpButton 
                  key={m} 
                  active={mode === m} 
                  onClick={() => setMode(m)}
                  className="text-left py-2"
                >
                  <i className={`fas fa-${getModeIcon(m)} mr-3 w-5`}></i>
                  {m === OracleMode.AUTO ? "Auto-Detección" : m}
                </SharpButton>
              ))}
            </div>
          </AcutePanel>

          <AcutePanel title="Marco de Difusión">
            <div className="flex flex-col space-y-1">
              {[OracleMode.FACEBOOK, OracleMode.LINKEDIN, OracleMode.TWITTER, OracleMode.BLOG].map((m) => (
                <SharpButton 
                  key={m} 
                  active={mode === m} 
                  onClick={() => setMode(m)}
                  className="text-left py-2"
                >
                  <i className={`fa-brands fa-${getModeIcon(m)} mr-3 w-5`}></i>
                  {m}
                </SharpButton>
              ))}
            </div>
          </AcutePanel>

          {isWriterMode && (
             <AcutePanel title="Estilo de Redacción">
                <div className="grid grid-cols-2 gap-2">
                  {['profesional', 'académico', 'serio', 'formal', 'informal', 'amigable'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s as OracleStyle)}
                      className={`text-[9px] uppercase tracking-widest p-2 border transition-all ${style === s ? 'border-[#c5a059] bg-[#c5a05922] text-[#c5a059]' : 'border-gray-800 text-gray-500'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </AcutePanel>
          )}

          {mode === OracleMode.COMBINATORIA && (
            <AcutePanel title="Cruces">
              <div className="space-y-3">
                <input placeholder="Industria 1" value={combinatoria.industry1} onChange={e => setCombinatoria({...combinatoria, industry1: e.target.value})} className="w-full bg-black border border-[#c5a05933] p-2 text-xs outline-none" />
                <input placeholder="Industria 2" value={combinatoria.industry2} onChange={e => setCombinatoria({...combinatoria, industry2: e.target.value})} className="w-full bg-black border border-[#c5a05933] p-2 text-xs outline-none" />
                <input placeholder="Industria 3" value={combinatoria.industry3} onChange={e => setCombinatoria({...combinatoria, industry3: e.target.value})} className="w-full bg-black border border-[#c5a05933] p-2 text-xs outline-none" />
              </div>
            </AcutePanel>
          )}

          <div className="p-3 bg-[#c5a0590a] border border-[#c5a05933] rounded-sm">
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Impacto esperado:</p>
            <p className="text-[10px] text-gray-400 italic leading-snug">Hacia: {user?.professionalGoal}</p>
          </div>

          <button onClick={clearHistory} className="w-full text-[10px] text-red-900/40 hover:text-red-600 uppercase tracking-widest transition-colors font-bold">
            Limpiar Revelaciones
          </button>
        </aside>

        <section className="lg:col-span-3 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scroll-smooth custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-6 rounded-sm text-sm ${msg.role === 'user' ? 'bg-[#c5a05911] border-r-2 border-[#c5a059] text-gray-200' : 'glass-panel text-gray-300'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center mb-4 gap-2 opacity-60">
                      <i className="fas fa-scroll accent-text text-xs"></i>
                      <span className="accent-text text-[10px] uppercase font-bold tracking-[0.2em]">Oráculo</span>
                    </div>
                  )}
                  {msg.role === 'user' ? <div className="whitespace-pre-wrap serif text-lg">{msg.content}</div> : <OracleMessageRenderer content={msg.content} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass-panel p-4 italic text-gray-500 animate-pulse text-sm">El Oráculo está ejerciendo la Agudeza...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isWriterMode ? `Escribe sobre un tema en estilo ${style}...` : "Plantea tu nudo estratégico..."}
              className="w-full bg-black border border-[#c5a05966] p-5 pr-14 text-sm focus:border-[#c5a059] transition-all outline-none rounded-sm serif italic"
              disabled={loading}
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 accent-text hover:scale-125 transition-transform disabled:opacity-50" disabled={loading}>
              <i className="fas fa-paper-plane text-xl"></i>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default App;
