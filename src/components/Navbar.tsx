import { Fragment, useState } from "react";

const LINKS = ["Labs", "Studio", "Openings", "Shop"];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <a href="#" className="flex items-center gap-3">
          <span
            className="text-[21px] tracking-tight text-black sm:text-[26px]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Mainframe®
          </span>
          <span
            aria-hidden
            className="text-[25px] text-black select-none sm:text-[30px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            ✳︎
          </span>
        </a>

        <nav className="hidden items-center text-[23px] text-black md:flex">
          {LINKS.map((label, index) => (
            <Fragment key={label}>
              <a href="#" className="transition-opacity hover:opacity-60">
                {label}
              </a>
              {index < LINKS.length - 1 ? <span>,&nbsp;</span> : null}
            </Fragment>
          ))}
        </nav>

        <a
          href="#"
          className="hidden text-[23px] text-black underline underline-offset-2 transition-opacity hover:opacity-60 md:inline"
        >
          Get in touch
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex flex-col gap-[5px] md:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-black transition-transform duration-300 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-opacity duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-black transition-transform duration-300 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </header>

      {/* Mobile overlay — sits under the bar so the toggle stays reachable. */}
      <div
        className="fixed inset-0 z-[9] flex flex-col justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      >
        {LINKS.map((label) => (
          <a
            key={label}
            href="#"
            onClick={() => setOpen(false)}
            className="text-[32px] font-medium text-black"
          >
            {label}
          </a>
        ))}
        <a
          href="#"
          onClick={() => setOpen(false)}
          className="text-[32px] font-medium text-black underline underline-offset-2"
        >
          Get in touch
        </a>
      </div>
    </>
  );
}
