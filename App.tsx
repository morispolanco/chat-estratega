
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
  const [hasKey, setHasKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  useEffect(() => {
    const checkKey = async () => {
      try {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.warn("Key selection interface not available");
      }
    };
    checkKey();

    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setUserGoalInput(parsedUser.professionalGoal);
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

  const handleOpenKeySelector = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

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

  const handleUpdateGoal = () => {
    if (user && userGoalInput.trim()) {
      const updatedUser = { ...user, professionalGoal: userGoalInput.trim() };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      setShowSettings(false);
      alert("Meta profesional actualizada. El Oráculo ajustará su agudeza.");
    }
  };

  const startNewConversation = () => {
    const initialMessage: Message = { 
      role: 'assistant', 
      content: `Entras al Templo, ${user?.name}. Plantea tu nudo estratégico o selecciona un canal de difusión para avanzar hacia tu meta: ${user?.professionalGoal}.` 
    };
    setMessages([initialMessage]);
    setView('chat');
  };

  const resumeConversation = () => {
    setView('chat');
  };

  const clearHistory = () => {
    if (window.confirm("¿Deseas purgar el archivo intelectual?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
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
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        await handleOpenKeySelector();
        setMessages(prev => [...prev, { role: 'assistant', content: "Error de acceso: Por favor, selecciona una llave API válida. Se ha reabierto el selector." }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "El Oráculo ha tenido un síncope intelectual. Reintenta tu planteamiento." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Hallazgo copiado al portapapeles.");
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

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen baroque-gradient flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <AcutePanel title="Iniciación">
            <div className="text-center space-y-4">
              <i className="fas fa-eye text-4xl accent-text mb-2 animate-pulse"></i>
              <p className="serif italic text-lg text-gray-300">
                "Todo hallazgo requiere un ojo alerta y un norte claro."
              </p>
              <form onSubmit={handleOnboardingSubmit} className="space-y-6 text-left">
                {!hasKey && (
                  <div className="p-4 bg-red-900/10 border border-red-900/40 rounded-sm">
                    <p className="text-[10px] text-red-200 uppercase tracking-widest mb-3 font-bold">Acceso Requerido</p>
                    <button 
                      type="button"
                      onClick={handleOpenKeySelector}
                      className="w-full bg-[#c5a05922] hover:bg-[#c5a05944] text-[#c5a059] transition-all py-3 text-[10px] uppercase font-bold tracking-widest border border-[#c5a05966]"
                    >
                      Configurar Llave Gemini Pro
                    </button>
                    <p className="text-[9px] text-gray-500 mt-2 italic text-center">
                      Visita <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">ai.google.dev/billing</a> para habilitar tu llave.
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">¿Cómo te llamas?</label>
                    <input
                      autoFocus
                      type="text"
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      className="w-full bg-black/60 border accent-border p-3 text-sm focus:bg-zinc-900 transition-all outline-none rounded-sm"
                      placeholder="Tu nombre..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">¿Cuál es tu contexto actual?</label>
                    <textarea
                      rows={2}
                      value={userBioInput}
                      onChange={(e) => setUserBioInput(e.target.value)}
                      className="w-full bg-black/60 border accent-border p-3 text-sm focus:bg-zinc-900 transition-all outline-none rounded-sm resize-none"
                      placeholder="Tu industria, rol o nudo recurrente..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#c5a059] mb-2 font-bold">¿Cuál es tu META PROFESIONAL?</label>
                    <textarea
                      rows={3}
                      value={userGoalInput}
                      onChange={(e) => setUserGoalInput(e.target.value)}
                      className="w-full bg-[#c5a0590a] border border-[#c5a05966] p-3 text-sm focus:bg-zinc-900 transition-all outline-none rounded-sm resize-none accent-text"
                      placeholder="Ej: Ser el consultor más agudo de mi región..."
                    />
                    <p className="text-[9px] text-gray-600 mt-2 italic uppercase tracking-tighter">
                      El Oráculo alineará cada hallazgo y post para acercarte a este fin.
                    </p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!userNameInput.trim() || !userBioInput.trim() || !userGoalInput.trim() || !hasKey}
                  className="w-full bg-[#c5a059] text-black font-bold py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#d4b47a] transition-all rounded-sm disabled:opacity-20 shadow-[0_0_20px_rgba(197,160,89,0.2)]"
                >
                  Cruzar el Umbral
                </button>
              </form>
            </div>
          </AcutePanel>
        </div>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen baroque-gradient flex flex-col items-center justify-center p-6 text-center">
        <header className="mb-12">
          <h1 className="text-6xl md:text-8xl accent-text font-bold tracking-tighter mb-2">NI MAGIA NI MÉTODO</h1>
          <p className="text-gray-400 text-sm uppercase tracking-[0.4em] serif italic">Templo del Arbitraje Intelectual</p>
          <Ornament />
        </header>

        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <AcutePanel title="Buscador">
              <div className="text-left space-y-5">
                <div>
                  <p className="accent-text serif text-3xl italic leading-none">{user?.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">Contexto:</p>
                  <p className="text-xs text-gray-400 leading-relaxed italic">{user?.bio}</p>
                </div>
                <div className="p-4 bg-[#c5a0590a] border-l-2 border-[#c5a059]">
                  <p className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold mb-1">Meta Profesional:</p>
                  <p className="text-sm text-gray-300 font-semibold italic serif leading-snug">{user?.professionalGoal}</p>
                </div>
                <div className="flex gap-4 pt-2 border-t border-gray-900 mt-4">
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[9px] text-gray-600 hover:text-gray-300 uppercase tracking-[0.2em]">Reiniciar Perfil</button>
                  <button onClick={handleOpenKeySelector} className="text-[9px] text-gray-600 hover:text-[#c5a059] uppercase tracking-[0.2em] flex items-center gap-1">
                    <i className="fas fa-key text-[8px]"></i> Llave API
                  </button>
                </div>
              </div>
            </AcutePanel>

            <button 
              onClick={startNewConversation}
              className="w-full bg-[#c5a059] text-black font-bold py-8 text-sm uppercase tracking-[0.3em] hover:bg-[#d4b47a] transition-all transform hover:scale-[1.01] active:scale-95 shadow-2xl flex flex-col items-center gap-3 group"
            >
              <i className="fas fa-scroll text-2xl group-hover:animate-bounce"></i>
              Nueva Consulta al Oráculo
            </button>
          </div>

          <div className="flex flex-col">
            <AcutePanel title="Revelaciones Previas">
              {messages.length > 0 ? (
                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar text-left">
                  <div className="space-y-4">
                    {messages.slice(-4).map((m, i) => (
                      <div key={i} className="border-l border-[#c5a05922] pl-4 py-1">
                        <p className={`text-[9px] uppercase tracking-widest mb-1 ${m.role === 'user' ? 'text-gray-600' : 'text-[#c5a059]'}`}>
                          {m.role === 'user' ? 'Tú planteaste' : 'El Oráculo dictó'}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-2 italic serif">{m.content}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={resumeConversation}
                    className="w-full mt-8 py-4 border border-[#c5a05944] text-[#c5a059] text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#c5a05911] transition-all"
                  >
                    Regresar al Diálogo
                  </button>
                </div>
              ) : (
                <div className="py-20 text-gray-700 italic serif text-sm text-center">
                  El silencio precede a la agudeza.<br/>Plantea tu primer nudo estratégico.
                </div>
              )}
            </AcutePanel>
          </div>
        </div>

        <footer className="mt-20 text-gray-700 text-[10px] uppercase tracking-[0.5em] opacity-40 italic">
          "La prudencia es la medida de la acción."
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen baroque-gradient flex flex-col items-center p-4 md:p-8 relative">
      <header className="w-full max-w-5xl flex flex-col items-center mb-8 relative z-20">
        <div className="w-full flex justify-between items-center mb-2">
          <button 
            onClick={() => setView('home')}
            className="text-[10px] text-gray-500 hover:text-[#c5a059] uppercase tracking-widest flex items-center gap-2 transition-all px-4 py-2 hover:bg-white/5 rounded-full"
          >
            <i className="fas fa-chevron-left"></i> Salir del Templo
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all px-4 py-2 rounded-full ${showSettings ? 'bg-[#c5a05922] text-[#c5a059]' : 'text-gray-500 hover:text-[#c5a059] hover:bg-white/5'}`}
          >
            <i className="fas fa-cog"></i> Configuración
          </button>
        </div>
        <h1 className="text-4xl md:text-5xl accent-text font-bold text-center tracking-tighter">NI MAGIA NI MÉTODO</h1>
        <Ornament />
      </header>

      {showSettings && (
        <div className="absolute top-24 right-4 md:right-12 z-50 w-full max-w-xs animate-in fade-in slide-in-from-top-4">
          <AcutePanel title="Configuración Estratégica">
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-[#c5a059] mb-2 font-bold">Meta Profesional Actual</label>
                <textarea
                  rows={3}
                  value={userGoalInput}
                  onChange={(e) => setUserGoalInput(e.target.value)}
                  className="w-full bg-black/60 border border-[#c5a05933] p-3 text-xs focus:border-[#c5a059] transition-all outline-none rounded-sm resize-none accent-text italic serif"
                  placeholder="Actualiza tu meta..."
                />
                <button 
                  onClick={handleUpdateGoal}
                  className="w-full mt-2 bg-[#c5a05922] text-[#c5a059] text-[9px] font-bold uppercase py-2 border border-[#c5a05944] hover:bg-[#c5a05933]"
                >
                  Actualizar Meta
                </button>
              </div>
              <div className="pt-4 border-t border-[#c5a05911]">
                <button 
                  onClick={handleOpenKeySelector}
                  className="w-full bg-black border border-gray-800 text-gray-400 text-[9px] font-bold uppercase py-2 hover:text-[#c5a059] hover:border-[#c5a05966] transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-key"></i> Cambiar Llave Gemini
                </button>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full text-[9px] text-gray-600 hover:text-gray-400 uppercase tracking-widest pt-2"
              >
                Cerrar Menú
              </button>
            </div>
          </AcutePanel>
        </div>
      )}

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1 h-[calc(100vh-280px)]">
        <aside className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          <AcutePanel title="Marcos Operativos">
            <div className="flex flex-col space-y-1">
              {[OracleMode.AUTO, OracleMode.TOPICA, OracleMode.ABDUCCION, OracleMode.PIVOTE, OracleMode.COMBINATORIA, OracleMode.KAIROS].map((m) => (
                <SharpButton 
                  key={m} 
                  active={mode === m} 
                  onClick={() => setMode(m)}
                  className="text-left py-3"
                >
                  <i className={`fas fa-${getModeIcon(m)} mr-3 w-5 text-center`}></i>
                  {m === OracleMode.AUTO ? "Auto-Detección" : m}
                </SharpButton>
              ))}
            </div>
          </AcutePanel>

          <AcutePanel title="Difusión Estratégica">
            <div className="flex flex-col space-y-1">
              {[OracleMode.FACEBOOK, OracleMode.LINKEDIN, OracleMode.TWITTER, OracleMode.BLOG].map((m) => (
                <SharpButton 
                  key={m} 
                  active={mode === m} 
                  onClick={() => setMode(m)}
                  className="text-left py-3"
                >
                  <i className={`fa-brands fa-${getModeIcon(m)} mr-3 w-5 text-center`}></i>
                  {m}
                </SharpButton>
              ))}
            </div>
          </AcutePanel>

          {isWriterMode && (
             <AcutePanel title="Estilo del Hallazgo">
                <div className="grid grid-cols-2 gap-2">
                  {['profesional', 'académico', 'serio', 'formal', 'informal', 'amigable'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s as OracleStyle)}
                      className={`text-[9px] uppercase tracking-widest p-2 border transition-all duration-300 font-bold ${style === s ? 'border-[#c5a059] bg-[#c5a05922] text-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.1)]' : 'border-gray-800 text-gray-600 hover:text-gray-400'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </AcutePanel>
          )}

          {mode === OracleMode.COMBINATORIA && (
            <AcutePanel title="Insumos del Cruce">
              <div className="space-y-3">
                <input placeholder="Industria A" value={combinatoria.industry1} onChange={e => setCombinatoria({...combinatoria, industry1: e.target.value})} className="w-full bg-black border border-[#c5a05933] p-2 text-xs outline-none text-gray-300" />
                <input placeholder="Realidad B" value={combinatoria.industry2} onChange={e => setCombinatoria({...combinatoria, industry2: e.target.value})} className="w-full bg-black border border-[#c5a05933] p-2 text-xs outline-none text-gray-300" />
                <input placeholder="Problema C" value={combinatoria.industry3} onChange={e => setCombinatoria({...combinatoria, industry3: e.target.value})} className="w-full bg-black border border-[#c5a05933] p-2 text-xs outline-none text-gray-300" />
              </div>
            </AcutePanel>
          )}

          <div className="p-4 bg-[#c5a05908] border border-[#c5a05922] rounded-sm">
            <p className="text-[9px] text-[#c5a059] uppercase tracking-widest font-black mb-2 opacity-60">Norte Estratégico:</p>
            <p className="text-[10px] text-gray-400 italic leading-relaxed line-clamp-3">{user?.professionalGoal}</p>
          </div>

          <button onClick={clearHistory} className="w-full text-[9px] text-red-900/40 hover:text-red-700 uppercase tracking-widest transition-colors font-bold pb-10">
            Limpiar Archivo Intelectual
          </button>
        </aside>

        <section className="lg:col-span-3 flex flex-col overflow-hidden glass-panel rounded-sm border-[#c5a05911]">
          <div className="flex-1 overflow-y-auto space-y-8 p-6 md:p-10 scroll-smooth custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] relative p-8 rounded-sm text-sm ${msg.role === 'user' ? 'bg-[#c5a05908] border-r-2 border-[#c5a05944] text-gray-300' : 'bg-black/20 border border-[#c5a05911] text-gray-200'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-feather accent-text text-[10px]"></i>
                        <span className="accent-text text-[10px] uppercase font-black tracking-[0.3em] opacity-80">Dictamen del Oráculo</span>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(msg.content)}
                        className="text-gray-600 hover:text-[#c5a059] transition-colors p-2"
                        title="Copiar hallazgo"
                      >
                        <i className="fas fa-copy text-xs"></i>
                      </button>
                    </div>
                  )}
                  {msg.role === 'user' ? <div className="whitespace-pre-wrap serif text-xl italic leading-tight">{msg.content}</div> : <OracleMessageRenderer content={msg.content} />}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass-panel p-6 border-l-2 border-[#c5a059] italic text-gray-500 animate-pulse text-sm serif">
                  El Oráculo está ejerciendo la Agudeza...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-6 bg-black/40 border-t border-[#c5a05911] relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-black border border-[#c5a05933] rounded-full text-[8px] uppercase tracking-widest text-[#c5a059] font-bold">
              {isWriterMode ? `Canal: ${mode} | Estilo: ${style}` : `Modo: ${mode}`}
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isWriterMode ? `Describe el tema para tu post en ${mode}...` : "Plantea tu nudo estratégico..."}
                className="w-full bg-black/80 border border-[#c5a05933] p-6 pr-20 text-base focus:border-[#c5a059] focus:bg-black transition-all outline-none rounded-sm serif italic text-gray-100"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="absolute right-6 accent-text hover:scale-110 active:scale-90 transition-all disabled:opacity-30 disabled:hover:scale-100" 
                disabled={loading || !input.trim()}
              >
                <i className="fas fa-paper-plane text-2xl"></i>
              </button>
            </div>
            <p className="text-[9px] text-gray-600 mt-4 text-center uppercase tracking-widest font-medium opacity-50">
              Cada palabra te acerca a: {user?.professionalGoal}
            </p>
          </form>
        </section>
      </main>
    </div>
  );
};

export default App;
