"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  CheckCircle2,
  Search,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@repo/ui/button";

interface Workshop {
  id: string;
  name: string;
  city: "London" | "Manchester" | "Birmingham";
  address: string;
  phone: string;
  rating: number;
  specialties: string[];
  features: string[];
  imageUrl: string;
}

const mockWorkshops: Workshop[] = [
  {
    id: "w1",
    name: "London Auto Service Centre",
    city: "London",
    address: "12 Kingsway, Holborn, London WC2B 6LH",
    phone: "+44 20 7946 0958",
    rating: 4.9,
    specialties: ["Engine & Gearbox", "Auto Transmission", "Diagnostics"],
    features: ["Direct Settlement", "24/7 Towing", "Genuine Parts Only"],
    imageUrl: "/workshop_1.jpg",
  },
  {
    id: "w2",
    name: "West-End Premium Garage",
    city: "London",
    address: "88 Kensington High St, Kensington, London W8 4SG",
    phone: "+44 20 7946 0119",
    rating: 4.8,
    specialties: [
      "German Vehicles Specialist",
      "ECU Coding",
      "Air Conditioning",
    ],
    features: [
      "Direct Settlement",
      "Free Car Wash",
      "Loaner Vehicle Available",
    ],
    imageUrl: "/workshop_2.jpg",
  },
  {
    id: "w3",
    name: "Manchester Garage Pro",
    city: "Manchester",
    address: "450 Deansgate, Manchester M3 4EE",
    phone: "+44 161 946 0890",
    rating: 4.9,
    specialties: [
      "Engine Tuning",
      "Suspension System",
      "Advanced Brake Systems",
    ],
    features: ["Direct Settlement", "Overnight Security", "Warranty Guarantee"],
    imageUrl: "/workshop_3.jpg",
  },
  {
    id: "w4",
    name: "Piccadilly Auto Workshop",
    city: "Manchester",
    address: "102 Piccadilly, Manchester M1 2AP",
    phone: "+44 161 946 0711",
    rating: 4.7,
    specialties: [
      "Car electrical repair",
      "General Maintenance",
      "Bodywork & Paint",
    ],
    features: [
      "Fast Claims Processing",
      "Pick-up & Delivery Service",
      "Warranty Guarantee",
    ],
    imageUrl: "/service_1.jpg",
  },
  {
    id: "w5",
    name: "Birmingham Automotive Clinic",
    city: "Birmingham",
    address: "15 Broad St, Birmingham B15 1AY",
    phone: "+44 121 946 0819",
    rating: 4.8,
    specialties: [
      "General Repair & Diagnostics",
      "Tuning",
      "Undercarriage Spray",
    ],
    features: ["Direct Settlement", "Comfortable Lounge", "Express Service"],
    imageUrl: "/service_2.jpg",
  },
];

type CityFilter = "all" | "London" | "Manchester" | "Birmingham";

export function WorkshopsSection() {
  const [selectedCity, setSelectedCity] = useState<CityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredWorkshops = mockWorkshops.filter((w) => {
    const matchesCity = selectedCity === "all" || w.city === selectedCity;
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCity && matchesSearch;
  });

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleBookAppointment = (workshopName: string) => {
    alert(
      `Booking Request Sent to ${workshopName}! Our coordinator will call you to confirm your time slot shortly.`,
    );
  };

  return (
    <section
      id="workshops"
      className="mx-auto flex w-full max-w-[1440px] flex-col justify-center px-5 py-16 sm:px-8 lg:px-12"
      aria-label="Workshops"
    >
      {/* Hide Scrollbars CSS Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-cloud bg-ash p-6 sm:p-10 lg:p-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-sans font-bold uppercase tracking-[0.25em] text-brand-blue">
              <span>Partner Network</span>
            </div>
            <h2 className="mt-4 text-3xl font-condensed font-bold uppercase tracking-wider text-charcoal sm:text-5xl lg:text-[40px] leading-tight">
              Our Certified Workshops
            </h2>
            <div className="mt-6 h-[3px] w-16 bg-brand-blue" />
            <p className="mt-6 max-w-xl text-sm leading-6 text-graphite font-sans font-medium">
              Access 350+ certified garages nationwide. Our partners support
              direct warranty claim settlement, meaning zero paperwork and no
              cash advance required.
            </p>
          </div>

          {/* Search bar inside workshops */}
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pewter" />
            <input
              type="text"
              placeholder="Search garage name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-cloud bg-white pl-10 pr-4 text-xs text-charcoal placeholder:text-pewter outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
            />
          </div>
        </div>

        {/* Filter Pills & Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "London", "Manchester", "Birmingham"] as CityFilter[]
            ).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-[330ms] cursor-pointer ${
                  selectedCity === city
                    ? "bg-brand-blue text-white border border-brand-blue"
                    : "bg-white border border-cloud text-graphite hover:text-brand-blue hover:border-brand-blue/30"
                }`}
              >
                {city === "all" ? "All Locations" : city}
              </button>
            ))}
          </div>

          {/* Slide navigation controls */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cloud bg-white text-graphite hover:bg-ash hover:text-charcoal transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cloud bg-white text-graphite hover:bg-ash hover:text-charcoal transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Workshops Slider */}
        <div className="mt-10">
          <AnimatePresence mode="popLayout">
            {filteredWorkshops.length > 0 ? (
              <motion.div
                ref={scrollContainerRef}
                layout
                className="flex items-stretch gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 group/slider"
              >
                {filteredWorkshops.map((workshop) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={workshop.id}
                    className="flex flex-col rounded-2xl border border-cloud bg-white p-6 transition-all duration-500 ease-out hover:border-brand-blue/30 w-full min-w-full md:w-[calc(50%-12px)] md:min-w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] lg:min-w-[calc(33.333%-16px)] group-hover/slider:lg:w-[calc(26%-16px)] group-hover/slider:lg:min-w-[calc(26%-16px)] lg:hover:!w-[calc(48%-16px)] lg:hover:!min-w-[calc(48%-16px)] snap-start overflow-hidden group/card shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
                  >
                    {/* Visual Image */}
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-ash">
                      <Image
                        src={workshop.imageUrl}
                        alt={workshop.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-md bg-brand-blue/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                        Certified Partner
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-ash px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pewter">
                          {workshop.city}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {workshop.rating}
                        </div>
                      </div>

                      <h3 className="mt-3 text-lg font-bold font-condensed uppercase tracking-wider text-charcoal">
                        {workshop.name}
                      </h3>

                      {/* Expandable Details Container (Desktop Hover Only) */}
                      <div className="lg:max-h-0 lg:opacity-0 lg:pointer-events-none transition-all duration-500 ease-out overflow-hidden lg:group-hover/card:max-h-[600px] lg:group-hover/card:opacity-100 lg:group-hover/card:pointer-events-auto flex flex-col flex-1">
                        <div className="mt-3 space-y-2 text-xs text-pewter">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-pewter" />
                            <span>{workshop.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 shrink-0 text-pewter" />
                            <span>{workshop.phone}</span>
                          </div>
                        </div>

                        {/* Specialty Badges */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {workshop.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full border border-cloud bg-ash px-2.5 py-0.5 text-[10px] font-semibold text-graphite"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        {/* Feature checkmarks */}
                        <div className="mt-5 flex-1 space-y-1.5 border-t border-cloud pt-4 text-xs text-graphite">
                          {workshop.features.map((feat) => (
                            <div key={feat} className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <Button
                          type="button"
                          onClick={() => handleBookAppointment(workshop.name)}
                          className="mt-6 h-11 w-full rounded-xl border border-cloud bg-ash text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-brand-blue hover:text-white hover:border-brand-blue cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-[330ms]"
                        >
                          <Calendar className="h-4 w-4" />
                          Book Appointment
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <Star className="h-10 w-10 text-slate-300" />
                <h4 className="mt-4 text-base font-bold text-slate-900">
                  No Workshops Found
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  Try adjusting your search keywords or location filter to find
                  partner garages.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
