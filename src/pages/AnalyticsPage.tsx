// src/pages/Analytics.tsx
import React from "react"
import { Link } from "react-router-dom"

type KPI = { label: string; value: string; sublabel?: string }
type Point = { x: string; y: number }

const kpis: KPI[] = [
  { label: "MRR", value: "$6,400", sublabel: "+4.3% MoM" },
  { label: "Active Workspaces", value: "41", sublabel: "+3 this week" },
  { label: "Avg. Report Time", value: "1.8m", sublabel: "-22% vs. last wk" },
  { label: "Cash Burn (net)", value: "$-3.2k", sublabel: "Runway: 8.5 mo" }
]

const revenueTrend: Point[] = [
  { x: "Mar", y: 19.2 }, { x: "Apr", y: 21.1 }, { x: "May", y: 22.9 },
  { x: "Jun", y: 24.7 }, { x: "Jul", y: 25.8 }, { x: "Aug", y: 28.3 }
]

const cashBars: Point[] = [
  { x: "Apr", y: 6.1 }, { x: "May", y: 5.4 }, { x: "Jun",
