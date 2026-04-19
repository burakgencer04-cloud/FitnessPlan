import { useState, useEffect, useRef } from 'react';

export function playDing(f = 880, d = 0.18) { 
  try { 
    const ctx = new (window.AudioContext || window.webkitAudioContext)(); 
    const o = ctx.createOscillator(), g = ctx.createGain(); 
    o.connect(g); g.connect(ctx.destination); 
    o.frequency.value = f; o.type = "sine"; 
    g.gain.setValueAtTime(0.4, ctx.currentTime); 
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d); 
    o.start(); o.stop(ctx.currentTime + d); 
  } catch {} 
}

export function playFinish() { 
  playDing(660,.1); 
  setTimeout(()=>playDing(880,.15),130); 
  setTimeout(()=>playDing(1046,.25),280); 
}

export function playRestEnd() { 
  [520,660,880].forEach((f,i)=>setTimeout(()=>playDing(f,.12),i*110)); 
}

export function useTimer() {
  const [sec, setSec] = useState(0);
  const [on, setOn] = useState(false);
  const r = useRef(null);
  
  useEffect(() => { 
    if (on) r.current = setInterval(() => setSec(s => s + 1), 1000); 
    else clearInterval(r.current); 
    return () => clearInterval(r.current); 
  }, [on]);
  
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  
  return { sec, on, toggle: () => setOn(v => !v), reset: () => { setOn(false); setSec(0); }, fmt };
}

export function useRestTimer() {
  const [secs, setSecs] = useState(0);
  const [act, setAct] = useState(false);
  const [lbl, setLbl] = useState("");
  const r = useRef(null);
  
  useEffect(() => {
    if (act && secs > 0) { 
      r.current = setInterval(() => setSecs(s => { 
        if (s <= 1) { 
          clearInterval(r.current); setAct(false); playRestEnd(); return 0; 
        } 
        return s - 1; 
      }), 1000); 
    }
    return () => clearInterval(r.current);
  }, [act]);
  
  const start = (s, l) => { clearInterval(r.current); setSecs(s); setLbl(l); setAct(true); };
  const stop = () => { clearInterval(r.current); setAct(false); setSecs(0); };
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  
  return { secs, act, lbl, start, stop, fmt };
}