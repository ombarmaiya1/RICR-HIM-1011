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
  const results = [];
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

  for (const company of GREENHOUSE_COMPANIES) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs?content=true`;
      const response = await fetch(url);

      if (!response.ok) continue;

      const data = await response.json();
      const jobs = data.jobs || [];

      for (const job of jobs) {
        const plainDesc = stripHtml(job.content || "");
        const searchableText = `${job.title || ""} ${plainDesc} ${job.location?.name || ""}`.toLowerCase();

        // Keyword filter if query terms provided
        if (queryTerms.length > 0) {
          const isMatch = queryTerms.some(term => searchableText.includes(term));
          if (!isMatch) continue;
        }

        results.push({
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
      }
    } catch (error) {
      console.error(`Greenhouse error for ${company.name}:`, error.message);
    }
  }

  return results;
};