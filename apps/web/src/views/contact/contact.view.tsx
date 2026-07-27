"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2 } from "lucide-react";
import { Input } from "@repo/ui/input";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";

const ContactMap = dynamic(() => import("./components/contact-map"), {
  ssr: false,
  loading: () => (
    <div className="size-full animate-pulse bg-surface-muted rounded-[24px]" />
  ),
});

export function ContactView() {
  const t = useTranslations("ContactPage");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    content: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-white text-deep-black">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-12 py-12 lg:py-20 space-y-16">
        {/* Top 2 Columns Section */}
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-block bg-accent-gold text-deep-black px-4 py-1.5 rounded-lg text-sm font-medium uppercase tracking-wide">
              {t("eyebrow")}
            </span>

            <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider text-deep-black">
              {t("title")}
            </h1>

            <p className="text-base sm:text-lg text-stone-gray font-normal">
              {t("description")}
            </p>

            <div className="grid gap-8 sm:grid-cols-2 pt-4 border-t border-border-gray">
              {/* Address */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold uppercase text-deep-black">
                  {t("offices.title")}
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-stone-gray font-medium leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">•</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("offices.hcm.label")}
                      </strong>{" "}
                      {t("offices.hcm.address")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">•</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("offices.hanoi.label")}
                      </strong>{" "}
                      {t("offices.hanoi.address")}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Customer Service */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold uppercase text-deep-black">
                  {t("contactDetailsTitle")}
                </h3>
                <ul className="space-y-3 text-xs sm:text-sm text-stone-gray font-medium leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">•</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("hotlines.hcm")}
                      </strong>{" "}
                      <a
                        href="tel:0886337733"
                        className="text-premium-red font-semibold hover:underline"
                      >
                        0886 33 77 33
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">•</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("hotlines.hanoi")}
                      </strong>{" "}
                      <a
                        href="tel:0989017999"
                        className="text-premium-red font-semibold hover:underline"
                      >
                        0989 017 999
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">•</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("emailLabel")}
                      </strong>{" "}
                      <a
                        href="mailto:fujitek.lexzenz.vn@gmail.com"
                        className="hover:underline"
                      >
                        fujitek.lexzenz.vn@gmail.com
                      </a>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-premium-red font-medium">•</span>
                    <span>
                      <strong className="text-deep-black">
                        {t("websiteLabel")}
                      </strong>{" "}
                      <a
                        href="https://fujitekvietnam.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-medium text-deep-black"
                      >
                        fujitekvietnam.com
                      </a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-6 bg-surface-muted rounded-[28px] p-6 sm:p-10 border border-border-gray shadow-xl">
            <span className="inline-block bg-accent-gold text-deep-black px-4 py-1.5 rounded-lg text-sm font-medium uppercase tracking-wide mb-8">
              {t("form.eyebrow")}
            </span>

            {isSubmitted ? (
              <div className="p-8 rounded-[20px] bg-surface-muted border border-premium-red/30 text-center space-y-4 animate-in zoom-in-95">
                <div className="size-16 bg-premium-red/10 text-premium-red rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-semibold uppercase text-deep-black">
                  {t("form.success.title")}
                </h3>
                <p className="text-sm text-stone-gray font-medium">
                  {t("form.success.description")}
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="bg-deep-black hover:bg-premium-red text-white px-6 py-2.5 rounded-[12px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t("form.success.reset")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-deep-black">
                      {t("form.fields.fullName.label")}
                    </label>
                    <Input
                      required
                      placeholder={t("form.fields.fullName.placeholder")}
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className={`h-12 rounded-[12px] bg-white border-border-gray ${formControlFocusClassName}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-deep-black">
                      {t("form.fields.phone.label")}
                    </label>
                    <Input
                      required
                      placeholder={t("form.fields.phone.placeholder")}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`h-12 rounded-[12px] bg-white border-border-gray ${formControlFocusClassName}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("form.fields.content.label")}
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t("form.fields.content.placeholder")}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className={`w-full p-4 rounded-[14px] bg-white border border-border-gray text-sm outline-none ${formControlFocusClassName}`}
                  />
                </div>

                <button
                  type="submit"
                  className="bg-premium-red hover:bg-warm-red text-white px-8 py-3.5 rounded-[12px] text-xs font-medium uppercase tracking-wider transition-colors duration-300 shadow-md shadow-premium-red/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t("form.submit")}</span>
                  <Send className="size-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Maps Section (2 Headquarters Map Embeds Side-by-Side) */}
        <div className="space-y-6 pt-6 border-t border-border-gray">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Hanoi HQ Map */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold uppercase text-deep-black">
                {t("maps.hanoi.title")}
              </h3>
              <div className="w-full h-[350px] rounded-[24px] overflow-hidden border border-border-gray shadow-md bg-surface-muted">
                <ContactMap
                  lat={21.035}
                  lng={105.75}
                  title={t("maps.hanoi.title")}
                />
              </div>
            </div>

            {/* Saigon Branch Map */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold uppercase text-deep-black">
                {t("maps.hcm.title")}
              </h3>
              <div className="w-full h-[350px] rounded-[24px] overflow-hidden border border-border-gray shadow-md bg-surface-muted">
                <ContactMap
                  lat={10.965}
                  lng={106.665}
                  title={t("maps.hcm.title")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
