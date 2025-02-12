import { marsSignChanges } from "./marsTransitions";

function getMarsSign(birthDateString: string) {
  const birthDate = new Date(birthDateString); // Convert string like "Mar 16, 1984" to Date object

  let prevSign = null;
  let nextSign = null;

  for (let i = 0; i < marsSignChanges.length; i++) {
    const changeDate = new Date(marsSignChanges[i].date);

    if (birthDate < changeDate) {
      nextSign = marsSignChanges[i];
      break;
    }
    prevSign = marsSignChanges[i];
  }

  if (!prevSign) return "Unknown (Out of Range)";
  if (!nextSign) return prevSign.sign;

  // Check if within 3 days of sign change
  const timeDiff =
    (new Date(nextSign.date).getTime() - birthDate.getTime()) /
    (1000 * 60 * 60 * 24);

  return timeDiff <= 3
    ? `${prevSign.sign} or ${nextSign.sign} (Cusp)`
    : prevSign.sign;
}

export default getMarsSign;
