import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("flex", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn("", className)} {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & React.ComponentProps<"button">

function PaginationLink({ isActive, disabled, className, children, ...props }: PaginationLinkProps) {
  return (
    <button
      disabled={disabled}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "flex items-center justify-center min-w-9 h-9 rounded-md text-sm transition-colors",
        "border border-[rgba(233,233,233,1)] bg-white",
        isActive && "border-[rgba(74,131,148,1)] text-[rgba(74,131,148,1)] font-medium",
        !isActive && "text-gray-600 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function PaginationPrevious({ className, disabled, ...props }: React.ComponentProps<"button"> & { disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "flex items-center justify-center min-w-9 h-9 rounded-md text-sm transition-colors",
        "border border-[rgba(233,233,233,1)] bg-white text-gray-600 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >      
      <ChevronLeft className="w-4 h-4 pl-1" />
      <span>Back</span>
    </button>
  )
}

function PaginationNext({ className, disabled, ...props }: React.ComponentProps<"button"> & { disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "flex items-center justify-center min-w-9 h-9 rounded-md text-sm transition-colors",
        "border border-[rgba(233,233,233,1)] bg-white text-gray-600 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span className="pl-1">Next</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex items-center justify-center min-w-9 h-9 text-gray-400", className)}
      {...props}
    >
      <MoreHorizontal className="w-4 h-4" />
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
