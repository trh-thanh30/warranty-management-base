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

      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8fafc] p-6 shadow-[0_28px_85px_-45px_rgba(15,23,42,0.4)] sm:p-10 lg:p-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#0b7dff]">
              Partner Network
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Our Certified Workshops
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Access 350+ certified garages nationwide. Our partners support
              direct warranty claim settlement, meaning zero paperwork and no
              cash advance required.
            </p>
          </div>

          {/* Search bar inside workshops */}
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="absolute left-4.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search garage name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#0b7dff] focus:ring-1 focus:ring-[#0b7dff]"
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
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedCity === city
                    ? "bg-slate-950 text-white shadow-md shadow-slate-950/10"
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-950"
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
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
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
                className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
              >
                {filteredWorkshops.map((workshop) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    key={workshop.id}
                    className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg w-full min-w-full md:w-[calc(50%-12px)] md:min-w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] lg:min-w-[calc(33.333%-16px)] snap-start"
                  >
                    {/* Visual Image */}
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-100">
                      <Image
                        src={workshop.imageUrl}
                        alt={workshop.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-slate-900/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        Certified Partner
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {workshop.city}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {workshop.rating}
                        </div>
                      </div>

                      <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-950">
                        {workshop.name}
                      </h3>

                      <div className="mt-3 space-y-2 text-xs text-slate-500">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>{workshop.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>{workshop.phone}</span>
                        </div>
                      </div>

                      {/* Specialty Badges */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {workshop.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* Feature checkmarks */}
                      <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
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
                        className="mt-6 h-11 w-full rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="h-4 w-4" />
                        Book Appointment
                      </Button>
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
