import { useEffect } from "react"
import { useLocation } from "react-router-dom"

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/policies": "Policies",
  "/claims": "Claims",
  "/premiums": "Premiums",
  "/members": "Members",
  "/jobs": "Job Postings",
  "/applications": "Applications",
  "/knowledge-base": "Knowledge Base",
  "/mailing-list": "Mailing List",
  "/settings": "Settings",
}

const SITE_NAME = "Fortune Sacco"

export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = PAGE_TITLES[pathname] ?? "Not Found"
    document.title = `${page} | ${SITE_NAME}`
  }, [pathname])
}
