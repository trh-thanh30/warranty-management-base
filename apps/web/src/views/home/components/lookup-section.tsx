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
  Key,
  Phone,
  User,
  CheckCircle2,
  Download,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import type { WarrantyDetails } from "../home.types";
import { mockWarrantyDatabase } from "../home.constants";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";

type HubTab = "lookup" | "activate" | "claim";

interface LookupSectionProps {
  isModalOpen?: boolean;
  setIsModalOpen?: (isOpen: boolean) => void;
  activeTab?: HubTab;
  setActiveTab?: (tab: HubTab) => void;
}

export function LookupSection({
  isModalOpen: controlledIsModalOpen,
  setIsModalOpen: controlledSetIsModalOpen,
  activeTab: controlledActiveTab,
  setActiveTab: controlledSetActiveTab,
}: LookupSectionProps) {
  const [localActiveTab, localSetActiveTab] = useState<HubTab>("lookup");
  const [localIsModalOpen, localSetIsModalOpen] = useState(false);

  const activeTab =
    controlledActiveTab !== undefined ? controlledActiveTab : localActiveTab;
  const setActiveTab =
    controlledSetActiveTab !== undefined
      ? controlledSetActiveTab
      : localSetActiveTab;
  const isModalOpen =
    controlledIsModalOpen !== undefined
      ? controlledIsModalOpen
      : localIsModalOpen;
  const setIsModalOpen =
    controlledSetIsModalOpen !== undefined
      ? controlledSetIsModalOpen
      : localSetIsModalOpen;

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#activate") {
        setActiveTab("activate");
        setIsModalOpen(true);
      } else if (hash === "#claim") {
        setActiveTab("claim");
        setIsModalOpen(true);
      } else if (hash === "#lookup") {
        setActiveTab("lookup");
        setIsModalOpen(true);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [setActiveTab, setIsModalOpen]);

  // Tab 1: Lookup state
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupContact, setLookupContact] = useState("");
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
    if (!lookupQuery.trim() || !lookupContact.trim()) return;

    setIsLoading(true);
    setLookupResult(null);

    setTimeout(() => {
      const cleanCode = lookupQuery.trim().toUpperCase();
      const cleanContact = lookupContact.trim().toLowerCase();

      const matchedRecord = mockWarrantyDatabase[cleanCode];

      if (
        matchedRecord &&
        (matchedRecord.ownerPhone === cleanContact ||
          matchedRecord.ownerEmail === cleanContact)
      ) {
        setLookupResult(matchedRecord.details);
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
    setLookupContact("");
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

  const { container, fadeUp } = useScrollReveal();

  return (
    <section
      id="lookup"
      className="relative bg-white min-h-[90vh] py-24 sm:py-32 flex items-center border-b border-cloud"
    >
      {/* Invisible anchors to support browser scrolling matching the navbar */}
      <div id="activate" className="absolute top-0" />
      <div id="claim" className="absolute top-0" />

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full"
      >
        <motion.div
          variants={fadeUp}
          className="mx-auto max-w-4xl text-center pb-8"
        >
          <div className="inline-flex items-center gap-2.5 text-sm sm:text-base font-sans font-bold uppercase tracking-[0.25em] text-brand-blue justify-center w-full">
            <span>Warranty Service Hub</span>
          </div>
          <h2 className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-charcoal sm:text-5xl lg:text-6xl max-w-none">
            Manage Your Protection
          </h2>
          <div className="mt-6 mx-auto h-[3px] w-16 bg-brand-blue" />
          <p className="mt-6 text-sm sm:text-base leading-7 text-graphite max-w-2xl mx-auto font-sans font-medium">
            Check expiration, activate new warranty certificates, or request
            repair claims instantly through our integrated dashboard.
          </p>
        </motion.div>

        {/* Services Grid (3 Cards) */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {/* Card 1: Check Expiry */}
          <motion.div
            variants={fadeUp}
            className="group rounded-2xl border border-cloud bg-white p-8 sm:p-10 transition-all duration-[330ms] hover:border-brand-blue hover:shadow-[0_12px_40px_rgba(11,125,255,0.08)] flex flex-col justify-between min-h-[420px]"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-105 transition-transform duration-[330ms]">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-condensed uppercase tracking-wider text-charcoal">
                Check Coverage Expiry
              </h3>
              <p className="mt-3 text-sm text-graphite leading-relaxed">
                Verify your vehicle&apos;s warranty status, contract expiration
                dates, and remaining claim limits instantly with ownership
                validation.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-pewter border-t border-cloud pt-6">
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Real-time coverage status & validation</span>
                </li>
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Verify owner phone & email records</span>
                </li>
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Check claim counts & financial limits</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("lookup");
                setIsModalOpen(true);
              }}
              className="mt-8 relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl border border-brand-blue text-xs font-condensed font-bold uppercase tracking-wider text-brand-blue bg-transparent transition-all duration-[300ms] group-hover:text-white hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer z-10 w-full"
            >
              {/* Rotated square diagonal sweep fill effect - triggered instantly on card hover via CSS */}
              <span className="absolute w-[300%] aspect-square -top-[100%] -left-[100%] bg-brand-blue rotate-45 translate-y-[150%] translate-x-[150%] transition-transform duration-[700ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 z-0" />
              <span className="relative z-10">Verify Status</span>
            </button>
          </motion.div>

          {/* Card 2: Activate Warranty */}
          <motion.div
            variants={fadeUp}
            className="group rounded-2xl border border-cloud bg-white p-8 sm:p-10 transition-all duration-[330ms] hover:border-brand-blue hover:shadow-[0_12px_40px_rgba(11,125,255,0.08)] flex flex-col justify-between min-h-[420px]"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-105 transition-transform duration-[330ms]">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-condensed uppercase tracking-wider text-charcoal">
                Activate Warranty
              </h3>
              <p className="mt-3 text-sm text-graphite leading-relaxed">
                Received an activation code from your vehicle dealer? Enter your
                VIN and owner details to start your protection plan.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-pewter border-t border-cloud pt-6">
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Register dealer activation codes</span>
                </li>
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Bind 17-digit chassis VIN numbers</span>
                </li>
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Generate downloadable certificate PDF</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("activate");
                setIsModalOpen(true);
              }}
              className="mt-8 relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl border border-brand-blue text-xs font-condensed font-bold uppercase tracking-wider text-brand-blue bg-transparent transition-all duration-[300ms] group-hover:text-white hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer z-10 w-full"
            >
              {/* Rotated square diagonal sweep fill effect - triggered instantly on card hover via CSS */}
              <span className="absolute w-[300%] aspect-square -top-[100%] -left-[100%] bg-brand-blue rotate-45 translate-y-[150%] translate-x-[150%] transition-transform duration-[700ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 z-0" />
              <span className="relative z-10">Register Code</span>
            </button>
          </motion.div>

          {/* Card 3: Request Claim */}
          <motion.div
            variants={fadeUp}
            className="group rounded-2xl border border-cloud bg-white p-8 sm:p-10 transition-all duration-[330ms] hover:border-brand-blue hover:shadow-[0_12px_40px_rgba(11,125,255,0.08)] flex flex-col justify-between min-h-[420px]"
          >
            <div>
              <div className="h-12 w-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-105 transition-transform duration-[330ms]">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-condensed uppercase tracking-wider text-charcoal">
                Request Repair Claim
              </h3>
              <p className="mt-3 text-sm text-graphite leading-relaxed">
                Experiencing a mechanical failure? Submit repair diagnostics
                directly to our network of 350+ certified workshop partners.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-pewter border-t border-cloud pt-6">
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Online breakdown & damage reports</span>
                </li>
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Search 350+ certified workshop centers</span>
                </li>
                <li className="flex items-center gap-2.5 font-sans">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-blue/60" />
                  <span>Real-time claim approval tracking</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab("claim");
                setIsModalOpen(true);
              }}
              className="mt-8 relative inline-flex h-11 items-center justify-center overflow-hidden rounded-xl border border-brand-blue text-xs font-condensed font-bold uppercase tracking-wider text-brand-blue bg-transparent transition-all duration-[300ms] group-hover:text-white hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer z-10 w-full"
            >
              {/* Rotated square diagonal sweep fill effect - triggered instantly on card hover via CSS */}
              <span className="absolute w-[300%] aspect-square -top-[100%] -left-[100%] bg-brand-blue rotate-45 translate-y-[150%] translate-x-[150%] transition-transform duration-[700ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 z-0" />
              <span className="relative z-10">Initiate Claim</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Warranty Service Hub Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                window.history.pushState(
                  "",
                  document.title,
                  window.location.pathname + window.location.search,
                );
              }}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-full max-w-4xl rounded-2xl border border-cloud bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-8"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  window.history.pushState(
                    "",
                    document.title,
                    window.location.pathname + window.location.search,
                  );
                }}
                className="absolute right-4 top-4 rounded-full p-2 text-pewter hover:bg-slate-100 hover:text-charcoal transition-all cursor-pointer z-20"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Scrollable Modal Body */}
              <div className="p-6 sm:p-10 overflow-y-auto flex-1">
                {/* Modal Header */}
                <div className="text-center pb-6 border-b border-cloud relative">
                  <div className="flex justify-center items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-brand-blue/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue border border-brand-blue/5">
                      Warranty Service Hub
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-medium tracking-tight text-charcoal">
                    {activeTab === "lookup" && "Verify Coverage Expiry"}
                    {activeTab === "activate" && "Activate New Warranty"}
                    {activeTab === "claim" && "Submit Repair Claim"}
                  </h3>
                </div>

                {/* Form contents */}
                <div className="mt-8">
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
                        <div className="max-w-md mx-auto">
                          {/* Left: Input Form */}
                          <form
                            onSubmit={handleLookup}
                            className="w-full space-y-4"
                          >
                            <div className="space-y-1.5">
                              <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                Warranty Code
                              </label>
                              <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pewter" />
                                <input
                                  type="text"
                                  required
                                  placeholder="Enter warranty code, e.g., WM-2026-AUDIA4"
                                  value={lookupQuery}
                                  onChange={(e) =>
                                    setLookupQuery(e.target.value)
                                  }
                                  className="h-12 w-full rounded-lg border border-cloud bg-ash pl-11 pr-4 text-sm text-charcoal placeholder:text-pewter outline-none transition-all focus:border-brand-blue focus:bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                Verification Phone or Email
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Enter registered phone (0901234567) or email"
                                value={lookupContact}
                                onChange={(e) =>
                                  setLookupContact(e.target.value)
                                }
                                className="h-12 w-full rounded-lg border border-cloud bg-ash px-4 text-sm text-charcoal placeholder:text-pewter outline-none transition-all focus:border-brand-blue focus:bg-white"
                              />
                            </div>

                            <Button
                              type="submit"
                              disabled={
                                isLoading ||
                                !lookupQuery.trim() ||
                                !lookupContact.trim()
                              }
                              className="h-12 w-full rounded-xl bg-brand-blue text-[15px] font-condensed font-bold uppercase tracking-wider text-white transition-all duration-[330ms] hover:bg-brand-blue/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 cursor-pointer"
                            >
                              {isLoading ? "Verifying..." : "Verify Coverage"}
                            </Button>
                          </form>
                        </div>

                        {/* Lookup Results */}
                        <div className="mt-8">
                          {isLoading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-brand-blue" />
                              <p className="mt-4 text-sm font-medium text-slate-500">
                                Retrieving security database...
                              </p>
                            </div>
                          )}

                          {!isLoading && lookupSearched && lookupResult && (
                            <motion.div
                              initial={{ scale: 0.98, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="rounded-[4px] border border-cloud bg-ash p-6 space-y-6"
                            >
                              <div className="flex flex-col justify-between gap-4 border-b border-cloud pb-6 sm:flex-row sm:items-center">
                                <div>
                                  <h3 className="text-lg font-medium text-charcoal">
                                    {lookupResult.vehicleName}
                                  </h3>
                                  <p className="mt-1 text-xs text-pewter">
                                    VIN: {lookupResult.vin} | Plate:{" "}
                                    {lookupResult.licensePlate}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-[4px] px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                    lookupResult.status === "Active"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : lookupResult.status === "Expired"
                                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                                        : "bg-amber-50 text-amber-700 border border-amber-200"
                                  }`}
                                >
                                  {lookupResult.status === "Active" ? (
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                  )}
                                  {lookupResult.status}
                                </span>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-4">
                                  <div className="flex items-start gap-3 text-xs">
                                    <Calendar className="mt-0.5 h-4 w-4 text-pewter" />
                                    <div>
                                      <span className="block font-medium text-charcoal">
                                        Coverage Period
                                      </span>
                                      <span className="text-pewter">
                                        {lookupResult.startDate} to{" "}
                                        {lookupResult.endDate}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-3 text-xs">
                                    <Clock className="mt-0.5 h-4 w-4 text-pewter" />
                                    <div>
                                      <span className="block font-medium text-charcoal">
                                        Time Remaining
                                      </span>
                                      <span className="text-pewter">
                                        {lookupResult.daysRemaining} days left
                                        of cover
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-pewter">
                                    Claim Budget Tracking
                                  </h4>
                                  <div className="space-y-1.5 text-xs text-graphite">
                                    <div className="flex justify-between">
                                      <span>Total Budget:</span>
                                      <span className="font-semibold text-charcoal">
                                        {lookupResult.claimLimit}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Claims Used:</span>
                                      <span className="font-semibold text-charcoal">
                                        {lookupResult.claimsUsed}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-t border-cloud/50 pt-1.5">
                                      <span className="font-medium">
                                        Remaining Budget:
                                      </span>
                                      <span className="font-semibold text-emerald-600">
                                        {lookupResult.remainingLimit}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full bg-brand-blue"
                                      style={{
                                        width: `${lookupResult.progressPercent}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="border-t border-cloud pt-6">
                                <h5 className="flex items-center gap-1.5 text-xs font-semibold text-charcoal mb-3">
                                  <Wrench className="h-3.5 w-3.5 text-brand-blue" />
                                  Covered Components List
                                </h5>
                                <ul className="grid gap-2 text-xs text-graphite sm:grid-cols-2">
                                  {lookupResult.coverageScope.map(
                                    (scope, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center gap-2"
                                      >
                                        <span className="h-1.5 w-1.5 rounded-[4px] bg-brand-blue" />
                                        {scope}
                                      </li>
                                    ),
                                  )}
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
                              <h4 className="mt-3 text-sm font-medium text-charcoal">
                                No Matching Records Found
                              </h4>
                              <p className="mt-1.5 max-w-sm text-xs text-pewter leading-relaxed">
                                No product was found matching the provided
                                warranty code and owner verification details.
                                Please check and try again.
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
                        className="max-w-xl mx-auto"
                      >
                        {!activationSuccess ? (
                          <form onSubmit={handleActivate} className="space-y-4">
                            <div className="text-center pb-2">
                              <p className="text-xs text-pewter">
                                Activate your warranty protection using the code
                                provided by your vehicle dealer.
                              </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              {/* Code */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                  Activation Code
                                </label>
                                <div className="relative">
                                  <Key className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pewter" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="ACT-XXXXX"
                                    value={activationCode}
                                    onChange={(e) =>
                                      setActivationCode(e.target.value)
                                    }
                                    className="h-11 w-full rounded-lg border border-cloud bg-ash pl-10 pr-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                                  />
                                </div>
                              </div>

                              {/* VIN */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                  Vehicle VIN (17 digits)
                                </label>
                                <div className="relative">
                                  <Car className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pewter" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter 17-digit VIN..."
                                    value={vinNumber}
                                    onChange={(e) =>
                                      setVinNumber(e.target.value)
                                    }
                                    className="h-11 w-full rounded-lg border border-cloud bg-ash pl-10 pr-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                                  />
                                </div>
                              </div>

                              {/* Fullname */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                  Owner Full Name
                                </label>
                                <div className="relative">
                                  <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pewter" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="James Smith..."
                                    value={fullName}
                                    onChange={(e) =>
                                      setFullName(e.target.value)
                                    }
                                    className="h-11 w-full rounded-lg border border-cloud bg-ash pl-10 pr-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                                  />
                                </div>
                              </div>

                              {/* Phone */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                  Phone Number
                                </label>
                                <div className="relative">
                                  <Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pewter" />
                                  <input
                                    type="tel"
                                    required
                                    placeholder="+44 7700 900077..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-cloud bg-ash pl-10 pr-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                                  />
                                </div>
                              </div>
                            </div>

                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="h-12 w-full rounded-xl bg-brand-blue text-[15px] font-condensed font-bold uppercase tracking-wider text-white transition-all duration-[330ms] hover:bg-brand-blue/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 cursor-pointer"
                            >
                              {isLoading
                                ? "Validating & Activating..."
                                : "Confirm & Activate Warranty"}
                            </Button>
                          </form>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center py-6"
                          >
                            <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
                            <h3 className="mt-4 text-lg font-medium text-charcoal">
                              Warranty Activated Successfully!
                            </h3>
                            <p className="mt-2 text-xs text-pewter max-w-sm">
                              Your protection plan is now active in the system
                              network. You can present this certificate at any
                              partner workshop.
                            </p>

                            <div className="mt-6 w-full rounded-[4px] border border-cloud bg-ash p-5 space-y-2 text-left text-xs text-graphite">
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  Contract Code:
                                </span>
                                <span className="font-medium text-charcoal">
                                  {activatedRecord?.contractId}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pewter">Owner Name:</span>
                                <span className="font-medium text-charcoal">
                                  {fullName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  VIN Registration:
                                </span>
                                <span className="font-medium text-charcoal">
                                  {vinNumber.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  Valid Until:
                                </span>
                                <span className="font-medium text-emerald-600">
                                  {activatedRecord?.date}
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 w-full sm:flex-row justify-center">
                              <Button
                                type="button"
                                onClick={resetForms}
                                className="h-11 rounded-xl bg-cloud px-6 text-xs font-condensed font-bold uppercase tracking-wider text-charcoal hover:bg-cloud/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-[330ms] cursor-pointer"
                              >
                                Activate Another
                              </Button>
                              <Button
                                type="button"
                                onClick={() =>
                                  alert(
                                    "Downloading Warranty E-Certificate PDF...",
                                  )
                                }
                                className="h-11 rounded-xl bg-brand-blue px-6 text-xs font-condensed font-bold uppercase tracking-wider text-white hover:bg-brand-blue/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-[330ms] cursor-pointer flex items-center justify-center gap-1.5"
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
                        className="max-w-xl mx-auto"
                      >
                        {!claimSuccess ? (
                          <form onSubmit={handleClaim} className="space-y-4">
                            <div className="text-center pb-2">
                              <p className="text-xs text-pewter">
                                Request a diagnostic or repair service under
                                your active warranty contract limits.
                              </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              {/* VIN */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                  Vehicle VIN (17 digits)
                                </label>
                                <div className="relative">
                                  <Car className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pewter" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter 17-digit VIN..."
                                    value={claimVin}
                                    onChange={(e) =>
                                      setClaimVin(e.target.value)
                                    }
                                    className="h-11 w-full rounded-lg border border-cloud bg-ash pl-10 pr-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                                  />
                                </div>
                              </div>

                              {/* Phone */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                  Owner Phone Number
                                </label>
                                <div className="relative">
                                  <Phone className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-pewter" />
                                  <input
                                    type="tel"
                                    required
                                    placeholder="+44 7700 900077..."
                                    value={claimPhone}
                                    onChange={(e) =>
                                      setClaimPhone(e.target.value)
                                    }
                                    className="h-11 w-full rounded-lg border border-cloud bg-ash pl-10 pr-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Workshop Partner */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                Select Partner Workshop
                              </label>
                              <select
                                required
                                value={claimWorkshop}
                                onChange={(e) =>
                                  setClaimWorkshop(e.target.value)
                                }
                                className="h-11 w-full rounded-lg border border-cloud bg-ash px-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                              >
                                <option value="" disabled>
                                  Choose a certified garage near you...
                                </option>
                                <option value="Manchester Garage Pro">
                                  Manchester Garage Pro (Certified Partner)
                                </option>
                                <option value="London Auto Specialists">
                                  London Auto Specialists (Certified Partner)
                                </option>
                                <option value="Birmingham Repair Hub">
                                  Birmingham Repair Hub (Certified Partner)
                                </option>
                              </select>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-condensed font-bold uppercase tracking-wider text-charcoal">
                                Breakdown & Failure Description
                              </label>
                              <textarea
                                required
                                rows={3}
                                placeholder="Please describe what parts are broken or failing (e.g. engine overheating, transmission slipping)..."
                                value={claimIssue}
                                onChange={(e) => setClaimIssue(e.target.value)}
                                className="w-full rounded-lg border border-cloud bg-ash p-4 text-sm text-charcoal outline-none focus:border-brand-blue focus:bg-white"
                              />
                            </div>

                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="h-12 w-full rounded-xl bg-rose-600 text-[15px] font-condensed font-bold uppercase tracking-wider text-white transition-all duration-[330ms] hover:bg-rose-500 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 cursor-pointer"
                            >
                              {isLoading
                                ? "Submitting Claim Request..."
                                : "Submit Claim Request"}
                            </Button>
                          </form>
                        ) : (
                          <motion.div
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center text-center py-6"
                          >
                            <div className="rounded-[4px] bg-amber-50 p-3 text-amber-600 border border-amber-200">
                              <AlertTriangle className="h-12 w-12 text-amber-500 animate-pulse" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-charcoal">
                              Claim Request Submitted
                            </h3>
                            <p className="mt-2 text-xs text-pewter max-w-sm">
                              Your warranty repair request has been logged. Our
                              claims review department will verify the coverage
                              limits.
                            </p>

                            <div className="mt-6 w-full rounded-[4px] border border-cloud bg-ash p-5 space-y-2 text-left text-xs text-graphite">
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  Claim Code ID:
                                </span>
                                <span className="font-medium text-charcoal">
                                  {claimCode}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  Assigned Gara:
                                </span>
                                <span className="font-medium text-charcoal">
                                  {claimWorkshop}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  Submit Status:
                                </span>
                                <span className="font-medium text-amber-600">
                                  Pending Review
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-pewter">
                                  Response ETA:
                                </span>
                                <span className="font-medium text-charcoal">
                                  Within 15 minutes
                                </span>
                              </div>
                            </div>

                            <div className="mt-6 text-xs text-pewter border-t border-cloud pt-4 w-full">
                              Please keep your vehicle at the workshop. A
                              technician will contact you and the garage
                              coordinator shortly.
                            </div>

                            <Button
                              type="button"
                              onClick={resetForms}
                              className="mt-6 h-11 rounded-xl bg-cloud px-8 text-xs font-condensed font-bold uppercase tracking-wider text-charcoal hover:bg-cloud/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-[330ms] cursor-pointer"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
