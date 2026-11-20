"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { type ReactElement, useId } from "react";
import { type FieldError, type Path, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import {
  type EnquiryForm,
  emptyEnquiry,
  enquirySchema,
} from "@/lib/enquiry-schema";

type EnquiryProduct = { id: number; name: string };

/** The API answered, but not with 201. */
class EnquiryRejected extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`POST /enquiries returned ${status}`);
  }
}

const formFields = new Set<string>(Object.keys(emptyEnquiry));
const isFormField = (name: string): name is Path<EnquiryForm> =>
  formFields.has(name);

/** What to tell the customer when an enquiry failed; field errors are shown on the fields instead. */
function failureMessage(error: Error): string | undefined {
  if (error instanceof EnquiryRejected) {
    if (error.status === 400) return undefined;
    if (error.status === 404) return "This product is no longer available.";
  }
  return "We couldn't send your enquiry. Please try again.";
}

export function EnquiryDialog({ product }: { product: EnquiryProduct }) {
  const form = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: emptyEnquiry,
  });
  const { errors } = form.formState;

  const send = useMutation({
    mutationFn: async (values: EnquiryForm) => {
      const { data, error, response } = await api.POST("/enquiries", {
        body: { productId: product.id, ...values },
      });
      if (error) throw new EnquiryRejected(response.status, error);
      return data;
    },
    onError: (error) => {
      if (!(error instanceof EnquiryRejected) || error.status !== 400) return;
      const { fields } = error.body as { fields: Record<string, string> };
      for (const [name, message] of Object.entries(fields)) {
        if (isFormField(name)) form.setError(name, { message });
      }
    },
  });

  return (
    <Dialog
      // After a successful enquiry, the next one starts blank. Waiting for the close animation
      // to finish keeps the thank-you on screen until the dialog has gone.
      onOpenChangeComplete={(open) => {
        if (!open && send.isSuccess) {
          form.reset();
          send.reset();
        }
      }}
    >
      <DialogTrigger render={<Button size="lg" />}>Enquire</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Enquire about ${product.name}`}</DialogTitle>
        </DialogHeader>
        {send.isSuccess ? (
          <p role="status">Thank you, our sales team will be in touch</p>
        ) : (
          <form
            noValidate
            className="grid gap-3"
            onSubmit={form.handleSubmit((values) => send.mutate(values))}
          >
            <Field label="Name" error={errors.name}>
              <Input autoComplete="name" {...form.register("name")} />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
            </Field>
            <Field label="Phone (optional)" error={errors.phone}>
              <Input
                type="tel"
                autoComplete="tel"
                {...form.register("phone")}
              />
            </Field>
            <Field label="Message (optional)" error={errors.message}>
              <Textarea {...form.register("message")} />
            </Field>
            {/* Honeypot: off-screen and out of the tab order, so only bots fill it in. */}
            <div
              aria-hidden
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label>
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  {...form.register("website")}
                />
              </label>
            </div>
            {send.error && failureMessage(send.error) && (
              <p role="alert" className="text-destructive text-xs">
                {failureMessage(send.error)}
              </p>
            )}
            <Button type="submit" disabled={send.isPending}>
              {send.isPending ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** A labelled control with its error message, linked so screen readers announce both. */
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: FieldError | undefined;
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <children.type
        {...children.props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-destructive text-xs">
          {error.message}
        </p>
      )}
    </div>
  );
}
