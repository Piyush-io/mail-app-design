"use client";

import { useMemo, useState } from "react";
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
        layoutId={`card-${mail.id}`}
        onClick={() => onOpen(mail)}
        drag="x"
        dragElastic={0.12}
        dragConstraints={{ left: -160, right: 160 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120) {
            onDelete(mail.id);
          } else if (info.offset.x > 120) {
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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "good morning";
    if (hour < 18) return "good afternoon";
    return "good evening";
  }, []);

  return (
    <div className="min-h-screen w-full flex items-start justify-center bg-gradient-to-b from-stone-100 to-[#d9d7cf]">
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
                  onOpen={setOpenMail}
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

                <div className="prose prose-sm max-w-none">
                  {openMail.body.map((p, idx) => (
                    <p key={idx} className="text-[15px] leading-relaxed my-2">{p}</p>
                  ))}
                  {/* signature block */}
                  <div className="h-20 my-4">
                    <svg viewBox="0 0 200 80" className="h-full w-auto">
                      <path d="M10 50 C 40 10, 80 90, 120 40 S 180 30, 190 60" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
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
                <Button size="sm" variant="ghost" className="border-0 focus-visible:ring-0 text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-full px-3" onClick={() => setOpenMail(null)}>Back</Button>
                <Button size="sm" variant="destructive" className="border-0 focus-visible:ring-0 bg-destructive text-white hover:bg-destructive/90 shadow-md rounded-full px-4" onClick={() => { setMails((prev) => prev.filter((x) => x.id !== openMail.id)); setOpenMail(null); }}>Delete</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}