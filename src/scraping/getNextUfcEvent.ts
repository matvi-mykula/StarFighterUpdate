import axios from "axios";

export const getNextUfcEvent = async () => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "" // relative path when deployed on Vercel (same domain)
        : "http://localhost:5000";
    const url = `${baseUrl}/next-ufc-card`;
    console.log({ url });
    const { data } = await axios.get(url);
    console.log({ data }); // Check the fetched data
    return data; // Process and return the data as needed
  } catch (error) {
    console.error("Error fetching UFC data:", error);
    return error;
  }
};

export const astrologicalSign = (birthDate: Date) => {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  return "Unknown";
};

export const astrologicalSignEmojis = {
  Aries: "♈️", // Ram
  Taurus: "♉️", // Bull
  Gemini: "♊️", // Twins
  Cancer: "♋️", // Crab
  Leo: "♌️", // Lion
  Virgo: "♍️", // Virgin/Maiden
  Libra: "♎️", // Scales
  Scorpio: "♏️", // Scorpion
  Sagittarius: "♐️", // Archer
  Capricorn: "♑️", // Goat-Fish
  Aquarius: "♒️", // Water Bearer
  Pisces: "♓️", // Fish
  Unknown: "0",
};

export function getSignWithEmoji(date: string | number | Date) {
  const sign = astrologicalSign(new Date(date)); // Assuming astrologicalSign is defined elsewhere
  const emoji = astrologicalSignEmojis[sign] || ""; // Handle cases where sign is not found
  return `${sign} - ${emoji}`; // Combine sign and emoji
}
