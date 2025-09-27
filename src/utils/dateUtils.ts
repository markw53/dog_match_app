import type { Timestamp } from "firebase/firestore";

const toJSDate = (date: Date | Timestamp): Date =>
  date instanceof Date ? date : date.toDate();

export const formatDate = (date?: Date | Timestamp): string =>
  date ? toJSDate(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

export const formatTime = (date?: Date | Timestamp): string =>
  date ? toJSDate(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

export const calculateAge = (birth: string | number | Date): number => {
  const dob = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const getRelativeTime = (date?: Date | Timestamp): string => {
  if (!date) return "";
  const d = toJSDate(date);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(d);
};