
import React from 'react';

export const Ornament: React.FC = () => (
  <div className="flex justify-center items-center my-4 opacity-30">
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c5a059]"></div>
    <i className="fas fa-feather-pointed mx-4 accent-text text-sm"></i>
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c5a059]"></div>
  </div>
);

export const SharpButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}> = ({ onClick, children, active, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-xs uppercase tracking-widest transition-all duration-300 border-b-2 font-semibold ${
      active 
        ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a05911]' 
        : 'border-transparent text-gray-500 hover:text-gray-300'
    } ${className}`}
  >
    {children}
  </button>
);

export const AcutePanel: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div className="glass-panel p-6 rounded-sm relative overflow-hidden">
    {title && (
      <div className="mb-4 border-b border-[#c5a05933] pb-2">
        <h3 className="serif text-xl accent-text italic">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

export const OracleMessageRenderer: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = content.trim().split(/\n\n+/);

  return (
    <div className="space-y-6 serif text-base leading-relaxed text-gray-200">
      {paragraphs.map((para, pIdx) => {
        const lines = para.trim().split('\n');
        const firstLine = lines[0];
        
        // Detect "HEADER:" or "HEADER" (all caps, at least 4 chars)
        const headerMatch = firstLine.match(/^([A-ZÁÉÍÓÚ\s]{4,}):?$/);
        
        if (headerMatch) {
          const title = headerMatch[1];
          const rest = lines.slice(1);
          return (
            <div key={pIdx} className="space-y-3">
              <h4 className="accent-text text-[10px] uppercase tracking-[0.25em] font-black opacity-90 mb-2 flex items-center gap-3">
                <span className="h-[1px] w-6 bg-[#c5a05966]"></span>
                {title}
              </h4>
              <div className="space-y-3 pl-4 border-l border-[#c5a05911]">
                {rest.map((l, lIdx) => (
                  <p key={lIdx} className="opacity-90">
                    {l.startsWith('- ') ? (
                      <span className="flex gap-3">
                        <span className="accent-text opacity-50">•</span>
                        <span>{l.substring(2)}</span>
                      </span>
                    ) : l}
                  </p>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={pIdx} className="space-y-2">
            {lines.map((l, lIdx) => (
              <p key={lIdx} className="opacity-90">
                {l.startsWith('- ') ? (
                  <span className="flex gap-3">
                    <span className="accent-text opacity-50">•</span>
                    <span>{l.substring(2)}</span>
                  </span>
                ) : l}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
};
