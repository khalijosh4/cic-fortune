import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5
  const halfVisible = Math.floor(maxVisiblePages / 2)

  let startPage = Math.max(currentPage - halfVisible, 1)
  let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(endPage - maxVisiblePages + 1, 1)
  }

  const pages: (number | string)[] = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  if (startPage > 1) {
    if (startPage > 2) pages.unshift('...')
    pages.unshift(1)
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return pages
}

export function getDisplayNameInitials(name: string) {
  if (!name) return ''
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}
