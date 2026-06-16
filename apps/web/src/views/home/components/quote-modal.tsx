"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, User, Phone, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@repo/ui/button";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: {
    type: "warranty" | "service";
    term: string;
    price: string;
  } | null;
}

export function QuoteModal({ isOpen, onClose, selectedPlan }: QuoteModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    plate: "",
    model: "",
    mileage: "",
    name: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.model.trim()) newErrors.model = "Brand & model are required";
    if (!formData.plate.trim())
      newErrors.plate = "License plate or VIN is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
      plate: "",
      model: "",
      mileage: "",
      name: "",
      phone: "",
      email: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleReset}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-800 bg-[#070e17] p-6 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] md:p-8"
          >
            {/* Background Glow */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#0b7dff]/15 blur-[60px]" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[60px]" />

            {/* Header */}
            <div className="relative flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#0b7dff]">
                  Get Started
                </span>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  {selectedPlan
                    ? `Quote: ${selectedPlan.term}`
                    : "Request a custom quote"}
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress indicators */}
            {step < 3 && (
              <div className="relative mt-6 flex gap-2">
                <div
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-[#0b7dff]" : "bg-white/10"}`}
                />
                <div
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-[#0b7dff]" : "bg-white/10"}`}
                />
              </div>
            )}

            {/* Step Content */}
            <div className="relative mt-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Vehicle Brand & Model
                    </label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g., Audi A4 2.0 TFSI"
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#0b7dff] focus:ring-1 focus:ring-[#0b7dff] ${
                          errors.model
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10"
                        }`}
                      />
                    </div>
                    {errors.model && (
                      <p className="text-xs text-red-400">{errors.model}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      License Plate or VIN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 29A-12345 or VIN number"
                      value={formData.plate}
                      onChange={(e) =>
                        handleInputChange("plate", e.target.value)
                      }
                      className={`w-full rounded-xl border bg-white/5 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#0b7dff] focus:ring-1 focus:ring-[#0b7dff] ${
                        errors.plate
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10"
                      }`}
                    />
                    {errors.plate && (
                      <p className="text-xs text-red-400">{errors.plate}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mileage (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 75000 km"
                      value={formData.mileage}
                      onChange={(e) =>
                        handleInputChange("mileage", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#0b7dff]"
                    />
                  </div>

                  <Button
                    onClick={handleNext}
                    className="mt-2 h-11 w-full rounded-full cursor-pointer text-xs font-semibold uppercase tracking-wider"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#0b7dff] focus:ring-1 focus:ring-[#0b7dff] ${
                          errors.name
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+84 901 234 567"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#0b7dff] focus:ring-1 focus:ring-[#0b7dff] ${
                          errors.phone
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full rounded-xl border bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#0b7dff] focus:ring-1 focus:ring-[#0b7dff] ${
                          errors.email
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/10"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-11 flex-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 cursor-pointer"
                    >
                      Back
                    </button>
                    <Button
                      type="submit"
                      className="h-11 flex-[2] rounded-full cursor-pointer text-xs font-semibold uppercase tracking-wider"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h4 className="mt-4 text-lg font-bold text-white">
                    Request Submitted!
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Thank you,{" "}
                    <span className="font-semibold text-white">
                      {formData.name}
                    </span>
                    . We have received your request for:
                  </p>
                  <div className="mt-2 rounded-xl bg-white/5 px-4 py-2 border border-white/5">
                    <span className="text-sm font-semibold text-[#9ed5ff]">
                      {selectedPlan
                        ? `${selectedPlan.type === "warranty" ? "Warranty" : "Maintenance"} - ${selectedPlan.term}`
                        : "Custom Care Plan"}
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Our advisor will review your vehicle details and contact you
                    at{" "}
                    <span className="font-semibold text-white">
                      {formData.phone}
                    </span>{" "}
                    within 15 minutes.
                  </p>
                  <Button
                    onClick={handleReset}
                    className="mt-6 h-11 w-full rounded-full cursor-pointer text-xs font-semibold uppercase tracking-wider"
                  >
                    Done
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
