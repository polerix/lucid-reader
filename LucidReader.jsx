import { useState, useEffect, useRef, useCallback } from "react";

// ─── Demo content ──────────────────────────────────────────────────────────────
const DEMO_EN = `The Architecture of Attention

The human brain does not read the way we were taught to believe. Rather than processing each letter sequentially, the visual cortex performs rapid pattern matching — comparing incoming shapes against a vast library of stored word signatures. This is why experienced readers can identify words almost instantly, long before the full visual scan completes.

Fixation points are the true atoms of reading. The eye leaps across a line in discrete jumps called saccades, pausing for approximately two hundred milliseconds at each landing. During these pauses, the fovea — the central, high-resolution region of your retina — captures a span of roughly seven to nine characters. The brain assembles meaning from these snapshots in real time.

What is truly remarkable is how much information the brain extracts from partial data. The beginning of a word carries disproportionate cognitive weight. Research has consistently shown that readers can identify most words from their initial consonants and length alone, leaving the trailing characters to serve primarily as confirmation.

Bionic reading makes this implicit process explicit. By visually anchoring each word at its origin — where identification begins — the technique creates a natural forward momentum. The eye no longer needs to hunt for anchor points. They are given. The result is a frictionless flow that feels, after only a few minutes, entirely natural.

The pacing bar adds a second dimension. Rather than permitting the eye to linger and backtrack, it establishes a rhythmic current. The mind follows the light. Comprehension, paradoxically, often improves — because the controlled pace prevents the mind from drifting into the interstices between words, those brief vacancies where attention habitually escapes.

Speed is not the goal. Presence is.

When reading becomes effortless, something else becomes possible. The text ceases to be an object you are working through and becomes instead a space you are inhabiting. Ideas arrive intact. Narrative coheres. The sensation is not of reading faster, but of reading more deeply — with full attention and without the usual friction of the medium itself.

This is the promise. Begin now.`;

const DEMO_FR = `L'Architecture de l'Attention

Le cerveau humain ne lit pas de la façon qu'on nous a enseignée. Plutôt que de traiter chaque lettre de manière séquentielle, le cortex visuel effectue une reconnaissance rapide de formes — comparant les contours perçus à une vaste bibliothèque de signatures de mots mémorisées. C'est pourquoi les lecteurs expérimentés identifient les mots presque instantanément, bien avant que le balayage visuel complet ne soit achevé.

Les points de fixation sont les véritables atomes de la lecture. L'œil parcourt une ligne en bonds discrets appelés saccades, s'immobilisant environ deux cents millisecondes à chaque point d'atterrissage. Durant ces pauses, la fovéa — la région centrale à haute résolution de la rétine — capte une plage d'environ sept à neuf caractères. Le cerveau assemble le sens à partir de ces instantanés en temps réel.

Ce qui est véritablement remarquable, c'est la quantité d'informations que le cerveau extrait de données partielles. Le début d'un mot porte un poids cognitif disproportionné. Les recherches montrent que les lecteurs peuvent identifier la plupart des mots à partir de leurs consonnes initiales et de leur longueur seules, les lettres restantes ne servant qu'à confirmer ce qui a déjà été reconnu.

La lecture bionique rend ce processus implicite explicite. En ancrant visuellement chaque mot à son origine — là où l'identification commence — la technique crée un élan naturel vers l'avant. L'œil n'a plus besoin de chercher ses propres points d'ancrage. Ils lui sont donnés. Le résultat est un flux sans friction qui, après quelques minutes seulement, paraît entièrement naturel.

La barre de rythme ajoute une seconde dimension. Plutôt que de laisser l'œil s'attarder et revenir en arrière, elle instaure un courant rythmique. L'esprit suit la lumière. La compréhension, paradoxalement, s'améliore souvent — car le rythme contrôlé empêche l'attention de s'égarer dans les interstices entre les mots, ces brèves vacances où l'esprit s'évade habituellement.

La vitesse n'est pas le but. La présence l'est.

Lorsque la lecture devient sans effort, autre chose devient possible. Le texte cesse d'être un objet que l'on traverse pour devenir un espace que l'on habite. Les idées arrivent intactes. Le récit prend forme. La sensation n'est pas de lire plus vite, mais de lire plus profondément — avec une attention pleine et entière, sans la friction habituelle du médium.

C'est la promesse. Commencez maintenant.`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const FONT_MAP = {
    sans: "-apple-system,'SF Pro Display','Helvetica Neue',Arial,sans-serif",
    serif: "'Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif",
    dyslexia: "'OpenDyslexic','Comic Sans MS',cursive",
};

function parseLines(raw) {
    const stripped = raw.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ");
    const paras = stripped.split(/\n\n+/);
    const out = [];
    paras.forEach((para) => {
        const words = para.trim().replace(/\n/g, " ").split(/\s+/).filter(Boolean);
        if (!words.length) return;
        let line = [], len = 0;
        words.forEach((w) => {
            if (len > 0 && len + w.length + 1 > 66) {
                out.push(line.join(" "));
                line = [w]; len = w.length;
            } else {
                line.push(w); len += (len > 0 ? 1 : 0) + w.length;
            }
        });
        if (line.length) out.push(line.join(" "));
        out.push("");
    });
    return out.filter(
        (l, i, a) => !(l === "" && (i === 0 || i === a.length - 1 || a[i - 1] === ""))
    );
}

// ─── Bionic word ───────────────────────────────────────────────────────────────
function BionicWord({ word, color, isWordHighlighted }) {
    return (
        <span style={{ position: "relative", display: "inline" }}>
            {isWordHighlighted && (
                <span style={{
                    position: "absolute",
                    inset: "-4px -6px",
                    background: "rgba(255,255,255,0.11)",
                    backdropFilter: "blur(14px) saturate(1.9)",
                    WebkitBackdropFilter: "blur(14px) saturate(1.9)",
                    border: "1px solid rgba(255,255,255,0.24)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 14px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.20)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}>
                    {/* Specular sheen on bubble */}
                    <span style={{
                        position: "absolute", top: 0, left: 0, right: 0,
                        height: "45%",
                        background: "linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)",
                        borderRadius: "8px 8px 0 0",
                    }} />
                </span>
            )}
            {word.split("").map((ch, i) => {
                const t = word.length <= 1 ? 0 : i / (word.length - 1);
                const op = Math.max(0.09, 1 - t * 0.86);
                return (
                    <span key={i} style={{
                        color, opacity: op,
                        fontWeight: i === 0 ? 700 : 400,
                        position: "relative", zIndex: 1,
                    }}>{ch}</span>
                );
            })}
        </span>
    );
}

// ─── Bionic line ───────────────────────────────────────────────────────────────
function BionicLine({ text, color, pacerMode, pacerWordIdx }) {
    const segs = text.split(/(\s+)/);
    let wIdx = 0;
    return (
        <span>
            {segs.map((seg, i) => {
                if (/^\s+$/.test(seg)) return <span key={i}>{seg}</span>;
                const thisIdx = wIdx++;
                return (
                    <BionicWord
                        key={i}
                        word={seg}
                        color={color}
                        isWordHighlighted={pacerMode === "word" && thisIdx === pacerWordIdx}
                    />
                );
            })}
        </span>
    );
}

// ─── Settings label ────────────────────────────────────────────────────────────
function SLabel({ children }) {
    return (
        <div style={{
            fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase",
            opacity: 0.42, marginBottom: "7px",
        }}>{children}</div>
    );
}

// ─── Generic button ────────────────────────────────────────────────────────────
function Btn({ cfg, onClick, children, style = {} }) {
    return (
        <button onClick={onClick} style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.11)",
            color: cfg.textColor, cursor: "pointer",
            padding: "8px 13px", borderRadius: "12px",
            fontSize: "15px", fontFamily: "inherit",
            transition: "background 0.15s",
            ...style,
        }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = style.background || "rgba(255,255,255,0.07)")}
        >{children}</button>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function LucidReader() {
    const [view, setView] = useState("home");
    const [lines, setLines] = useState([]);
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [pacerPct, setPacerPct] = useState(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [lang, setLang] = useState("en");
    const [cfg, setCfg] = useState({
        font: "sans",
        textColor: "#dde1f0",
        bgColor: "#080810",
        pacerColor: "#5eadf7",
        maskColor: "#080810",
        wpm: 180,
        visibleLines: 5,    // 1–10
        pacerMode: "line",  // "line" | "word"
    });

    const rafRef = useRef(null);
    const tmRef = useRef(null);
    const t0Ref = useRef(null);
    const fileRef = useRef(null);

    const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

    const loadText = useCallback((raw) => {
        setLines(parseLines(raw));
        setIdx(0); setPacerPct(0); setPlaying(false); setView("reading");
    }, []);

    const loadDemo = () => loadText(lang === "fr" ? DEMO_FR : DEMO_EN);

    // ── Playback engine ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!playing || view !== "reading" || !lines.length) return;
        const line = lines[idx] ?? "";
        const wc = line.split(/\s+/).filter(Boolean).length || 1;
        const ms = Math.max(600, (wc / cfg.wpm) * 60000);
        t0Ref.current = performance.now();
        setPacerPct(0);

        const tick = (now) => {
            const p = Math.min((now - t0Ref.current) / ms, 1);
            setPacerPct(p * 100);
            if (p < 1) rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);

        tmRef.current = setTimeout(() => {
            setIdx((prev) => {
                if (prev + 1 < lines.length) return prev + 1;
                setPlaying(false); return prev;
            });
        }, ms);

        return () => { cancelAnimationFrame(rafRef.current); clearTimeout(tmRef.current); };
    }, [playing, idx, lines, cfg.wpm, view]);

    const stop = () => { cancelAnimationFrame(rafRef.current); clearTimeout(tmRef.current); };
    const prev = () => { stop(); setPacerPct(0); setIdx((i) => Math.max(0, i - 1)); };
    const next = () => { stop(); setPacerPct(0); setIdx((i) => Math.min(lines.length - 1, i + 1)); };

    // ── Line blur/fade table ─────────────────────────────────────────────────────
    const lineStyle = (dist) => {
        const table = [
            { opacity: 1, blur: 0 },
            { opacity: 0.65, blur: 0.7 },
            { opacity: 0.35, blur: 2 },
            { opacity: 0.12, blur: 4 },
            { opacity: 0.04, blur: 7 },
            { opacity: 0.01, blur: 10 },
        ];
        const r = table[Math.min(dist, table.length - 1)];
        return { opacity: r.opacity, filter: `blur(${r.blur}px)` };
    };

    // ── Glass helper ─────────────────────────────────────────────────────────────
    const glass = (extra = {}) => ({
        background: "rgba(255,255,255,0.065)",
        backdropFilter: "blur(32px) saturate(1.6)",
        WebkitBackdropFilter: "blur(32px) saturate(1.6)",
        border: "1px solid rgba(255,255,255,0.13)",
        borderRadius: "18px",
        ...extra,
    });

    // ── Visible window ───────────────────────────────────────────────────────────
    const WING = Math.floor((cfg.visibleLines - 1) / 2);
    const start = Math.max(0, idx - WING);
    const end = Math.min(lines.length, idx + WING + 1);
    const visible = lines.slice(start, end).map((t, i) => ({ t, abs: start + i }));

    // ── Word pacer index ─────────────────────────────────────────────────────────
    const curLine = lines[idx] ?? "";
    const wordCount = curLine.split(/\s+/).filter(Boolean).length || 1;
    const pacerWordIdx = Math.min(Math.floor((pacerPct / 100) * wordCount), wordCount - 1);

    // ── i18n strings ─────────────────────────────────────────────────────────────
    const L = lang === "fr" ? {
        header: "Lecteur Bionique",
        tagline: "Concentration. Fluidité. Présence.",
        openBook: "Ouvrir un livre",
        upload: "Téléverser EPUB ou TXT",
        orText: "ou",
        tryDemo: "✦  Essayer la démo",
        library: "← Bibliothèque",
        settings: "Réglages",
        wpmLabel: "MPM",
        langLabel: "Language / Langue",
        font: "Police",
        pacer: "Mode du curseur",
        lineMode: "▬  Ligne",
        wordMode: "◉  Mot",
        visLines: "Lignes visibles",
        focusCtx: "1 · Foyer — 10 · Contexte",
        textColor: "Couleur du texte",
        bg: "Arrière-plan",
        pacerClr: "Couleur du curseur",
        fadeClr: "Couleur de fondu",
        speed: "Vitesse de lecture",
        progress: "Progression",
        sans: "Sans",
        serif: "Sérif",
        dyslex: "Dyslex.",
    } : {
        header: "Bionic Speed Reader",
        tagline: "Focus. Flow. Presence.",
        openBook: "Open a book",
        upload: "Upload EPUB or TXT",
        orText: "or",
        tryDemo: "✦  Try Demo Text",
        library: "← Library",
        settings: "Settings",
        wpmLabel: "WPM",
        langLabel: "Language / Langue",
        font: "Typeface",
        pacer: "Pacer Mode",
        lineMode: "▬  Line",
        wordMode: "◉  Word",
        visLines: "Visible Lines",
        focusCtx: "1 · Focus — 10 · Context",
        textColor: "Text Color",
        bg: "Background",
        pacerClr: "Pacer Color",
        fadeClr: "Fade Color",
        speed: "Reading Speed",
        progress: "Progress",
        sans: "Sans",
        serif: "Serif",
        dyslex: "Dyslex.",
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // HOME SCREEN
    // ─────────────────────────────────────────────────────────────────────────────
    if (view === "home") return (
        <div style={{
            minHeight: "100vh",
            background: cfg.bgColor,
            backgroundImage: `
        radial-gradient(ellipse at 18% 28%, rgba(94,173,247,0.10) 0%, transparent 55%),
        radial-gradient(ellipse at 82% 72%, rgba(140,80,220,0.07) 0%, transparent 55%)`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "40px 24px",
            fontFamily: FONT_MAP.sans, color: cfg.textColor,
        }}>
            {/* Lang pill — top right */}
            <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "6px" }}>
                {[["en", "EN"], ["fr", "FR"]].map(([k, label]) => (
                    <button key={k} onClick={() => setLang(k)} style={{
                        padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
                        fontFamily: FONT_MAP.sans, fontSize: "12px", letterSpacing: "0.08em",
                        background: lang === k ? `${cfg.pacerColor}25` : "rgba(255,255,255,0.07)",
                        border: `1px solid ${lang === k ? cfg.pacerColor + "50" : "rgba(255,255,255,0.12)"}`,
                        color: lang === k ? cfg.pacerColor : cfg.textColor,
                        transition: "all 0.18s",
                    }}>{label}</button>
                ))}
            </div>

            {/* Wordmark */}
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.38em", opacity: 0.38, marginBottom: "10px", textTransform: "uppercase" }}>
                    {L.header}
                </div>
                <div style={{ fontSize: "44px", fontWeight: 200, letterSpacing: "-0.025em", lineHeight: 1 }}>
                    <span style={{ fontWeight: 800 }}>L</span>ucid
                    <span style={{ opacity: 0.32 }}> Reader</span>
                </div>
                <div style={{ fontSize: "13px", opacity: 0.32, marginTop: "10px" }}>{L.tagline}</div>
            </div>

            {/* Source panel */}
            <div style={{ ...glass(), padding: "28px 24px", width: "100%", maxWidth: "400px" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.22em", opacity: 0.38, marginBottom: "18px", textTransform: "uppercase" }}>
                    {L.openBook}
                </div>

                <input ref={fileRef} type="file" accept=".txt,.epub,.html" style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        const r = new FileReader();
                        r.onload = (ev) => loadText(ev.target.result);
                        r.readAsText(f);
                    }}
                />

                {[
                    { emoji: "📂", label: L.upload, act: () => fileRef.current?.click(), primary: true },
                    { emoji: "📁", label: "Google Drive", act: null },
                    { emoji: "🐙", label: "GitHub Repository", act: null },
                    { emoji: "☁️", label: "Microsoft OneDrive", act: null },
                ].map(({ emoji, label, act, primary }, i) => (
                    <button key={i}
                        onClick={act ?? (() => alert("OAuth flow available in production build."))}
                        style={{
                            width: "100%", marginBottom: "9px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            borderRadius: "13px",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "13px 16px", cursor: "pointer",
                            color: cfg.textColor, fontSize: "14px",
                            fontFamily: FONT_MAP.sans, opacity: primary ? 1 : 0.72,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    >
                        <span>{emoji}&nbsp;&nbsp;{label}</span>
                        {!act && (
                            <span style={{ fontSize: "11px", opacity: 0.5, background: "rgba(255,255,255,0.09)", padding: "2px 9px", borderRadius: "20px" }}>
                                Connect
                            </span>
                        )}
                    </button>
                ))}

                <div style={{ display: "flex", alignItems: "center", margin: "20px 0", opacity: 0.28 }}>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.25)" }} />
                    <span style={{ padding: "0 14px", fontSize: "11px" }}>{L.orText}</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.25)" }} />
                </div>

                <button onClick={loadDemo} style={{
                    width: "100%", padding: "14px",
                    background: `${cfg.pacerColor}1a`,
                    border: `1px solid ${cfg.pacerColor}3a`,
                    borderRadius: "13px", cursor: "pointer",
                    color: cfg.pacerColor, fontSize: "15px",
                    fontFamily: FONT_MAP.sans, fontWeight: 500,
                    letterSpacing: "0.01em", transition: "all 0.18s",
                }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = `${cfg.pacerColor}30`)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = `${cfg.pacerColor}1a`)}
                >{L.tryDemo}</button>
            </div>

            <div style={{ marginTop: "28px", fontSize: "11px", opacity: 0.25, textAlign: "center" }}>
                Bionic anchoring · Adaptive pacing · Focus gradient
            </div>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────────
    // READING SCREEN
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div style={{
            height: "100vh", overflow: "hidden",
            background: cfg.bgColor,
            backgroundImage: `radial-gradient(ellipse at 15% 20%, rgba(94,173,247,0.07) 0%, transparent 45%)`,
            display: "flex", flexDirection: "column",
            fontFamily: FONT_MAP[cfg.font], color: cfg.textColor,
            position: "relative",
        }}>

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div style={{
                ...glass({ borderRadius: "16px" }),
                margin: "12px 14px 0", padding: "9px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
            }}>
                <button onClick={() => { stop(); setView("home"); }} style={{
                    background: "none", border: "none", color: cfg.textColor, opacity: 0.55,
                    cursor: "pointer", fontSize: "13px", fontFamily: "inherit",
                    padding: "4px 8px", borderRadius: "8px",
                }}>{L.library}</button>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {[["en", "EN"], ["fr", "FR"]].map(([k, label]) => (
                        <button key={k} onClick={() => setLang(k)} style={{
                            padding: "4px 10px", borderRadius: "18px", cursor: "pointer",
                            fontFamily: FONT_MAP.sans, fontSize: "11px", letterSpacing: "0.06em",
                            background: lang === k ? `${cfg.pacerColor}20` : "rgba(255,255,255,0.06)",
                            border: `1px solid ${lang === k ? cfg.pacerColor + "40" : "rgba(255,255,255,0.10)"}`,
                            color: lang === k ? cfg.pacerColor : cfg.textColor,
                            transition: "all 0.18s",
                        }}>{label}</button>
                    ))}
                    <div style={{ fontSize: "11px", opacity: 0.35, letterSpacing: "0.06em", marginLeft: "4px" }}>
                        {idx + 1} <span style={{ opacity: 0.5 }}>/</span> {lines.length}
                    </div>
                </div>

                <button onClick={() => setSettingsOpen(true)} style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                    color: cfg.textColor, cursor: "pointer", padding: "5px 12px",
                    borderRadius: "10px", fontSize: "13px", fontFamily: "inherit",
                }}>⚙ {L.settings}</button>
            </div>

            {/* ── Reading Area ───────────────────────────────────────────────── */}
            <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "0 9%",
                position: "relative", overflow: "hidden",
            }}>
                {/* Top/bottom fade mask */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
                    background: `linear-gradient(to bottom,
            ${cfg.maskColor} 0%,
            ${cfg.maskColor}cc 7%,
            ${cfg.maskColor}55 17%,
            transparent 28%,
            transparent 72%,
            ${cfg.maskColor}55 83%,
            ${cfg.maskColor}cc 93%,
            ${cfg.maskColor} 100%)`,
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                    {visible.map(({ t, abs }) => {
                        const dist = Math.abs(abs - idx);
                        const ls = lineStyle(dist);
                        const isCur = abs === idx;
                        const isEmpty = !t.trim();

                        return (
                            <div key={abs} style={{
                                ...ls,
                                transition: "opacity 0.28s ease, filter 0.28s ease",
                                padding: isEmpty ? "6px 0" : "3px 0",
                                position: "relative",
                                minHeight: isEmpty ? "14px" : undefined,
                                userSelect: "none",
                            }}>
                                {/* LINE mode — frosted glass pill sweeps across */}
                                {isCur && !isEmpty && cfg.pacerMode === "line" && (
                                    <div style={{
                                        position: "absolute",
                                        top: "1px", bottom: "1px", left: "-14px",
                                        width: `calc(${pacerPct}% + 14px)`,
                                        minWidth: "28px",
                                        background: "rgba(255,255,255,0.095)",
                                        backdropFilter: "blur(18px) saturate(2.0)",
                                        WebkitBackdropFilter: "blur(18px) saturate(2.0)",
                                        borderRight: "1.5px solid rgba(255,255,255,0.32)",
                                        borderTop: "1px solid rgba(255,255,255,0.20)",
                                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: "0 12px 12px 0",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 18px rgba(0,0,0,0.22)",
                                        zIndex: 0, transition: "none", pointerEvents: "none", overflow: "hidden",
                                    }}>
                                        <div style={{
                                            position: "absolute", top: 0, left: 0, right: 0, height: "42%",
                                            background: "linear-gradient(to bottom, rgba(255,255,255,0.11), transparent)",
                                            borderRadius: "0 12px 0 0",
                                        }} />
                                    </div>
                                )}

                                {/* Text */}
                                {!isEmpty && (
                                    <div style={{
                                        position: "relative", zIndex: 1,
                                        fontSize: "19px", lineHeight: "1.72", letterSpacing: "0.008em",
                                    }}>
                                        <BionicLine
                                            text={t}
                                            color={cfg.textColor}
                                            pacerMode={cfg.pacerMode}
                                            pacerWordIdx={isCur ? pacerWordIdx : -1}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Controls ───────────────────────────────────────────────────── */}
            <div style={{
                ...glass({ borderRadius: "16px" }),
                margin: "0 14px 14px", padding: "11px 18px",
                display: "flex", alignItems: "center", gap: "10px", flexShrink: 0,
            }}>
                <Btn cfg={cfg} onClick={prev} style={{ opacity: 0.65, fontSize: "17px" }}>⏮</Btn>
                <Btn cfg={cfg} onClick={() => setPlaying((p) => !p)} style={{
                    background: `${cfg.pacerColor}20`, border: `1px solid ${cfg.pacerColor}40`,
                    color: cfg.pacerColor, padding: "9px 22px", fontSize: "17px", fontWeight: 500,
                }}>{playing ? "⏸" : "▶"}</Btn>
                <Btn cfg={cfg} onClick={next} style={{ opacity: 0.65, fontSize: "17px" }}>⏭</Btn>

                <div style={{ flex: 1 }} />

                {/* WPM with turtle/rabbit */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "15px", lineHeight: 1 }} title="Slow">🐢</span>
                    <Btn cfg={cfg} onClick={() => set("wpm", Math.max(60, cfg.wpm - 20))}
                        style={{ padding: "6px 10px", opacity: 0.65 }}>−</Btn>
                    <div style={{ minWidth: "62px", textAlign: "center", fontSize: "12px", opacity: 0.65, letterSpacing: "0.04em" }}>
                        {cfg.wpm} {L.wpmLabel}
                    </div>
                    <Btn cfg={cfg} onClick={() => set("wpm", Math.min(800, cfg.wpm + 20))}
                        style={{ padding: "6px 10px", opacity: 0.65 }}>+</Btn>
                    <span style={{ fontSize: "15px", lineHeight: 1 }} title="Fast">🐇</span>
                </div>
            </div>

            {/* ── Settings Panel ─────────────────────────────────────────────── */}
            {settingsOpen && (
                <>
                    <div onClick={() => setSettingsOpen(false)} style={{
                        position: "fixed", inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
                        zIndex: 20,
                    }} />

                    <div style={{
                        position: "fixed", top: 0, right: 0, bottom: 0,
                        width: "min(360px, 90vw)",
                        background: "rgba(10,10,20,0.88)",
                        backdropFilter: "blur(36px) saturate(1.7)",
                        WebkitBackdropFilter: "blur(36px) saturate(1.7)",
                        borderLeft: "1px solid rgba(255,255,255,0.13)",
                        padding: "24px 20px 40px",
                        zIndex: 21, overflowY: "auto",
                        fontFamily: FONT_MAP.sans, color: cfg.textColor,
                        display: "flex", flexDirection: "column", gap: "22px",
                    }}>

                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>{L.settings}</span>
                            <button onClick={() => setSettingsOpen(false)} style={{
                                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)",
                                color: cfg.textColor, borderRadius: "50%", width: "32px", height: "32px",
                                cursor: "pointer", fontSize: "14px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>✕</button>
                        </div>

                        {/* Language */}
                        <div>
                            <SLabel>{L.langLabel}</SLabel>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {[["en", "English"], ["fr", "Français"]].map(([k, label]) => (
                                    <button key={k} onClick={() => setLang(k)} style={{
                                        flex: 1, padding: "11px 6px", borderRadius: "12px", cursor: "pointer",
                                        fontSize: "13px", fontFamily: FONT_MAP.sans,
                                        background: lang === k ? `${cfg.pacerColor}25` : "rgba(255,255,255,0.06)",
                                        border: `1px solid ${lang === k ? cfg.pacerColor + "50" : "rgba(255,255,255,0.10)"}`,
                                        color: lang === k ? cfg.pacerColor : cfg.textColor,
                                        transition: "all 0.18s",
                                    }}>{label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Typeface */}
                        <div>
                            <SLabel>{L.font}</SLabel>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {[["sans", L.sans], ["serif", L.serif], ["dyslexia", L.dyslex]].map(([k, label]) => (
                                    <button key={k} onClick={() => set("font", k)} style={{
                                        flex: 1, padding: "11px 6px", borderRadius: "12px", cursor: "pointer",
                                        fontFamily: FONT_MAP[k], fontSize: "13px",
                                        background: cfg.font === k ? `${cfg.pacerColor}25` : "rgba(255,255,255,0.06)",
                                        border: `1px solid ${cfg.font === k ? cfg.pacerColor + "50" : "rgba(255,255,255,0.10)"}`,
                                        color: cfg.font === k ? cfg.pacerColor : cfg.textColor,
                                        transition: "all 0.18s",
                                    }}>{label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Pacer mode */}
                        <div>
                            <SLabel>{L.pacer}</SLabel>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {[["line", L.lineMode], ["word", L.wordMode]].map(([k, label]) => (
                                    <button key={k} onClick={() => set("pacerMode", k)} style={{
                                        flex: 1, padding: "11px 6px", borderRadius: "12px", cursor: "pointer",
                                        fontSize: "13px", fontFamily: FONT_MAP.sans,
                                        background: cfg.pacerMode === k ? `${cfg.pacerColor}25` : "rgba(255,255,255,0.06)",
                                        border: `1px solid ${cfg.pacerMode === k ? cfg.pacerColor + "50" : "rgba(255,255,255,0.10)"}`,
                                        color: cfg.pacerMode === k ? cfg.pacerColor : cfg.textColor,
                                        transition: "all 0.18s",
                                    }}>{label}</button>
                                ))}
                            </div>
                        </div>

                        {/* Visible lines */}
                        <div>
                            <SLabel>{L.visLines} — {cfg.visibleLines}</SLabel>
                            <input type="range" min={1} max={10} step={1}
                                value={cfg.visibleLines}
                                onChange={(e) => set("visibleLines", parseInt(e.target.value))}
                                style={{ width: "100%", accentColor: cfg.pacerColor }}
                            />
                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: "11px", marginTop: "5px", opacity: 0.45,
                            }}>
                                <span>1 · Focus</span>
                                <span>10 · Context</span>
                            </div>
                        </div>

                        {/* Color pickers */}
                        {[
                            [L.textColor, "textColor"],
                            [L.bg, "bgColor"],
                            [L.pacerClr, "pacerColor"],
                            [L.fadeClr, "maskColor"],
                        ].map(([label, k]) => (
                            <div key={k}>
                                <SLabel>{label}</SLabel>
                                <div style={{
                                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                                    borderRadius: "12px", padding: "8px 14px",
                                    display: "flex", alignItems: "center", gap: "12px",
                                }}>
                                    <input type="color" value={cfg[k]}
                                        onChange={(e) => set(k, e.target.value)}
                                        style={{ width: "34px", height: "24px", border: "none", borderRadius: "6px", cursor: "pointer", background: "none", padding: 0 }}
                                    />
                                    <span style={{ fontSize: "12px", opacity: 0.55, fontFamily: "monospace", letterSpacing: "0.05em" }}>{cfg[k]}</span>
                                    <div style={{
                                        width: "20px", height: "20px", borderRadius: "50%",
                                        background: cfg[k], border: "1px solid rgba(255,255,255,0.2)",
                                        marginLeft: "auto", flexShrink: 0,
                                    }} />
                                </div>
                            </div>
                        ))}

                        {/* WPM slider */}
                        <div>
                            <SLabel>
                                🐢 &nbsp;{L.speed} — {cfg.wpm} {L.wpmLabel}&nbsp; 🐇
                            </SLabel>
                            <input type="range" min={60} max={800} step={10}
                                value={cfg.wpm}
                                onChange={(e) => set("wpm", parseInt(e.target.value))}
                                style={{ width: "100%", accentColor: cfg.pacerColor }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", opacity: 0.35, marginTop: "4px" }}>
                                <span>60</span><span>800</span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div>
                            <SLabel>{L.progress} — {idx + 1} / {lines.length}</SLabel>
                            <input type="range" min={0} max={Math.max(0, lines.length - 1)}
                                value={idx}
                                onChange={(e) => { stop(); setPacerPct(0); setIdx(parseInt(e.target.value)); }}
                                style={{ width: "100%", accentColor: cfg.pacerColor }}
                            />
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
