@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --acc: #ff6eb4;
  --bg:  #0d0a0e;
  --sf:  #180f18;
  --br:  rgba(255,110,180,.1);
  --tx:  #f5f0f4;
  --mu:  rgba(245,240,244,.45);
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { font-family: var(--font-body), 'Space Grotesk', system-ui, sans-serif; background: var(--bg); color: var(--tx); min-height: 100dvh; }
.ff  { font-family: var(--font-display), 'Syne', sans-serif; }
input, select { color-scheme: dark; font-family: inherit; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: var(--acc); border-radius: 2px; }

.sf   { background: var(--sf); border: 1px solid var(--br); }
.sfh  { cursor: pointer; transition: all .2s; }
.sfh:hover { border-color: var(--acc) !important; background: rgba(255,255,255,.04) !important; }
.ab   { background: var(--acc); color: var(--bg); font-family: var(--font-display),'Syne',sans-serif; font-weight: 800; cursor: pointer; border: none; transition: transform .1s; }
.ab:active   { transform: scale(.97); }
.ab:disabled { opacity: .35; cursor: not-allowed; }
.glow { box-shadow: 0 0 22px color-mix(in srgb, var(--acc) 30%, transparent); }
.tag  { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 999px; font-size: .67rem; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; border: 1px solid; }
.gbg  { background-image: linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px); background-size: 38px 38px; }

@keyframes fu { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes fi { from{opacity:0} to{opacity:1} }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
.fu { animation: fu .4s cubic-bezier(.16,1,.3,1) both; }
.fi { animation: fi .3s ease both; }
.d1{animation-delay:.05s} .d2{animation-delay:.1s} .d3{animation-delay:.15s} .d4{animation-delay:.2s}

.sdot { width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:700;border:1px solid var(--br);color:var(--mu);transition:all .25s; }
.sdot.act  { background:var(--acc);color:var(--bg);border-color:var(--acc); }
.sdot.done { background:rgba(255,255,255,.06);color:var(--acc);border-color:var(--acc); }

.ov { position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:50;display:flex;align-items:flex-end;animation:fi .2s ease; }
.sh { background:var(--sf);border-radius:24px 24px 0 0;padding:24px 20px 48px;width:100%;max-height:92vh;overflow-y:auto;animation:fu .3s cubic-bezier(.16,1,.3,1); }

.bnav { position:fixed;bottom:0;left:0;right:0;background:var(--sf);border-top:1px solid var(--br);display:flex;padding:10px 0 20px;z-index:40; }
.nb   { display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;cursor:pointer;background:none;border:none; }
.nb span { font-size:.63rem;font-weight:600;letter-spacing:.04em; }

.wbtn { display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 0;border-radius:14px;font-size:14px;font-weight:700;font-family:var(--font-display),'Syne',sans-serif;cursor:pointer;text-decoration:none;transition:transform .1s;width:100%;border:none; }
.wbtn:active { transform:scale(.97); }

.pin-dot { width:14px;height:14px;border-radius:50%;border:2px solid var(--acc);transition:all .2s; }
.pin-dot.filled { background:var(--acc); }
.pin-key { width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid var(--br);color:var(--tx);font-size:22px;font-weight:700;font-family:var(--font-display),'Syne',sans-serif;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center; }
.pin-key:active { background:var(--acc);color:var(--bg);transform:scale(.93); }

.ri { background:rgba(255,255,255,.05);border:1px solid var(--br);border-radius:10px;padding:8px 12px;color:var(--tx);font-size:13px;outline:none;transition:border-color .2s; }
.ri:focus { border-color:var(--acc); }

.cal-day { display:flex;flex-direction:column;align-items:center;padding:6px 4px;border-radius:12px;cursor:pointer;transition:all .15s;min-width:40px; }
.apt-row  { display:flex;align-items:stretch;gap:10px;margin-bottom:8px;cursor:pointer; }
.apt-time-col { display:flex;flex-direction:column;align-items:center;width:44px;flex-shrink:0; }
.apt-line { flex:1;width:1px;background:var(--br);margin-top:4px; }
.apt-card { flex:1;border-radius:14px;padding:12px 14px;border:1px solid var(--br);background:var(--sf);transition:all .2s; }
.apt-card:hover { border-color:var(--acc);background:rgba(255,255,255,.04); }

.toggle { position:relative;width:44px;height:24px;flex-shrink:0; }
.toggle input { opacity:0;width:0;height:0;position:absolute; }
.slider { position:absolute;inset:0;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid var(--br);cursor:pointer;transition:.2s; }
.slider::before { content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#555;top:2px;left:2px;transition:.2s; }
input:checked+.slider { background:var(--acc);border-color:var(--acc); }
input:checked+.slider::before { background:var(--bg);transform:translateX(20px); }
