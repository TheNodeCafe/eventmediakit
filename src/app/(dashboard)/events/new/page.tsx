"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormData } from "@/lib/validations/event";
import { useCreateEvent } from "@/hooks/use-events";
import { useOrg } from "@/hooks/use-org";
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
  useOrg();
  const router = useRouter();
  const createEvent = useCreateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { locale: "fr" },
  });

  async function onSubmit(data: EventFormData) {
    const event = await createEvent.mutateAsync(data);
    router.push(`/events/${event.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nouvel événement</h1>
          <p className="text-muted-foreground">
            Configurez les informations de base de votre événement
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Ces informations seront visibles par vos participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;événement</Label>
              <Input
                id="name"
                placeholder="Salon de l'Innovation 2026"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre événement..."
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input id="end_date" type="date" {...register("end_date")} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/events" className={buttonVariants({ variant: "outline" })}>Annuler</Link>
              <Button type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? "Création..." : "Créer l'événement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
