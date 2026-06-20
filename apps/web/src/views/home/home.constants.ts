import type {
  StatItem,
  Testimonial,
  HowItWorksStep,
  MockWarrantyRecord,
} from "./home.types";

export const carHeroImage = {
  src: "/service_1.jpg",
  alt: "Professional vehicle service checkup",
};

export const carHeroImages = [
  {
    src: "/service_1.jpg",
    alt: "Professional vehicle service checkup",
    title: "Professional vehicle maintenance & servicing",
    description:
      "Keep your vehicle running smoothly with our certified service packages and expert care.",
  },
  {
    src: "/service_2.jpg",
    alt: "Vehicle key handover after successful repair",
    title: "Certified workshop partner network",
    description:
      "Access over 350+ certified garages ready to service your vehicle with direct billing.",
  },
  {
    src: "/service_3.jpg",
    alt: "Expert vehicle diagnostics scanning",
    title: "Fast claims processed in 24 hours",
    description:
      "No paperwork, no upfront payments. We settle approved repair claims directly with workshops.",
  },
  {
    src: "/service_4.jpg",
    alt: "Certified mechanical workshop repair",
    title: "Drive with absolute peace of mind",
    description:
      "Protect your vehicle against unexpected breakdowns with flexible 12, 24, or 36-month plans.",
  },
];

export const navItems = [
  "Home",
  "Services",
  "About us",
  "How it works",
  "Pricing",
  "Stories",
  "FAQ",
];

export const trustItems = [
  "Certified repair network",
  "Claims handled in 24h",
  "No hidden fees",
];

export const pricingPlans = [
  {
    term: "12 months",
    price: "$40",
    note: "Flexible cover for short-term ownership",
  },
  {
    term: "24 months",
    price: "$38",
    note: "Recommended balance of value and protection",
    featured: true,
  },
  {
    term: "36 months",
    price: "$36",
    note: "Lowest monthly cost for long-term cover",
  },
];

export const servicePlans = [
  {
    term: "Basic Care",
    price: "$18",
    note: "Essential checks & routine oil changes",
  },
  {
    term: "Standard Care",
    price: "$28",
    note: "Full diagnostics, fluids & filters cover",
    featured: true,
  },
  {
    term: "Premium Care",
    price: "$48",
    note: "Full package: brakes, plugs & air-con",
  },
];

export const footerLinks = ["Coverage", "Claims", "Partners", "Support"];

export const statsItems: StatItem[] = [
  {
    value: 12000,
    suffix: "+",
    label: "Cars Protected",
    description: "Vehicles covered across our network",
  },
  {
    value: 24,
    suffix: "h",
    label: "Claim Response",
    description: "Average time to process a claim",
  },
  {
    value: 350,
    suffix: "+",
    label: "Certified Workshops",
    description: "Partner garages nationwide",
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: 1,
    title: "Check Eligibility",
    description:
      "Enter your plate number or VIN. We instantly verify your car's eligibility for coverage in under 60 seconds.",
    icon: "search",
  },
  {
    step: 2,
    title: "Choose Your Plan",
    description:
      "Pick from 12, 24, or 36-month plans. All include engine, gearbox and key mechanical components.",
    icon: "layers",
  },
  {
    step: 3,
    title: "Drive With Confidence",
    description:
      "Your car is covered from day one. If something breaks, call us and we handle the workshop directly.",
    icon: "shield",
  },
  {
    step: 4,
    title: "We Pay the Workshop",
    description:
      "Approved claims are settled directly with our partner workshops. No upfront costs, no paperwork stress.",
    icon: "check",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marcus Holden",
    role: "Small Business Owner",
    location: "Lyon, France",
    avatar: "MH",
    rating: 5,
    quote:
      "My gearbox failed three months in. Garanty covered the full repair — €2,400 — without any argument. Best decision I made when buying used.",
    carModel: "BMW 520d (2019)",
    claimAmount: "€2,400",
  },
  {
    id: "2",
    name: "Sophie Laurent",
    role: "Nurse",
    location: "Bordeaux, France",
    avatar: "SL",
    rating: 5,
    quote:
      "I was sceptical at first, but when my turbo went, they sorted everything in 48 hours. The workshop dealt with Garanty directly — I just picked up my car.",
    carModel: "Renault Megane (2018)",
    claimAmount: "€1,800",
  },
  {
    id: "3",
    name: "David Okafor",
    role: "Freelance Developer",
    location: "Paris, France",
    avatar: "DO",
    rating: 5,
    quote:
      "The engine coolant system failed on the motorway. Without Garanty, I'd have been looking at a €3,000 repair bill. It was completely stress-free.",
    carModel: "Volkswagen Passat (2020)",
    claimAmount: "€3,100",
  },
  {
    id: "4",
    name: "Amélie Rousseau",
    role: "Teacher",
    location: "Marseille, France",
    avatar: "AR",
    rating: 5,
    quote:
      "As a single parent, an unexpected repair bill would have been devastating. Garanty gave me the peace of mind I needed for just €38 a month.",
    carModel: "Peugeot 308 (2017)",
    claimAmount: "€1,550",
  },
];

export const carBrands = [
  { name: "Audi", src: "/brands/audi.svg" },
  { name: "BMW", src: "/brands/bmw.png" },
  { name: "Ford", src: "/brands/ford.svg" },
  { name: "Genesis", src: "/brands/genesis.png" },
  { name: "Honda", src: "/brands/honda.svg" },
  { name: "Hyundai", src: "/brands/hyundai.svg" },
  { name: "Jaguar", src: "/brands/jaguar.svg" },
  { name: "Kia", src: "/brands/kia.svg" },
  {
    name: "Land Rover",
    src: "/brands/landrover.jpeg",
    className: "invert mix-blend-multiply",
  },
  { name: "Lexus", src: "/brands/lexus.svg" },
  { name: "Mercedes-Benz", src: "/brands/mercedes.svg" },
  { name: "Porsche", src: "/brands/porsche.svg" },
  { name: "Tesla", src: "/brands/tesla.svg" },
  { name: "Toyota", src: "/brands/toyota.svg" },
  { name: "Volkswagen", src: "/brands/volkswagen.svg" },
  { name: "Volvo", src: "/brands/volvo.svg" },
];

export const faqItems = [
  {
    question: "What types of vehicles are eligible for coverage?",
    answer:
      "We cover used petrol and diesel vehicles up to 10 years old with fewer than 150,000 km on the clock. Electric and hybrid vehicles are also eligible on select plans.",
  },
  {
    question: "How does the claim process work?",
    answer:
      "Simply call our claims line or submit online. We'll authorise the repair directly with one of our 350+ certified partner workshops — you never pay upfront for covered repairs.",
  },
  {
    question: "Are there any waiting periods before I can claim?",
    answer:
      "Coverage starts immediately for mechanical failures that occur after your plan activates. There is no waiting period for plans purchased at the point of sale.",
  },
  {
    question: "What is the maximum claim limit?",
    answer:
      "Claim limits depend on your plan: up to €3,000 on our 12-month plan, €4,500 on 24-month, and €5,000 on our 36-month plan. All limits reset annually.",
  },
  {
    question: "Can I use any garage, or must I use a partner workshop?",
    answer:
      "Repairs must be carried out at one of our 350+ certified partner workshops to ensure quality and direct billing. You can find your nearest workshop via our app or website.",
  },
  {
    question: "What happens if my vehicle breaks down far from home?",
    answer:
      "All plans include roadside assistance and towing to the nearest partner workshop at no extra cost. We also cover overnight accommodation if your vehicle cannot be repaired same-day.",
  },
  {
    question: "How do I activate my warranty after purchase?",
    answer:
      "Go to the 'Warranty Service Hub' section on our site, select the 'Activate Warranty' tab, enter the activation code provided by your dealer, along with your vehicle VIN and contact info. Click confirm, and your coverage will start instantly.",
  },
  {
    question: "What is the detailed policy on covered components?",
    answer:
      "Depending on your plan level, we cover major mechanical components including the engine block, transmission, drive system, steering, starters, alternators, and advanced electronics. Consumables like brake pads, tires, and oil filters are covered only under scheduled maintenance packages.",
  },
  {
    question: "What is the step-by-step guideline when my vehicle breaks down?",
    answer:
      "Step 1: Pull over safely and call our 24/7 hotline. Step 2: Have your vehicle towed or driven to the nearest partner workshop. Step 3: The workshop will submit a diagnostic report to us. Step 4: We approve the claim limit directly, the garage repairs your vehicle, and you drive away with zero out-of-pocket costs.",
  },
];

export const mockWarrantyDatabase: Record<string, MockWarrantyRecord> = {
  "WM-2026-AUDIA4": {
    ownerPhone: "0901234567",
    ownerEmail: "customer.a@gmail.com",
    details: {
      vehicleName: "Audi A4 2.0 TFSI (2023)",
      vin: "VIN-AUDI-2026-A4",
      licensePlate: "LN71 DXG",
      planName: "Gold Warranty Package",
      status: "Active",
      startDate: "2026-01-15",
      endDate: "2029-01-15",
      claimLimit: "$8,000",
      claimsUsed: "$600",
      remainingLimit: "$7,400",
      daysRemaining: 942,
      progressPercent: 15,
      coverageScope: [
        "Engine & Turbocharger",
        "Automatic Transmission",
        "Steering System & Rack",
        "Air Conditioning & Climate",
        "Body Electrical Systems",
      ],
    },
  },
  "WM-2026-CAMERA": {
    ownerPhone: "0901234567",
    ownerEmail: "customer.a@gmail.com",
    details: {
      vehicleName: "Dashcam 4K Pro (Accessory)",
      vin: "SN-CAM-8899",
      licensePlate: "Linked to Vehicle LN71 DXG",
      planName: "Accessory Protection Package",
      status: "Active",
      startDate: "2026-02-10",
      endDate: "2027-02-10",
      claimLimit: "$200",
      claimsUsed: "$0",
      remainingLimit: "$200",
      daysRemaining: 238,
      progressPercent: 35,
      coverageScope: [
        "Mainboard & Processor",
        "Image Sensor & Lens Lens",
        "Internal Battery & Power Supply",
      ],
    },
  },
  "WM-2026-TOYOTA": {
    ownerPhone: "0987654321",
    ownerEmail: "customer.b@gmail.com",
    details: {
      vehicleName: "Toyota Camry 2.5Q (2021)",
      vin: "VIN-TOYO-2026-C5",
      licensePlate: "LO19 KWY",
      planName: "Standard Warranty Package",
      status: "Expired",
      startDate: "2023-05-10",
      endDate: "2026-05-10",
      claimLimit: "$6,000",
      claimsUsed: "$6,000",
      remainingLimit: "$0",
      daysRemaining: 0,
      progressPercent: 100,
      coverageScope: [
        "Engine Block & Internals",
        "Manual/Automatic Gearbox",
        "Starter Motor & Alternator",
      ],
    },
  },
};

export const leftSolutionsData = [
  {
    iconKey: "auto-fixers" as const,
    title: "AUTO FIXERS",
    description:
      "It provides reliable and fast car repair services to get your vehicle back on the road in top condition.",
  },
  {
    iconKey: "mechanic-masters" as const,
    title: "MECHANIC MASTERS",
    description:
      "Delivers expert car repair and maintenance services, ensuring your vehicle performs at its best every time.",
  },
  {
    iconKey: "paint-workshop" as const,
    title: "PAINT & BODYWORK",
    description:
      "Premium exterior paint correction, scratch repairs, and bodywork restoration by certified experts.",
  },
];

export const rightSolutionsData = [
  {
    iconKey: "precision-auto" as const,
    title: "PRECISION AUTO",
    description:
      "Precision Auto delivers expert car repair and maintenance for flawless performance.",
  },
  {
    iconKey: "drive-in-garage" as const,
    title: "DRIVE-IN GARAGE",
    description:
      "Offers fast, reliable car repair and maintenance services to keep your vehicle in top shape.",
  },
  {
    iconKey: "pro-equipments" as const,
    title: "PRO EQUIPMENTS",
    description:
      "Utilizing state-of-the-art diagnostic machinery and certified professional tools.",
  },
];
