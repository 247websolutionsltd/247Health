export type Appointment = {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  type: "In-person" | "Video call";
  status: "upcoming" | "completed" | "cancelled";
};

export const appointments: Appointment[] = [
  { id: "a1", doctorId: "d1", date: "Fri, 3 Oct", time: "10:00 AM", type: "In-person", status: "upcoming" },
  { id: "a2", doctorId: "d3", date: "Tue, 7 Oct", time: "02:00 PM", type: "Video call", status: "upcoming" },
  { id: "a3", doctorId: "d2", date: "Mon, 22 Sep", time: "09:30 AM", type: "In-person", status: "completed" },
  { id: "a4", doctorId: "d5", date: "Thu, 11 Sep", time: "04:30 PM", type: "Video call", status: "completed" },
  { id: "a5", doctorId: "d6", date: "Wed, 3 Sep", time: "11:00 AM", type: "In-person", status: "cancelled" },
];
