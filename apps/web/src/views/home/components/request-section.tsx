"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useScrollReveal, viewportOnce } from "@/src/hooks/use-scroll-reveal";
import { CheckCircle2 } from "lucide-react";

export function RequestSection() {
  const { container, fadeUp } = useScrollReveal();

  const customSlideRight: Variants = {
    hidden: {
      opacity: 0,
      x: -80,
      transition: { duration: 0.75, ease: "easeInOut" },
    },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1], // Apple-style easeOutExpo curve
      },
    },
  };

  const customImageSpringUp: Variants = {
    hidden: { opacity: 0, y: 180, scale: 0.8 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 240,
        damping: 12,
        mass: 0.6,
      },
    },
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.service || formData.service === "Select") {
      newErrors.service = "Please choose a service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <section
      id="request-quote"
      className="w-full relative mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28 bg-ash"
      aria-label="Send a repair request"
    >
      {/* Section Header - Centered & Full Width */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="text-center mb-16 flex flex-col items-center"
      >
        <motion.span
          variants={fadeUp}
          className="text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.2em] text-brand-blue"
        >
          SEND A REQUEST
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-charcoal sm:text-[2.6rem] leading-[1.1] max-w-3xl"
        >
          OUR ONE-STOP CAR REPAIR SHOP
        </motion.h2>
        <motion.div
          variants={fadeUp}
          className="mt-6 h-[3px] w-16 bg-brand-blue"
        />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid w-full gap-12 lg:gap-16 lg:grid-cols-12 items-center lg:items-end"
      >
        {/* Left Side: Graphic Panel with Image */}
        <motion.div
          variants={customImageSpringUp}
          className="w-full order-2 lg:order-1 lg:col-span-5 h-[380px] sm:h-[480px] lg:h-[550px] flex items-end justify-center select-none relative group"
        >
          {/* Slanted Panel Design Group */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[24px]">
            {/* Primary slanted blue block */}
            <div className="absolute -left-20 top-0 bottom-0 w-[90%] bg-brand-blue transform -skew-x-[15deg] origin-top" />
            {/* Secondary thin slanted blue block */}
            <div className="absolute left-[78%] top-0 bottom-0 w-[30px] bg-brand-blue transform -skew-x-[15deg] origin-top opacity-90" />
          </div>

          {/* Solid Rectangular Image, filling most of the space, popping out */}
          <div className="relative z-10 w-[88%] h-[85%] rounded-[20px] overflow-hidden border-[4px] border-white shadow-2xl mb-8 mr-4 bg-ash">
            <Image
              src="/workshop_2.jpg"
              alt="Professional automotive service workshop"
              fill
              className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-105"
              sizes="(max-w-[768px]) 100vw, 40vw"
            />
          </div>
        </motion.div>

        {/* Right Side: Form Panel */}
        <motion.div
          variants={customSlideRight}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full order-1 lg:order-2 lg:col-span-7 flex flex-col justify-center"
        >
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Row 1: Name and Email */}
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                          FULL NAME
                        </label>
                        <input
                          type="text"
                          placeholder="ENTER FULL NAME"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className={`w-full rounded-full border bg-white py-[16px] px-8 text-base font-sans text-charcoal placeholder-pale-silver outline-none transition-all cursor-text hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 ${
                            errors.name ? "border-red-500" : "border-cloud"
                          }`}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 font-sans">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                          EMAIL
                        </label>
                        <input
                          type="email"
                          placeholder="ENTER EMAIL"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className={`w-full rounded-full border bg-white py-[16px] px-8 text-base font-sans text-charcoal placeholder-pale-silver outline-none transition-all cursor-text hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 ${
                            errors.email ? "border-red-500" : "border-cloud"
                          }`}
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 font-sans">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Phone and Service Selection */}
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                          PHONE
                        </label>
                        <input
                          type="tel"
                          placeholder="ENTER PHONE"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className={`w-full rounded-full border bg-white py-[16px] px-8 text-base font-sans text-charcoal placeholder-pale-silver outline-none transition-all cursor-text hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 ${
                            errors.phone ? "border-red-500" : "border-cloud"
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-500 font-sans">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                          CHOOSE SERVICE
                        </label>
                        <div className="relative">
                          <select
                            value={formData.service}
                            onChange={(e) =>
                              handleInputChange("service", e.target.value)
                            }
                            className={`w-full appearance-none rounded-full border bg-white py-[16px] px-8 pr-12 text-base font-sans text-charcoal outline-none transition-all cursor-pointer hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 ${
                              errors.service ? "border-red-500" : "border-cloud"
                            }`}
                          >
                            <option value="">SELECT</option>
                            <option value="electrical">
                              Electrical System
                            </option>
                            <option value="repair">Auto Car Repair</option>
                            <option value="clean">Car & Engine Clean</option>
                            <option value="paint">Paint Correction</option>
                            <option value="coating">Ceramic Coating</option>
                            <option value="restoration">
                              Headlight Restoration
                            </option>
                          </select>
                          <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-pewter">
                            <svg
                              className="h-4 w-4 fill-current"
                              viewBox="0 0 20 20"
                            >
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                        {errors.service && (
                          <p className="text-xs text-red-500 font-sans">
                            {errors.service}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="space-y-3">
                      <label className="text-xs font-sans font-medium uppercase tracking-wider text-pewter">
                        MESSAGE
                      </label>
                      <textarea
                        placeholder="WRITE SOMETHING HERE"
                        rows={3}
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        className="w-full rounded-[20px] border border-cloud bg-white py-[16px] px-8 text-base font-sans text-charcoal placeholder-pale-silver outline-none transition-all cursor-text hover:border-brand-blue/40 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 resize-none h-auto"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-blue h-14 min-h-[48px] px-10 text-sm font-condensed font-bold uppercase tracking-wider text-white transition-all duration-[330ms] hover:scale-105 active:scale-95 shadow-sm cursor-pointer z-10"
                      >
                        {/* Rotated sweep overlay */}
                        <span className="absolute w-[200%] aspect-square -top-[50%] -left-[50%] bg-brand-blue-hover rotate-45 translate-y-[120%] translate-x-[120%] transition-transform duration-[700ms] ease-out group-hover:translate-y-0 group-hover:translate-x-0 z-0" />
                        <span className="relative z-10">
                          REQUEST A QUOTE NOW!
                        </span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center py-10 text-center bg-white border border-cloud rounded-[24px] p-8 shadow-xs"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                  <h3 className="mt-6 text-2xl font-condensed font-bold uppercase text-charcoal tracking-wider">
                    Request Submitted!
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-graphite max-w-md">
                    Thank you,{" "}
                    <span className="font-semibold text-charcoal">
                      {formData.name}
                    </span>
                    . We have received your service request.
                  </p>
                  <p className="mt-4 text-xs leading-5 text-pewter max-w-sm">
                    Our professional advisor will review your vehicle
                    requirements and contact you at{" "}
                    <span className="font-semibold text-charcoal">
                      {formData.phone}
                    </span>{" "}
                    shortly to coordinate.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-8 rounded-full border border-cloud bg-ash px-8 py-3 text-xs font-semibold text-charcoal hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all duration-[330ms] cursor-pointer"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
