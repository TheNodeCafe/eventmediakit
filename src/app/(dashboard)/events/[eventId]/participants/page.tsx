"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Upload,
  Users,
  Send,
  Trash2,
} from "lucide-react";
import {
  useParticipants,
  useCreateParticipant,
  useDeleteParticipant,
} from "@/hooks/use-participants";
import { useCategories } from "@/hooks/use-categories";

const statusLabels: Record<string, string> = {
  invited: "Invité",
  link_opened: "Lien ouvert",
  completed: "Complété",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  invited: "outline",
  link_opened: "secondary",
  completed: "default",
};

export default function ParticipantsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: participants, isLoading } = useParticipants(eventId);
  const { data: categories } = useCategories(eventId);
  const deleteParticipant = useDeleteParticipant(eventId);
  const [inviting, setInviting] = useState<string[]>([]);

  async function handleInvite(participantIds: string[]) {
    setInviting(participantIds);
    try {
      await fetch(`/api/participants/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, participant_ids: participantIds }),
      });
    } finally {
      setInviting([]);
    }
  }

  async function handleInviteAll() {
    const uninvited = participants
      ?.filter((p) => !p.invited_at)
      .map((p) => p.id);
    if (uninvited?.length) {
      await handleInvite(uninvited);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/events/${eventId}`}
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Participants</h1>
            <p className="text-muted-foreground">
              {participants?.length ?? 0} participant(s)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(participants?.length ?? 0) > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleInviteAll}
              disabled={inviting.length > 0}
            >
              <Send className="mr-2 h-4 w-4" />
              Envoyer tous les liens
            </Button>
          )}
          <Link
            href={`/events/${eventId}/participants/import`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Link>
          <AddParticipantDialog
            eventId={eventId}
            categories={categories ?? []}
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : !participants?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">Aucun participant</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Importez un CSV ou ajoutez des participants manuellement
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Invité le</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.email}</TableCell>
                  <TableCell>{p.category?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[p.status]}>
                      {statusLabels[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.invited_at
                      ? new Date(p.invited_at).toLocaleDateString("fr-FR")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleInvite([p.id])}
                        disabled={inviting.includes(p.id)}
                        title="Envoyer le lien"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          if (confirm("Supprimer ce participant ?")) {
                            deleteParticipant.mutate(p.id);
                          }
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function AddParticipantDialog({
  eventId,
  categories,
}: {
  eventId: string;
  categories: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const createParticipant = useCreateParticipant(eventId);

  async function handleAdd() {
    if (!email.trim() || !categoryId) return;
    await createParticipant.mutateAsync({
      email: email.trim(),
      category_id: categoryId,
    });
    setEmail("");
    setCategoryId("");
    setOpen(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un participant</DialogTitle>
          <DialogDescription>
            Le participant recevra un lien magique par email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="participant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAdd}
            disabled={createParticipant.isPending || !email || !categoryId}
            className="w-full"
          >
            {createParticipant.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
