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
  const results = [];
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const company of LEVER_COMPANIES) {
    try {
      const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
      const response = await fetch(url);

      if (!response.ok) continue;

      const jobs = await response.json();
      if (!Array.isArray(jobs)) continue;

      for (const job of jobs) {
        const descriptionText = job.descriptionPlain || job.text || "";
        const searchableText = `${job.text || ""} ${descriptionText} ${job.categories?.location || ""}`.toLowerCase();

        // Keyword filter if query terms provided
        if (queryTerms.length > 0) {
          const isMatch = queryTerms.some(term => searchableText.includes(term));
          if (!isMatch) continue;
        }

        results.push({
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
      }
    } catch (error) {
      console.error(`Lever error for ${company.name}:`, error.message);
    }
  }

  return results;
};