const GREENHOUSE_COMPANIES = [
  { name: "Cloudflare", token: "cloudflare" },
  { name: "GitHub", token: "github" },
  { name: "Stripe", token: "stripe" },
  { name: "GitLab", token: "gitlab" },
  { name: "Canonical", token: "canonical" },
  { name: "Discord", token: "discord" },
  { name: "Figma", token: "figma" },
  { name: "Segment", token: "segment" },
  { name: "Roblox", token: "roblox" },
  { name: "HashiCorp", token: "hashicorp" },
  { name: "Reddit", token: "reddit" },
  { name: "DoorDash", token: "doordash" },
  { name: "Twilio", token: "twilio" },
  { name: "Vercel", token: "vercel" },
  { name: "Elastic", token: "elastic" },
];

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const searchGreenhouseJobs = async ({ query = "" }) => {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  const fetchCompanyJobs = async (company) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs?content=true`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return [];

      const data = await response.json();
      const jobs = data.jobs || [];
      const companyResults = [];

      for (const job of jobs) {
        const plainDesc = stripHtml(job.content || "");
        const searchableText = `${job.title || ""} ${plainDesc} ${job.location?.name || ""}`.toLowerCase();

        if (queryTerms.length > 0) {
          const isMatch = queryTerms.some(term => searchableText.includes(term));
          if (!isMatch) continue;
        }

        companyResults.push({
          title: job.title || "Untitled Position",
          company: company.name,
          location: job.location?.name || "Remote / Multiple",
          workplaceType: job.location?.name?.toLowerCase().includes("remote") ? "Remote" : "On-site / Hybrid",
          employmentType: "Full-time",
          description: plainDesc.slice(0, 1500),
          source: "greenhouse",
          sourceJobId: String(job.id),
          jobUrl: job.absolute_url || "",
          applyUrl: job.absolute_url || "",
          postedAt: job.updated_at ? new Date(job.updated_at) : null,
        });

        // Limit per company to prevent payload explosion
        if (companyResults.length >= 4) break;
      }
      return companyResults;
    } catch {
      clearTimeout(timeoutId);
      return [];
    }
  };

  const resultsArray = await Promise.allSettled(
    GREENHOUSE_COMPANIES.map(company => fetchCompanyJobs(company))
  );

  const results = [];
  resultsArray.forEach(res => {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      results.push(...res.value);
    }
  });

  return results;
};