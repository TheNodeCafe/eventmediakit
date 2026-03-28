"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormData } from "@/lib/validations/event";
import { useCreateEvent } from "@/hooks/use-events";
import { useI18n } from "@/lib/i18n/context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { locale: "fr" },
  });

  async function onSubmit(data: EventFormData) {
    try {
      const event = await createEvent.mutateAsync(data);
      router.push(`/events/${event.id}`);
    } catch (err) {
      console.error("Event creation failed:", err);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "h-9 w-9 rounded-lg shrink-0",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">{t("newEvent", "title")}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {t("newEvent", "subtitle")}
          </p>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-[16px] font-semibold">{t("newEvent", "generalInfo")}</CardTitle>
          <CardDescription className="text-[13px]">
            {t("newEvent", "infoDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {createEvent.isError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" />
              </svg>
              {createEvent.error?.message || t("newEvent", "createError")}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[13px] font-medium">
                {t("newEvent", "eventName")}
              </Label>
              <Input
                id="name"
                placeholder={t("newEvent", "eventNamePlaceholder")}
                {...register("name")}
                className="h-10 rounded-lg text-[14px]"
              />
              {errors.name && (
                <p className="text-[12px] text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[13px] font-medium">
                {t("newEvent", "description")} <span className="font-normal text-muted-foreground">({t("newEvent", "optional")})</span>
              </Label>
              <Textarea
                id="description"
                placeholder={t("newEvent", "descPlaceholder")}
                {...register("description")}
                className="min-h-[100px] rounded-lg text-[14px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-[13px] font-medium">{t("newEvent", "startDate")}</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  className="h-10 rounded-lg text-[14px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-[13px] font-medium">{t("newEvent", "endDate")}</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className="h-10 rounded-lg text-[14px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="access_password" className="text-[13px] font-medium">
                {t("newEvent", "password")} <span className="font-normal text-muted-foreground">({t("newEvent", "optional")})</span>
              </Label>
              <Input
                id="access_password"
                type="text"
                placeholder={t("newEvent", "passwordPlaceholder")}
                {...register("access_password")}
                className="h-10 rounded-lg text-[14px]"
              />
              <p className="text-[12px] text-muted-foreground">
                {t("newEvent", "passwordHint")}
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-border/40 pt-5">
              <Link
                href="/events"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-lg h-10 text-[13px] font-medium border-border/60",
                })}
              >
                {t("newEvent", "cancel")}
              </Link>
              <Button
                type="submit"
                disabled={createEvent.isPending}
                className="rounded-lg h-10 text-[13px] font-semibold shadow-sm shadow-primary/15 px-5"
              >
                {createEvent.isPending ? t("newEvent", "creating") : t("newEvent", "create")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
