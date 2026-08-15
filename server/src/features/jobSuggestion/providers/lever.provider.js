const LEVER_COMPANIES = [
  { name: "Spotify", slug: "spotify" },
  { name: "Palantir", slug: "palantir" },
  { name: "Datadog", slug: "datadog" },
  { name: "Postman", slug: "postman" },
  { name: "Deliveroo", slug: "deliveroo" },
  { name: "Braze", slug: "braze" },
  { name: "Scale AI", slug: "scaleai" },
  { name: "Clever", slug: "clever" },
  { name: "Affirm", slug: "affirm" },
  { name: "Lever", slug: "lever" },
];

export const searchLeverJobs = async ({ query = "" }) => {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  const fetchCompanyJobs = async (company) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const jobs = await response.json();
      if (!Array.isArray(jobs)) return [];

      const companyResults = [];
      for (const job of jobs) {
        const descriptionText = job.descriptionPlain || job.text || "";
        const searchableText = `${job.text || ""} ${descriptionText} ${job.categories?.location || ""}`.toLowerCase();

        if (queryTerms.length > 0) {
          const isMatch = queryTerms.some(term => searchableText.includes(term));
          if (!isMatch) continue;
        }

        companyResults.push({
          title: job.text || "Untitled Position",
          company: company.name,
          location: job.categories?.location || "Remote / Multiple",
          workplaceType: job.workplaceType || (job.categories?.location?.toLowerCase().includes("remote") ? "Remote" : "On-site / Hybrid"),
          employmentType: job.categories?.commitment || "Full-time",
          description: descriptionText.slice(0, 1500),
          source: "lever",
          sourceJobId: String(job.id),
          jobUrl: job.hostedUrl || "",
          applyUrl: job.applyUrl || job.hostedUrl || "",
          postedAt: job.createdAt ? new Date(job.createdAt) : null,
        });

        if (companyResults.length >= 4) break;
      }
      return companyResults;
    } catch {
      clearTimeout(timeoutId);
      return [];
    }
  };

  const resultsArray = await Promise.allSettled(
    LEVER_COMPANIES.map(company => fetchCompanyJobs(company))
  );

  const results = [];
  resultsArray.forEach(res => {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      results.push(...res.value);
    }
  });

  return results;
};