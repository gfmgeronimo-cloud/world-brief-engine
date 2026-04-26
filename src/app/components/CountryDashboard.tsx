"use client";

import { useMemo, useState } from "react";

type Country = {
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

type NewsItem = {
  title: string;
  url: string;
  sourceCountry?: string;
  domain?: string;
  seendate?: string;
};

function formatNumber(value?: number) {
  if (!value) return "Not available";
  return Math.round(value).toLocaleString("en-US");
}

function getCurrency(country: Country) {
  if (!country.currencies) return "Not available";
  return Object.values(country.currencies)
    .map((c) => `${c.name}${c.symbol ? ` (${c.symbol})` : ""}`)
    .join(", ");
}

function getLanguages(country: Country) {
  if (!country.languages) return "Not available";
  return Object.values(country.languages).slice(0, 4).join(", ");
}

export default function CountryDashboard({ countries }: { countries: Country[] }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const regions = useMemo(() => {
    return ["All", ...Array.from(new Set(countries.map((c) => c.region))).sort()];
  }, [countries]);

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch =
        country.name.common.toLowerCase().includes(search.toLowerCase()) ||
        country.name.official.toLowerCase().includes(search.toLowerCase()) ||
        country.cca3.toLowerCase().includes(search.toLowerCase());

      const matchesRegion = region === "All" || country.region === region;

      return matchesSearch && matchesRegion;
    });
  }, [countries, search, region]);

  async function openCountry(country: Country) {
    setSelectedCountry(country);
    setNews([]);
    setLoadingNews(true);

    try {
      const res = await fetch(`/api/news?country=${encodeURIComponent(country.name.common)}`);
      const data = await res.json();
      setNews(data.articles || []);
    } catch {
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  }

  return (
    <div className="p-6 md:p-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-3">
          Public data intelligence dashboard
        </p>

        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          🌍 World Brief Engine
        </h1>

        <p className="text-gray-300 max-w-3xl text-lg">
          Explore every country through structured public data, basic political-geographic context,
          and recent open-web signals.
        </p>
      </section>

      <section className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          className="w-full md:w-2/3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-gray-500"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="w-full md:w-1/3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-gray-500"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </section>

      <p className="text-gray-500 mb-6">
        Showing {filteredCountries.length} countries
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCountries.map((country) => (
          <button
            key={country.cca3}
            onClick={() => openCountry(country)}
            className="text-left bg-gray-950 border border-gray-800 hover:border-gray-500 rounded-2xl p-5 transition"
          >
            <div className="flex items-start gap-4">
              <img
                src={country.flags.svg}
                alt={country.flags.alt || `${country.name.common} flag`}
                className="w-12 h-8 object-cover rounded border border-gray-800"
              />

              <div>
                <h2 className="text-xl font-semibold">{country.name.common}</h2>
                <p className="text-gray-500 text-sm">{country.region}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-300">
              <p>
                <span className="text-gray-500">Capital:</span>{" "}
                {country.capital?.[0] || "Not available"}
              </p>
              <p>
                <span className="text-gray-500">Population:</span>{" "}
                {formatNumber(country.population)}
              </p>
              <p>
                <span className="text-gray-500">Area:</span>{" "}
                {country.area ? `${formatNumber(country.area)} km²` : "Not available"}
              </p>
            </div>
          </button>
        ))}
      </section>

      {selectedCountry && (
        <div className="fixed inset-0 bg-black/80 p-4 md:p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between gap-4 mb-8">
              <div className="flex items-start gap-4">
                <img
                  src={selectedCountry.flags.svg}
                  alt={selectedCountry.flags.alt || `${selectedCountry.name.common} flag`}
                  className="w-16 h-10 object-cover rounded border border-gray-800"
                />

                <div>
                  <h2 className="text-3xl font-bold">{selectedCountry.name.common}</h2>
                  <p className="text-gray-500">{selectedCountry.name.official}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCountry(null)}
                className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl h-fit"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <Info label="Capital" value={selectedCountry.capital?.[0] || "Not available"} />
              <Info label="Region" value={`${selectedCountry.region}${selectedCountry.subregion ? ` / ${selectedCountry.subregion}` : ""}`} />
              <Info label="Population" value={formatNumber(selectedCountry.population)} />
              <Info label="Area" value={selectedCountry.area ? `${formatNumber(selectedCountry.area)} km²` : "Not available"} />
              <Info label="Currency" value={getCurrency(selectedCountry)} />
              <Info label="Languages" value={getLanguages(selectedCountry)} />
              <Info label="Borders" value={selectedCountry.borders?.join(", ") || "None / island state"} />
              <Info label="Country code" value={`${selectedCountry.cca2} / ${selectedCountry.cca3}`} />
            </div>

            <div className="mb-8">
              <a
                href={selectedCountry.maps.googleMaps}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white text-black px-5 py-3 rounded-xl font-medium"
              >
                Open in Google Maps
              </a>
            </div>

            <section>
              <h3 className="text-2xl font-semibold mb-4">Recent open-web signals</h3>

              {loadingNews ? (
                <p className="text-gray-500">Loading recent signals...</p>
              ) : news.length === 0 ? (
                <p className="text-gray-500">
                  No recent data available from the current news source.
                </p>
              ) : (
                <div className="space-y-3">
                  {news.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-gray-900 border border-gray-800 hover:border-gray-500 rounded-xl p-4"
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {item.domain || "Source"} {item.seendate ? `• ${item.seendate}` : ""}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </section>

            <p className="text-xs text-gray-600 mt-8">
              Sources: REST Countries API for country facts; GDELT Project for recent open-web signals.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{label}</p>
      <p className="text-gray-200">{value}</p>
    </div>
  );
}