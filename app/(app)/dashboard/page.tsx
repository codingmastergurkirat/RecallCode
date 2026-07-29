import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CreditCard,
  Flame,
  Layers3,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { Card } from "@/components/ui/card";
import { requireUser, getCurrentProfile } from "@/services/auth.service";
import { getDashboardData } from "@/services/dashboard.service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [user, profile] = await Promise.all([
    requireUser(),
    getCurrentProfile(),
  ]);
  const { stats, progress, activity } = await getDashboardData(user.id);
  const firstName = (
    profile?.full_name ??
    user.user_metadata.full_name ??
    user.email?.split("@")[0] ??
    "there"
  ).split(" ")[0];
  const weakPatterns = [...progress]
    .filter((item) => item.attempted > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  const statCards = [
    {
      label: "Problems solved",
      value: stats.totalSolved,
      helper: "Unique accepted",
      icon: CheckCircle2,
    },
    {
      label: "Reviews today",
      value: stats.reviewsToday,
      helper: stats.reviewsToday ? "Ready now" : "All caught up",
      icon: BrainCircuit,
    },
    {
      label: "Flashcards",
      value: stats.flashcards,
      helper: "In your deck",
      icon: CreditCard,
    },
    {
      label: "Current streak",
      value: `${stats.currentStreak}d`,
      helper: "Keep showing up",
      icon: Flame,
    },
    {
      label: "Pattern mastery",
      value: `${Math.round(stats.averageMastery)}%`,
      helper: "Across practiced patterns",
      icon: Layers3,
    },
  ];

  return (
    <div className="page-shell dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span className="page-kicker">LEARNING OVERVIEW</span>
          <h1>Good to see you, {firstName}.</h1>
          <p>One focused session is enough to move the curve.</p>
        </div>
        <Link className="button button-primary button-md" href="/problems">
          Solve a problem
          <ArrowRight size={17} />
        </Link>
      </section>

      <section className="stats-grid" aria-label="Learning statistics">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card className="stat-card" key={stat.label}>
              <div className="stat-icon">
                <Icon size={19} />
              </div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.helper}</small>
            </Card>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <Card className="dashboard-card activity-card">
          <div className="card-heading-row">
            <div>
              <span className="card-kicker">MOMENTUM</span>
              <h2>Learning activity</h2>
            </div>
            <span className="range-pill">14 days</span>
          </div>
          <ActivityChart data={activity} />
          <div className="chart-legend">
            <span>
              <i className="legend-orange" /> Problems solved
            </span>
            <span>
              <i className="legend-black" /> Reviews
            </span>
          </div>
        </Card>

        <Card className="dashboard-card due-card">
          <div className="due-orb">
            <span>{stats.reviewsToday}</span>
            <small>due</small>
          </div>
          <div>
            <span className="card-kicker">TODAY&apos;S REVIEWS</span>
            <h2>
              {stats.reviewsToday
                ? "Your recall window is open."
                : "Memory loop complete."}
            </h2>
            <p>
              {stats.reviewsToday
                ? "Review now while retrieval is effortful and useful."
                : "Solve a problem to generate your next review set."}
            </p>
          </div>
          <Link
            className="button button-secondary button-md"
            href={stats.reviewsToday ? "/reviews" : "/problems"}
          >
            {stats.reviewsToday ? "Start review" : "Browse problems"}
            <ArrowRight size={17} />
          </Link>
        </Card>
      </section>

      <section className="dashboard-grid lower-grid">
        <Card className="dashboard-card mastery-card">
          <div className="card-heading-row">
            <div>
              <span className="card-kicker">PATTERN MASTERY</span>
              <h2>Your strongest mental models</h2>
            </div>
            <Link href="/problems">View library</Link>
          </div>
          {progress.length ? (
            <div className="mastery-dashboard-list">
              {progress.slice(0, 5).map((pattern) => (
                <div key={pattern.slug}>
                  <div>
                    <span>{pattern.name}</span>
                    <small>
                      {pattern.solved} solved · {pattern.attempted} attempted
                    </small>
                  </div>
                  <div className="dashboard-progress-track">
                    <i style={{ width: `${pattern.mastery}%` }} />
                  </div>
                  <strong>{Math.round(pattern.mastery)}%</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-inline-empty">
              <Layers3 size={22} />
              <div>
                <strong>Your pattern map starts with one solve.</strong>
                <span>Complete a problem to see mastery take shape.</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="dashboard-card weak-card">
          <div className="weak-card-icon">
            <Sparkles size={21} />
          </div>
          <span className="card-kicker">FOCUS NEXT</span>
          <h2>Weak patterns</h2>
          {weakPatterns.length ? (
            <ul>
              {weakPatterns.map((pattern) => (
                <li key={pattern.slug}>
                  <span>{pattern.name}</span>
                  <strong>{Math.round(pattern.mastery)}%</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Practice two or more patterns and RecallCode will surface the
              highest-impact next move.
            </p>
          )}
          <Link href="/problems?focus=weak">
            Find a focus problem <ArrowRight size={16} />
          </Link>
        </Card>
      </section>
    </div>
  );
}
