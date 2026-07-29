"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Container } from "@/src/components/common/container";
import { formControlFocusClassName } from "@/src/components/common/form-control.constants";

export function WarrantyActivateView() {
  const t = useTranslations("Warranty.activate");
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    carPlate: "",
    carBrand: "",
    stampCode: "",
    dealerName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  return (
    <main className="min-h-screen bg-surface-muted py-12 sm:py-20 text-deep-black">
      <Container className="max-w-[1000px] space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block bg-surface-muted0/10 text-premium-red border border-premium-red/30 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.25em]">
            {t("eyebrow")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-condensed font-semibold uppercase tracking-wider">
            {t("title")}
          </h1>
          <p className="text-base sm:text-lg text-stone-gray font-normal max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white rounded-[28px] p-8 sm:p-12 border-2 border-premium-red text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="size-20 bg-premium-red/10 text-premium-red rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold uppercase text-deep-black">
              {t("success.title")}
            </h2>
            <p className="text-base text-stone-gray font-normal max-w-lg mx-auto">
              {t.rich("success.description", {
                plate: () => (
                  <strong className="text-deep-black">
                    {formData.carPlate}
                  </strong>
                ),
              })}
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="bg-deep-black hover:bg-premium-red text-white px-8 py-3.5 rounded-[14px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {t("success.reset")}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[28px] p-6 sm:p-10 border border-border-gray shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.customerName.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.customerName.placeholder")}
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className={`h-12 rounded-[12px] border-border-gray ${formControlFocusClassName}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.phone.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.phone.placeholder")}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={`h-12 rounded-[12px] border-border-gray ${formControlFocusClassName}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.carPlate.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.carPlate.placeholder")}
                    value={formData.carPlate}
                    onChange={(e) =>
                      setFormData({ ...formData, carPlate: e.target.value })
                    }
                    className={`h-12 rounded-[12px] border-border-gray ${formControlFocusClassName}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-deep-black">
                    {t("fields.stampCode.label")}
                  </label>
                  <Input
                    required
                    placeholder={t("fields.stampCode.placeholder")}
                    value={formData.stampCode}
                    onChange={(e) =>
                      setFormData({ ...formData, stampCode: e.target.value })
                    }
                    className={`h-12 rounded-[12px] border-border-gray ${formControlFocusClassName}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-premium-red hover:bg-warm-red text-white py-4 rounded-[16px] text-sm font-semibold uppercase tracking-wider transition-colors shadow-lg cursor-pointer"
              >
                {t("submit")}
              </button>
            </form>
          </div>
        )}
      </Container>
    </main>
  );
}
