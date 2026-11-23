"use client";

import { useEffect, type RefObject } from "react";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { UserRole } from "@/lib/roles";

type Props = {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  reduceMotion: boolean;
  isInView: boolean;
};

export type RoleAction = {
  label: string;
  href: string;
};

const roleOptions: ReadonlyArray<{
  role: UserRole;
  description: string;
  icon: LucideIcon;
}> = [
  {
    role: "customer",
    description: "Plan your dream wedding.",
    icon: HeartHandshake,
  },
  {
    role: "vendor",
    description: "Showcase your services and grow.",
    icon: Store,
  },
  {
    role: "admin",
    description: "Manage and oversee WedPlan.",
    icon: ShieldCheck,
  },
];

const workflows: Record<
  UserRole,
  {
    title: string;
    subtitle: string;
    steps: ReadonlyArray<{ title: string; description: string }>;
  }
> = {
  customer: {
    title: "Customer",
    subtitle: "Plan your dream wedding.",
    steps: [
      {
        title: "Discover Wedding Services",
        description:
          "Browse approved wedding professionals by category, location, and price.",
      },
      {
        title: "Compare Vendors",
        description:
          "Review service details, pricing, photos, and vendor information before deciding.",
      },
      {
        title: "Request a Booking",
        description:
          "Choose a service, provide your event details, and send a booking request.",
      },
      {
        title: "Track Your Bookings",
        description:
          "Follow pending, accepted, or rejected requests from your dashboard.",
      },
    ],
  },
  vendor: {
    title: "Vendor",
    subtitle: "Showcase your services and grow your wedding business.",
    steps: [
      {
        title: "Activate Vendor Access",
        description:
          "Register as a vendor, or add Vendor access to an existing Customer account.",
      },
      {
        title: "Create Your Services",
        description:
          "Add service details, category, pricing, location, and photos; manage activation from your service list.",
      },
      {
        title: "Get Admin Approval",
        description:
          "Submitted services remain pending until an Admin reviews them.",
      },
      {
        title: "Manage Booking Requests",
        description:
          "Review incoming requests and accept or reject eligible bookings.",
      },
      {
        title: "Manage Your Subscription",
        description:
          "View your plan and service limits, and upgrade when needed.",
      },
    ],
  },
  admin: {
    title: "Admin",
    subtitle: "Manage and oversee the WedPlan platform.",
    steps: [
      {
        title: "Manage Users",
        description:
          "Search platform users, review their roles, and block or unblock accounts.",
      },
      {
        title: "Review Services",
        description:
          "Inspect submitted listings and approve or reject services.",
      },
      {
        title: "Monitor Platform Activity",
        description:
          "Oversee users, services, bookings, and subscription activity.",
      },
      {
        title: "Review Transactions",
        description:
          "Inspect payment and subscription transaction records.",
      },
    ],
  },
};

type Particle = {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  lifetime: number;
  size: number;
  sparkle: boolean;
};

export function CursorDust({
  sectionRef,
  reduceMotion,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  reduceMotion: boolean;
}) {
  useEffect(() => {
    const sectionCandidate = sectionRef.current;
    if (!sectionCandidate) return;

    const canvasCandidate = sectionCandidate.querySelector("canvas");
    if (!(canvasCandidate instanceof HTMLCanvasElement)) return;
    if (
      reduceMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const section: HTMLElement = sectionCandidate;
    const canvas: HTMLCanvasElement = canvasCandidate;
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;
    const context: CanvasRenderingContext2D = canvasContext;

    const smallScreen = window.innerWidth < 640;
    const lowPowerDevice =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency > 0 &&
      navigator.hardwareConcurrency <= 4;
    const particleLimit = smallScreen || lowPowerDevice ? 18 : 42;
    const spawnInterval = smallScreen || lowPowerDevice ? 38 : 22;
    const particles: Particle[] = Array.from({ length: particleLimit }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      lifetime: 0,
      size: 0,
      sparkle: false,
    }));
    let nextParticle = 0;
    let frameId: number | null = null;
    let previousPointer: { x: number; y: number } | null = null;
    let lastSpawnTime = 0;
    let lastFrameTime = 0;
    let width = 0;
    let height = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    function resizeCanvas() {
      const bounds = section.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function spawnParticle(x: number, y: number, sparkle: boolean) {
      const particle = particles[nextParticle];
      nextParticle = (nextParticle + 1) % particles.length;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.12 + Math.random() * 0.38;

      particle.active = true;
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed - 0.22;
      particle.age = 0;
      particle.lifetime = sparkle ? 620 + Math.random() * 220 : 420 + Math.random() * 300;
      particle.size = sparkle ? 2 + Math.random() * 1.2 : 0.8 + Math.random() * 1.1;
      particle.sparkle = sparkle;
    }

    function drawSparkle(x: number, y: number, size: number) {
      context.beginPath();
      context.moveTo(x, y - size);
      context.lineTo(x + size * 0.34, y - size * 0.34);
      context.lineTo(x + size, y);
      context.lineTo(x + size * 0.34, y + size * 0.34);
      context.lineTo(x, y + size);
      context.lineTo(x - size * 0.34, y + size * 0.34);
      context.lineTo(x - size, y);
      context.lineTo(x - size * 0.34, y - size * 0.34);
      context.closePath();
      context.fill();
    }

    function renderFrame(timestamp: number) {
      frameId = null;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#d3b58f";
      context.shadowColor = "rgba(184, 149, 112, 0.72)";
      context.globalCompositeOperation = "lighter";

      const delta = Math.min(32, timestamp - (lastFrameTime || timestamp));
      lastFrameTime = timestamp;
      let hasActiveParticles = false;

      for (const particle of particles) {
        if (!particle.active) continue;

        particle.age += delta;
        if (particle.age >= particle.lifetime) {
          particle.active = false;
          continue;
        }

        hasActiveParticles = true;
        const progress = particle.age / particle.lifetime;
        const frameScale = delta / 16.67;
        particle.vy -= 0.002 * frameScale;
        particle.x += particle.vx * frameScale;
        particle.y += particle.vy * frameScale;
        context.globalAlpha = (1 - progress) * 0.72;
        context.shadowBlur = particle.sparkle ? 9 : 4;

        if (particle.sparkle) {
          drawSparkle(particle.x, particle.y, particle.size);
        } else {
          context.beginPath();
          context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      context.shadowBlur = 0;

      if (hasActiveParticles) {
        frameId = window.requestAnimationFrame(renderFrame);
      } else {
        lastFrameTime = 0;
      }
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const bounds = section.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) return;

      const now = performance.now();
      const previous = previousPointer ?? { x, y };
      const distance = Math.hypot(x - previous.x, y - previous.y);
      if (now - lastSpawnTime < spawnInterval && distance < 10) return;
      lastSpawnTime = now;

      const count = Math.min(
        smallScreen || lowPowerDevice ? 2 : 3,
        Math.max(1, Math.ceil(distance / 22))
      );
      for (let index = 0; index < count; index += 1) {
        const progress = (index + 1) / count;
        const trailX = previous.x + (x - previous.x) * progress * 0.72;
        const trailY = previous.y + (y - previous.y) * progress * 0.72;
        spawnParticle(trailX, trailY, Math.random() < 0.07);
      }

      previousPointer = { x, y };
      if (frameId === null) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    }

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(section);
    section.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      context.clearRect(0, 0, width, height);
    };
  }, [reduceMotion, sectionRef]);

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
}

function FlowPath({
  d,
  delay,
  reduceMotion,
  isInView,
}: {
  d: string;
  delay: number;
  reduceMotion: boolean;
  isInView: boolean;
}) {
  const isStatic = reduceMotion || !isInView;

  return (
    <>
      <path d={d} fill="none" stroke="rgba(184,149,112,0.28)" strokeWidth="1.5" />
      <motion.path
        d={d}
        fill="none"
        pathLength={1}
        stroke="#c5a47e"
        strokeDasharray="0.1 0.9"
        strokeLinecap="round"
        strokeWidth="2"
        animate={isStatic ? { strokeDashoffset: 0 } : { strokeDashoffset: [0, -1] }}
        transition={
          isStatic
            ? { duration: 0 }
            : { duration: 4.8, delay, repeat: Infinity, ease: "linear" }
        }
      />
    </>
  );
}

export default function HowItWorksUniverse({
  activeRole,
  onSelectRole,
  reduceMotion,
  isInView,
}: Props) {
  return (
    <div className="relative mx-auto mt-4 max-w-4xl lg:mt-5">
      <div className="relative z-10 flex min-h-14 w-full items-center gap-3 rounded-2xl border border-champagne/30 bg-card/90 px-3 py-2 shadow-sm sm:mx-auto sm:w-fit sm:gap-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Heart size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-champagne">
            WedPlan
          </span>
          <span className="block text-xs text-muted sm:text-sm">
            One platform. Three roles. A seamless wedding planning experience.
          </span>
        </span>
        <Sparkles
          size={16}
          className="ml-auto shrink-0 text-champagne sm:ml-0"
          aria-hidden="true"
        />
      </div>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-[28px] top-8 z-0 w-1 sm:hidden"
        viewBox="0 0 4 100"
        preserveAspectRatio="none"
      >
        <FlowPath
          d="M2 0 V100"
          delay={0}
          reduceMotion={reduceMotion}
          isInView={isInView}
        />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-[28px] z-0 hidden h-[76px] w-full sm:block"
        viewBox="0 0 1000 76"
        preserveAspectRatio="none"
      >
        <FlowPath
          d="M500 0 C500 42 166 36 166 76"
          delay={0}
          reduceMotion={reduceMotion}
          isInView={isInView}
        />
        <FlowPath
          d="M500 0 V76"
          delay={0.8}
          reduceMotion={reduceMotion}
          isInView={isInView}
        />
        <FlowPath
          d="M500 0 C500 42 834 36 834 76"
          delay={1.6}
          reduceMotion={reduceMotion}
          isInView={isInView}
        />
      </svg>

      <div
        role="group"
        aria-label="Choose a WedPlan role"
        className="relative z-10 mt-2 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3 lg:mt-7 lg:gap-4"
      >
        {roleOptions.map(({ role, description, icon: Icon }) => {
          const selected = activeRole === role;

          return (
            <button
              key={role}
              id={`how-it-works-${role}-trigger`}
              type="button"
              aria-expanded={selected}
              aria-controls="how-it-works-workflow-panel"
              onClick={() => onSelectRole(role)}
              className={`relative flex min-h-[64px] w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-h-[92px] sm:flex-col sm:justify-center sm:gap-1.5 sm:px-2 sm:text-center lg:min-h-[108px] ${
                selected
                  ? "border-champagne/60 bg-champagne/10 shadow-sm"
                  : "border-border/80 bg-card/90 hover:border-champagne/45 hover:bg-secondary/60"
              }`}
            >
              <span
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? "border-champagne/50 bg-card text-primary"
                    : "border-border bg-background text-muted"
                }`}
              >
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 sm:flex-none">
                <span className="block font-serif text-sm leading-tight text-foreground">
                  {role === "customer"
                    ? "Customer"
                    : role === "vendor"
                      ? "Vendor"
                      : "Admin"}
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-muted">
                  {description}
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none sm:absolute sm:right-2 sm:top-2 ${
                  selected ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RoleWorkflowPanel({
  role,
  actions,
  notice,
  reduceMotion,
  isInView,
}: {
  role: UserRole;
  actions: { primary: RoleAction; secondary?: RoleAction };
  notice?: string;
  reduceMotion: boolean;
  isInView: boolean;
}) {
  const workflow = workflows[role];
  const headingId = `how-it-works-${role}-workflow-heading`;

  return (
    <motion.section
      aria-labelledby={headingId}
      className="grid gap-3 rounded-2xl border border-champagne/25 bg-card/85 p-3 shadow-[0_8px_28px_rgba(48,39,42,0.045)] sm:gap-4 sm:p-4 md:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.75fr)] md:gap-5 lg:gap-6 lg:p-5"
      initial={reduceMotion || !isInView ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-champagne">
          {workflow.title} workflow
        </p>
        <h3
          id={headingId}
          className="mt-1 font-serif text-lg leading-tight text-foreground lg:text-2xl"
        >
          {workflow.subtitle}
        </h3>

        <ol className="mt-2 grid gap-0.5 lg:mt-3 lg:gap-1">
          {workflow.steps.map((step, index) => (
            <motion.li
              key={step.title}
              className="relative grid grid-cols-[26px_minmax(0,1fr)] gap-2 py-0.5 lg:grid-cols-[28px_minmax(0,1fr)] lg:gap-2.5 lg:py-1"
              initial={reduceMotion || !isInView ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                delay: reduceMotion ? 0 : index * 0.045,
              }}
            >
              {index < workflow.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-4px] left-[12px] top-7 w-px bg-champagne/40 lg:bottom-[-5px] lg:left-[13px] lg:top-8"
                />
              )}
              <span className="relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-champagne/40 bg-background text-[10px] font-semibold text-primary lg:h-7 lg:w-7">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 pb-1">
                <span className="block text-xs font-semibold text-foreground sm:text-sm">
                  {step.title}
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-muted">
                  {step.description}
                </span>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      <aside className="flex min-w-0 flex-col justify-center gap-2 rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4">
        {notice && (
          <p className="mb-1 text-xs leading-5 text-muted">
            {notice}
          </p>
        )}
        {[actions.primary, actions.secondary]
          .filter((action): action is RoleAction => Boolean(action))
          .map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-center text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:text-sm ${
                index === 0
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "border border-border bg-card text-foreground hover:border-champagne/60 hover:text-primary"
              }`}
            >
              <span>{action.label}</span>
              <ArrowRight size={15} className="shrink-0" aria-hidden="true" />
            </Link>
          ))}
      </aside>
    </motion.section>
  );
}
