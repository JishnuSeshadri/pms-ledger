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
  ChevronDown,
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
    managers: ["Anand Shah", "Chockalingam Narayanan", "Prem Khurana", "Sandip Santdasani"], aum: 13837, inception: "Sept 2018",
    benchmarkName: "BSE 500 TRI", stockUniverse: "25\u201330 stocks",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and ICICI Prudential's own investor deck (Aug 2026, performance as on 31 Jul 2026).",
    strategy: "Contrarian PMS focusing on stocks performing contrary to current markets and available at a reasonable valuation.",
    capLarge: 71.46, capMid: 5.42, capSmall: 21.55, capMicro: null,
    holdings: [
      { name: "Bharti Airtel Ltd", weight: 6.77 }, { name: "Tata Steel Ltd", weight: 4.97 }, { name: "Eternal Ltd", weight: 4.94 },
      { name: "Larsen & Toubro Ltd", weight: 4.75 }, { name: "ICICI Bank Ltd", weight: 4.64 }, { name: "Samvardhana Motherson International Ltd", weight: 4.49 },
      { name: "Interglobe Aviation Ltd", weight: 3.73 }, { name: "State Bank of India", weight: 3.61 }, { name: "Vardhman Textiles Ltd", weight: 3.61 },
      { name: "HDFC Bank Ltd", weight: 3.58 },
    ],
    r1m: 1.99, bm1m: 2.19, r3m: 2.86, bm3m: 3.78, r6m: 2.60, bm6m: 1.99, r1y: 6.26, bm1y: 2.98, r2y: 2.59, bm2y: 0.42, r3y: 15.09, bm3y: 11.89, r5y: 16.56, bm5y: 12.35, si: 18.10, bmsi: 13.07,
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
    managers: ["Anand Shah", "Chockalingam Narayanan", "Prem Khurana", "Sandip Santdasani"], aum: 1148, inception: "Jan 2004",
    benchmarkName: "BSE 500 TRI", stockUniverse: "25\u201330 stocks",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and ICICI Prudential's own investor deck (Aug 2026, performance as on 31 Jul 2026).",
    strategy: "Flexicap PMS following a value investment style \u2014 diversified stocks with high potential quoting at a discount to fair/intrinsic value.",
    capLarge: 50.57, capMid: 9.58, capSmall: 37.13, capMicro: null,
    holdings: [
      { name: "Bharti Airtel Ltd", weight: 5.88 }, { name: "ICICI Bank Ltd", weight: 5.51 }, { name: "Samvardhana Motherson International Ltd", weight: 5.39 },
      { name: "Larsen & Toubro Ltd", weight: 5.30 }, { name: "State Bank of India", weight: 4.67 }, { name: "Tata Steel Ltd", weight: 4.46 },
      { name: "Sarda Energy and Minerals Ltd", weight: 4.34 }, { name: "Vardhman Textiles Ltd", weight: 3.77 }, { name: "Jindal Stainless Ltd", weight: 3.50 },
      { name: "HDFC Bank Ltd", weight: 3.37 },
    ],
    r1m: 0.40, bm1m: 2.19, r3m: -0.61, bm3m: 3.78, r6m: 1.81, bm6m: 1.99, r1y: 10.63, bm1y: 2.98, r2y: 3.16, bm2y: 0.42, r3y: 18.17, bm3y: 11.89, r5y: 20.05, bm5y: 12.35, si: 12.97, bmsi: 12.36,
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
    managers: ["Anand Shah", "Chockalingam Narayanan", "Prem Khurana", "Sandip Santdasani"], aum: 1622, inception: "Dec 2000",
    benchmarkName: "BSE 500 TRI", stockUniverse: "25\u201330 stocks",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and ICICI Prudential's own investor deck (Aug 2026, performance as on 31 Jul 2026).",
    strategy: "Flexicap PMS focused on finding growth companies \u2014 prominent businesses with competent management, at reasonable valuations.",
    capLarge: 60.56, capMid: 14.74, capSmall: 20.55, capMicro: null,
    holdings: [
      { name: "ICICI Bank Ltd", weight: 6.05 }, { name: "FSN E-Commerce Ventures Ltd", weight: 5.03 }, { name: "Bharti Airtel Ltd", weight: 4.92 },
      { name: "State Bank of India", weight: 4.85 }, { name: "Eternal Ltd", weight: 4.72 }, { name: "Larsen & Toubro Ltd", weight: 4.58 },
      { name: "Tata Steel Ltd", weight: 4.24 }, { name: "HDFC Bank Ltd", weight: 3.83 }, { name: "Honasa Consumer Ltd", weight: 3.70 },
      { name: "Jindal Stainless Ltd", weight: 3.64 },
    ],
    r1m: 3.39, bm1m: 2.19, r3m: 6.43, bm3m: 3.78, r6m: 4.74, bm6m: 1.99, r1y: 6.37, bm1y: 2.98, r2y: 2.07, bm2y: 0.42, r3y: 15.84, bm3y: 11.89, r5y: 14.52, bm5y: 12.35, si: 12.16, bmsi: 12.36,
  },
  {
    scheme: "ICICI Prudential ACE Portfolio PMS", provider: "ICICI Prudential PMS",
    managers: ["Anand Shah", "Chockalingam Narayanan", "Prem Khurana", "Sandip Santdasani"], aum: 1423, inception: "Dec 2010",
    benchmarkName: "BSE 500 TRI", stockUniverse: "25\u201330 stocks",
    sourceNote: "Source: bank PMS Reckoner (30 Jun 2026) and ICICI Prudential's own investor deck (Aug 2026, performance as on 31 Jul 2026). Inception date corrected to Dec 2010 per the deck (reckoner listed Dec 2008).",
    strategy: "Flexicap PMS aiming for exposure to \u201Cnon-zero sum, under-penetrated themes\u201D in India.",
    capLarge: 51.38, capMid: 15.33, capSmall: 30.78, capMicro: null,
    holdings: [
      { name: "FSN E-Commerce Ventures Ltd", weight: 5.67 }, { name: "ICICI Bank Ltd", weight: 5.66 }, { name: "Eternal Ltd", weight: 5.22 },
      { name: "State Bank of India", weight: 4.98 }, { name: "Larsen & Toubro Ltd", weight: 4.47 }, { name: "Bharti Airtel Ltd", weight: 4.02 },
      { name: "Tata Steel Ltd", weight: 3.84 }, { name: "BSE Ltd", weight: 3.61 }, { name: "TVS Motor Company Ltd", weight: 3.45 },
      { name: "Honasa Consumer Ltd", weight: 3.37 },
    ],
    r1m: 2.77, bm1m: 2.19, r3m: 7.24, bm3m: 3.78, r6m: 6.11, bm6m: 1.99, r1y: 6.90, bm1y: 2.98, r2y: 5.23, bm2y: 0.42, r3y: 19.62, bm3y: 11.89, r5y: 14.33, bm5y: 12.35, si: 14.51, bmsi: 11.90,
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
  "ICICI Prudential PMS": {
    // Partial entry: only one manager bio confirmed so far (from the Contra Strategy deck).
    // No firm-level founded/AUM/team stats included since we don't have them from a source yet.
    managers: [
      { name: "Anand Shah", credentials: null, bio: "CIO \u2013 PMS & AIF at ICICI Prudential Asset Management Company Limited. Oversees all PMS strategies offered by the AMC." },
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

/* ------------------------------------------------------------------ */
/* MUTUAL FUNDS — real data, verified per-scheme against Groww's live  */
/* fund pages (not search snippets), 12 Aug 2026. Direct Plan Growth   */
/* variant used throughout. Returns are annualised (3Y/5Y); 1Y is      */
/* absolute. "—" fields are genuinely not available for that fund      */
/* (either too new, or the source didn't surface that period).         */
/* Covers the top 15 AMCs by AUM across 4 categories; not every AMC    */
/* runs every category (gaps noted, not guessed).                      */
/* ------------------------------------------------------------------ */
const MF_CATEGORIES = ["Aggressive Hybrid", "Balanced Advantage", "Multi Asset Allocation", "Conservative Hybrid", "Banking & PSU", "Corporate Bond", "Short Duration", "Gilt"];

const MUTUAL_FUNDS = [
  // Aggressive Hybrid (14)
  { category: "Aggressive Hybrid", provider: "SBI", scheme: "SBI Equity Hybrid Fund", r1y: 8.2, r3y: 13.8, r5y: 11.6 },
  { category: "Aggressive Hybrid", provider: "ICICI Prudential", scheme: "ICICI Prudential Equity & Debt Fund", r1y: 6.6, r3y: 15.4, r5y: 16.5 },
  { category: "Aggressive Hybrid", provider: "HDFC", scheme: "HDFC Hybrid Equity Fund", r1y: -0.5, r3y: 8.1, r5y: 9.7 },
  { category: "Aggressive Hybrid", provider: "Nippon India", scheme: "Nippon India Aggressive Hybrid Fund", r1y: 6.0, r3y: 12.6, r5y: 12.4 },
  { category: "Aggressive Hybrid", provider: "Edelweiss", scheme: "Edelweiss Aggressive Hybrid Fund", r1y: 7.2, r3y: 15.2, r5y: 15.0 },
  { category: "Aggressive Hybrid", provider: "Axis", scheme: "Axis Aggressive Hybrid Fund", r1y: 6.2, r3y: 11.1, r5y: 8.8 },
  { category: "Aggressive Hybrid", provider: "Bandhan", scheme: "Bandhan Aggressive Hybrid Fund", r1y: 12.2, r3y: 16.1, r5y: 13.1 },
  { category: "Aggressive Hybrid", provider: "Kotak Mahindra", scheme: "Kotak Aggressive Hybrid Fund", r1y: null, r3y: null, r5y: 13.5 },
  { category: "Aggressive Hybrid", provider: "Aditya Birla Sun Life", scheme: "ABSL Equity Hybrid '95 Fund", r1y: null, r3y: null, r5y: 9.9 },
  { category: "Aggressive Hybrid", provider: "Mirae Asset", scheme: "Mirae Asset Aggressive Hybrid Fund", r1y: null, r3y: 12.5, r5y: 11.4 },
  { category: "Aggressive Hybrid", provider: "UTI", scheme: "UTI Aggressive Hybrid Fund", r1y: null, r3y: 12.7, r5y: 12.7 },
  { category: "Aggressive Hybrid", provider: "DSP", scheme: "DSP Aggressive Hybrid Fund", r1y: null, r3y: 12.0, r5y: 10.3 },
  { category: "Aggressive Hybrid", provider: "Tata", scheme: "Tata Aggressive Hybrid Fund", r1y: null, r3y: 9.7, r5y: 10.7 },
  { category: "Aggressive Hybrid", provider: "Invesco", scheme: "Invesco India Aggressive Hybrid Fund", r1y: -1.7, r3y: 12.8, r5y: 10.9 },

  // Balanced Advantage (14)
  { category: "Balanced Advantage", provider: "HDFC", scheme: "HDFC Balanced Advantage Fund", r1y: 4.1, r3y: 13.7, r5y: 15.8 },
  { category: "Balanced Advantage", provider: "ICICI Prudential", scheme: "ICICI Prudential Balanced Advantage Fund", r1y: 10.0, r3y: 13.0, r5y: 11.9 },
  { category: "Balanced Advantage", provider: "Aditya Birla Sun Life", scheme: "ABSL Balanced Advantage Fund", r1y: 10.2, r3y: 13.1, r5y: 11.3 },
  { category: "Balanced Advantage", provider: "Axis", scheme: "Axis Balanced Advantage Fund", r1y: 6.2, r3y: 13.4, r5y: 10.9 },
  { category: "Balanced Advantage", provider: "Nippon India", scheme: "Nippon India Balanced Advantage Fund", r1y: 7.9, r3y: 12.3, r5y: 10.8 },
  { category: "Balanced Advantage", provider: "Bandhan", scheme: "Bandhan Balanced Advantage Fund", r1y: null, r3y: 11.3, r5y: 9.2 },
  { category: "Balanced Advantage", provider: "Edelweiss", scheme: "Edelweiss Balanced Advantage Fund", r1y: 9.2, r3y: 11.9, r5y: 10.7 },
  { category: "Balanced Advantage", provider: "Invesco", scheme: "Invesco India Balanced Advantage Fund", r1y: null, r3y: 10.5, r5y: 9.5 },
  { category: "Balanced Advantage", provider: "Tata", scheme: "Tata Balanced Advantage Fund", r1y: 6.4, r3y: 10.1, r5y: 10.3 },
  { category: "Balanced Advantage", provider: "Kotak Mahindra", scheme: "Kotak Balanced Advantage Fund", r1y: 6.3, r3y: 11.0, r5y: 10.2 },
  { category: "Balanced Advantage", provider: "Mirae Asset", scheme: "Mirae Asset Balanced Advantage Fund", r1y: 7.3, r3y: 11.4, r5y: null },
  { category: "Balanced Advantage", provider: "SBI", scheme: "SBI Balanced Advantage Fund", r1y: 6.4, r3y: 11.2, r5y: null },
  { category: "Balanced Advantage", provider: "DSP", scheme: "DSP Dynamic Asset Allocation Fund", r1y: 6.9, r3y: 11.7, r5y: null },
  { category: "Balanced Advantage", provider: "PPFAS", scheme: "Parag Parikh Dynamic Asset Allocation Fund", r1y: 4.1, r3y: null, r5y: null },

  // Multi Asset Allocation (13)
  { category: "Multi Asset Allocation", provider: "Nippon India", scheme: "Nippon India Multi Asset Allocation Fund", r1y: 19.2, r3y: 20.2, r5y: 16.7 },
  { category: "Multi Asset Allocation", provider: "ICICI Prudential", scheme: "ICICI Prudential Multi Asset Fund", r1y: 10.9, r3y: 16.1, r5y: 17.8 },
  { category: "Multi Asset Allocation", provider: "SBI", scheme: "SBI Multi Asset Allocation Fund", r1y: 15.6, r3y: 16.3, r5y: 14.6 },
  { category: "Multi Asset Allocation", provider: "Aditya Birla Sun Life", scheme: "ABSL Multi Asset Allocation Fund", r1y: 18.4, r3y: 17.4, r5y: null },
  { category: "Multi Asset Allocation", provider: "Axis", scheme: "Axis Multi Asset Allocation Fund", r1y: null, r3y: 15.3, r5y: 11.0 },
  { category: "Multi Asset Allocation", provider: "UTI", scheme: "UTI Multi Asset Allocation Fund", r1y: 10.9, r3y: 17.7, r5y: 14.8 },
  { category: "Multi Asset Allocation", provider: "Tata", scheme: "Tata Multi Asset Allocation Fund", r1y: 12.4, r3y: 14.9, r5y: 14.0 },
  { category: "Multi Asset Allocation", provider: "HDFC", scheme: "HDFC Multi Asset Allocation Fund", r1y: 8.3, r3y: 13.3, r5y: 12.2 },
  { category: "Multi Asset Allocation", provider: "Mirae Asset", scheme: "Mirae Asset Multi Asset Allocation Fund", r1y: 15.0, r3y: null, r5y: null },
  { category: "Multi Asset Allocation", provider: "DSP", scheme: "DSP Multi Asset Allocation Fund", r1y: 21.6, r3y: null, r5y: null },
  { category: "Multi Asset Allocation", provider: "Kotak Mahindra", scheme: "Kotak Multi Asset Allocation Fund", r1y: 24.4, r3y: null, r5y: null },
  { category: "Multi Asset Allocation", provider: "Bandhan", scheme: "Bandhan Multi Asset Allocation Fund", r1y: 19.3, r3y: null, r5y: null },
  { category: "Multi Asset Allocation", provider: "Invesco", scheme: "Invesco India Multi Asset Allocation Fund", r1y: 18.8, r3y: null, r5y: null },

  // Conservative Hybrid (10)
  { category: "Conservative Hybrid", provider: "PPFAS", scheme: "Parag Parikh Conservative Hybrid Fund", r1y: 5.8, r3y: 10.7, r5y: 10.0 },
  { category: "Conservative Hybrid", provider: "Nippon India", scheme: "Nippon India Conservative Hybrid Fund", r1y: 8.1, r3y: 9.1, r5y: 8.7 },
  { category: "Conservative Hybrid", provider: "UTI", scheme: "UTI Conservative Hybrid Fund", r1y: null, r3y: 8.7, r5y: 8.6 },
  { category: "Conservative Hybrid", provider: "Aditya Birla Sun Life", scheme: "ABSL Regular Savings Fund", r1y: 6.5, r3y: 9.3, r5y: 8.9 },
  { category: "Conservative Hybrid", provider: "SBI", scheme: "SBI Conservative Hybrid Fund", r1y: 6.9, r3y: 9.2, r5y: 9.3 },
  { category: "Conservative Hybrid", provider: "ICICI Prudential", scheme: "ICICI Prudential Regular Savings Fund", r1y: 5.7, r3y: 9.7, r5y: 9.2 },
  { category: "Conservative Hybrid", provider: "Kotak Mahindra", scheme: "Kotak Debt Hybrid Fund", r1y: 5.2, r3y: 9.6, r5y: 9.5 },
  { category: "Conservative Hybrid", provider: "DSP", scheme: "DSP Regular Savings Fund", r1y: 5.1, r3y: 9.2, r5y: 8.0 },
  { category: "Conservative Hybrid", provider: "Axis", scheme: "Axis Conservative Hybrid Fund", r1y: null, r3y: 7.5, r5y: 6.8 },
  { category: "Conservative Hybrid", provider: "HDFC", scheme: "HDFC Hybrid Debt Fund", r1y: 3.8, r3y: 8.3, r5y: 8.6 },

  // Banking & PSU (14)
  { category: "Banking & PSU", provider: "UTI", scheme: "UTI Banking & PSU Debt Fund", r1y: 6.1, r3y: 7.4, r5y: 7.7 },
  { category: "Banking & PSU", provider: "ICICI Prudential", scheme: "ICICI Prudential Banking and PSU Debt Fund", r1y: 5.8, r3y: 7.3, r5y: 6.7 },
  { category: "Banking & PSU", provider: "DSP", scheme: "DSP Banking & PSU Debt Fund", r1y: 7.5, r3y: 7.7, r5y: 6.2 },
  { category: "Banking & PSU", provider: "Kotak Mahindra", scheme: "Kotak Banking and PSU Debt Fund", r1y: 5.7, r3y: 7.4, r5y: 6.5 },
  { category: "Banking & PSU", provider: "Bandhan", scheme: "Bandhan Banking and PSU Debt Fund", r1y: 6.0, r3y: 7.2, r5y: 6.2 },
  { category: "Banking & PSU", provider: "Invesco", scheme: "Invesco India Banking and PSU Fund", r1y: 5.4, r3y: 7.3, r5y: 5.9 },
  { category: "Banking & PSU", provider: "HDFC", scheme: "HDFC Banking and PSU Debt Fund", r1y: 5.4, r3y: 7.2, r5y: 6.3 },
  { category: "Banking & PSU", provider: "Nippon India", scheme: "Nippon India Banking and PSU Debt Fund", r1y: 5.3, r3y: 7.2, r5y: 6.3 },
  { category: "Banking & PSU", provider: "SBI", scheme: "SBI Banking and PSU Debt Fund", r1y: 5.5, r3y: 7.2, r5y: 6.1 },
  { category: "Banking & PSU", provider: "Edelweiss", scheme: "Edelweiss Banking and PSU Debt Fund", r1y: null, r3y: 7.1, r5y: 6.2 },
  { category: "Banking & PSU", provider: "Aditya Birla Sun Life", scheme: "ABSL Banking and PSU Debt Fund", r1y: 5.2, r3y: 7.1, r5y: 6.3 },
  { category: "Banking & PSU", provider: "Mirae Asset", scheme: "Mirae Asset Banking and PSU Fund", r1y: 5.1, r3y: 6.9, r5y: 5.9 },
  { category: "Banking & PSU", provider: "Axis", scheme: "Axis Banking & PSU Debt Fund", r1y: 5.3, r3y: 7.0, r5y: 6.2 },
  { category: "Banking & PSU", provider: "Tata", scheme: "Tata Banking & PSU Debt Fund", r1y: 7.0, r3y: 5.5, r5y: null },

  // Corporate Bond (12; PPFAS, Edelweiss, Mirae Asset not reliably available)
  { category: "Corporate Bond", provider: "ICICI Prudential", scheme: "ICICI Prudential Corporate Bond Fund", r1y: 6.2, r3y: 7.49, r5y: 6.82 },
  { category: "Corporate Bond", provider: "HDFC", scheme: "HDFC Corporate Bond Fund", r1y: 5.1, r3y: 7.15, r5y: 6.3 },
  { category: "Corporate Bond", provider: "SBI", scheme: "SBI Corporate Bond Fund", r1y: 5.5, r3y: 7.3, r5y: 6.29 },
  { category: "Corporate Bond", provider: "Nippon India", scheme: "Nippon India Corporate Bond Fund", r1y: 5.7, r3y: 7.57, r5y: 6.79 },
  { category: "Corporate Bond", provider: "Axis", scheme: "Axis Corporate Bond Fund", r1y: 5.8, r3y: 7.71, r5y: 6.78 },
  { category: "Corporate Bond", provider: "Aditya Birla Sun Life", scheme: "ABSL Corporate Bond Fund", r1y: 5.4, r3y: 7.17, r5y: 6.38 },
  { category: "Corporate Bond", provider: "Tata", scheme: "Tata Corporate Bond Fund", r1y: 5.5, r3y: 7.3, r5y: null },
  { category: "Corporate Bond", provider: "Bandhan", scheme: "Bandhan Corporate Bond Fund", r1y: 6.0, r3y: 7.32, r5y: 6.09 },
  { category: "Corporate Bond", provider: "Kotak Mahindra", scheme: "Kotak Corporate Bond Fund", r1y: 5.5, r3y: 7.41, r5y: 6.47 },
  { category: "Corporate Bond", provider: "DSP", scheme: "DSP Corporate Bond Fund", r1y: 6.1, r3y: 7.36, r5y: 6.0 },
  { category: "Corporate Bond", provider: "Invesco", scheme: "Invesco India Corporate Bond Fund", r1y: 5.3, r3y: 7.27, r5y: 6.14 },
  { category: "Corporate Bond", provider: "UTI", scheme: "UTI Corporate Bond Fund", r1y: 5.5, r3y: 7.3, r5y: 6.28 },

  // Short Duration (10; DSP, Kotak Mahindra, Edelweiss, Invesco, PPFAS not reliably available)
  { category: "Short Duration", provider: "ICICI Prudential", scheme: "ICICI Prudential Short Term Fund", r1y: 6.5, r3y: 7.84, r5y: 7.16 },
  { category: "Short Duration", provider: "HDFC", scheme: "HDFC Short Term Fund", r1y: 5.8, r3y: 7.51, r5y: 6.58 },
  { category: "Short Duration", provider: "Axis", scheme: "Axis Short Term Fund", r1y: 6.2, r3y: 7.76, r5y: 6.77 },
  { category: "Short Duration", provider: "SBI", scheme: "SBI Short Term Fund", r1y: 5.5, r3y: 7.33, r5y: 6.37 },
  { category: "Short Duration", provider: "Nippon India", scheme: "Nippon India Short Term Fund", r1y: 6.0, r3y: 7.68, r5y: 6.68 },
  { category: "Short Duration", provider: "Aditya Birla Sun Life", scheme: "ABSL Short Term Fund", r1y: 6.1, r3y: 7.66, r5y: 6.84 },
  { category: "Short Duration", provider: "Bandhan", scheme: "Bandhan Short Term Fund", r1y: 6.6, r3y: 7.73, r5y: 6.46 },
  { category: "Short Duration", provider: "Tata", scheme: "Tata Short Term Bond Fund", r1y: 7.3, r3y: 7.78, r5y: 6.36 },
  { category: "Short Duration", provider: "UTI", scheme: "UTI Short Term Fund", r1y: 5.6, r3y: 7.39, r5y: 7.52 },
  { category: "Short Duration", provider: "Mirae Asset", scheme: "Mirae Asset Short Duration Fund", r1y: null, r3y: 6.45, r5y: 6.58 },

  // Gilt (10; UTI, Mirae Asset, Edelweiss, Invesco, PPFAS not reliably available)
  { category: "Gilt", provider: "SBI", scheme: "SBI Gilt Fund", r1y: 5.5, r3y: 6.65, r5y: 6.34 },
  { category: "Gilt", provider: "Bandhan", scheme: "Bandhan Gilt Fund", r1y: 9.4, r3y: 7.97, r5y: 6.43 },
  { category: "Gilt", provider: "ICICI Prudential", scheme: "ICICI Prudential Gilt Fund", r1y: 6.0, r3y: 7.31, r5y: 6.82 },
  { category: "Gilt", provider: "HDFC", scheme: "HDFC Gilt Fund", r1y: 5.1, r3y: 6.56, r5y: 5.61 },
  { category: "Gilt", provider: "Kotak Mahindra", scheme: "Kotak Gilt Fund", r1y: 5.0, r3y: 5.87, r5y: 5.59 },
  { category: "Gilt", provider: "Nippon India", scheme: "Nippon India Gilt Fund", r1y: 5.4, r3y: 6.46, r5y: 5.77 },
  { category: "Gilt", provider: "Tata", scheme: "Tata Gilt Fund", r1y: 5.4, r3y: 6.69, r5y: 6.09 },
  { category: "Gilt", provider: "DSP", scheme: "DSP Gilt Fund", r1y: 5.2, r3y: 6.77, r5y: 6.13 },
  { category: "Gilt", provider: "Axis", scheme: "Axis Gilt Fund", r1y: 6.0, r3y: 7.26, r5y: 6.16 },
  { category: "Gilt", provider: "Aditya Birla Sun Life", scheme: "ABSL Gilt Fund", r1y: null, r3y: null, r5y: 5.38 },
].map((f, i) => ({ ...f, id: 1000 + i }));

const ALL_FUNDS = [...FUNDS, ...MUTUAL_FUNDS];

/* ------------------------------------------------------------------ */
/* ASSET_CLASSES — registry driving the Calculator tab. Each entry is  */
/* one self-contained "block" (own amount, own fund picker, own        */
/* subtotal). Adding a future asset class (REITs, Commodities, etc.)   */
/* is just adding one more entry here — no other code changes needed.  */
/* ------------------------------------------------------------------ */
const ASSET_CLASSES = [
  { key: "pms", label: "PMS", funds: FUNDS, supportsSip: false },
  { key: "mf", label: "Mutual Funds", funds: MUTUAL_FUNDS, supportsSip: true },
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

/* Lump sum: standard compound growth. SIP: future value of a monthly annuity-due,
   using the same convention (monthly rate = annual/12/100) as most Indian SIP
   calculators, so the numbers match what people are used to seeing elsewhere. */
function computeFutureValue(principal, annualReturnPct, years, mode) {
  if (mode === "sip") {
    const n = years * 12;
    const i = annualReturnPct / 1200;
    if (i === 0) return principal * n;
    return principal * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  }
  return principal * Math.pow(1 + annualReturnPct / 100, years);
}

function investedForMode(principal, years, mode) {
  return mode === "sip" ? principal * years * 12 : principal;
}

export default function App() {
  const [tab, setTab] = useState("explore");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("aum");
  const [sortDir, setSortDir] = useState("desc");
  const [openFund, setOpenFund] = useState(null);

  const [mfQuery, setMfQuery] = useState("");
  const [mfCategory, setMfCategory] = useState("Aggressive Hybrid");
  const [mfSortKey, setMfSortKey] = useState("r5y");
  const [mfSortDir, setMfSortDir] = useState("desc");

  const [classSelections, setClassSelections] = useState({});
  const [classAmounts, setClassAmounts] = useState({});
  const [classModes, setClassModes] = useState({});
  const [overrides, setOverrides] = useState({});
  const [years, setYears] = useState(5);

  const mfFiltered = useMemo(() => {
    let list = MUTUAL_FUNDS.filter(
      (f) =>
        f.category === mfCategory &&
        (f.scheme.toLowerCase().includes(mfQuery.toLowerCase()) || f.provider.toLowerCase().includes(mfQuery.toLowerCase()))
    );
    list.sort((a, b) => {
      let av = a[mfSortKey];
      let bv = b[mfSortKey];
      if (av === null || av === undefined) av = -9999;
      if (bv === null || bv === undefined) bv = -9999;
      if (mfSortKey === "scheme" || mfSortKey === "provider") {
        return mfSortDir === "asc" ? a[mfSortKey].localeCompare(b[mfSortKey]) : b[mfSortKey].localeCompare(a[mfSortKey]);
      }
      return mfSortDir === "asc" ? av - bv : bv - av;
    });
    return list;
  }, [mfQuery, mfCategory, mfSortKey, mfSortDir]);

  function toggleMfSort(key) {
    if (mfSortKey === key) {
      setMfSortDir(mfSortDir === "asc" ? "desc" : "asc");
    } else {
      setMfSortKey(key);
      setMfSortDir("desc");
    }
  }

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

  function toggleClassFund(classKey, id) {
    setClassSelections((prev) => {
      const cur = prev[classKey] || [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...prev, [classKey]: next };
    });
    setOverrides((prev) => {
      if (prev[id] !== undefined) return prev;
      const f = ALL_FUNDS.find((x) => x.id === id);
      return { ...prev, [id]: bestReturn(f).value };
    });
  }

  const classData = ASSET_CLASSES.map((ac) => {
    const ids = classSelections[ac.key] || [];
    const classAmount = classAmounts[ac.key] || 0;
    const mode = ac.supportsSip ? classModes[ac.key] || "lumpsum" : "lumpsum";
    const selected = ids.map((id) => ac.funds.find((f) => f.id === id)).filter(Boolean);
    const perFundAmount = selected.length ? classAmount / selected.length : 0;
    const projections = selected.map((f) => {
      const r = overrides[f.id] ?? bestReturn(f).value;
      const fv = computeFutureValue(perFundAmount, r, years, mode);
      const invested = investedForMode(perFundAmount, years, mode);
      return { fund: f, r, fv, invested, gain: fv - invested };
    });
    const classFV = projections.reduce((s, p) => s + p.fv, 0);
    const classInvested = projections.reduce((s, p) => s + p.invested, 0);
    return { ...ac, ids, amount: classAmount, mode, projections, classFV, classInvested };
  });

  const totalInvested = classData.reduce((s, c) => s + c.classInvested, 0);
  const totalFV = classData.reduce((s, c) => s + c.classFV, 0);
  const totalGain = totalFV - totalInvested;
  const blendedReturn = totalInvested > 0 && years > 0 ? (Math.pow(totalFV / totalInvested, 1 / years) - 1) * 100 : 0;

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
                Bank-approved PMS shelf, plus top-15-AMC mutual funds — real manager, strategy & returns data.
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
              14 PMS · 97 MUTUAL FUNDS
            </div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { id: "explore", label: "PMS", icon: LayoutList },
              { id: "mutualfunds", label: "Mutual Funds", icon: LayoutList },
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
        ) : tab === "mutualfunds" ? (
          <MutualFundsView
            funds={mfFiltered}
            query={mfQuery}
            setQuery={setMfQuery}
            category={mfCategory}
            setCategory={setMfCategory}
            sortKey={mfSortKey}
            sortDir={mfSortDir}
            toggleSort={toggleMfSort}
          />
        ) : (
          <CalculatorView
            classData={classData}
            toggleClassFund={toggleClassFund}
            overrides={overrides}
            setOverrides={setOverrides}
            classAmounts={classAmounts}
            setClassAmounts={setClassAmounts}
            classModes={classModes}
            setClassModes={setClassModes}
            years={years}
            setYears={setYears}
            totalInvested={totalInvested}
            totalFV={totalFV}
            totalGain={totalGain}
            blendedReturn={blendedReturn}
          />
        )}
      </main>

      {openFund && <FundDetail fund={openFund} onClose={() => setOpenFund(null)} />}

      <footer style={{ borderTop: `1px solid ${RULE}`, padding: "18px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, maxWidth: 640, marginInline: "auto" }}>
          14 PMS schemes (bank Reckoner + provider decks) and 97 mutual fund schemes across 8 categories —
          Aggressive Hybrid, Balanced Advantage, Multi Asset Allocation, Conservative Hybrid, Banking & PSU,
          Corporate Bond, Short Duration, Gilt — verified per-scheme against Groww's live fund pages as of
          Aug/Sep 2026. Direct Plan – Growth throughout. Gaps are funds genuinely not offered by that AMC or
          not reliably available, not guesses. Past returns don't guarantee future performance.
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

function MutualFundsView({ funds, query, setQuery, category, setCategory, sortKey, sortDir, toggleSort }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {MF_CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: "7px 13px",
                borderRadius: 20,
                border: `1px solid ${active ? GOLD : RULE}`,
                background: active ? GOLD : CARD,
                color: active ? "#fff" : INK,
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 380 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: MUTED }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search AMC or scheme…"
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
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${RULE}` }}>
              <SortHeader label="Scheme" k="scheme" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="left" />
              <SortHeader label="1Y" k="r1y" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="3Y" k="r3y" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="5Y" k="r5y" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {funds.map((f) => (
              <tr key={f.id} className="row-hover" style={{ borderBottom: `1px solid ${RULE}` }}>
                <td style={{ padding: "12px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f.scheme}</div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{f.provider}</div>
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
      <p style={{ fontSize: 11.5, color: MUTED, marginTop: 12, lineHeight: 1.5 }}>
        Direct Plan – Growth returns, verified against Groww's live fund pages (12 Aug 2026). "—" means that
        period genuinely isn't available for this fund (too new, or not reliably sourced) — not a zero.
      </p>
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
            {provInfo.founded && (
              <p style={{ fontSize: 12.5, color: INK, lineHeight: 1.5, margin: "0 0 10px" }}>
                Founded {provInfo.founded}
                {provInfo.aumUsdBn ? ` · ~USD ${provInfo.aumUsdBn}bn managed` : ""}
                {provInfo.aumCr ? ` · ~\u20B9${provInfo.aumCr.toLocaleString("en-IN")} Cr managed` : ""}
                {provInfo.team ? ` · ${provInfo.team} people` : ""}
                {provInfo.locations ? ` across ${provInfo.locations} locations` : ""}.
                {" "}{provInfo.philosophy} {provInfo.framework}
              </p>
            )}
            {fund.managers.filter((m) => provInfo.managers.some((pm) => pm.name === m)).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {fund.managers.map((m) => {
                  const bio = provInfo.managers.find((pm) => pm.name === m);
                  if (!bio) return null;
                  return (
                    <div key={m} style={{ background: PAPER, borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        {bio.name} {bio.credentials && <span style={{ fontWeight: 400, color: MUTED, fontSize: 12 }}>({bio.credentials})</span>}
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
  classData,
  toggleClassFund,
  overrides,
  setOverrides,
  classAmounts,
  setClassAmounts,
  classModes,
  setClassModes,
  years,
  setYears,
  totalInvested,
  totalFV,
  totalGain,
  blendedReturn,
}) {
  const [expanded, setExpanded] = useState(() => Object.fromEntries(ASSET_CLASSES.map((c) => [c.key, true])));

  return (
    <div style={{ maxWidth: 640, marginInline: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11.5, color: MUTED, display: "block", marginBottom: 4 }}>Investment horizon (years)</label>
        <input
          type="number"
          min={1}
          max={30}
          value={years}
          onChange={(e) => setYears(Math.min(30, Math.max(1, Number(e.target.value))))}
          className="mono"
          style={{ width: 110, padding: "9px 10px", border: `1px solid ${RULE}`, borderRadius: 6, fontSize: 14 }}
        />
        <p style={{ fontSize: 11.5, color: MUTED, margin: "6px 0 0" }}>Shared across every asset class below.</p>
      </div>

      {classData.map((cls) => (
        <AssetClassCard
          key={cls.key}
          cls={cls}
          expanded={expanded[cls.key]}
          onToggleExpand={() => setExpanded((e) => ({ ...e, [cls.key]: !e[cls.key] }))}
          setClassAmounts={setClassAmounts}
          setClassModes={setClassModes}
          toggleClassFund={toggleClassFund}
          overrides={overrides}
          setOverrides={setOverrides}
        />
      ))}

      <div style={{ background: INK, borderRadius: 10, padding: 18, marginTop: 8, color: "#fff" }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, opacity: 0.7 }}>
          PORTFOLIO PROJECTION · {years} YEAR{years > 1 ? "S" : ""}
        </div>
        <div className="mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{fmtINR(totalFV)}</div>
        <div className="mono" style={{ fontSize: 13, marginTop: 2, opacity: 0.85 }}>
          {totalGain >= 0 ? "+" : ""}{fmtINR(totalGain)} gain on {fmtINR(totalInvested)} invested
        </div>
        {totalInvested > 0 && (
          <div className="mono" style={{ fontSize: 12, marginTop: 8, opacity: 0.75 }}>
            Blended return: {blendedReturn >= 0 ? "+" : ""}{blendedReturn.toFixed(2)}% p.a.
          </div>
        )}
        {classData.filter((c) => c.classInvested > 0).length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
            {classData
              .filter((c) => c.classInvested > 0)
              .map((c) => (
                <div key={c.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", opacity: 0.85 }}>
                  <span>{c.label}{c.mode === "sip" ? " (SIP)" : ""}</span>
                  <span className="mono">{fmtINR(c.classFV)}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {totalInvested === 0 && (
        <p style={{ fontSize: 12.5, color: MUTED, textAlign: "center", marginTop: 12 }}>
          Pick funds and enter an amount in one or more sections above to see a projection.
        </p>
      )}

      <p style={{ fontSize: 11.5, color: MUTED, marginTop: 14, lineHeight: 1.5, textAlign: "center" }}>
        Assumed annual return is pre-filled per fund from its longest available track record and is editable with
        +/−. Illustrative only — past performance doesn't predict future returns.
      </p>
    </div>
  );
}

function AssetClassCard({ cls, expanded, onToggleExpand, setClassAmounts, setClassModes, toggleClassFund, overrides, setOverrides }) {
  const [query, setQuery] = useState("");
  const list = cls.funds.filter(
    (f) => f.scheme.toLowerCase().includes(query.toLowerCase()) || f.provider.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ border: `1px solid ${RULE}`, borderRadius: 10, background: CARD, marginBottom: 14, overflow: "hidden" }}>
      <button
        onClick={onToggleExpand}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div>
          <div className="disp" style={{ fontSize: 16, fontWeight: 700 }}>{cls.label}</div>
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
            {cls.ids.length > 0
              ? cls.mode === "sip"
                ? `${cls.ids.length} fund${cls.ids.length > 1 ? "s" : ""} · ${fmtINR(cls.amount)}/mo SIP`
                : `${cls.ids.length} fund${cls.ids.length > 1 ? "s" : ""} · ${fmtINR(cls.amount)} invested`
              : "No funds selected"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {cls.classFV > 0 && <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{fmtINR(cls.classFV)}</div>}
          <ChevronDown size={18} color={MUTED} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 16px 16px" }}>
          {cls.supportsSip && (
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {[
                { key: "lumpsum", label: "Lump Sum" },
                { key: "sip", label: "Monthly SIP" },
              ].map((m) => {
                const active = (cls.mode || "lumpsum") === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setClassModes((prev) => ({ ...prev, [cls.key]: m.key }))}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: 6,
                      border: `1px solid ${active ? GOLD : RULE}`,
                      background: active ? GOLD : PAPER,
                      color: active ? "#fff" : INK,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11.5, color: MUTED, display: "block", marginBottom: 4 }}>
              {cls.mode === "sip" ? `Monthly SIP amount in ${cls.label} (₹)` : `Amount to invest in ${cls.label} (₹)`}
            </label>
            <input
              type="number"
              value={cls.amount}
              onChange={(e) => setClassAmounts((a) => ({ ...a, [cls.key]: Math.max(0, Number(e.target.value)) }))}
              className="mono"
              style={{ width: "100%", padding: "9px 10px", border: `1px solid ${RULE}`, borderRadius: 6, fontSize: 14 }}
            />
          </div>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <Search size={14} style={{ position: "absolute", left: 9, top: 9, color: MUTED }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${cls.label}…`}
              style={{ width: "100%", padding: "7px 9px 7px 30px", border: `1px solid ${RULE}`, borderRadius: 6, fontSize: 13, background: PAPER }}
            />
          </div>
          <div style={{ border: `1px solid ${RULE}`, borderRadius: 8, maxHeight: 220, overflowY: "auto" }}>
            {list.map((f) => {
              const checked = cls.ids.includes(f.id);
              const br = bestReturn(f);
              return (
                <label
                  key={f.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    borderBottom: `1px solid ${RULE}`,
                    cursor: "pointer",
                    background: checked ? "#F8F5EA" : "transparent",
                  }}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleClassFund(cls.key, f.id)} style={{ width: 14, height: 14 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.scheme}</div>
                    <div style={{ fontSize: 11, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.provider}</div>
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: colorFor(br.value), flexShrink: 0 }}>{fmtPct(br.value)} {br.label}</div>
                </label>
              );
            })}
            {list.length === 0 && <p style={{ fontSize: 12, color: MUTED, textAlign: "center", padding: 16 }}>No match.</p>}
          </div>

          {cls.projections.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {cls.projections.map((p) => (
                <div key={p.fund.id} style={{ padding: "8px 0", borderBottom: `1px solid ${RULE}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.fund.scheme}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <button
                      onClick={() => setOverrides((o) => ({ ...o, [p.fund.id]: Math.round((o[p.fund.id] - 0.5) * 10) / 10 }))}
                      style={{ border: `1px solid ${RULE}`, background: "none", borderRadius: 4, width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Minus size={10} />
                    </button>
                    <span className="mono" style={{ fontSize: 11.5, width: 44, textAlign: "center" }}>{p.r.toFixed(1)}%</span>
                    <button
                      onClick={() => setOverrides((o) => ({ ...o, [p.fund.id]: Math.round((o[p.fund.id] + 0.5) * 10) / 10 }))}
                      style={{ border: `1px solid ${RULE}`, background: "none", borderRadius: 4, width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="mono" style={{ fontSize: 12, width: 80, textAlign: "right", fontWeight: 600 }}>{fmtINR(p.fv)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{cls.label} subtotal</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{fmtINR(cls.classFV)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
