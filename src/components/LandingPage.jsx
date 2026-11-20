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
import { LandingPageSkeleton } from "./SkeletonScreens";
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
  const { user } = useAuth();
  const rootRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [graduatesData, setGraduatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

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
    if (user) {
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

  // Hero entrance choreography runs synchronously before paint so the hero never flashes visible first
  useLayoutEffect(() => {
    if (loading || !rootRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({
        defaults: {
          ease: 'power2.out',
          force3D: true,
          clearProps: "transform,opacity,filter",
        },
      });

      heroTl
        .fromTo(
          '.gsap-nav-header',
          { yPercent: -100, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.95, ease: 'expo.out' }
        )
        .fromTo(
          '.gsap-nav-item',
          { y: -14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.09, ease: 'power2.out' },
          0.25
        )
        .fromTo(
          '.gsap-hero-logo',
          { scale: 0.92, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 1.05, ease: 'power2.out' },
          0.18
        )
        .fromTo(
          '.gsap-hero-word',
          { yPercent: 55, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.06,
            ease: 'power2.out',
          },
          0.32
        )
        .fromTo(
          '.gsap-hero-subtitle',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.95, ease: 'power2.out' },
          0.62
        )
        .fromTo(
          '.gsap-hero-cta',
          { y: 16, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power2.out' },
          0.82
        )
        .fromTo(
          '.gsap-hero-pillar',
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.95, stagger: 0.14, ease: 'power2.out' },
          0.95
        )
        .fromTo(
          '.gsap-hero-compliance',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out' },
          1.22
        )
    }, rootRef)

    return () => {
      ctx.revert();
    };
  }, [loading]);

  useLayoutEffect(() => {
    if (loading || !rootRef.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const observers = [];

    const ctx = gsap.context(() => {
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

  if (loading) {
    return <LandingPageSkeleton />;
  }

  const dataNotAvailable =
    !dashboardData?.available || !graduatesData?.available;

  return (
    <div
      ref={rootRef}
      className="bg-frosted-canvas min-h-screen flex flex-col w-full"
    >
      {/* Frosted Top Navigation */}
      <header className="gsap-nav-header glass-header sticky top-0 z-40 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between gap-4">
          <div className="gsap-nav-item flex items-center gap-3 min-w-0 w-full justify-self-start">
            <img
              src="/logo/iskolayan-square-light.png"
              alt="IskoLayan Logo"
              className="w-10 h-10 rounded-xl object-contain flex-shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-foreground block leading-tight truncate">
                IskoLayan
              </span>
              <span className="text-[11px] text-muted-foreground font-medium block truncate">
                Palayan City Scholarship Management System
              </span>
            </div>
          </div>

          <nav className="gsap-nav-item hidden md:flex items-center justify-center gap-1 justify-self-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("overview")}
            >
              Overview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("statistics")}
            >
              Public Statistics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection("graduates")}
            >
              Graduates
            </Button>
          </nav>

          <Button
            variant="default"
            size="sm"
            onClick={handleDashboardClick}
            className="gsap-nav-item rounded-xl px-4 flex-shrink-0 justify-self-end"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Landing Hero Section with Palayan City Seal */}
      <section
        id="overview"
        className="relative overflow-hidden border-b border-border/80"
      >
        <div className="w-80 h-80 rounded-full bg-brand/20 blur-[120px] absolute -top-12 left-8 pointer-events-none animate-float-slow" />
        <div className="w-80 h-80 rounded-full bg-highlight/25 blur-[120px] absolute -bottom-16 right-8 pointer-events-none animate-float-slow" />

        <div className="relative w-full px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto text-center">
            {/* IskoLayan Logo */}
            <div className="gsap-hero-logo flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#587529]/30 via-[#EDDA5E]/35 to-[#F4BE38]/35 blur-lg" />
                <img
                  src="/logo/iskolayan-square-light.png"
                  alt="IskoLayan Official Logo"
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-contain shadow-xl shadow-[#587529]/15 transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground mb-4 leading-[1.12] [perspective:800px]">
              <SplitWords text="IskoLayan:" />{" "}
              <SplitWords
                text="Palayan City Scholarship Management System"
                className="text-brand"
              />
            </h1>

            <p className="gsap-hero-subtitle text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Empowering Palayan City scholars through transparent financial aid
              tracking, academic performance monitoring, and partner-institution
              coordination.
            </p>

            <div className="gsap-hero-cta flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToSection("statistics")}
                className="h-11 px-7 text-sm sm:text-base rounded-xl w-full sm:w-auto"
              >
                <span>View Public Statistics</span>
              </Button>
            </div>

            {/* Landing Feature Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <Card className="gsap-hero-pillar glass-card-hover">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-foreground">
                    Live Public Transparency
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Aggregate scholarship counts, school distributions, and
                    disbursement progress updated directly from Supabase.
                  </p>
                </CardContent>
              </Card>

              <Card className="gsap-hero-pillar glass-card-hover">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-foreground">
                    Academic Continuity
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Multi-semester grade history tracking across GWA and
                    percentage scales for all partner colleges.
                  </p>
                </CardContent>
              </Card>

              <Card className="gsap-hero-pillar glass-card-hover">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-foreground">
                    Privacy-First Records
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Individual scholar profiles stay protected behind
                    authenticated LGU administrator login.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Powered by ICT Division & NPC Seal Compliance Strip */}
            <div className="gsap-hero-compliance mt-7 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-border/90 shadow-[0_6px_24px_rgba(88,117,41,0.08)]">
              <div className="flex items-center gap-2.5 text-left">
                <img
                  src="/logo/ict-logo.png"
                  alt="Palayan City ICT Division Logo"
                  className="h-8 w-8 object-contain flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
                    Powered by
                  </span>
                  <span className="text-xs font-bold text-foreground block leading-tight">
                    Palayan City ICT Division
                  </span>
                </div>
              </div>

              <div className="hidden sm:block h-6 w-px bg-border" />

              <div className="flex items-center gap-2.5 text-left">
                <img
                  src="/logo/npc.png"
                  alt="National Privacy Commission Seal"
                  className="h-8 w-auto object-contain flex-shrink-0"
                />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block leading-none mb-0.5">
                    Data Privacy Compliance
                  </span>
                  <span className="text-xs font-bold text-foreground block leading-tight">
                    National Privacy Commission (RA 10173)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Analytics Section */}
      <main
        id="statistics"
        className="flex-grow w-full px-4 sm:px-6 lg:px-10 py-10 space-y-8"
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
              <Card className="gsap-kpi-card glass-card-hover border-t-4 border-t-[#587529]">
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

              <Card className="gsap-kpi-card glass-card-hover border-t-4 border-t-[#71951E]">
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

              <Card className="gsap-kpi-card glass-card-hover border-t-4 border-t-[#F4BE38]">
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

              <Card className="gsap-kpi-card glass-card-hover border-t-4 border-t-[#EDDA5E]">
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
              <Card className="gsap-demo-card glass-card-hover">
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

              <Card className="gsap-demo-card glass-card-hover">
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

              <Card className="gsap-demo-card glass-card-hover">
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
                  <Card className="gsap-schools-card lg:col-span-6 glass-card-hover flex flex-col">
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
                    <Card className="gsap-chart-card glass-card-hover">
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

                    <Card className="gsap-chart-card glass-card-hover flex-1">
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
        <Card id="graduates">
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
                          className="gsap-grad-card p-4 rounded-xl bg-white/90 border border-border hover:border-brand/40 transition-colors shadow-sm flex flex-col justify-between gap-3"
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

      <footer className="gsap-footer border-t border-border py-7 bg-white/90 backdrop-blur-md">
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

      {/* Custom Admin Login Prompt Modal */}
      <AdminLoginDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
      />
    </div>
  );
};

export default LandingPage;
