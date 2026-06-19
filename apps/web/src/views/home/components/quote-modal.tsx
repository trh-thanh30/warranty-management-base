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
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-cloud bg-white p-6 text-charcoal shadow-sm md:p-8"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-brand-blue">
                  Get Started
                </span>
                <h3 className="mt-1 text-2xl font-medium tracking-tight text-charcoal">
                  {selectedPlan
                    ? `Quote: ${selectedPlan.term}`
                    : "Request a custom quote"}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-cloud bg-ash text-graphite transition-colors hover:bg-cloud hover:text-charcoal cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress indicators */}
            {step < 3 && (
              <div className="relative mt-6 flex gap-2">
                <div
                  className={`h-1.5 flex-1 rounded-[2px] transition-colors duration-300 ${step >= 1 ? "bg-brand-blue" : "bg-cloud"}`}
                />
                <div
                  className={`h-1.5 flex-1 rounded-[2px] transition-colors duration-300 ${step >= 2 ? "bg-brand-blue" : "bg-cloud"}`}
                />
              </div>
            )}

            {/* Step Content */}
            <div className="relative mt-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-graphite">
                      Vehicle Brand & Model
                    </label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pewter" />
                      <input
                        type="text"
                        placeholder="e.g., Audi A4 2.0 TFSI"
                        value={formData.model}
                        onChange={(e) =>
                          handleInputChange("model", e.target.value)
                        }
                        className={`w-full rounded-[4px] border bg-white py-3 pl-10 pr-4 text-sm text-charcoal placeholder-pewter outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue ${
                          errors.model
                            ? "border-red-500 focus:border-red-500"
                            : "border-cloud"
                        }`}
                      />
                    </div>
                    {errors.model && (
                      <p className="text-xs text-red-600">{errors.model}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-graphite">
                      License Plate or VIN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 29A-12345 or VIN number"
                      value={formData.plate}
                      onChange={(e) =>
                        handleInputChange("plate", e.target.value)
                      }
                      className={`w-full rounded-[4px] border bg-white py-3 px-4 text-sm text-charcoal placeholder-pewter outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue ${
                        errors.plate
                          ? "border-red-500 focus:border-red-500"
                          : "border-cloud"
                      }`}
                    />
                    {errors.plate && (
                      <p className="text-xs text-red-600">{errors.plate}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-graphite">
                      Mileage (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 75000 km"
                      value={formData.mileage}
                      onChange={(e) =>
                        handleInputChange("mileage", e.target.value)
                      }
                      className="w-full rounded-[4px] border border-cloud bg-white py-3 px-4 text-sm text-charcoal placeholder-pewter outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleNext}
                    className="mt-2 h-11 w-full rounded-[4px] bg-brand-blue text-white hover:bg-brand-blue/90 cursor-pointer text-xs font-medium uppercase tracking-wider transition-colors duration-[330ms]"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-graphite">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pewter" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`w-full rounded-[4px] border bg-white py-3 pl-10 pr-4 text-sm text-charcoal placeholder-pewter outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue ${
                          errors.name
                            ? "border-red-500 focus:border-red-500"
                            : "border-cloud"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-graphite">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pewter" />
                      <input
                        type="tel"
                        placeholder="+84 901 234 567"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`w-full rounded-[4px] border bg-white py-3 pl-10 pr-4 text-sm text-charcoal placeholder-pewter outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue ${
                          errors.phone
                            ? "border-red-500 focus:border-red-500"
                            : "border-cloud"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-graphite">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pewter" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full rounded-[4px] border bg-white py-3 pl-10 pr-4 text-sm text-charcoal placeholder-pewter outline-none transition-all focus:border-brand-blue focus:ring-1 focus:ring-brand-blue ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : "border-cloud"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-11 flex-1 rounded-[4px] border border-cloud bg-ash text-xs font-medium uppercase tracking-wider text-graphite transition-colors hover:bg-cloud cursor-pointer"
                    >
                      Back
                    </button>
                    <Button
                      type="submit"
                      className="h-11 flex-[2] rounded-[4px] bg-brand-blue text-white hover:bg-brand-blue/90 cursor-pointer text-xs font-medium uppercase tracking-wider transition-colors duration-[330ms]"
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
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h4 className="mt-4 text-lg font-medium text-charcoal">
                    Request Submitted!
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-graphite">
                    Thank you,{" "}
                    <span className="font-semibold text-charcoal">
                      {formData.name}
                    </span>
                    . We have received your request for:
                  </p>
                  <div className="mt-2 rounded-[4px] bg-ash px-4 py-2 border border-cloud">
                    <span className="text-sm font-semibold text-brand-blue">
                      {selectedPlan
                        ? `${selectedPlan.type === "warranty" ? "Warranty" : "Maintenance"} - ${selectedPlan.term}`
                        : "Custom Care Plan"}
                    </span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-pewter">
                    Our advisor will review your vehicle details and contact you
                    at{" "}
                    <span className="font-semibold text-charcoal">
                      {formData.phone}
                    </span>{" "}
                    within 15 minutes.
                  </p>
                  <Button
                    type="button"
                    onClick={handleReset}
                    className="mt-6 h-11 w-full rounded-[4px] bg-brand-blue text-white hover:bg-brand-blue/90 cursor-pointer text-xs font-medium uppercase tracking-wider transition-colors duration-[330ms]"
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
