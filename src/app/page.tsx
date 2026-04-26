import CountryDashboard from "./components/CountryDashboard";

type RestCountry = {
  name: { common: string; official: string };
  cca2: string;
  cca3: string;
  capital?: string[];
  region: string;
  subregion?: string;
  population: number;
  area?: number;
  borders?: string[];
  currencies?: Record<string, { name: string; symbol?: string }>;
  languages?: Record<string, string>;
  flags: { png: string; svg: string; alt?: string };
  maps: { googleMaps: string };
};

async function getCountries() {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,region,subregion,population,area,borders,currencies,languages,flags,maps",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch countries");
  }

  const countries: RestCountry[] = await res.json();

  return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
}

export default async function Home() {
  const countries = await getCountries();

  return (
    <main className="min-h-screen bg-black text-white">
      <CountryDashboard countries={countries} />
    </main>
  );
}