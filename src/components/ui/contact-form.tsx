"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_ENDPOINT } from "@/content/site";

type State = "idle" | "sending" | "sent" | "error";

/**
 * Real contact form — the message is relayed to the inbox behind
 * CONTACT_ENDPOINT's alias.
 *
 * There is no server behind this site, so the post goes to FormSubmit, which
 * needs no account of ours. One caveat worth knowing: the very first submission
 * triggers an activation email to that inbox, and messages only start arriving
 * once that link is clicked.
 *
 * Submitting over fetch rather than a plain form post keeps the visitor on the
 * page, and every outcome is reported honestly — on failure the address is
 * shown so the message is not simply lost.
 */
export function ContactForm() {
  const [state, setState] = React.useState<State>("idle");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setState("sending");
    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          _subject: `Message from ${data.get("name") || "the site"}`,
          _captcha: "false",
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-border bg-white/[0.03] px-6 py-10 text-center">
        <p className="text-lg font-medium">Thank you — your message is sent.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          I will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <h3 className="mb-6 text-[clamp(1.3rem,2.4vw,1.7rem)] leading-none font-light">
        Send me an email
      </h3>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <div className="grid content-start gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cf-name" className="text-sm font-normal">
              Name
            </Label>
            <Input
              id="cf-name"
              name="name"
              required
              autoComplete="name"
              className="h-11 rounded-lg bg-background/60"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cf-email" className="text-sm font-normal">
              Email
            </Label>
            <Input
              id="cf-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="h-11 rounded-lg bg-background/60"
            />
          </div>
        </div>

        <div className="grid content-start gap-2">
          <Label htmlFor="cf-message" className="text-sm font-normal">
            Message
          </Label>
          <Textarea
            id="cf-message"
            name="message"
            required
            rows={6}
            className="min-h-[8rem] rounded-lg bg-background/60 md:min-h-[9.5rem]"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col items-end gap-3">
        {state === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            That did not go through. Please reach me through the links above, or
            try again in a moment.
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={state === "sending"}
          className="h-11 rounded-lg px-7 font-semibold"
        >
          {state === "sending" ? "Sending…" : "Send email"}
        </Button>
      </div>
    </form>
  );
}
