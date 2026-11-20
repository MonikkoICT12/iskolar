import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
  AlertCircle,
  Heart,
  UserCheck,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Label,
  LabelList,
} from "recharts";
import dataService from "../services/dataService";
import { useAuth } from "../contexts/AuthContext";
import { safePercentage } from "../utils/helpers";
import AdminLoginDialog from "./AdminLoginDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const SplitWords = ({
  text,
  wordClassName = "gsap-hero-word",
  className = "",
}) =>
  text.split(" ").map((word, idx, arr) => (
    <span
      key={`${word}-${idx}`}
      className={`inline-block overflow-hidden align-bottom ${
        idx < arr.length - 1 ? "mr-[0.25em]" : ""
      }`}
    >
      <span
        className={`inline-block will-change-transform ${wordClassName} ${className}`}
      >
        {word}
      </span>
    </span>
  ));

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const rootRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [graduatesData, setGraduatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [headerSolid, setHeaderSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setHeaderSolid(window.scrollY > Math.max(360, window.innerHeight * 0.65));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true);
      try {
        const [dashboard, graduates] = await Promise.all([
          dataService.getPublicDashboardStats(),
          dataService.getPublicGraduatesBySchool(),
        ]);
        setDashboardData(dashboard);
        setGraduatesData(graduates);
      } catch (err) {
        console.error("Error fetching public data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  const handleDashboardClick = () => {
    if (user && isAdmin) {
      navigate("/admin");
    } else {
      setLoginPromptOpen(true);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Exact queue-system chart palette: Olive Dark #587529, Amber #F4BE38, Olive #71951E, Butter #EDDA5E
  const CHART_COLORS = {
    oliveDark: "#587529",
    olive: "#71951E",
    amber: "#F4BE38",
    butter: "#EDDA5E",
    grid: "#E8E8E3",
    axis: "#474A3D",
  };

  const PIE_COLORS = [CHART_COLORS.oliveDark, CHART_COLORS.amber];

  const yearLevelChartConfig = {
    count: {
      label: "Scholars",
      color: CHART_COLORS.olive,
    },
  };

  const paymentChartConfig = {
    Paid: {
      label: "Paid",
      color: CHART_COLORS.oliveDark,
    },
    Processing: {
      label: "Processing",
      color: CHART_COLORS.amber,
    },
  };

  // Hero entrance choreography runs immediately on mount before first paint
  useLayoutEffect(() => {
    if (!rootRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({
        defaults: {
          ease: "power2.out",
          force3D: true,
          clearProps: "transform,opacity,filter",
        },
      });

      heroTl
        .fromTo(
          ".gsap-nav-header",
          { y: -28, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.45, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".gsap-hero-bg-img",
          { scale: 1.075, y: 10 },
          {
            scale: 1,
            y: 0,
            duration: 2.4,
            ease: "power2.out",
            clearProps: "transform",
          },
          0,
        )
        .fromTo(
          ".gsap-hero-watermark",
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.75, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".gsap-hero-badge",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.55, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".gsap-hero-word",
          { yPercent: 85, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.55,
            stagger: 0.035,
            ease: "power3.out",
          },
          0,
        )
        .fromTo(
          ".gsap-hero-subtitle",
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.65, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".gsap-hero-cta",
          { y: 24, scale: 0.94, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1.6, ease: "power3.out" },
          0,
        )
        .fromTo(
          ".gsap-hero-compliance",
          { y: 26, scale: 0.95, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1.65, ease: "power3.out" },
          0,
        );
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (loading || !rootRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const observers = [];

    const ctx = gsap.context(() => {
      if (rootRef.current?.querySelector(".gsap-hero-float-card")) {
        gsap.fromTo(
          ".gsap-hero-float-card",
          { y: 28, scale: 0.94, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.55,
            ease: "power3.out",
            force3D: true,
            clearProps: "transform,opacity",
          },
        );
      }

      // Reliable IntersectionObserver helper (never leaves scrolled/resized elements stuck invisible)
      const revealGroup = (
        triggerSelector,
        runAnimation,
        initialHiddenSelector,
      ) => {
        const triggerEl = rootRef.current?.querySelector(triggerSelector);
        if (!triggerEl) return;

        const targets = initialHiddenSelector
          ? rootRef.current.querySelectorAll(initialHiddenSelector)
          : [triggerEl];
        if (!targets.length) return;

        let played = false;
        const play = (instant = false) => {
          if (played) return;
          played = true;
          if (instant) {
            gsap.set(targets, { clearProps: "all" });
          } else {
            runAnimation(targets);
          }
        };

        const rect = triggerEl.getBoundingClientRect();
        if (rect.bottom < 0) {
          // Already scrolled past — ensure immediately visible
          play(true);
          return;
        }
        if (rect.top <= window.innerHeight * 0.96) {
          play(false);
          return;
        }

        const io = new IntersectionObserver(
          (entries) => {
            if (
              entries.some(
                (e) =>
                  e.isIntersecting ||
                  e.boundingClientRect.top <= window.innerHeight,
              )
            ) {
              play(false);
              io.disconnect();
            }
          },
          { threshold: 0.01 },
        );
        io.observe(triggerEl);
        observers.push(io);
      };

      // KPI cards row
      revealGroup(
        ".gsap-kpi-grid",
        (targets) =>
          gsap.fromTo(
            targets,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.11,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity",
            },
          ),
        ".gsap-kpi-card",
      );

      // Demographic cards row
      revealGroup(
        ".gsap-demo-grid",
        (targets) =>
          gsap.fromTo(
            targets,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.12,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity",
            },
          ),
        ".gsap-demo-card",
      );

      // Top 10 Schools Ranked BarList card
      revealGroup(".gsap-schools-card", () => {
        gsap.fromTo(
          ".gsap-schools-card",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power2.out",
            force3D: true,
            clearProps: "transform,opacity",
          },
        );
        gsap.fromTo(
          ".gsap-school-row",
          { x: -12, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.72,
            stagger: 0.06,
            ease: "power2.out",
            force3D: true,
            clearProps: "transform,opacity",
          },
        );
        gsap.fromTo(
          ".gsap-school-bar",
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 1.15,
            stagger: 0.06,
            ease: "power2.out",
            force3D: true,
            clearProps: "transform",
          },
        );
      });

      // Right analytics chart cards
      revealGroup(
        ".gsap-charts-col",
        (targets) =>
          gsap.fromTo(
            targets,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.92,
              stagger: 0.16,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity",
            },
          ),
        ".gsap-chart-card",
      );

      // Graduates heading typography
      revealGroup(
        "#graduates",
        (targets) =>
          gsap.fromTo(
            targets,
            { yPercent: 60, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.95,
              stagger: 0.08,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity",
            },
          ),
        ".gsap-grad-word",
      );

      // Graduates summary banner
      revealGroup(".gsap-grad-banner", (targets) =>
        gsap.fromTo(
          targets,
          { y: 18, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            force3D: true,
            clearProps: "transform,opacity",
          },
        ),
      );

      // Graduates institutional grid & bars
      revealGroup(
        ".gsap-grad-grid",
        (targets) => {
          gsap.fromTo(
            targets,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.07,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform,opacity",
            },
          );
          gsap.fromTo(
            ".gsap-grad-bar",
            { scaleX: 0 },
            {
              scaleX: 1,
              transformOrigin: "left center",
              duration: 1.1,
              stagger: 0.07,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform",
            },
          );
        },
        ".gsap-grad-card",
      );

      // Rolling numeric counters on scroll reveal
      rootRef.current.querySelectorAll("[data-gsap-count]").forEach((el) => {
        const targetVal = parseFloat(el.dataset.gsapCount || "0");
        const decimals = parseInt(el.dataset.gsapDecimals || "0", 10);
        const prefix = el.dataset.gsapPrefix || "";
        if (isNaN(targetVal)) return;

        let counted = false;
        const runCounter = () => {
          if (counted) return;
          counted = true;
          const counter = { val: 0 };
          gsap.to(counter, {
            val: targetVal,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${prefix}${counter.val.toLocaleString("en-PH", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}`;
            },
          });
        };

        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.98) {
          runCounter();
          return;
        }

        const io = new IntersectionObserver(
          (entries) => {
            if (
              entries.some(
                (e) =>
                  e.isIntersecting ||
                  e.boundingClientRect.top <= window.innerHeight,
              )
            ) {
              runCounter();
              io.disconnect();
            }
          },
          { threshold: 0.05 },
        );
        io.observe(el);
        observers.push(io);
      });
    }, rootRef);

    return () => {
      observers.forEach((io) => io.disconnect());
      ctx.revert();
    };
  }, [loading, dashboardData, graduatesData]);

  const dataNotAvailable =
    !loading && (!dashboardData?.available || !graduatesData?.available);

  return (
    <div
      ref={rootRef}
      className="bg-frosted-canvas min-h-screen flex flex-col w-full"
    >
      {/* Blended Transparent Top Navigation (transitions to frosted glass after hero scroll) */}
      <header
        className={`gsap-nav-header fixed top-0 inset-x-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
          headerSolid
            ? "glass-header shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between gap-4">
          <div className="gsap-nav-item flex items-center gap-3 min-w-0 justify-self-start">
            <img
              src="/logo/iskolayan-square-light.png"
              alt="IskoLayan Logo"
              className="w-9 h-9 rounded-xl object-contain flex-shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <span
                className={`font-extrabold text-sm block leading-tight truncate transition-colors duration-300 ${
                  headerSolid
                    ? "text-foreground"
                    : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                }`}
              >
                IskoLayan
              </span>
              <span
                className={`text-[11px] font-medium block truncate transition-colors duration-300 ${
                  headerSolid
                    ? "text-muted-foreground"
                    : "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
                }`}
              >
                Palayan City Scholarship System
              </span>
            </div>
          </div>

          <nav
            className={`gsap-nav-item hidden md:flex items-center justify-center gap-1 rounded-full px-2 py-1 justify-self-center transition-[background-color,border-color,box-shadow] duration-300 ${
              headerSolid
                ? "bg-white/85 border border-border/90 shadow-sm"
                : "bg-white/15 backdrop-blur-md border border-white/25 shadow-sm"
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("overview")}
              className={`rounded-full h-8 px-4 text-xs font-semibold transition-colors ${
                headerSolid
                  ? "text-foreground hover:bg-brand/10 hover:text-brand"
                  : "text-white hover:bg-white/20 hover:text-white"
              }`}
            >
              Overview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("statistics")}
              className={`rounded-full h-8 px-4 text-xs font-semibold transition-colors ${
                headerSolid
                  ? "text-muted-foreground hover:bg-brand/10 hover:text-brand"
                  : "text-white/90 hover:bg-white/20 hover:text-white"
              }`}
            >
              Public Statistics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("graduates")}
              className={`rounded-full h-8 px-4 text-xs font-semibold transition-colors ${
                headerSolid
                  ? "text-muted-foreground hover:bg-brand/10 hover:text-brand"
                  : "text-white/90 hover:bg-white/20 hover:text-white"
              }`}
            >
              Graduates
            </Button>
          </nav>

          <Button
            variant="default"
            size="sm"
            onClick={handleDashboardClick}
            className={`gsap-nav-item rounded-full px-4 h-9 flex-shrink-0 justify-self-end shadow-sm transition-[background-color,border-color,box-shadow] duration-300 ${
              headerSolid ? "" : "border border-white/20 shadow-md"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Minimalist Architectural City Hall Hero Section (Full-Bleed Whole Canvas) */}
      <section
        id="overview"
        className="relative w-full border-b border-border/70"
      >
        <div className="gsap-hero-frame relative w-full min-h-[680px] sm:min-h-[780px] lg:min-h-screen max-h-[1160px] overflow-hidden flex flex-col justify-between bg-[#1A2110]">
          {/* Palayan City Hall Softly Blurred Full-Bleed Backdrop (-inset-3 prevents blur edge fringing) */}
          <img
            src="/cityhall.jpg"
            alt="Palayan City Hall"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="gsap-hero-bg-img absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] max-w-none object-cover object-[50%_36%] blur-[3.5px]"
          />

          {/* Soft Top Header Gradient Blend */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-44 sm:h-56 bg-gradient-to-b from-[#161D0D]/30 via-[#161D0D]/10 to-transparent z-[1]"
          />

          {/* Subtle Sky Editorial Watermark */}
          <div className="gsap-hero-watermark pointer-events-none select-none absolute top-20 sm:top-24 inset-x-0 text-center overflow-hidden z-[2]">
            <span className="block font-black uppercase tracking-[0.1em] text-[clamp(3.25rem,11vw,9.25rem)] leading-none text-white/25">
              IskoLayan
            </span>
          </div>

          {/* Olive-Charcoal Architectural Contrast Scrim (keeps City Hall & flag bright in center/top) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#161D0D]/90 via-[#161D0D]/30 to-transparent z-[3]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#161D0D]/70 via-[#161D0D]/15 to-transparent z-[3]" />

          {/* Top Minimal Location Pill */}
          <div className="relative z-10 px-5 sm:px-8 lg:px-12 pt-24 sm:pt-28 flex items-center justify-between">
            <div className="gsap-hero-badge inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1A2110]/35 backdrop-blur-md border border-white/30 text-white shadow-sm">
              <img
                src="/logo/iskolayan-square-light.png"
                alt="IskoLayan Official Mark"
                className="w-5 h-5 rounded-md object-contain"
              />
              <span className="text-[11px] sm:text-xs font-medium tracking-wide">
                City Government of Palayan · Nueva Ecija
              </span>
            </div>
          </div>

          {/* Bottom Split Editorial Headline + Centered Compliance Pill + Right Live Metric Pill */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-12 pb-8 sm:pb-10 pt-16 flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end gap-5 sm:gap-6">
            <div className="max-w-lg lg:justify-self-start">
              <h1 className="text-3xl sm:text-5xl lg:text-[2.65rem] xl:text-[3.2rem] font-black tracking-tight text-white leading-[1.08] [perspective:800px]">
                <SplitWords text="IskoLayan:" />{" "}
                <SplitWords
                  text="Palayan City Scholarship Management System"
                  className="text-[#EDDA5E]"
                />
              </h1>

              <p className="gsap-hero-subtitle text-sm sm:text-base text-white/85 mt-3.5 leading-relaxed max-w-md font-normal">
                Empowering Palayan City scholars through transparent financial
                aid tracking, academic continuity, and partner-institution
                coordination.
              </p>

              <div className="gsap-hero-cta mt-6 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => scrollToSection("statistics")}
                  className="h-11 px-6 rounded-full bg-[#587529] hover:bg-[#496221] text-white font-semibold shadow-lg shadow-black/25 gap-2 border border-white/15"
                >
                  <span>View Public Statistics</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Middle-Bottom ICT Division & NPC Compliance Pill (dead-center of hero) */}
            <div className="gsap-hero-compliance inline-flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 px-4 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-xl self-center lg:self-end lg:justify-self-center flex-shrink-0">
              <div className="flex items-center gap-2.5 text-left">
                <div className="h-8 w-8 rounded-lg bg-white/95 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img
                    src="/logo/ict-logo.png"
                    alt="Palayan City ICT Division Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/75 block leading-none mb-0.5">
                    Powered by
                  </span>
                  <span className="text-xs font-bold text-white block leading-tight">
                    Palayan City ICT Division
                  </span>
                </div>
              </div>

              <div className="hidden sm:block h-7 w-px bg-white/25" />

              <div className="flex items-center gap-2.5 text-left">
                <div className="h-8 rounded-lg bg-white/95 px-1.5 py-1 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img
                    src="/logo/npc.png"
                    alt="National Privacy Commission Seal"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-white/75 block leading-none mb-0.5">
                    Data Privacy Compliance
                  </span>
                  <span className="text-xs font-bold text-white block leading-tight">
                    NPC Seal (RA 10173)
                  </span>
                </div>
              </div>
            </div>

            <div className="self-start lg:self-end lg:justify-self-end flex-shrink-0">
              {dashboardData?.available && (
                <div className="gsap-hero-float-card inline-flex items-center gap-5 px-5 py-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-xl">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/75 font-semibold block">
                      Registered Scholars
                    </span>
                    <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-[#EDDA5E]">
                      {(dashboardData.total_scholars || 0).toLocaleString(
                        "en-PH",
                      )}
                    </span>
                  </div>
                  <div className="h-9 w-px bg-white/25" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/75 font-semibold block">
                      Partner Schools
                    </span>
                    <span className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight text-white">
                      {(dashboardData.total_schools || 0).toLocaleString(
                        "en-PH",
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Flowing Gradient Green Wave Backdrop + Frosted Glass Analytics Section */}
      <div className="relative w-full overflow-hidden flex-grow flex flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden blur-[28px] sm:blur-[36px]"
        >
          {/* Soft Ambient Green-Gold Atmospheric Glows */}
          <div className="absolute -top-32 -left-32 w-[620px] h-[620px] rounded-full bg-[#71951E]/18 blur-[120px]" />
          <div className="absolute top-[32%] -right-32 w-[680px] h-[680px] rounded-full bg-[#587529]/16 blur-[130px]" />
          <div className="absolute -bottom-32 left-[18%] w-[640px] h-[520px] rounded-full bg-[#EDDA5E]/22 blur-[120px]" />

          {/* Huge Upper Flowing Soft Olive Wave (200% seamless loop) */}
          <svg
            viewBox="0 0 2880 720"
            preserveAspectRatio="none"
            className="animate-wave-slow absolute -top-12 left-0 w-[200%] h-[620px] sm:h-[780px]"
          >
            <defs>
              <linearGradient id="waveGreenTopSoft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#88AA3B" stopOpacity="0.06" />
                <stop offset="35%" stopColor="#71951E" stopOpacity="0.22" />
                <stop offset="70%" stopColor="#587529" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#EDDA5E" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M0,260 C360,100 720,420 1080,260 C1260,180 1350,220 1440,260 C1800,100 2160,420 2520,260 C2700,180 2790,220 2880,260 L2880,580 C2520,700 2160,440 1800,580 C1620,650 1530,615 1440,580 C1080,700 720,440 360,580 C180,650 90,615 0,580 Z"
              fill="url(#waveGreenTopSoft)"
            />
          </svg>

          {/* Upper Counter-Flowing Sage-Butter Ribbon */}
          <svg
            viewBox="0 0 2880 720"
            preserveAspectRatio="none"
            className="animate-wave-reverse absolute top-[6%] left-0 w-[200%] h-[580px] sm:h-[720px]"
          >
            <defs>
              <linearGradient id="waveSageCounter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94B547" stopOpacity="0.16" />
                <stop offset="50%" stopColor="#71951E" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#EDDA5E" stopOpacity="0.14" />
              </linearGradient>
            </defs>
            <path
              d="M0,320 C360,480 720,160 1080,320 C1260,400 1350,360 1440,320 C1800,480 2160,160 2520,320 C2700,400 2790,360 2880,320 L2880,640 C2520,520 2160,720 1800,600 C1620,540 1530,590 1440,640 C1080,520 720,720 360,600 C180,540 90,590 0,640 Z"
              fill="url(#waveSageCounter)"
            />
          </svg>

          {/* Huge Mid-Page Sweeping Emerald Wave behind Charts & Schools */}
          <svg
            viewBox="0 0 2880 800"
            preserveAspectRatio="none"
            className="animate-wave-slow absolute top-[30%] left-0 w-[200%] h-[680px] sm:h-[860px]"
          >
            <defs>
              <linearGradient id="waveGreenMidSoft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#71951E" stopOpacity="0.04" />
                <stop offset="40%" stopColor="#587529" stopOpacity="0.22" />
                <stop offset="75%" stopColor="#8DB03D" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#F4BE38" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <path
              d="M0,280 C360,100 720,460 1080,280 C1260,190 1350,235 1440,280 C1800,100 2160,460 2520,280 C2700,190 2790,235 2880,280 L2880,660 C2520,780 2160,500 1800,660 C1620,740 1530,700 1440,660 C1080,780 720,500 360,660 C180,740 90,700 0,660 Z"
              fill="url(#waveGreenMidSoft)"
            />
          </svg>

          {/* Lower Soft Olive-Gold Wave behind Graduates & Footer */}
          <svg
            viewBox="0 0 2880 680"
            preserveAspectRatio="none"
            className="animate-wave-reverse absolute -bottom-10 left-0 w-[200%] h-[560px] sm:h-[720px]"
          >
            <defs>
              <linearGradient id="waveGreenBottomSoft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#71951E" stopOpacity="0.02" />
                <stop offset="45%" stopColor="#587529" stopOpacity="0.2" />
                <stop offset="80%" stopColor="#8DB03D" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#EDDA5E" stopOpacity="0.14" />
              </linearGradient>
            </defs>
            <path
              d="M0,220 C360,80 720,380 1080,220 C1260,140 1350,180 1440,220 C1800,80 2160,380 2520,220 C2700,140 2790,180 2880,220 L2880,680 L0,680 Z"
              fill="url(#waveGreenBottomSoft)"
            />
          </svg>
        </div>

      {/* Public Analytics Section */}
      <main
        id="statistics"
        className="relative z-10 flex-grow w-full px-4 sm:px-6 lg:px-10 py-10 space-y-8 scroll-mt-16"
      >
        {dataNotAvailable && (
          <Card className="border-highlight/70 bg-highlight/20">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-foreground mb-1">
                  Data is not available yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Public dashboard statistics will appear once the Supabase RPC
                  functions are configured.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {dashboardData?.available && (
          <>
            {/* Top 4 KPI Cards */}
            <div className="gsap-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="gsap-kpi-card glass-frosted-card border-t-4 border-t-[#587529]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center">
                      <Users className="w-5 h-5 text-brand" />
                    </div>
                    <Badge variant="default">Total</Badge>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Scholars
                  </p>
                  <p
                    className="text-3xl font-black text-foreground mt-1 tabular-nums"
                    data-gsap-count={dashboardData.total_scholars || 0}
                  >
                    {(dashboardData.total_scholars || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/70">
                    Registered program beneficiaries
                  </p>
                </CardContent>
              </Card>

              <Card className="gsap-kpi-card glass-frosted-card border-t-4 border-t-[#71951E]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand text-brand-foreground flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <Badge variant="success">
                      {safePercentage(
                        dashboardData.active_scholars || 0,
                        dashboardData.total_scholars,
                      ).toFixed(1)}
                      % Enrolled
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Scholars
                  </p>
                  <p
                    className="text-3xl font-black text-foreground mt-1 tabular-nums"
                    data-gsap-count={dashboardData.active_scholars || 0}
                  >
                    {(dashboardData.active_scholars || 0).toLocaleString()}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-border/70">
                    <Progress
                      value={safePercentage(
                        dashboardData.active_scholars || 0,
                        dashboardData.total_scholars,
                      )}
                      className="h-1.5"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="gsap-kpi-card glass-frosted-card border-t-4 border-t-[#F4BE38]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-highlight text-highlight-foreground flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <Badge variant="gold">
                      {safePercentage(
                        dashboardData.graduated_scholars || 0,
                        dashboardData.total_scholars,
                      ).toFixed(1)}
                      % Alumni
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Graduates
                  </p>
                  <p
                    className="text-3xl font-black text-foreground mt-1 tabular-nums"
                    data-gsap-count={dashboardData.graduated_scholars || 0}
                  >
                    {(dashboardData.graduated_scholars || 0).toLocaleString()}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-border/70">
                    <Progress
                      value={safePercentage(
                        dashboardData.graduated_scholars || 0,
                        dashboardData.total_scholars,
                      )}
                      className="h-1.5 [&>div]:bg-[#F4BE38]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="gsap-kpi-card glass-frosted-card border-t-4 border-t-[#EDDA5E]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-soft/60 border border-highlight/40 flex items-center justify-center">
                      <School className="w-5 h-5 text-foreground" />
                    </div>
                    <Badge variant="secondary">Partners</Badge>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Partner Schools
                  </p>
                  <p
                    className="text-3xl font-black text-foreground mt-1 tabular-nums"
                    data-gsap-count={dashboardData.total_schools || 0}
                  >
                    {(dashboardData.total_schools || 0).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/70">
                    Colleges &amp; universities nationwide
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Demographic & Equity Breakdown Row */}
            <div className="gsap-demo-grid grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="gsap-demo-card glass-frosted-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-highlight/25 border border-highlight/50 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          PWD Scholars
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Accessibility support cohort
                        </p>
                      </div>
                    </div>
                    <Badge variant="gold" className="tabular-nums">
                      {safePercentage(
                        dashboardData.pwd_count || 0,
                        dashboardData.total_scholars,
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <p
                      className="text-3xl font-black text-foreground tabular-nums"
                      data-gsap-count={dashboardData.pwd_count || 0}
                    >
                      {dashboardData.pwd_count || 0}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      of {dashboardData.total_scholars || 0} scholars
                    </span>
                  </div>

                  <Progress
                    value={safePercentage(
                      dashboardData.pwd_count || 0,
                      dashboardData.total_scholars,
                    )}
                    className="h-2"
                  />
                </CardContent>
              </Card>

              <Card className="gsap-demo-card glass-frosted-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-soft/45 border border-brand-soft flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Solo Parent Scholars
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Single-parent households
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="tabular-nums">
                      {safePercentage(
                        dashboardData.solo_parent_count || 0,
                        dashboardData.total_scholars,
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <p
                      className="text-3xl font-black text-foreground tabular-nums"
                      data-gsap-count={dashboardData.solo_parent_count || 0}
                    >
                      {dashboardData.solo_parent_count || 0}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      of {dashboardData.total_scholars || 0} scholars
                    </span>
                  </div>

                  <Progress
                    value={safePercentage(
                      dashboardData.solo_parent_count || 0,
                      dashboardData.total_scholars,
                    )}
                    className="h-2 [&>div]:bg-[#F4BE38]"
                  />
                </CardContent>
              </Card>

              <Card className="gsap-demo-card glass-frosted-card">
                <CardContent className="p-6 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Gender Distribution
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Proportional scholar split
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand tabular-nums">
                      {dashboardData.total_scholars || 0} total
                    </span>
                  </div>

                  {/* Proportional Split Bar */}
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
                    <div
                      className="h-full bg-[#587529] transition-all duration-500"
                      style={{
                        width: `${safePercentage(
                          dashboardData.male_count || 0,
                          dashboardData.total_scholars,
                        )}%`,
                      }}
                    />
                    <div
                      className="h-full bg-[#F4BE38] transition-all duration-500"
                      style={{
                        width: `${safePercentage(
                          dashboardData.female_count || 0,
                          dashboardData.total_scholars,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="px-3 py-2 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Male
                        </p>
                        <p
                          className="text-xl font-black text-brand tabular-nums"
                          data-gsap-count={dashboardData.male_count || 0}
                        >
                          {dashboardData.male_count || 0}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-brand tabular-nums">
                        {safePercentage(
                          dashboardData.male_count || 0,
                          dashboardData.total_scholars,
                        ).toFixed(1)}
                        %
                      </span>
                    </div>

                    <div className="px-3 py-2 rounded-xl bg-highlight/20 border border-highlight/50 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground">
                          Female
                        </p>
                        <p
                          className="text-xl font-black text-foreground tabular-nums"
                          data-gsap-count={dashboardData.female_count || 0}
                        >
                          {dashboardData.female_count || 0}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-foreground/85 tabular-nums">
                        {safePercentage(
                          dashboardData.female_count || 0,
                          dashboardData.total_scholars,
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics & Charts Section (Tremor BarList + Shadcn Charts) */}
            {(() => {
              const topSchools = (
                dashboardData.scholars_per_school || []
              ).slice(0, 10);
              const maxSchoolCount = Math.max(
                ...topSchools.map((s) => s.count || 0),
                1,
              );
              const yearData = dashboardData.scholars_per_year_level || [];
              const peakYear = yearData.reduce(
                (best, cur) =>
                  (cur.count || 0) > (best?.count || 0) ? cur : best,
                null,
              );
              const paidCount = dashboardData.paid_count || 0;
              const processingCount = dashboardData.processing_count || 0;
              const paymentTotal = paidCount + processingCount;
              const paidShare = safePercentage(paidCount, paymentTotal);
              const processingShare = safePercentage(
                processingCount,
                paymentTotal,
              );
              const paymentChartData = [
                {
                  status: "Paid",
                  value: paidCount,
                  fill: CHART_COLORS.oliveDark,
                },
                {
                  status: "Processing",
                  value: processingCount,
                  fill: CHART_COLORS.amber,
                },
              ];

              return (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left: Tremor-Style Ranked School BarList */}
                  <Card className="gsap-schools-card lg:col-span-6 glass-frosted-card flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div>
                          <h3 className="text-lg font-extrabold text-foreground">
                            Scholars per School (Top 10)
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Ranked partner institutions by scholar headcount
                          </p>
                        </div>
                        <Badge variant="default" className="tabular-nums">
                          {topSchools.length} Listed
                        </Badge>
                      </div>

                      <div className="space-y-3 flex-1">
                        {topSchools.map((school, idx) => {
                          const barWidth = Math.max(
                            4,
                            ((school.count || 0) / maxSchoolCount) * 100,
                          );
                          const schoolShare = safePercentage(
                            school.count || 0,
                            dashboardData.total_scholars,
                          );
                          return (
                            <div
                              key={school.school_name || idx}
                              className="gsap-school-row group space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                                      idx < 3
                                        ? "bg-brand text-white"
                                        : "bg-[#F2F4EA] text-muted-foreground"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <span
                                    className="font-semibold text-foreground truncate"
                                    title={school.school_name}
                                  >
                                    {school.school_name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 tabular-nums">
                                  <span className="text-[11px] text-muted-foreground">
                                    {schoolShare.toFixed(1)}%
                                  </span>
                                  <span className="font-extrabold text-brand min-w-[2.25rem] text-right">
                                    {(school.count || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[#F2F4EA] overflow-hidden">
                                <div
                                  className="gsap-school-bar h-full rounded-full"
                                  style={{
                                    width: `${barWidth}%`,
                                    background:
                                      idx < 3
                                        ? "linear-gradient(90deg, #587529 0%, #71951E 100%)"
                                        : "linear-gradient(90deg, #71951E 0%, #A9BD54 100%)",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right Column: Shadcn Year Level Bar Chart + Center-Label Donut */}
                  <div className="gsap-charts-col lg:col-span-6 flex flex-col gap-6">
                    <Card className="gsap-chart-card glass-frosted-card">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-lg font-extrabold text-foreground">
                              Scholars per Year Level
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Distribution across academic standing
                            </p>
                          </div>
                          {peakYear && (
                            <Badge variant="gold" className="tabular-nums">
                              Peak: {peakYear.year_level}
                            </Badge>
                          )}
                        </div>

                        <ChartContainer
                          config={yearLevelChartConfig}
                          className="h-[195px] w-full aspect-auto"
                        >
                          <BarChart
                            data={yearData}
                            margin={{ top: 22, right: 8, left: 8, bottom: 4 }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                            />
                            <XAxis
                              dataKey="year_level"
                              tickLine={false}
                              tickMargin={8}
                              axisLine={false}
                            />
                            <ChartTooltip
                              cursor={{ fill: "rgba(88, 117, 41, 0.08)" }}
                              content={
                                <ChartTooltipContent valueSuffix=" scholars" />
                              }
                            />
                            <Bar
                              dataKey="count"
                              fill="var(--color-count)"
                              radius={[8, 8, 0, 0]}
                              maxBarSize={54}
                            >
                              <LabelList
                                dataKey="count"
                                position="top"
                                offset={8}
                                className="fill-foreground text-[11px] font-bold"
                              />
                            </Bar>
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    <Card className="gsap-chart-card glass-frosted-card flex-1">
                      <CardContent className="p-6 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="text-lg font-extrabold text-foreground">
                              Payment Status
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Disbursement progress across active grants
                            </p>
                          </div>
                          <Badge variant="success" className="tabular-nums">
                            {paidShare.toFixed(1)}% Disbursed
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          <div className="sm:col-span-5 flex justify-center">
                            <ChartContainer
                              config={paymentChartConfig}
                              className="h-[175px] w-[175px] aspect-square"
                            >
                              <PieChart>
                                <ChartTooltip
                                  cursor={false}
                                  content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                  data={paymentChartData}
                                  dataKey="value"
                                  nameKey="status"
                                  innerRadius={52}
                                  outerRadius={74}
                                  paddingAngle={4}
                                  strokeWidth={2}
                                  stroke="#ffffff"
                                >
                                  {paymentChartData.map((entry, idx) => (
                                    <Cell
                                      key={entry.status || idx}
                                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                                    />
                                  ))}
                                  <Label
                                    content={({ viewBox }) => {
                                      if (
                                        viewBox &&
                                        "cx" in viewBox &&
                                        "cy" in viewBox
                                      ) {
                                        return (
                                          <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                          >
                                            <tspan
                                              x={viewBox.cx}
                                              y={viewBox.cy - 4}
                                              className="fill-foreground text-2xl font-black tabular-nums"
                                            >
                                              {paymentTotal.toLocaleString()}
                                            </tspan>
                                            <tspan
                                              x={viewBox.cx}
                                              y={viewBox.cy + 16}
                                              className="fill-muted-foreground text-[11px] font-semibold"
                                            >
                                              Active
                                            </tspan>
                                          </text>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                </Pie>
                              </PieChart>
                            </ChartContainer>
                          </div>

                          <div className="sm:col-span-7 space-y-3">
                            <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/25 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#587529]" />
                                  <span className="text-xs font-bold text-foreground">
                                    Paid
                                  </span>
                                </div>
                                <div className="flex items-baseline gap-2 tabular-nums">
                                  <span className="text-lg font-black text-brand">
                                    {paidCount.toLocaleString()}
                                  </span>
                                  <span className="text-[11px] font-semibold text-muted-foreground">
                                    ({paidShare.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                              <Progress value={paidShare} className="h-1.5" />
                            </div>

                            <div className="p-3.5 rounded-xl bg-highlight/20 border border-highlight/50 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4BE38]" />
                                  <span className="text-xs font-bold text-foreground">
                                    Processing
                                  </span>
                                </div>
                                <div className="flex items-baseline gap-2 tabular-nums">
                                  <span className="text-lg font-black text-foreground">
                                    {processingCount.toLocaleString()}
                                  </span>
                                  <span className="text-[11px] font-semibold text-muted-foreground">
                                    ({processingShare.toFixed(1)}%)
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={processingShare}
                                className="h-1.5 [&>div]:bg-[#F4BE38]"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Graduates Section */}
        <Card id="graduates" className="glass-frosted-card scroll-mt-24">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground mb-1">
                  <SplitWords text="Graduates" wordClassName="gsap-grad-word" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Celebrating our scholars who have completed their studies
                </p>
              </div>
              {graduatesData?.available && graduatesData.schools.length > 0 && (
                <Badge variant="gold" className="self-start sm:self-auto">
                  {graduatesData.schools.length} Institutions
                </Badge>
              )}
            </div>

            {graduatesData?.available && graduatesData.schools.length > 0 && (
              <div className="gsap-grad-banner p-6 rounded-2xl gradient-emerald-gold-soft border border-brand/25">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Total Graduated Scholars
                    </p>
                    <p
                      className="text-3xl font-black text-foreground tabular-nums"
                      data-gsap-count={graduatesData.schools.reduce(
                        (sum, school) => sum + (school.graduate_count || 0),
                        0,
                      )}
                    >
                      {graduatesData.schools
                        .reduce(
                          (sum, school) => sum + (school.graduate_count || 0),
                          0,
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Total Scholarship Support
                    </p>
                    <p
                      className="text-3xl font-black text-brand tabular-nums"
                      data-gsap-count={graduatesData.schools.reduce(
                        (sum, school) =>
                          sum + (school.total_scholarship_amount || 0),
                        0,
                      )}
                      data-gsap-decimals="2"
                      data-gsap-prefix="PHP "
                    >
                      PHP{" "}
                      {graduatesData.schools
                        .reduce(
                          (sum, school) =>
                            sum + (school.total_scholarship_amount || 0),
                          0,
                        )
                        .toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!graduatesData?.available || graduatesData.schools.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No graduates yet.</p>
              </div>
            ) : (
              (() => {
                const sortedGradSchools = [...graduatesData.schools].sort(
                  (a, b) => (b.graduate_count || 0) - (a.graduate_count || 0),
                );
                const maxGradCount = Math.max(
                  ...sortedGradSchools.map((s) => s.graduate_count || 0),
                  1,
                );
                return (
                  <div className="gsap-grad-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sortedGradSchools.map((school, index) => {
                      const fillPct = Math.max(
                        6,
                        ((school.graduate_count || 0) / maxGradCount) * 100,
                      );
                      return (
                        <div
                          key={school.school_name || index}
                          className="gsap-grad-card p-4 rounded-xl bg-white/55 backdrop-blur-xl border border-white/80 hover:border-brand/40 hover:bg-white/70 transition-all shadow-[0_6px_22px_rgba(88,117,41,0.08)] flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-4 h-4 text-brand" />
                              </div>
                              <div className="min-w-0">
                                <h3
                                  className="text-sm font-bold text-foreground truncate"
                                  title={school.school_name}
                                >
                                  {school.school_name}
                                </h3>
                                <p className="text-xs font-extrabold text-brand tabular-nums mt-0.5">
                                  PHP{" "}
                                  {(
                                    school.total_scholarship_amount || 0
                                  ).toLocaleString("en-PH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="gold"
                              className="flex-shrink-0 tabular-nums"
                            >
                              {school.graduate_count}{" "}
                              {school.graduate_count === 1
                                ? "graduate"
                                : "graduates"}
                            </Badge>
                          </div>

                          <div className="h-1.5 w-full rounded-full bg-[#F2F4EA] overflow-hidden">
                            <div
                              className="gsap-grad-bar h-full rounded-full bg-gradient-to-r from-[#587529] to-[#F4BE38]"
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="gsap-footer relative z-10 border-t border-white/75 py-7 bg-white/55 backdrop-blur-2xl">
        <div className="w-full px-4 sm:px-6 lg:px-10 space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo/ict-logo.png"
                alt="Palayan City ICT Division Logo"
                className="h-11 w-11 object-contain flex-shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Developed &amp; Powered by
                </span>
                <p className="text-xs font-bold text-foreground leading-tight">
                  Palayan City ICT Division
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Information &amp; Communications Technology Division
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src="/logo/npc.png"
                alt="National Privacy Commission Seal"
                className="h-11 w-auto object-contain flex-shrink-0"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Data Privacy Compliance
                </span>
                <p className="text-xs font-bold text-foreground leading-tight">
                  National Privacy Commission
                </p>
                <p className="text-[11px] text-muted-foreground">
                  RA 10173 · Registered &amp; Certified
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <img
                src="/logo/iskolayan-square-light.png"
                alt="IskoLayan Logo"
                className="w-5 h-5 rounded object-contain"
              />
              <span>IskoLayan: Palayan City Scholarship Management System</span>
            </div>
            <span>All public metrics are aggregate-only</span>
          </div>
        </div>
      </footer>
      </div>

      {/* Custom Admin Login Prompt Modal */}
      <AdminLoginDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
      />
    </div>
  );
};

export default LandingPage;
