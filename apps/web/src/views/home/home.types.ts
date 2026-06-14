export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  quote: string;
  carModel: string;
  claimAmount: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}
