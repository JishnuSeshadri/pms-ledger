import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  X,
  ArrowUpDown,
  Calculator as CalcIcon,
  LayoutList,
  Info,
  Plus,
  Minus,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* REAL DATA — PMS Reckoner (Bank-approved list), as on 30 June 2026   */
/* Source: uploaded PDF "PMS_Reckoner_-_July_2026.pdf"                 */
/* Fund manager names, strategy, holdings & AUM all from that document.*/
/* Returns table includes both Portfolio and Benchmark (BM) figures.   */
/* ------------------------------------------------------------------ */
const FUNDS = [
  {
    scheme: "Carnelian Capital Compounder PMS", provider: "Carnelian Asset Management",
    managers: ["Vikas Khemani"], aum: 2155, inception: "May 2019", benchmarkName: "BSE 500 TRI",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and Carnelian's own investor materials.",
    strategy: "Flexicap (blend of large, mid & small cap, 50:30:20) listed companies, sector-agnostic strategy focusing on capturing the \u201Ctrillion-dollar India opportunity.\u201D",
    capLarge: 26.7, capMid: 46.5, capSmall: 25.2, capMicro: null,
    holdings: [
      { name: "Aditya Birla Capital", weight: 10.4 }, { name: "Laurus Labs", weight: 7.7 }, { name: "Biocon", weight: 7.6 },
      { name: "Bharat Heavy Electricals Ltd", weight: 4.6 }, { name: "Yatharth Hospital", weight: 4.2 }, { name: "Star Health", weight: 4.1 },
      { name: "ONE 97 Communications", weight: 4.1 }, { name: "Larsen & Toubro", weight: 3.9 }, { name: "ICICI Bank", weight: 3.8 },
      { name: "Endurance Technologies", weight: 3.4 },
    ],
    r1m: 4.1, bm1m: 1.7, r3m: 22.3, bm3m: 12.1, r6m: 3.8, bm6m: -3.5, r1y: 12.0, bm1y: -2.0, r2y: 11.8, bm2y: 1.5, r3y: 23.5, bm3y: 12.5, r5y: 17.6, bm5y: 12.2, si: 19.3, bmsi: 14.9,
  },
  {
    scheme: "Abakkus Diversified Alpha Approach", provider: "Abakkus Asset Manager",
    managers: ["Sunil Singhania", "Aman Chowhan", "Hitesh Arora"], aum: 1328, inception: "Jan 2024", benchmarkName: "BSE 500 TRI",
    minInvestment: "\u20B950 lacs", exitLoad: "1.5% within 12 months, Nil after",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and Abakkus's own investor deck.",
    strategy: "Flexicap PMS following the MEETS framework.",
    capLarge: 47.7, capMid: 17.5, capSmall: 28.5, capMicro: 2.6,
    holdings: [
      { name: "Aditya Birla Capital Ltd", weight: null }, { name: "Cummins India Ltd", weight: null }, { name: "Axis Bank Ltd", weight: null },
      { name: "Larsen & Toubro Ltd", weight: null }, { name: "PNB Housing Finance Ltd", weight: null }, { name: "Vedanta Aluminium Metal Ltd", weight: null },
      { name: "State Bank of India", weight: null }, { name: "NTPC Ltd", weight: null }, { name: "Bharti Airtel Ltd", weight: null },
      { name: "HDFC Bank Ltd", weight: null },
    ],
    r1m: 3.7, bm1m: 1.7, r3m: 21.4, bm3m: 12.1, r6m: 6.4, bm6m: -3.5, r1y: 8.8, bm1y: -2.0, r2y: 4.77, bm2y: 1.52, r3y: null, bm3y: null, r5y: null, bm5y: null, si: 22.95, bmsi: 17.65,
  },
  {
    scheme: "ICICI Prudential Contra Portfolio PMS", provider: "ICICI Prudential PMS",
    managers: ["Anand Shah", "Chockalingam Narayanan"], aum: 13837, inception: "Sept 2018",
    strategy: "Contrarian PMS focusing on stocks performing contrary to current markets and available at a reasonable valuation.",
    capLarge: 70.0, capMid: 5.8, capSmall: 22.3, capMicro: null,
    holdings: [
      { name: "Bharti Airtel Ltd", weight: null }, { name: "L&T", weight: null }, { name: "TATA Steel", weight: null },
      { name: "Eternal Ltd", weight: null }, { name: "ICICI Bank", weight: null },
    ],
    r1m: 1.0, bm1m: 1.7, r3m: 10.7, bm3m: 12.1, r6m: -1.4, bm6m: -3.5, r1y: 2.0, bm1y: -2.0, r3y: 16.6, bm3y: 12.5, r5y: 17.5, bm5y: 12.2,
  },
  {
    scheme: "Helios India Rising PMS", provider: "Helios Capital",
    managers: ["Dinshaw Irani"], aum: 1577, inception: "March 2020",
    strategy: "Flexicap PMS following Elimination Investing, focusing on eliminating poor stocks on 8 factors.",
    capLarge: 42.9, capMid: 27.6, capSmall: 24.1, capMicro: null,
    holdings: [
      { name: "One 97 Communications Ltd", weight: null }, { name: "Adani Ports and Special Eco Zone Ltd", weight: null }, { name: "Eternal Ltd", weight: null },
      { name: "ICICI Bank", weight: null }, { name: "SBI", weight: null },
    ],
    r1m: 6.0, bm1m: 1.7, r3m: 21.3, bm3m: 12.1, r6m: -0.5, bm6m: -3.5, r1y: 5.4, bm1y: -2.0, r3y: 16.2, bm3y: 12.5, r5y: 13.5, bm5y: 12.2,
  },
  {
    scheme: "Carnelian Contra PMS", provider: "Carnelian Asset Management",
    managers: ["Vikas Khemani"], aum: 130, inception: "Jan 2022", benchmarkName: "BSE 500 TRI",
    minInvestment: "\u20B950 Lakhs", exitLoad: "1% if redeemed within 1 year", stockUniverse: "20\u201325 stocks",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and Carnelian's own investor materials.",
    strategy: "Multi-cap with 60% large-cap bias, aiming for superior risk-adjusted returns via a contrarian absolute-return approach.",
    capLarge: 40.8, capMid: 19.5, capSmall: 29.4, capMicro: null,
    holdings: [
      { name: "Reliance Industries", weight: 9.6 }, { name: "Kotak Mahindra Bank", weight: 8.7 }, { name: "Bajaj Auto", weight: 7.6 },
      { name: "Bandhan Bank", weight: 7.5 }, { name: "Biocon", weight: 7.3 }, { name: "Edelweiss Financial", weight: 6.3 },
      { name: "Aarti Industries", weight: 5.6 }, { name: "Infosys", weight: 4.4 }, { name: "Indus Towers", weight: 3.9 },
      { name: "PCBL", weight: 3.6 },
    ],
    r1m: -0.8, bm1m: 1.7, r3m: 11.8, bm3m: 12.1, r6m: -0.3, bm6m: -3.5, r1y: 0.2, bm1y: -2.0, r2y: 1.2, bm2y: 1.5, r3y: 22.2, bm3y: 12.5, r5y: null, bm5y: null, si: 24.3, bmsi: 11.4,
  },
  {
    scheme: "Carnelian Shift PMS", provider: "Carnelian Asset Management",
    managers: [], aum: null, inception: "Oct 2020", benchmarkName: "BSE 500 TRI",
    sourceNote: "Source: Carnelian's own investor materials \u2014 not on the bank's official PMS Reckoner.",
    strategy: "Mid & small-cap PMS. Broadened from March 2026 to reflect structural shifts in the Indian economy and the evolving post-COVID-19 global macroeconomic environment, enabling greater flexibility to capture long-term opportunities.",
    capLarge: 12.4, capMid: 27.2, capSmall: 56.8, capMicro: null,
    holdings: [
      { name: "Biocon", weight: 7.4 }, { name: "Laurus Labs", weight: 7.0 }, { name: "Kalpataru Projects", weight: 5.5 },
      { name: "Bharat Heavy Electricals Ltd", weight: 5.0 }, { name: "Kirloskar Pneumatic", weight: 4.7 }, { name: "Timken", weight: 4.4 },
      { name: "Larsen & Toubro", weight: 4.0 }, { name: "Aurobindo Pharma", weight: 3.3 }, { name: "Tata Motors", weight: 3.1 },
      { name: "Poly Medicure", weight: 3.0 },
    ],
    r1m: 5.3, bm1m: 1.7, r3m: 27.5, bm3m: 12.1, r6m: 7.5, bm6m: -3.5, r1y: 5.8, bm1y: -2.0, r2y: 10.0, bm2y: 1.5, r3y: 22.9, bm3y: 12.5, r5y: 21.4, bm5y: 12.2, si: 32.3, bmsi: 17.7,
  },
  {
    scheme: "Buoyant Opportunities PMS", provider: "Buoyant Capital",
    managers: ["Jigar Mistry"], aum: 11548, inception: "May 2016",
    strategy: "Multi-cap, cross-cycle investing \u2014 shifts toward higher-growth stocks in aggressive cycles, toward capital protection and defensive sectors in downturns.",
    capLarge: 57.4, capMid: 21.1, capSmall: 13.9, capMicro: null,
    holdings: [
      { name: "ICICI Bank", weight: null }, { name: "Axis Bank", weight: null }, { name: "Bharti Airtel", weight: null },
      { name: "SBI", weight: null }, { name: "Shriram Transport Finance Ltd", weight: null },
    ],
    r1m: 2.5, bm1m: 1.7, r3m: 11.7, bm3m: 12.1, r6m: -0.1, bm6m: -3.5, r1y: 5.1, bm1y: -2.0, r3y: 18.0, bm3y: 12.5, r5y: 20.2, bm5y: 12.2,
  },
  {
    scheme: "ICICI Prudential Value Portfolio PMS", provider: "ICICI Prudential PMS",
    managers: ["Anand Shah", "Chockalingam Narayanan", "Geetika Gupta"], aum: 1148, inception: "Jan 2004",
    strategy: "Flexicap PMS following a value investment style \u2014 diversified stocks with high potential quoting at a discount to fair/intrinsic value.",
    capLarge: 47.6, capMid: 12.2, capSmall: 37.9, capMicro: null,
    holdings: [
      { name: "L&T Ltd", weight: null }, { name: "Bharti Airtel Ltd", weight: null }, { name: "Samvardhana Motherson International Ltd", weight: null },
      { name: "ICICI Bank", weight: null }, { name: "SBI", weight: null },
    ],
    r1m: 0.5, bm1m: 1.7, r3m: 9.4, bm3m: 12.1, r6m: 1.2, bm6m: -3.5, r1y: 8.3, bm1y: -2.0, r3y: 21.0, bm3y: 12.5, r5y: 21.4, bm5y: 12.2,
  },
  {
    scheme: "Abakkus All Cap Approach PMS", provider: "Abakkus Asset Manager",
    managers: ["Sunil Singhania", "Aman Chowhan"], aum: 7767, inception: "Oct 2020", benchmarkName: "BSE 500 TRI",
    minInvestment: "\u20B950 lacs", exitLoad: "1.5% within 12 months, Nil after",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and Abakkus's own investor deck.",
    strategy: "Flexicap PMS following the MEETS framework.",
    capLarge: 63.8, capMid: 14.7, capSmall: 13.2, capMicro: null,
    holdings: [
      { name: "Aditya Birla Capital Ltd", weight: null }, { name: "Polycab India Ltd", weight: null }, { name: "Axis Bank Ltd", weight: null },
      { name: "Sun Pharmaceutical Industries Ltd", weight: null }, { name: "Larsen & Toubro Ltd", weight: null }, { name: "Max Financial Services Ltd", weight: null },
      { name: "HDFC Bank Ltd", weight: null }, { name: "IIFL Finance Ltd", weight: null }, { name: "NTPC Ltd", weight: null },
      { name: "State Bank of India", weight: null },
    ],
    r1m: 1.5, bm1m: 1.7, r3m: 12.6, bm3m: 12.1, r6m: 0.0, bm6m: -3.5, r1y: 5.3, bm1y: -2.0, r2y: 4.77, bm2y: 1.52, r3y: 15.3, bm3y: 12.5, r5y: 14.5, bm5y: 12.2, si: 22.95, bmsi: 17.65,
  },
  {
    scheme: "ICICI Prudential Growth Leaders Strategy PMS", provider: "ICICI Prudential PMS",
    managers: ["Chockalingam Narayanan", "Geetika Gupta"], aum: 1622, inception: "Dec 2000",
    strategy: "Flexicap PMS focused on finding growth companies \u2014 prominent businesses with competent management, at reasonable valuations.",
    capLarge: 57.7, capMid: 19.7, capSmall: 17.7, capMicro: null,
    holdings: [
      { name: "ICICI Bank Ltd", weight: null }, { name: "SBI", weight: null }, { name: "L&T", weight: null },
      { name: "FSN E-Commerce Ventures Ltd", weight: null }, { name: "Tata Steel", weight: null },
    ],
    r1m: 3.2, bm1m: 1.7, r3m: 12.2, bm3m: 12.1, r6m: -0.8, bm6m: -3.5, r1y: 1.0, bm1y: -2.0, r3y: 15.9, bm3y: 12.5, r5y: 14.7, bm5y: 12.2,
  },
  {
    scheme: "ICICI Prudential ACE Portfolio PMS", provider: "ICICI Prudential PMS",
    managers: ["Anand Shah", "Chockalingam Narayanan", "Geetika Gupta"], aum: 1423, inception: "Dec 2008",
    strategy: "Flexicap PMS aiming for exposure to \u201Cnon-zero sum, under-penetrated themes\u201D in India.",
    capLarge: 48.0, capMid: 22.3, capSmall: 27.7, capMicro: null,
    holdings: [
      { name: "ICICI Bank", weight: null }, { name: "FSN E-Commerce Ventures Ltd", weight: null }, { name: "Eternal Ltd", weight: null },
      { name: "SBI", weight: null }, { name: "L&T", weight: null },
    ],
    r1m: 4.9, bm1m: 1.7, r3m: 14.9, bm3m: 12.1, r6m: -0.3, bm6m: -3.5, r1y: 2.4, bm1y: -2.0, r3y: 19.3, bm3y: 12.5, r5y: 15.6, bm5y: 12.2,
  },
  {
    scheme: "AAA India Opportunity PMS", provider: "AlfAccurate Advisors",
    managers: ["Rajesh Kothari"], aum: 2228, inception: "Nov 2009",
    strategy: "Flexicap PMS combining high-growth and value stocks for long-term capital appreciation.",
    capLarge: 56, capMid: 18, capSmall: 22, capMicro: null,
    holdings: [
      { name: "ICICI Bank", weight: null }, { name: "HDFC Bank", weight: null }, { name: "Shriram Finance Ltd", weight: null },
      { name: "Reliance Industries", weight: null }, { name: "Bharti Airtel", weight: null },
    ],
    r1m: 3.4, bm1m: 1.7, r3m: 15.6, bm3m: 12.1, r6m: -1.5, bm6m: -3.5, r1y: -1.6, bm1y: -2.0, r3y: 13.9, bm3y: 12.5, r5y: 13.0, bm5y: 12.2,
  },
  {
    scheme: "Renaissance Opportunities Portfolio PMS", provider: "Renaissance Investment Managers",
    managers: ["Pankaj Murarka"], aum: 577, inception: "Jan 2018",
    strategy: "Large-cap PMS built on a bottom-up approach, following the SQGARP framework.",
    capLarge: 65.3, capMid: 20.0, capSmall: 9.3, capMicro: null,
    holdings: [
      { name: "HDFC Bank", weight: null }, { name: "ICICI Bank", weight: null }, { name: "Power Finance Corporation", weight: null },
      { name: "Kotak Mahindra Bank", weight: null }, { name: "Maruti Suzuki India", weight: null },
    ],
    r1m: 0.9, bm1m: 1.7, r3m: 7.6, bm3m: 7.4, r6m: -8.7, bm6m: -8.1, r1y: -8.6, bm1y: -5.4, r3y: 9.1, bm3y: 8.8, r5y: 13.3, bm5y: 10.0,
  },
  {
    scheme: "Renaissance India Next Portfolio PMS", provider: "Renaissance Investment Managers",
    managers: ["Pankaj Murarka"], aum: 1145, inception: "April 2018",
    strategy: "Flexicap strategy blending top-down and bottom-up approaches, investing across market caps aligned with the economic cycle.",
    capLarge: 40.5, capMid: 29.6, capSmall: 25.2, capMicro: null,
    holdings: [
      { name: "HDFC Bank", weight: null }, { name: "Power Finance Corporation", weight: null }, { name: "Federal Bank Ltd", weight: null },
      { name: "City Union Bank Ltd", weight: null }, { name: "One 97 Communications", weight: null },
    ],
    r1m: 1.4, bm1m: 1.7, r3m: 10.1, bm3m: 12.1, r6m: -8.9, bm6m: -3.5, r1y: -10.3, bm1y: -2.0, r3y: 11.8, bm3y: 12.5, r5y: 17.0, bm5y: 12.2,
  },
].map((f, i) => ({ ...f, id: i }));

/* ------------------------------------------------------------------ */
/* Firm-level profile & manager bios — only populated where we have    */
/* a real source document (e.g. an investor deck). Looked up by        */
/* provider name in the detail view; providers with no entry here      */
/* simply don't show this section. No bios are invented.               */
/* ------------------------------------------------------------------ */
const PROVIDER_INFO = {
  "Carnelian Asset Management": {
    founded: 2019,
    aumUsdBn: 1.9,
    team: 115,
    locations: 10,
    philosophy: "QGARP \u2014 Quality Growth companies (Business & Management) at a Reasonable Price.",
    framework: "Proprietary forensic framework, \u201CCLEAR\u201D: Cash flow analysis, Liability analysis, Earnings quality analysis, Asset quality analysis, Related party & governance issues.",
    managers: [
      { name: "Vikas Khemani", credentials: "CA, CFA, CS", bio: "Founder. 28 years in capital markets; previously CEO of Edelweiss Securities Ltd. for 17 years, where he built institutional equities, investment banking, and equity research into market-leading businesses." },
      { name: "Manoj Bahety", credentials: "CA, CFA", bio: "Fund manager. ~28 years in financial services; previously Deputy Head of Institutional Equity Research, Head of Forensic Research, and Head of Thematic & Mid Cap Research at Edelweiss Securities. Known for pioneering \u201CAnalysis Beyond Consensus\u201D (ABC Research)." },
      { name: "Swati Khemani", credentials: "CA", bio: "Co-founder. 24 years of financial experience across equity research, institutional sales, investment banking and human capital management; leads overall business and capital management at Carnelian." },
    ],
  },
  "Abakkus Asset Manager": {
    founded: 2018,
    aumCr: 41480,
    team: 160,
    locations: null,
    philosophy: "Fundamental, bottom-up research focused on generating alpha over benchmark \u2014 growth where profitability is expected to grow faster than average, and value in fundamentally underpriced companies.",
    framework: "Proprietary \u201CMEETS\u201D framework: Management, Events/Trends, Earnings, Timing, Structural.",
    managers: [
      { name: "Sunil Singhania", credentials: "CA, CFA", bio: "Founder. ~30 years in Indian asset management; was CIO \u2013 Equities at Reliance Nippon Life Asset Management (2003\u20132017), managing ~USD 11bn and growing the Reliance Growth Fund over 100x in under 22 years. First Indian appointed to the CFA Institute's Global Board (2013\u20132019); founding member of the Association of Portfolio Managers of India." },
      { name: "Aman Chowhan", credentials: "BCOM, MBA", bio: "Senior Fund Manager and Principal Officer for Abakkus's PMS strategies. 25 years of experience; previously at Nippon Life AMC, TAIB Securities, and Tata TD Waterhouse." },
      { name: "Hitesh Arora", credentials: "B.Tech, MS, MBA, CFA", bio: "Fund Manager. 19 years of experience; previously at Unifi Capital, Deutsche Bank, and J.P. Morgan." },
    ],
  },
};

const PERIODS = [
  { key: "r1m", bmKey: "bm1m", label: "1M" },
  { key: "r3m", bmKey: "bm3m", label: "3M" },
  { key: "r6m", bmKey: "bm6m", label: "6M" },
  { key: "r1y", bmKey: "bm1y", label: "1Y" },
  { key: "r2y", bmKey: "bm2y", label: "2Y" },
  { key: "r3y", bmKey: "bm3y", label: "3Y" },
  { key: "r5y", bmKey: "bm5y", label: "5Y" },
  { key: "si", bmKey: "bmsi", label: "SI" },
];

const INK = "#1B2430";
const MUTED = "#6B7280";
const GOLD = "#A6812E";
const GREEN = "#1E7145";
const RED = "#B23A2E";
const PAPER = "#EFEDE6";
const CARD = "#FFFFFF";
const RULE = "#DAD6C9";

function fmtPct(v) {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}
function fmtCr(v) {
  if (v === null || v === undefined) return "Not disclosed";
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
}
function fmtINR(v) {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}
function colorFor(v) {
  if (v === null || v === undefined) return MUTED;
  return v >= 0 ? GREEN : RED;
}
function bestReturn(f) {
  if (f.si !== null && f.si !== undefined) return { value: f.si, label: "SI" };
  if (f.r5y !== null && f.r5y !== undefined) return { value: f.r5y, label: "5Y" };
  if (f.r3y !== null && f.r3y !== undefined) return { value: f.r3y, label: "3Y" };
  if (f.r1y !== null && f.r1y !== undefined) return { value: f.r1y, label: "1Y" };
  return { value: 0, label: "\u2014" };
}

export default function App() {
  const [tab, setTab] = useState("explore");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("aum");
  const [sortDir, setSortDir] = useState("desc");
  const [openFund, setOpenFund] = useState(null);

  const [calcIds, setCalcIds] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [amount, setAmount] = useState(1000000);
  const [years, setYears] = useState(5);

  const filtered = useMemo(() => {
    let list = FUNDS.filter(
      (f) =>
        f.scheme.toLowerCase().includes(query.toLowerCase()) ||
        f.provider.toLowerCase().includes(query.toLowerCase()) ||
        f.managers.some((m) => m.toLowerCase().includes(query.toLowerCase()))
    );
    list.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av === null) av = -9999;
      if (bv === null) bv = -9999;
      if (sortKey === "scheme" || sortKey === "provider") {
        return sortDir === "asc" ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [query, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function toggleCalc(id) {
    setCalcIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
    setOverrides((prev) => {
      if (prev[id] !== undefined) return prev;
      const f = FUNDS.find((x) => x.id === id);
      return { ...prev, [id]: bestReturn(f).value };
    });
  }

  const selectedFunds = calcIds.map((id) => FUNDS.find((f) => f.id === id));
  const perFundAmount = calcIds.length ? amount / calcIds.length : 0;

  const projections = selectedFunds.map((f) => {
    const r = overrides[f.id] ?? bestReturn(f).value;
    const fv = perFundAmount * Math.pow(1 + r / 100, years);
    return { fund: f, r, fv, gain: fv - perFundAmount };
  });
  const totalFV = projections.reduce((s, p) => s + p.fv, 0);
  const totalGain = totalFV - amount;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .disp { font-family: 'Fraunces', serif; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .row-hover:hover { background: #F8F7F2; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${RULE}; border-radius: 4px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
        button { font-family: inherit; }
      `}</style>

      {/* HEADER */}
      <header style={{ borderBottom: `1px solid ${RULE}`, background: CARD }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 0", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 className="disp" style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
                PMS Ledger
              </h1>
              <p style={{ color: MUTED, fontSize: 13.5, margin: "4px 0 16px" }}>
                Bank-approved PMS shelf — real fund manager, strategy & returns data.
              </p>
            </div>
            <div
              style={{
                border: `1.5px solid ${GOLD}`,
                color: GOLD,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10.5,
                letterSpacing: 1,
                padding: "6px 10px",
                borderRadius: 3,
                transform: "rotate(-3deg)",
                whiteSpace: "nowrap",
                marginBottom: 16,
              }}
            >
              13 PMS · RECKONER 30 JUN 2026
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "explore", label: "Explore", icon: LayoutList },
              { id: "calculator", label: "Calculator", icon: CalcIcon },
            ].map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent",
                    color: active ? INK : MUTED,
                    fontWeight: active ? 600 : 500,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        {tab === "explore" ? (
          <ExploreView
            funds={filtered}
            query={query}
            setQuery={setQuery}
            sortKey={sortKey}
            sortDir={sortDir}
            toggleSort={toggleSort}
            onOpen={setOpenFund}
          />
        ) : (
          <CalculatorView
            calcIds={calcIds}
            toggleCalc={toggleCalc}
            overrides={overrides}
            setOverrides={setOverrides}
            amount={amount}
            setAmount={setAmount}
            years={years}
            setYears={setYears}
            projections={projections}
            totalFV={totalFV}
            totalGain={totalGain}
            perFundAmount={perFundAmount}
          />
        )}
      </main>

      {openFund && <FundDetail fund={openFund} onClose={() => setOpenFund(null)} />}

      <footer style={{ borderTop: `1px solid ${RULE}`, padding: "18px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, maxWidth: 640, marginInline: "auto" }}>
          14 PMS schemes shown — 13 from the bank's PMS Reckoner (30 Jun 2026), plus Carnelian Shift, added from
          Carnelian's own investor deck. Manager bios, strategy details and benchmark comparisons are shown only
          where the source document provides them. Past returns don't guarantee future performance.
        </p>
      </footer>
    </div>
  );
}

function SortHeader({ label, k, sortKey, sortDir, onClick, align = "right" }) {
  const active = sortKey === k;
  return (
    <th
      onClick={() => onClick(k)}
      style={{
        cursor: "pointer",
        textAlign: align,
        padding: "10px 12px",
        fontSize: 11.5,
        color: active ? INK : MUTED,
        fontWeight: 600,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {active ? <ArrowUpDown size={11} /> : null}
      </span>
    </th>
  );
}

function ExploreView({ funds, query, setQuery, sortKey, sortDir, toggleSort, onOpen }) {
  return (
    <div>
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 380 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: MUTED }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fund or PMS provider…"
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            border: `1px solid ${RULE}`,
            borderRadius: 6,
            fontSize: 14,
            background: CARD,
            outline: "none",
          }}
        />
      </div>

      <div style={{ background: CARD, border: `1px solid ${RULE}`, borderRadius: 8, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${RULE}` }}>
              <SortHeader label="Scheme" k="scheme" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="left" />
              <SortHeader label="AUM" k="aum" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="1Y" k="r1y" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="3Y" k="r3y" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="5Y" k="r5y" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {funds.map((f) => (
              <tr
                key={f.id}
                className="row-hover"
                onClick={() => onOpen(f)}
                style={{ borderBottom: `1px solid ${RULE}`, cursor: "pointer" }}
              >
                <td style={{ padding: "12px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f.scheme}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                    {f.managers.length > 0 ? f.managers.join(", ") : "Manager not disclosed"}
                  </div>
                </td>
                <td className="mono" style={{ padding: "12px", textAlign: "right", fontSize: 13 }}>
                  {fmtCr(f.aum)}
                </td>
                <td className="mono" style={{ padding: "12px", textAlign: "right", fontSize: 13, color: colorFor(f.r1y) }}>
                  {fmtPct(f.r1y)}
                </td>
                <td className="mono" style={{ padding: "12px", textAlign: "right", fontSize: 13, color: colorFor(f.r3y) }}>
                  {fmtPct(f.r3y)}
                </td>
                <td className="mono" style={{ padding: "12px", textAlign: "right", fontSize: 13, color: colorFor(f.r5y), fontWeight: 600 }}>
                  {fmtPct(f.r5y)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {funds.length === 0 && (
        <p style={{ textAlign: "center", color: MUTED, marginTop: 40 }}>No fund matches "{query}".</p>
      )}
    </div>
  );
}

function MiniCapBar({ fund }) {
  const segs = [
    { label: "Large", value: fund.capLarge, color: INK },
    { label: "Mid", value: fund.capMid, color: GOLD },
    { label: "Small", value: fund.capSmall, color: "#8FA998" },
    { label: "Micro", value: fund.capMicro, color: RULE },
  ].filter((s) => s.value !== null && s.value !== undefined);
  return (
    <div>
      <div style={{ display: "flex", width: "100%", height: 10, borderRadius: 5, overflow: "hidden" }}>
        {segs.map((s) => (
          <div key={s.label} style={{ width: `${s.value}%`, background: s.color }} title={`${s.label} ${s.value}%`} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
        {segs.map((s) => (
          <span key={s.label} style={{ fontSize: 11, color: MUTED, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" }} />
            {s.label} {s.value}%
          </span>
        ))}
      </div>
    </div>
  );
}

function FundDetail({ fund, onClose }) {
  const data = PERIODS.map((p) => ({ name: p.label, portfolio: fund[p.key], benchmark: fund[p.bmKey] }));
  const br = bestReturn(fund);
  const provInfo = PROVIDER_INFO[fund.provider];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(27,36,48,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: CARD,
          width: "100%",
          maxWidth: 640,
          borderRadius: "16px 16px 0 0",
          padding: 24,
          maxHeight: "88vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 className="disp" style={{ margin: 0, fontSize: 19, fontWeight: 700, lineHeight: 1.25 }}>
              {fund.scheme}
            </h2>
            <p style={{ margin: "4px 0 0", color: MUTED, fontSize: 13.5 }}>
              {fund.provider}{fund.managers.length > 0 ? ` · ${fund.managers.join(", ")}` : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <X size={20} color={MUTED} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: INK, lineHeight: 1.55, margin: "14px 0" }}>{fund.strategy}</p>

        <div style={{ display: "flex", gap: 20, margin: "16px 0", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4 }}>AUM</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 600 }}>{fmtCr(fund.aum)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4 }}>INCEPTION</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 600 }}>{fund.inception}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4 }}>{br.label} RETURN</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 600, color: colorFor(br.value) }}>{fmtPct(br.value)}</div>
          </div>
        </div>

        {(fund.minInvestment || fund.exitLoad || fund.benchmarkName || fund.stockUniverse) && (
          <div style={{ background: PAPER, borderRadius: 8, padding: "4px 14px", marginBottom: 18 }}>
            {[
              ["Benchmark", fund.benchmarkName],
              ["Stock universe", fund.stockUniverse],
              ["Min. investment", fund.minInvestment],
              ["Exit load", fund.exitLoad],
            ]
              .filter(([, v]) => v)
              .map(([label, value], i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: i < arr.length - 1 ? `1px solid ${RULE}` : "none",
                  }}
                >
                  <span style={{ fontSize: 12.5, color: MUTED }}>{label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
          </div>
        )}

        {(fund.capLarge !== null || fund.capMid !== null || fund.capSmall !== null || fund.capMicro !== null) && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4, marginBottom: 6 }}>MARKET CAP ALLOCATION</div>
            <MiniCapBar fund={fund} />
          </div>
        )}

        <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4, marginBottom: 8 }}>PORTFOLIO VS. BENCHMARK</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={RULE} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={{ stroke: RULE }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                formatter={(v) => (v === null || v === undefined ? "N/A" : `${v.toFixed(2)}%`)}
                contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${RULE}` }}
              />
              <Bar dataKey="portfolio" name="Portfolio" radius={[3, 3, 0, 0]} fill={GOLD} />
              <Bar dataKey="benchmark" name="Benchmark" radius={[3, 3, 0, 0]} fill={RULE} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: MUTED, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: GOLD, display: "inline-block" }} /> Portfolio
          </span>
          <span style={{ fontSize: 11, color: MUTED, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: RULE, display: "inline-block" }} /> Benchmark
          </span>
        </div>
        <p style={{ fontSize: 11, color: MUTED, textAlign: "center", marginTop: 4 }}>
          Returns for periods over 1 year are annualised (CAGR). "N/A" means not reported for that period.
        </p>

        {fund.holdings.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4, marginBottom: 8 }}>TOP HOLDINGS</div>
            <div style={{ background: PAPER, borderRadius: 8, padding: "4px 14px" }}>
              {fund.holdings.map((h, i) => (
                <div
                  key={h.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: i < fund.holdings.length - 1 ? `1px solid ${RULE}` : "none",
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: MUTED, width: 14, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{h.name}</span>
                  {h.weight !== null && h.weight !== undefined && (
                    <span className="mono" style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>{h.weight.toFixed(1)}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {provInfo && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.4, marginBottom: 8 }}>ABOUT {fund.provider.toUpperCase()}</div>
            <p style={{ fontSize: 12.5, color: INK, lineHeight: 1.5, margin: "0 0 10px" }}>
              Founded {provInfo.founded} · ~USD {provInfo.aumUsdBn}bn managed · {provInfo.team} people across {provInfo.locations} locations.
              {" "}{provInfo.philosophy} {provInfo.framework}
            </p>
            {fund.managers.filter((m) => provInfo.managers.some((pm) => pm.name === m)).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {fund.managers.map((m) => {
                  const bio = provInfo.managers.find((pm) => pm.name === m);
                  if (!bio) return null;
                  return (
                    <div key={m} style={{ background: PAPER, borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {bio.name} <span style={{ fontWeight: 400, color: MUTED, fontSize: 12 }}>({bio.credentials})</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: MUTED, margin: "4px 0 0", lineHeight: 1.5 }}>{bio.bio}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, background: PAPER, borderRadius: 8, display: "flex", gap: 10 }}>
          <Info size={16} color={MUTED} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>
            {fund.sourceNote || "Source: bank PMS Reckoner, as on 30 June 2026."} Holdings and allocation are a snapshot from that date and change over time.
          </p>
        </div>
      </div>
    </div>
  );
}

function CalculatorView({
  calcIds,
  toggleCalc,
  overrides,
  setOverrides,
  amount,
  setAmount,
  years,
  setYears,
  projections,
  totalFV,
  totalGain,
  perFundAmount,
}) {
  const [query, setQuery] = useState("");
  const list = FUNDS.filter(
    (f) => f.scheme.toLowerCase().includes(query.toLowerCase()) || f.provider.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) minmax(280px, 1.1fr)", gap: 20 }}>
      <div>
        <h3 className="disp" style={{ fontSize: 17, margin: "0 0 10px" }}>1. Pick funds</h3>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: MUTED }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            style={{ width: "100%", padding: "8px 10px 8px 32px", border: `1px solid ${RULE}`, borderRadius: 6, fontSize: 13.5, background: CARD }}
          />
        </div>
        <div style={{ border: `1px solid ${RULE}`, borderRadius: 8, maxHeight: 360, overflowY: "auto", background: CARD }}>
          {list.map((f) => {
            const checked = calcIds.includes(f.id);
            const br = bestReturn(f);
            return (
              <label
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderBottom: `1px solid ${RULE}`,
                  cursor: "pointer",
                  background: checked ? "#F8F5EA" : "transparent",
                }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleCalc(f.id)} style={{ width: 15, height: 15 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.scheme}</div>
                  <div style={{ fontSize: 11.5, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.provider}</div>
                </div>
                <div className="mono" style={{ fontSize: 12, color: colorFor(br.value), flexShrink: 0 }}>{fmtPct(br.value)} {br.label}</div>
              </label>
            );
          })}
        </div>

        <h3 className="disp" style={{ fontSize: 17, margin: "20px 0 10px" }}>2. Set amount & horizon</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, color: MUTED, display: "block", marginBottom: 4 }}>Amount to invest (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              style={{ width: "100%", padding: "9px 10px", border: `1px solid ${RULE}`, borderRadius: 6, fontSize: 14 }}
              className="mono"
            />
          </div>
          <div style={{ width: 110 }}>
            <label style={{ fontSize: 11.5, color: MUTED, display: "block", marginBottom: 4 }}>Years</label>
            <input
              type="number"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Math.min(30, Math.max(1, Number(e.target.value))))}
              style={{ width: "100%", padding: "9px 10px", border: `1px solid ${RULE}`, borderRadius: 6, fontSize: 14 }}
              className="mono"
            />
          </div>
        </div>
        {calcIds.length > 1 && (
          <p style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>
            Amount is split equally across {calcIds.length} selected funds — {fmtINR(perFundAmount)} each.
          </p>
        )}
      </div>

      <div>
        <h3 className="disp" style={{ fontSize: 17, margin: "0 0 10px" }}>3. Projection</h3>
        {calcIds.length === 0 ? (
          <div style={{ border: `1px dashed ${RULE}`, borderRadius: 8, padding: 30, textAlign: "center", color: MUTED, fontSize: 13.5 }}>
            Select one or more funds on the left to see a projection.
          </div>
        ) : (
          <>
            <div style={{ background: CARD, border: `1px solid ${RULE}`, borderRadius: 8, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: MUTED, letterSpacing: 0.4 }}>PROJECTED VALUE AFTER {years} YEAR{years > 1 ? "S" : ""}</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{fmtINR(totalFV)}</div>
              <div className="mono" style={{ fontSize: 13, color: colorFor(totalGain), marginTop: 2 }}>
                {totalGain >= 0 ? "+" : ""}{fmtINR(totalGain)} gain on {fmtINR(amount)} invested
              </div>
            </div>

            <div style={{ height: Math.max(140, projections.length * 44) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={projections.map((p) => ({ name: p.fund.scheme.length > 22 ? p.fund.scheme.slice(0, 22) + "…" : p.fund.scheme, value: Math.round(p.fv) }))}
                  margin={{ top: 4, right: 30, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={RULE} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10.5, fill: MUTED }} axisLine={{ stroke: RULE }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: INK }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => fmtINR(v)} contentStyle={{ fontSize: 12, borderRadius: 6, border: `1px solid ${RULE}` }} />
                  <Bar dataKey="value" fill={GOLD} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: 14, background: CARD, border: `1px solid ${RULE}`, borderRadius: 8, overflow: "hidden" }}>
              {projections.map((p) => (
                <div key={p.fund.id} style={{ padding: "10px 12px", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.fund.scheme}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      onClick={() => setOverrides((o) => ({ ...o, [p.fund.id]: Math.round((o[p.fund.id] - 0.5) * 10) / 10 }))}
                      style={{ border: `1px solid ${RULE}`, background: "none", borderRadius: 4, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Minus size={11} />
                    </button>
                    <span className="mono" style={{ fontSize: 12.5, width: 52, textAlign: "center" }}>{p.r.toFixed(1)}%</span>
                    <button
                      onClick={() => setOverrides((o) => ({ ...o, [p.fund.id]: Math.round((o[p.fund.id] + 0.5) * 10) / 10 }))}
                      style={{ border: `1px solid ${RULE}`, background: "none", borderRadius: 4, width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  <div className="mono" style={{ fontSize: 12.5, width: 90, textAlign: "right", fontWeight: 600 }}>{fmtINR(p.fv)}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
              Assumed annual return is pre-filled with each fund's longest available track record (5Y, or 3Y/1Y where 5Y isn't
              available yet) and is editable with +/−. This is an illustrative projection, not a guarantee — past
              performance doesn't predict future returns.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
