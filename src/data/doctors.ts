import { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export type Specialty = { name: string; icon: ComponentProps<typeof MaterialIcons>["name"] };

export const specialties: Specialty[] = [
  { name: "General", icon: "medical-services" },
  { name: "Cardiology", icon: "favorite" },
  { name: "Dental", icon: "sentiment-satisfied" },
  { name: "Pediatrics", icon: "child-care" },
  { name: "Eye Care", icon: "visibility" },
  { name: "Neurology", icon: "psychology" },
  { name: "Dermatology", icon: "face" },
  { name: "Ortho", icon: "accessibility-new" },
];

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews: number;
  years: number;
  patients: string;
  fee: string;
  color: string;
  about: string;
  available: boolean;
};

export const doctors: Doctor[] = [
  { id: "d1", name: "Dr. Amara Okafor", specialty: "Cardiology", hospital: "Lagoon Heart Centre", rating: 4.9, reviews: 312, years: 14, patients: "2.4k", fee: "$45", color: "#2563EB", available: true,
    about: "Consultant cardiologist focused on preventive heart care, hypertension and post-cardiac rehabilitation." },
  { id: "d2", name: "Dr. Daniel Mensah", specialty: "General", hospital: "CityCare Clinic", rating: 4.8, reviews: 540, years: 9, patients: "4.1k", fee: "$25", color: "#0EA5E9", available: true,
    about: "Family physician helping patients with everyday illness, chronic conditions and routine check-ups." },
  { id: "d3", name: "Dr. Zainab Bello", specialty: "Pediatrics", hospital: "Little Steps Hospital", rating: 4.9, reviews: 288, years: 11, patients: "3.0k", fee: "$35", color: "#6366F1", available: true,
    about: "Paediatrician caring for infants, children and teens, with a special interest in child nutrition and vaccines." },
  { id: "d4", name: "Dr. Chidi Eze", specialty: "Dental", hospital: "BrightSmile Dental", rating: 4.7, reviews: 201, years: 8, patients: "1.8k", fee: "$30", color: "#14B8A6", available: false,
    about: "Dental surgeon offering cleaning, restorative care and cosmetic dentistry in a calm, friendly setting." },
  { id: "d5", name: "Dr. Ifeoma Adeyemi", specialty: "Dermatology", hospital: "ClearSkin Studio", rating: 4.8, reviews: 175, years: 10, patients: "1.5k", fee: "$40", color: "#3B82F6", available: true,
    about: "Dermatologist treating acne, eczema, pigmentation and hair loss with evidence-based care." },
  { id: "d6", name: "Dr. Tunde Balogun", specialty: "Ortho", hospital: "MoveWell Ortho Hospital", rating: 4.6, reviews: 143, years: 16, patients: "2.2k", fee: "$50", color: "#0284C7", available: true,
    about: "Orthopaedic specialist for joint pain, sports injuries and mobility recovery." },
];

export const initials = (name: string) =>
  name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2);

export const timeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "04:30 PM"];
