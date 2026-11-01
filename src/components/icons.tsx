import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6.3 6.3 2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M12 4v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
      <path d="M8 15h2M14 15h2M8 18h2M14 18h2" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function GraphIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="12" cy="18" r="2.5" />
      <path d="M8.5 6h7M7.3 8.2l3.5 7.6M16.7 8.2l-3.5 7.6" />
    </svg>
  );
}
