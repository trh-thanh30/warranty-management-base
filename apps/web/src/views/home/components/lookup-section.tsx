"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Car,
  Wrench,
  Clock,
  Sparkles,
  Key,
  Phone,
  User,
  CheckCircle2,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@repo/ui/button";

interface WarrantyDetails {
  vehicleName: string;
  vin: string;
  licensePlate: string;
  planName: string;
  status: "Active" | "Expired" | "Pending";
  startDate: string;
  endDate: string;
  claimLimit: string;
  claimsUsed: string;
  remainingLimit: string;
  daysRemaining: number;
  progressPercent: number;
  coverageScope: string[];
}

const mockDatabase: Record<string, WarrantyDetails> = {
  "GB64 EFG": {
    vehicleName: "Mercedes-Benz C200 (2022)",
    vin: "W1KWF8DB4NF999999",
    licensePlate: "GB64 EFG",
    planName: "Premium Care Package",
    status: "Active",
    startDate: "2025-10-15",
    endDate: "2026-10-15",
    claimLimit: "$5,000",
    claimsUsed: "$1,200",
    remainingLimit: "$3,800",
    daysRemaining: 124,
    progressPercent: 66,
    coverageScope: [
      "Engine & Turbocharger",
      "Transmission (Auto/Manual)",
      "Electrical Systems",
      "Air Conditioning",
      "Suspension & Steering",
    ],
  },
  "LS15 HRD": {
    vehicleName: "Honda CR-V (2021)",
    vin: "JH4YK3F85MC888888",
    licensePlate: "LS15 HRD",
    planName: "Standard Care Package",
    status: "Active",
    startDate: "2026-01-10",
    endDate: "2027-01-10",
    claimLimit: "$4,500",
    claimsUsed: "$0",
    remainingLimit: "$4,500",
    daysRemaining: 210,
    progressPercent: 42,
    coverageScope: [
      "Engine block & internal parts",
      "Gearbox & Torque converter",
      "Starter Motor & Alternator",
      "Braking System (excluding pads)",
    ],
  },
  "LO19 KWY": {
    vehicleName: "Toyota Vios (2019)",
    vin: "AHTK23F90KB111111",
    licensePlate: "LO19 KWY",
    planName: "Basic Care Package",
    status: "Expired",
    startDate: "2024-05-10",
    endDate: "2025-05-10",
    claimLimit: "$3,000",
    claimsUsed: "$3,000",
    remainingLimit: "$0",
    daysRemaining: 0,
    progressPercent: 100,
    coverageScope: [
      "Engine (lubricated parts only)",
      "Manual/Automatic Transmission",
    ],
  },
};

const defaultRecord: WarrantyDetails = {
  vehicleName: "Hyundai Santa Fe (2023)",
  vin: "KMHSH81C7NU204680",
  licensePlate: "LN71 DXG",
  planName: "Standard Care Package",
  status: "Active",
  startDate: "2026-02-01",
  endDate: "2027-02-01",
  claimLimit: "$4,500",
  claimsUsed: "$350",
  remainingLimit: "$4,150",
  daysRemaining: 231,
  progressPercent: 36,
  coverageScope: [
    "Engine & Turbocharger",
    "Transmission & Gearbox",
    "Starter Motor & Alternator",
    "Steering System",
  ],
};

type HubTab = "lookup" | "activate" | "claim";

export function LookupSection() {
  const [activeTab, setActiveTab] = useState<HubTab>("lookup");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#activate") {
        setActiveTab("activate");
      } else if (hash === "#claim") {
        setActiveTab("claim");
      } else if (hash === "#lookup") {
        setActiveTab("lookup");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Tab 1: Lookup state
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState<WarrantyDetails | null>(
    null,
  );
  const [lookupSearched, setLookupSearched] = useState(false);

  // Tab 2: Activate state
  const [activationCode, setActivationCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vinNumber, setVinNumber] = useState("");
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [activatedRecord, setActivatedRecord] = useState<{
    contractId: string;
    date: string;
  } | null>(null);

  // Tab 3: Claim state
  const [claimVin, setClaimVin] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimWorkshop, setClaimWorkshop] = useState("");
  const [claimIssue, setClaimIssue] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimCode, setClaimCode] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLoading(true);
    setLookupResult(null);

    setTimeout(() => {
      const cleanQuery = lookupQuery.trim().toUpperCase();
      const matchedKey = Object.keys(mockDatabase).find(
        (key) =>
          key.replace(/[-.]/g, "") === cleanQuery.replace(/[-.]/g, "") ||
          cleanQuery.includes(key.replace(/[-.]/g, "")) ||
          cleanQuery.includes(key),
      );

      if (matchedKey) {
        setLookupResult(mockDatabase[matchedKey] || null);
      } else if (cleanQuery.length > 5) {
        setLookupResult({
          ...defaultRecord,
          vin: cleanQuery.padEnd(17, "X").substring(0, 17),
          licensePlate: lookupQuery.trim().toUpperCase(),
        });
      } else {
        setLookupResult(null);
      }
      setIsLoading(false);
      setLookupSearched(true);
    }, 800);
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode || !fullName || !phone || !vinNumber) return;

    setIsLoading(true);
    setTimeout(() => {
      const randomContract = `W-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expireDate = new Date();
      expireDate.setFullYear(expireDate.getFullYear() + 1); // 1 year warranty

      setActivatedRecord({
        contractId: randomContract,
        date: expireDate.toISOString().split("T")[0] || "",
      });
      setIsLoading(false);
      setActivationSuccess(true);
    }, 1200);
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimVin || !claimPhone || !claimWorkshop || !claimIssue) return;

    setIsLoading(true);
    setTimeout(() => {
      const generatedClaim = `CLAIM-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
      setClaimCode(generatedClaim);
      setIsLoading(false);
      setClaimSuccess(true);
    }, 1200);
  };

  const resetForms = () => {
    setLookupQuery("");
    setLookupResult(null);
    setLookupSearched(false);

    setActivationCode("");
    setFullName("");
    setPhone("");
    setVinNumber("");
    setActivationSuccess(false);
    setActivatedRecord(null);

    setClaimVin("");
    setClaimPhone("");
    setClaimWorkshop("");
    setClaimIssue("");
    setClaimSuccess(false);
    setClaimCode("");
  };

  const handleTabChange = (tab: HubTab) => {
    setActiveTab(tab);
    resetForms();
  };

  return (
    <section
      id="lookup"
      className="relative bg-white py-16 sm:py-24 border-b border-slate-100"
    >
      {/* Invisible anchors to support browser scrolling matching the navbar */}
      <div id="activate" className="absolute top-0" />
      <div id="claim" className="absolute top-0" />
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-48 top-0 h-96 w-96 rounded-full bg-[#0b7dff]/5 blur-[120px]" />
        <div className="absolute -right-48 bottom-0 h-96 w-96 rounded-full bg-[#9ed5ff]/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b7dff]/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0b7dff]">
            <Sparkles className="h-3 w-3" />
            Warranty Service Hub
          </span>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Manage Your Protection
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Check expiration, activate new warranty certificates, or request
            repair claims instantly through our integrated dashboard.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => handleTabChange("lookup")}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "lookup"
                  ? "bg-white text-[#0b7dff] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Check Expiry
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("activate")}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "activate"
                  ? "bg-white text-[#0b7dff] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Activate Warranty
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("claim")}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === "claim"
                  ? "bg-white text-[#0b7dff] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Request Claim
            </button>
          </div>
        </div>

        {/* Main Dashboard Card */}
        <div className="mx-auto mt-8 max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08)] sm:p-10">
          <AnimatePresence mode="wait">
            {/* TAB 1: LOOKUP */}
            {activeTab === "lookup" && (
              <motion.div
                key="lookup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form
                  onSubmit={handleLookup}
                  className="relative flex flex-col gap-3 sm:flex-row"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Plate (e.g. 30A-999.99) or VIN..."
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition-all focus:border-[#0b7dff] focus:bg-white focus:ring-2 focus:ring-[#0b7dff]/15"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !lookupQuery.trim()}
                    className="h-12 rounded-full bg-[#0b7dff] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0b7dff]/15 transition-all hover:bg-[#0966d6] disabled:opacity-50 cursor-pointer sm:w-auto"
                  >
                    {isLoading ? "Checking..." : "Verify Status"}
                  </Button>
                </form>

                {/* Lookup Results */}
                <div className="mt-8">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#0b7dff]" />
                      <p className="mt-4 text-sm font-medium text-slate-500">
                        Retrieving security database...
                      </p>
                    </div>
                  )}

                  {!isLoading && lookupSearched && lookupResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div
                        className={`flex items-center justify-between rounded-2xl p-4 ${
                          lookupResult.status === "Active"
                            ? "bg-emerald-50 border border-emerald-100 text-emerald-950"
                            : "bg-rose-50 border border-rose-100 text-rose-950"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {lookupResult.status === "Active" ? (
                            <div className="rounded-full bg-emerald-500 p-2 text-white shadow-md">
                              <ShieldCheck className="h-5 w-5" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-rose-500 p-2 text-white shadow-md">
                              <ShieldAlert className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold">
                              {lookupResult.planName}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              VIN: {lookupResult.vin}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            lookupResult.status === "Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {lookupResult.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid gap-3.5 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                          <Car className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Vehicle
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {lookupResult.vehicleName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                          <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              License Plate
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {lookupResult.licensePlate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Coverage Duration
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {lookupResult.startDate} to {lookupResult.endDate}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Remaining
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {lookupResult.status === "Active"
                                ? `${lookupResult.daysRemaining} Days`
                                : "Expired"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expiration Progress */}
                      {lookupResult.status === "Active" && (
                        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">
                              Warranty Term Duration
                            </span>
                            <span className="text-[#0b7dff]">
                              {lookupResult.progressPercent}% Time Elapsed
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#0b7dff] rounded-full transition-all duration-500"
                              style={{
                                width: `${lookupResult.progressPercent}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Claim Budget Summary */}
                      <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex justify-between border-b border-slate-200/60 pb-2.5 text-xs font-semibold">
                          <span className="text-slate-800">
                            Claim Budget Limits
                          </span>
                          <span className="text-slate-400">
                            Total Limit: {lookupResult.claimLimit}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400 font-medium">
                              Claims Used
                            </span>
                            <span className="text-base font-bold text-slate-800">
                              {lookupResult.claimsUsed}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400 font-medium">
                              Remaining Budget
                            </span>
                            <span
                              className={`text-base font-bold ${lookupResult.status === "Active" ? "text-emerald-600" : "text-slate-500"}`}
                            >
                              {lookupResult.remainingLimit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scope list */}
                      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Wrench className="h-3.5 w-3.5 text-[#0b7dff]" />
                          Covered Components List
                        </h5>
                        <ul className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                          {lookupResult.coverageScope.map((scope, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0b7dff]" />
                              {scope}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {!isLoading && lookupSearched && !lookupResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center text-rose-600"
                    >
                      <ShieldAlert className="h-10 w-10 text-rose-400" />
                      <h4 className="mt-3 text-sm font-bold text-slate-900">
                        Warranty Record Not Found
                      </h4>
                      <p className="mt-1.5 max-w-sm text-xs text-slate-500">
                        Please check the spelling of your license plate (e.g.
                        30A-999.99) or VIN, or make sure it has been activated.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: ACTIVATE */}
            {activeTab === "activate" && (
              <motion.div
                key="activate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!activationSuccess ? (
                  <form onSubmit={handleActivate} className="space-y-4">
                    <div className="text-center pb-2">
                      <p className="text-xs text-slate-500">
                        Activate your warranty protection using the code
                        provided by your vehicle dealer.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Code */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Activation Code
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="ACT-XXXXX"
                            value={activationCode}
                            onChange={(e) => setActivationCode(e.target.value)}
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* VIN */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Vehicle VIN (17 digits)
                        </label>
                        <div className="relative">
                          <Car className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Enter 17-digit VIN..."
                            value={vinNumber}
                            onChange={(e) => setVinNumber(e.target.value)}
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Fullname */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Owner Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="James Smith..."
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            required
                            placeholder="+44 7700 900077..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 w-full rounded-full bg-[#0b7dff] text-sm font-semibold text-white shadow-lg shadow-[#0b7dff]/15 transition-all hover:bg-[#0966d6] cursor-pointer"
                    >
                      {isLoading
                        ? "Validating & Activating..."
                        : "Confirm & Activate Warranty"}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                  >
                    <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      Warranty Activated Successfully!
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 max-w-sm">
                      Your protection plan is now active in the system network.
                      You can present this certificate at any partner workshop.
                    </p>

                    <div className="mt-6 w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2 text-left text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract Code:</span>
                        <span className="font-bold text-slate-950">
                          {activatedRecord?.contractId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owner Name:</span>
                        <span className="font-semibold text-slate-950">
                          {fullName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          VIN Registration:
                        </span>
                        <span className="font-semibold text-slate-950">
                          {vinNumber.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Valid Until:</span>
                        <span className="font-bold text-emerald-600">
                          {activatedRecord?.date}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 w-full sm:flex-row justify-center">
                      <Button
                        type="button"
                        onClick={resetForms}
                        className="h-11 rounded-full bg-slate-100 px-6 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        Activate Another
                      </Button>
                      <Button
                        type="button"
                        onClick={() =>
                          alert("Downloading Warranty E-Certificate PDF...")
                        }
                        className="h-11 rounded-full bg-[#0b7dff] px-6 text-xs font-semibold text-white hover:bg-[#0966d6] cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF Certificate
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB 3: CLAIM */}
            {activeTab === "claim" && (
              <motion.div
                key="claim"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!claimSuccess ? (
                  <form onSubmit={handleClaim} className="space-y-4">
                    <div className="text-center pb-2">
                      <p className="text-xs text-slate-500">
                        Car broke down or needs repairs? Select your workshop
                        and submit a claim limit approval request.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* VIN / Plate */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          VIN or License Plate
                        </label>
                        <div className="relative">
                          <Car className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            placeholder="Enter VIN/Plate to verify..."
                            value={claimVin}
                            onChange={(e) => setClaimVin(e.target.value)}
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Contact Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            required
                            placeholder="Enter active phone number..."
                            value={claimPhone}
                            onChange={(e) => setClaimPhone(e.target.value)}
                            className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Workshop Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Select Repair Workshop
                      </label>
                      <select
                        required
                        value={claimWorkshop}
                        onChange={(e) => setClaimWorkshop(e.target.value)}
                        className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Choose Partner Workshop --
                        </option>
                        <option value="London Auto Service Centre">
                          London Auto Service Centre (Holborn, London)
                        </option>
                        <option value="West-End Premium Garage">
                          West-End Premium Garage (Kensington, London)
                        </option>
                        <option value="Manchester Garage Pro">
                          Manchester Garage Pro (Deansgate, Manchester)
                        </option>
                        <option value="Piccadilly Auto Workshop">
                          Piccadilly Auto Workshop (Piccadilly, Manchester)
                        </option>
                        <option value="Birmingham Automotive Clinic">
                          Birmingham Automotive Clinic (Broad St, Birmingham)
                        </option>
                      </select>
                    </div>

                    {/* Issue Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Breakdown Description
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Please describe what parts are broken or failing (e.g. engine overheating, transmission slipping)..."
                        value={claimIssue}
                        onChange={(e) => setClaimIssue(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-950 outline-none focus:border-[#0b7dff] focus:bg-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 w-full rounded-full bg-rose-600 text-sm font-semibold text-white shadow-lg shadow-rose-600/15 transition-all hover:bg-rose-700 cursor-pointer"
                    >
                      {isLoading
                        ? "Submitting Claim Request..."
                        : "Submit Claim Request"}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6"
                  >
                    <div className="rounded-full bg-amber-50 p-3 text-amber-600 border border-amber-200">
                      <AlertTriangle className="h-12 w-12 text-amber-500 animate-pulse" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-950">
                      Claim Request Submitted
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 max-w-sm">
                      Your warranty repair request has been logged. Our claims
                      review department will verify the coverage limits.
                    </p>

                    <div className="mt-6 w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2 text-left text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Claim Code ID:</span>
                        <span className="font-bold text-slate-950">
                          {claimCode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned Gara:</span>
                        <span className="font-semibold text-slate-950">
                          {claimWorkshop}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Submit Status:</span>
                        <span className="font-bold text-amber-600">
                          Pending Review
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Response ETA:</span>
                        <span className="font-semibold text-slate-950">
                          Within 15 minutes
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 text-xs text-slate-400 border-t border-slate-100 pt-4 w-full">
                      Please keep your vehicle at the workshop. A technician
                      will contact you and the garage coordinator shortly.
                    </div>

                    <Button
                      type="button"
                      onClick={resetForms}
                      className="mt-6 h-11 rounded-full bg-slate-100 px-8 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                    >
                      New Request
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
