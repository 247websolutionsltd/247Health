import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";

interface NotificationProps {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  desc: string;
}

const notifications: NotificationProps[] = [
  { title: 'Appointment confirmed', desc: 'Dr. Amara Okafor • Fri, 3 Oct at 10:00 AM', icon: 'event-available' },
  { title: 'Reminder: video consult', desc: 'Your call with Dr. Zainab Bello starts in 1 day.', icon: 'videocam' },
  { title: 'Lab results ready', desc: 'Your blood test results are now available.', icon: 'science' },
  { title: 'Prescription refilled', desc: 'Your prescription has been sent to your pharmacy.', icon: 'medication' },
  { title: 'Profile completed', desc: 'Your health profile is all set up.', icon: 'account-circle' },
];

export default notifications;
