"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Star, Reply } from "lucide-react";

type Mail = {
  id: number;
  from: string;
  subject: string;
  preview: string;
  body: string[]; // paragraphs
  stamp: string; // image url
  time: string;
  important?: boolean;
};

const initialMails: Mail[] = [
  {
    id: 1,
    from: "carl",
    subject: "coffee on sunday?",
    preview: "you up for some coffee on sunday?",
    body: [
      "hey sam,",
      "you up for some coffee on sunday? was thinking bonanza in mitte",
      "Got a new bike, will do a tour in the morning and after we can meet up, was thinking around 11.",
      "Anyways, hope you are good x",
      "Carl",
    ],
    stamp: "https://images.unsplash.com/photo-1542587224-7e4ee9b2a6c6?q=80&w=256&auto=format&fit=crop",
    time: "12:53",
    important: false,
  },
  {
    id: 2,
    from: "olivia",
    subject: "slides for monday",
    preview: "shared latest deck – take a look",
    body: [
      "hey sam,",
      "just dropped the slides for monday's review. would love your notes by tonight if possible.",
      "thx!",
      "olivia",
    ],
    stamp: "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?q=80&w=256&auto=format&fit=crop",
    time: "09:41",
    important: false,
  },
  {
    id: 3,
    from: "devon",
    subject: "tickets are in",
    preview: "got us row c – see you there",
    body: [
      "yo,",
      "tickets confirmed. will forward qr codes later today.",
      "cheers",
      "devon",
    ],
    stamp: "https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=256&auto=format&fit=crop",
    time: "08:05",
    important: false,
  },
];

function Stamp({ url }: { url: string }) {
  return (
    <img
      src={url}
      alt="stamp"
      className="h-12 w-9 rounded-md shadow-md object-cover object-center"
    />
  );
}

function MailCard({
  mail,
  index,
  onOpen,
  onDelete,
  onToggleImportant,
}: {
  mail: Mail;
  index: number;
  onOpen: (mail: Mail) => void;
  onDelete: (id: number) => void;
  onToggleImportant?: (id: number) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-160, 0, 160], [-6, 0, 6]);
  const shadow = useTransform(
    x,
    [-160, 0, 160],
    ["0 24px 40px -16px rgba(0,0,0,.25)", "0 18px 28px -12px rgba(0,0,0,.2)", "0 24px 40px -16px rgba(0,0,0,.25)"]
  );
  const delOpacity = useTransform(x, [-100, -40], [1, 0]);
  const impOpacity = useTransform(x, [40, 100], [0, 1]);

  // haptics + trackpad support
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const firedRef = useRef({ left: false, right: false });
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const haptic = (pattern: number | number[] = 30) => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        // @ts-expect-error: vibrate exists on Navigator in most browsers
        navigator.vibrate(pattern);
      }
    } catch {}
  };

  useEffect(() => {
    const unsubscribe = x.on("change", (val) => {
      if (val < -120 && !firedRef.current.left) {
        firedRef.current.left = true;
        haptic([8, 20, 8]);
      } else if (val > -120 && firedRef.current.left) {
        firedRef.current.left = false;
      }
      if (val > 120 && !firedRef.current.right) {
        firedRef.current.right = true;
        haptic([8, 20, 8]);
      } else if (val < 120 && firedRef.current.right) {
        firedRef.current.right = false;
      }
    });
    return unsubscribe;
  }, [x]);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // react to primarily horizontal trackpad scrolls
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();

      const next = x.get() + e.deltaX * 0.6; // dampen for finer control
      const clamped = Math.max(-160, Math.min(160, next));
      x.set(clamped);

      if (settleRef.current) clearTimeout(settleRef.current);
      settleRef.current = setTimeout(() => {
        const current = x.get();
        if (current <= -120) {
          haptic(40);
          onDelete(mail.id);
        } else if (current >= 120) {
          haptic(40);
          onToggleImportant?.(mail.id);
        } else {
          x.set(0);
        }
      }, 160);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel as any);
      if (settleRef.current) clearTimeout(settleRef.current);
    };
  }, [x, mail.id, onDelete, onToggleImportant]);

  return (
    <div className="relative">
      <motion.div
        style={{ opacity: delOpacity }}
        className="absolute -left-16 top-1/2 -translate-y-1/2 select-none"
      >
        <div className="inline-flex items-center gap-1.5 text-xs text-destructive/80 bg-destructive/10 px-2 py-1 rounded-full">
          <Trash2 className="h-3.5 w-3.5" />
          <span>delete</span>
        </div>
      </motion.div>
      <motion.div
        style={{ opacity: impOpacity }}
        className="absolute right-16 top-1/2 -translate-y-1/2 select-none flex flex-row-reverse"
      >
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>important</span>
        </div>
      </motion.div>

      <motion.button
        ref={btnRef}
        layoutId={`card-${mail.id}`}
        onClick={() => onOpen(mail)}
        drag="x"
        dragElastic={0.12}
        dragConstraints={{ left: -160, right: 160 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120) {
            haptic(40);
            onDelete(mail.id);
          } else if (info.offset.x > 120) {
            haptic(40);
            onToggleImportant?.(mail.id);
          } else {
            x.set(0);
          }
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 26, mass: 0.6 }}
        style={{ x, rotate, boxShadow: shadow as unknown as string }}
        className="relative w-[92vw] max-w-md rounded-xl bg-white/95 text-left p-5 pr-16 shadow-xl hover:shadow-2xl backdrop-saturate-150 will-change-transform"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="text-base font-semibold tracking-tight leading-none flex items-center">
              {mail.from}
              {mail.important && <Star className="h-4 w-4 text-amber-500 ml-1 fill-current" />}
            </div>
            <div className="text-foreground/60 mt-1 text-sm line-clamp-1">{mail.subject}</div>
            <div className="text-foreground/50 mt-1 text-xs line-clamp-1">{mail.preview}</div>
          </div>
          <div className="absolute right-4 top-4">
            <Stamp url={mail.stamp} />
          </div>
        </div>
        {/* faux floating action circle */}
        <div className="absolute -right-6 bottom-6 h-8 w-8 rounded-full bg-white shadow-md" />
      </motion.button>

      {/* layered backs for stack look */}
      {index === 0 && (
        <>
          <div className="pointer-events-none absolute -z-10 left-2 right-2 top-2 h-[88%] rounded-xl bg-white/80 shadow-md" />
          <div className="pointer-events-none absolute -z-20 left-4 right-4 top-4 h-[76%] rounded-xl bg-white/70 shadow-sm" />
        </>
      )}
    </div>
  );
}

export default function Page() {
  const [mails, setMails] = useState<Mail[]>(initialMails);
  const [openMail, setOpenMail] = useState<Mail | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  // envelope animation state
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [envelopeMode, setEnvelopeMode] = useState<"open" | "close">("open");
  const pendingMailRef = useRef<Mail | null>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "good morning";
    if (hour < 18) return "good afternoon";
    return "good evening";
  }, []);

  // orchestrate envelope -> letter reveal
  const openWithEnvelope = (mail: Mail) => {
    pendingMailRef.current = mail;
    setEnvelopeMode("open");
    setShowEnvelope(true);
    // reveal detail after animation
    setTimeout(() => {
      setOpenMail(mail);
      setShowEnvelope(false);
    }, 900);
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-gradient-to-b from-stone-100 to-[#d9d7cf]">
      {/* envelope overlay */}
      <AnimatePresence>
        {showEnvelope && (
          <motion.div
            key="envelope-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/20 backdrop-blur-[1.5px]"
          >
            <EnvelopeAnimation mode={envelopeMode} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full max-w-[480px] mx-auto px-5 pt-7 pb-28 antialiased">
        {/* header */}
        <div className="flex items-center justify-between mb-7">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/70">inbox</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70 px-2.5 py-1 rounded-full bg-foreground/5">
            <Search className="h-3.5 w-3.5" />
            search
          </span>
        </div>

        {/* greeting */}
        <div className="text-foreground/60 text-sm leading-relaxed mb-9">
          {greeting} sam, you have
          <div className="text-foreground font-semibold text-2xl tracking-tight mt-0.5">{mails.length} new mails</div>
        </div>

        {/* list view */}
        <AnimatePresence initial={false} mode="popLayout">
          {!openMail && !isComposing && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="space-y-6"
            >
              {mails.map((m, i) => (
                <MailCard
                  key={m.id}
                  mail={m}
                  index={i}
                  onOpen={openWithEnvelope}
                  onDelete={(id) => setMails((prev) => prev.filter((x) => x.id !== id))}
                  onToggleImportant={(id) =>
                    setMails((prev) =>
                      prev.map((m) =>
                        m.id === id ? { ...m, important: !m.important } : m
                      )
                    )
                  }
                />
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-16 text-sm font-medium text-background inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/90 hover:bg-foreground cursor-pointer"
                onClick={() => setIsComposing(true)}
              >
                write
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* compose view */}
        <AnimatePresence mode="popLayout">
          {!openMail && isComposing && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="space-y-4"
            >
              <div className="rounded-xl bg-white p-5 shadow-xl">
                <h2 className="text-lg font-semibold mb-4">New Message</h2>
                <Input 
                  placeholder="To" 
                  className="mb-2 border-0 focus-visible:ring-0 outline-none bg-muted/50 placeholder:text-muted-foreground text-[15px]" 
                />
                <Input 
                  placeholder="Subject" 
                  className="mb-4 border-0 focus-visible:ring-0 outline-none bg-muted/50 placeholder:text-muted-foreground text-[15px]" 
                />
                <Textarea 
                  placeholder="Type your message..." 
                  className="min-h-[200px] resize-none border-0 focus-visible:ring-0 outline-none bg-muted/50 rounded-md text-[15px] placeholder:text-muted-foreground mb-4" 
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="border-0 focus-visible:ring-0 text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full px-3"
                    onClick={() => setIsComposing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="border-0 focus-visible:ring-0 bg-foreground text-background hover:bg-foreground/90 shadow-md rounded-full px-4"
                    onClick={() => {
                      setIsComposing(false);
                      // TODO: implement send logic
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* detail view */}
        <AnimatePresence mode="wait">
          {openMail && (
            <motion.div
              key={`detail-${openMail.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="space-y-4"
            >
              <motion.div layoutId={`card-${openMail.id}`} className="rounded-xl bg-white p-5 shadow-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-foreground/60">{openMail.time}</div>
                  <Stamp url={openMail.stamp} />
                </div>

                {/* letter paper look */}
                <div
                  className="rounded-xl p-4 shadow-inner ring-1 ring-black/5 bg-[#fffdfa]"
                  style={{
                    backgroundImage:
                      "linear-gradient(transparent 23px, rgba(0,0,0,0.04) 24px)",
                    backgroundSize: "100% 24px",
                    transform: "rotate(-0.15deg)",
                  }}
                >
                  <div className="handwritten text-[18px] leading-8 text-[#243b6b]/95">
                    {openMail.body.map((p, idx) => (
                      <p
                        key={idx}
                        className="my-[6px]"
                        style={{ textIndent: idx === 0 ? 0 : "1.25rem" }}
                      >
                        {p}
                      </p>
                    ))}
                    {/* signature block */}
                    <div className="h-20 my-4">
                      <svg viewBox="0 0 200 80" className="h-full w-auto">
                        <path d="M10 50 C 40 10, 80 90, 120 40 S 180 30, 190 60" stroke="currentColor" strokeWidth="3" fill="none" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* integrated reply input */}
                <div className="pt-6">
                  <Textarea
                    placeholder="reply"
                    className="min-h-[96px] resize-none border-0 rounded-none bg-transparent focus-visible:ring-0 outline-none text-[15px] placeholder:text-muted-foreground mb-4"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" className="border-0 focus-visible:ring-0 bg-foreground text-background hover:bg-foreground/90 shadow-md rounded-full px-4" onClick={() => {
                      // TODO: send reply logic
                      setOpenMail(null);
                    }}>Send</Button>
                  </div>
                </div>
              </motion.div>

              <div className="text-center text-xs text-foreground/40">{openMail.time}</div>

              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="border-0 focus-visible:ring-0 text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full px-3"
                  onClick={() => {
                    // close via envelope
                    setEnvelopeMode("close");
                    setShowEnvelope(true);
                    setTimeout(() => {
                      setShowEnvelope(false);
                      setOpenMail(null);
                    }, 900);
                  }}
                >
                  Back
                </Button>
                <Button size="sm" variant="destructive" className="border-0 focus-visible:ring-0 bg-destructive text-white hover:bg-destructive/90 shadow-md rounded-full px-4" onClick={() => { setMails((prev) => prev.filter((x) => x.id !== openMail.id)); setOpenMail(null); }}>Delete</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// simple envelope animation component
function EnvelopeAnimation({ mode }: { mode: "open" | "close" }) {
  const isOpening = mode === "open";
  return (
    <div className="relative w-[320px] h-[220px]">
      {/* envelope body */}
      <div className="absolute inset-0 rounded-xl shadow-2xl"
        style={{
          background:
            "linear-gradient(180deg,#f1e7d3 0%,#e8ddc4 100%)",
        }}
      />

      {/* letter */}
      <motion.div
        initial={{ y: isOpening ? 60 : 0, opacity: 0.95 }}
        animate={{ y: isOpening ? -40 : 60, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, duration: 0.9 }}
        className="absolute left-4 right-4 top-6 h-[150px] rounded-lg shadow-lg ring-1 ring-black/5 bg-[#fffdfa]"
        style={{
          backgroundImage: "linear-gradient(transparent 23px, rgba(0,0,0,0.05) 24px)",
          backgroundSize: "100% 24px",
        }}
      >
        <div className="p-4 text-[16px] handwritten text-neutral-700">
          dear sam —
          <br />
          opening your letter…
        </div>
      </motion.div>

      {/* wax seal */}
      <motion.div
        initial={{ scale: isOpening ? 1 : 0, opacity: 1 }}
        animate={{ scale: isOpening ? 0 : 1, opacity: isOpening ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="absolute left-1/2 -translate-x-1/2 top-[72px] w-10 h-10 rounded-full bg-red-600 shadow-md ring-2 ring-red-700/40"
        style={{ boxShadow: "0 6px 10px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.3)" }}
      />

      {/* flap */}
      <motion.div
        initial={{ rotateX: isOpening ? 0 : 180, transformOrigin: "top" }}
        animate={{ rotateX: isOpening ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="absolute left-0 right-0 top-0 h-[110px] origin-top rounded-t-xl"
        style={{
          background:
            "linear-gradient(180deg,#e5d8bb 0%,#dacba8 100%)",
          clipPath: "polygon(0% 0%, 50% 0%, 100% 0%, 50% 100%)",
          boxShadow: "inset 0 -8px 14px rgba(0,0,0,0.12)",
        }}
      />

      {/* decorative seams */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-black/10" />
      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 6px 12px rgba(0,0,0,0.08)" }} />
    </div>
  );
}