import axios from "axios";

export type BirthChartPlacement = {
  planet: string;
  sign: string;
  signs: string[];
  degree: number | null;
  degreeRange: string;
  longitude: number | null;
  longitudeRange: {
    start: number;
    end: number;
  };
};

export type BirthChartFighter = {
  name: string;
  birthDate: string;
  birthDateRangeUtc: {
    start: string;
    end: string;
  } | null;
  placements: BirthChartPlacement[];
  warnings: string[];
};

export type SynastryAspect = {
  fighterAPlanet: string;
  fighterBPlanet: string;
  aspect: string;
  orb: number;
  orbRange: string;
  label: string;
  certainty: "all-day" | "possible";
};

export type BirthChartComparison = {
  calculationMode: "date_only_utc_day_range";
  fighters: BirthChartFighter[];
  synastry: SynastryAspect[];
  warnings: string[];
};

export type BirthChartCompareFighter = {
  name: string;
  birthDate: string;
};

export const getBirthChartComparison = async (
  fighters: BirthChartCompareFighter[]
) => {
  const baseUrl =
    process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api";
  const url = `${baseUrl}/birthchart/compare`;

  try {
    const { data } = await axios.post<BirthChartComparison>(url, { fighters });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data?.error;
      throw new Error(
        serverError || error.message || "Unable to compare birth charts"
      );
    }

    throw new Error("Unable to compare birth charts");
  }
};
