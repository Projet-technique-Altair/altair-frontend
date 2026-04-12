import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Pencil,
  Save,
  Search,
  Trash2,
  UserPlus,
  Orbit,
  FlaskConical,
  Users,
  X,
} from "lucide-react";

import { api } from "@/api";
import { getLab } from "@/api/labs";
import { getStarpath } from "@/api/starpaths";
import { getUserPseudo } from "@/api/users";

import type { Group } from "@/contracts/groups";
import type {
  GroupLabResult,
  GroupMemberResult,
  GroupStarpathResult,
  SearchLabResult,
  SearchStarpathResult,
  SearchUserResult,
} from "@/api/types";

type EditableGroup = Group & {
  description?: string | null;
};

type MutationMessage = {
  type: "success" | "error";
  text: string;
} | null;

type BusyAction =
  | "save-group"
  | "add-users"
  | "add-labs"
  | "add-starpaths"
  | "delete-group"
  | null;

type EnrichedMember = GroupMemberResult & {
  pseudo?: string;
};

type EnrichedLab = GroupLabResult & {
  name?: string;
};

type EnrichedStarpath = GroupStarpathResult & {
  name?: string;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[11px] uppercase tracking-wide text-white/50">
      {children}
    </label>
  );
}

function InputShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/20 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default function CreatorGroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const groupId = useMemo(() => (typeof id === "string" ? id.trim() : ""), [id]);

  const [group, setGroup] = useState<EditableGroup | null>(null);

  const [members, setMembers] = useState<EnrichedMember[]>([]);
  const [labs, setLabs] = useState<EnrichedLab[]>([]);
  const [starpaths, setStarpaths] = useState<EnrichedStarpath[]>([]);

  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<SearchUserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUserResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const [labQuery, setLabQuery] = useState("");
  const [labResults, setLabResults] = useState<SearchLabResult[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<SearchLabResult[]>([]);
  const [searchingLabs, setSearchingLabs] = useState(false);

  const [starpathQuery, setStarpathQuery] = useState("");
  const [starpathResults, setStarpathResults] = useState<SearchStarpathResult[]>([]);
  const [selectedStarpaths, setSelectedStarpaths] = useState<SearchStarpathResult[]>([]);
  const [searchingStarpaths, setSearchingStarpaths] = useState(false);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<MutationMessage>(null);

  const isBusy = busyAction !== null;

  const normalizeText = (value: string, maxLength: number) =>
    value.replace(/\s+/g, " ").trim().slice(0, maxLength);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!groupId) {
        navigate("/creator/workspace");
        return;
      }

      setLoading(true);

      try {
        const [g, m, l, sp] = await Promise.all([
          api.getGroupById(groupId),
          api.getGroupMembers(groupId),
          api.getGroupLabs(groupId),
          api.getGroupStarpaths(groupId),
        ]);

        const enrichedMembers = await Promise.all(
          (m ?? []).map(async (member) => {
            try {
              const fullUser = await getUserPseudo(member.user_id);

              return {
                ...member,
                pseudo: fullUser?.pseudo || "Unknown user",
              } as EnrichedMember;
            } catch {
              return {
                ...member,
                pseudo: "Unknown user",
              } as EnrichedMember;
            }
          }),
        );

        const enrichedLabs = await Promise.all(
          (l ?? []).map(async (lab) => {
            try {
              const fullLab = await getLab(lab.lab_id);

              return {
                ...lab,
                name: fullLab?.name || "Unknown lab",
              } as EnrichedLab;
            } catch {
              return {
                ...lab,
                name: "Unknown lab",
              } as EnrichedLab;
            }
          }),
        );

        const enrichedStarpaths = await Promise.all(
          (sp ?? []).map(async (starpath) => {
            const starpathId =
              typeof starpath === "string" ? starpath : starpath.starpath_id;

            try {
              const fullStarpath = await getStarpath(starpathId);

              return {
                ...(typeof starpath === "string"
                  ? { starpath_id: starpathId }
                  : starpath),
                name: fullStarpath?.name || "Unknown starpath",
              } as EnrichedStarpath;
            } catch {
              return {
                ...(typeof starpath === "string"
                  ? { starpath_id: starpathId }
                  : starpath),
                name: "Unknown starpath",
              } as EnrichedStarpath;
            }
          }),
        );

        if (cancelled) return;

        setGroup(g);
        setMembers(enrichedMembers);
        setLabs(enrichedLabs);
        setStarpaths(enrichedStarpaths);
        setName(g.name ?? "");
        setDescription(g.description ?? "");
      } catch (err) {
        console.error("Failed to load group:", err);

        if (!cancelled) {
          setMessage({
            type: "error",
            text: "Failed to load this group.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [groupId, navigate]);

  useEffect(() => {
    let cancelled = false;

    if (userQuery.trim().length < 2) {
      setUserResults([]);
      setSearchingUsers(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchingUsers(true);

      try {
        const results = await api.searchUsers(userQuery.trim().slice(0, 80));

        if (cancelled) return;
        setUserResults(results ?? []);
      } catch (err) {
        console.error("Failed to search users:", err);

        if (!cancelled) {
          setUserResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchingUsers(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [userQuery]);

  useEffect(() => {
    let cancelled = false;

    if (labQuery.trim().length < 2) {
      setLabResults([]);
      setSearchingLabs(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchingLabs(true);

      try {
        const results = await api.searchLabs(labQuery.trim().slice(0, 80));

        if (cancelled) return;
        setLabResults(results ?? []);
      } catch (err) {
        console.error("Failed to search labs:", err);

        if (!cancelled) {
          setLabResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchingLabs(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [labQuery]);

  useEffect(() => {
    let cancelled = false;

    if (starpathQuery.trim().length < 2) {
      setStarpathResults([]);
      setSearchingStarpaths(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchingStarpaths(true);

      try {
        const results = await api.searchStarpaths(starpathQuery.trim().slice(0, 80));

        if (cancelled) return;
        setStarpathResults(results ?? []);
      } catch (err) {
        console.error("Failed to search starpaths:", err);

        if (!cancelled) {
          setStarpathResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchingStarpaths(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [starpathQuery]);

  const userResultsFiltered = userResults.filter(
    (user) =>
      !selectedUsers.some((selected) => selected.user_id === user.user_id) &&
      !members.some((member) => member.user_id === user.user_id),
  );

  const labResultsFiltered = labResults.filter(
    (lab) =>
      !selectedLabs.some((selected) => selected.lab_id === lab.lab_id) &&
      !labs.some((assigned) => assigned.lab_id === lab.lab_id),
  );

  const starpathResultsFiltered = starpathResults.filter(
    (starpath) =>
      !selectedStarpaths.some(
        (selected) => selected.starpath_id === starpath.starpath_id,
      ) &&
      !starpaths.some(
        (assigned) => assigned.starpath_id === starpath.starpath_id,
      ),
  );

  const handleStartEditing = () => {
    if (!group) return;

    setName(group.name ?? "");
    setDescription(group.description ?? "");
    setMessage(null);
    setEditing(true);
  };

  const handleCancelEditing = () => {
    setName(group?.name ?? "");
    setDescription(group?.description ?? "");
    setMessage(null);
    setEditing(false);
  };

  const handleSaveGroup = async () => {
    if (!groupId || busyAction) return;

    const nextName = normalizeText(name, 120);
    const nextDescription = description.trim().slice(0, 2000);

    if (!nextName) {
      setMessage({
        type: "error",
        text: "Group name cannot be empty.",
      });
      return;
    }

    setBusyAction("save-group");
    setMessage(null);

    try {
      const updated = await api.updateGroup(groupId, {
        name: nextName,
        description: nextDescription,
      });

      setGroup(updated);
      setName(updated.name ?? nextName);
      setDescription(updated.description ?? nextDescription);
      setEditing(false);

      setMessage({
        type: "success",
        text: "Group details saved successfully.",
      });
    } catch (err) {
      console.error("Failed to update group:", err);

      setMessage({
        type: "error",
        text: "Failed to save group details.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!groupId || isBusy || rowBusyId) return;

    setRowBusyId(userId);
    setMessage(null);

    try {
      await api.removeGroupMember(groupId, userId);
      setMembers((prev) => prev.filter((member) => member.user_id !== userId));
      setMessage({
        type: "success",
        text: "Member removed from the group.",
      });
    } catch (err) {
      console.error("Failed to remove member:", err);
      setMessage({
        type: "error",
        text: "Failed to remove this member.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleUnassignLab = async (labId: string) => {
    if (!groupId || isBusy || rowBusyId) return;

    setRowBusyId(labId);
    setMessage(null);

    try {
      await api.unassignLabFromGroup(groupId, labId);
      setLabs((prev) => prev.filter((lab) => lab.lab_id !== labId));
      setMessage({
        type: "success",
        text: "Lab unassigned successfully.",
      });
    } catch (err) {
      console.error("Failed to unassign lab:", err);
      setMessage({
        type: "error",
        text: "Failed to unassign this lab.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleUnassignStarpath = async (starpathId: string) => {
    if (!groupId || isBusy || rowBusyId) return;

    setRowBusyId(starpathId);
    setMessage(null);

    try {
      await api.unassignStarpathFromGroup(groupId, starpathId);
      setStarpaths((prev) =>
        prev.filter((starpath) => starpath.starpath_id !== starpathId),
      );
      setMessage({
        type: "success",
        text: "Starpath unassigned successfully.",
      });
    } catch (err) {
      console.error("Failed to unassign starpath:", err);
      setMessage({
        type: "error",
        text: "Failed to unassign this starpath.",
      });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleConfirmUsers = async () => {
    if (!groupId || busyAction || selectedUsers.length === 0) return;

    setBusyAction("add-users");
    setMessage(null);

    try {
      for (const user of selectedUsers) {
        await api.addGroupMember(groupId, user.user_id);
      }

      const nextMembers: EnrichedMember[] = selectedUsers.map((user) => ({
        ...user,
        pseudo: user.pseudo || "Unknown user",
      }));

      setMembers((prev) => {
        const existingIds = new Set(prev.map((member) => member.user_id));

        return [
          ...prev,
          ...nextMembers.filter((user) => !existingIds.has(user.user_id)),
        ];
      });

      setSelectedUsers([]);
      setUserQuery("");
      setUserResults([]);

      setMessage({
        type: "success",
        text: "Selected members added successfully.",
      });
    } catch (err) {
      console.error("Failed to add users:", err);
      setMessage({
        type: "error",
        text: "Failed to add selected members.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmLabs = async () => {
    if (!groupId || busyAction || selectedLabs.length === 0) return;

    setBusyAction("add-labs");
    setMessage(null);

    try {
      for (const lab of selectedLabs) {
        await api.assignLabToGroup(groupId, lab.lab_id);
      }

      const nextLabs: EnrichedLab[] = selectedLabs.map((lab) => ({
        ...lab,
        name: lab.name || "Unknown lab",
      }));

      setLabs((prev) => {
        const existingIds = new Set(prev.map((lab) => lab.lab_id));

        return [
          ...prev,
          ...nextLabs.filter((lab) => !existingIds.has(lab.lab_id)),
        ];
      });

      setSelectedLabs([]);
      setLabQuery("");
      setLabResults([]);

      setMessage({
        type: "success",
        text: "Selected labs assigned successfully.",
      });
    } catch (err) {
      console.error("Failed to assign labs:", err);
      setMessage({
        type: "error",
        text: "Failed to assign selected labs.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirmStarpaths = async () => {
    if (!groupId || busyAction || selectedStarpaths.length === 0) return;

    setBusyAction("add-starpaths");
    setMessage(null);

    try {
      for (const starpath of selectedStarpaths) {
        await api.assignStarpathToGroup(groupId, starpath.starpath_id);
      }

      const nextStarpaths: EnrichedStarpath[] = selectedStarpaths.map(
        (starpath) => ({
          ...starpath,
          name: starpath.name || "Unknown starpath",
        }),
      );

      setStarpaths((prev) => {
        const existingIds = new Set(prev.map((starpath) => starpath.starpath_id));

        return [
          ...prev,
          ...nextStarpaths.filter(
            (starpath) => !existingIds.has(starpath.starpath_id),
          ),
        ];
      });

      setSelectedStarpaths([]);
      setStarpathQuery("");
      setStarpathResults([]);

      setMessage({
        type: "success",
        text: "Selected starpaths assigned successfully.",
      });
    } catch (err) {
      console.error("Failed to assign starpaths:", err);
      setMessage({
        type: "error",
        text: "Failed to assign selected starpaths.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleDelete = async () => {
    if (!groupId || busyAction) return;

    setBusyAction("delete-group");
    setMessage(null);

    try {
      await api.deleteGroup(groupId);
      navigate("/creator/workspace");
    } catch (err) {
      console.error("Failed to delete group:", err);
      setConfirmDelete(false);
      setMessage({
        type: "error",
        text: "Failed to delete this group.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="animate-pulse text-white/70">Loading group…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white">
      <div className="mx-auto w-full max-w-[1680px] px-6 py-10 xl:px-10 2xl:px-14">
        <div>
          <button
            onClick={() => navigate("/creator/workspace")}
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white/80"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Creator group
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white/92 sm:text-4xl">
            {group?.name || "Group"}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
            Manage the group details, members, assigned labs, and assigned
            starpaths.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {editing ? (
              <>
                <button
                  onClick={handleSaveGroup}
                  disabled={busyAction === "save-group"}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] active:scale-[0.98] ${
                    busyAction === "save-group"
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                  type="button"
                >
                  <Save className="h-4 w-4" />
                  {busyAction === "save-group" ? "Saving changes…" : "Save changes"}
                </button>

                <button
                  onClick={handleCancelEditing}
                  disabled={busyAction === "save-group"}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/80 transition hover:border-purple-400/30 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleStartEditing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-purple-400/30 hover:bg-white/5"
                type="button"
              >
                <Pencil className="h-4 w-4" />
                Edit details
              </button>
            )}
          </div>

          {message && (
            <div
              className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                message.type === "success"
                  ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                  : "border border-red-400/20 bg-red-500/10 text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 h-px w-full bg-white/10" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Members
              </div>

              <div className="mt-4 space-y-4">
                {members.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/50">
                    No members added yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div className="min-w-0 text-sm text-white/85">
                          <div className="truncate">
                            {member.pseudo || "Unknown user"}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={rowBusyId === member.user_id || isBusy}
                          className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <InputShell>
                  <FieldLabel>Add members</FieldLabel>

                  <div className="mt-3 flex items-center gap-3">
                    <Search className="h-4 w-4 text-white/35" />
                    <input
                      placeholder="Search user by pseudo..."
                      value={userQuery}
                      onChange={(e) => {
                        setMessage(null);
                        setUserQuery(e.target.value.slice(0, 80));
                      }}
                      className="w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                  </div>

                  {userQuery.trim().length >= 2 ? (
                    searchingUsers ? (
                      <div className="mt-3 text-sm text-white/45">
                        Searching users…
                      </div>
                    ) : (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                        {userResultsFiltered.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-white/50">
                            No available users found.
                          </div>
                        ) : (
                          userResultsFiltered.map((user) => (
                            <button
                              key={user.user_id}
                              onClick={() =>
                                setSelectedUsers((prev) => [...prev, user])
                              }
                              disabled={isBusy}
                              className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm text-white/82 transition last:border-b-0 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                            >
                              <span className="truncate">
                                {user.pseudo || "Unknown user"}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-white/35">
                                Add
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )
                  ) : null}
                </InputShell>

                {selectedUsers.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-white/45">
                      Pending members
                    </div>

                    <div className="space-y-2">
                      {selectedUsers.map((user) => (
                        <div
                          key={user.user_id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="min-w-0 text-sm text-white/85">
                            <div className="truncate">
                              {user.pseudo || "Unknown user"}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedUsers((prev) =>
                                prev.filter((entry) => entry.user_id !== user.user_id),
                              )
                            }
                            disabled={isBusy}
                            className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmUsers}
                      disabled={busyAction === "add-users"}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-purple-400/30 hover:bg-white/5 ${
                        busyAction === "add-users"
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }`}
                      type="button"
                    >
                      <UserPlus className="h-4 w-4" />
                      {busyAction === "add-users"
                        ? "Adding members…"
                        : "Add selected members"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Assigned labs
              </div>

              <div className="mt-4 space-y-4">
                {labs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/50">
                    No labs assigned yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labs.map((lab) => (
                      <div
                        key={lab.lab_id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div className="min-w-0 text-sm text-white/85">
                          <div className="truncate">{lab.name || "Unknown lab"}</div>
                        </div>

                        <button
                          onClick={() => handleUnassignLab(lab.lab_id)}
                          disabled={rowBusyId === lab.lab_id || isBusy}
                          className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <InputShell>
                  <FieldLabel>Add labs</FieldLabel>

                  <div className="mt-3 flex items-center gap-3">
                    <Search className="h-4 w-4 text-white/35" />
                    <input
                      placeholder="Search lab..."
                      value={labQuery}
                      onChange={(e) => {
                        setMessage(null);
                        setLabQuery(e.target.value.slice(0, 80));
                      }}
                      className="w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                  </div>

                  {labQuery.trim().length >= 2 ? (
                    searchingLabs ? (
                      <div className="mt-3 text-sm text-white/45">
                        Searching labs…
                      </div>
                    ) : (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                        {labResultsFiltered.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-white/50">
                            No available labs found.
                          </div>
                        ) : (
                          labResultsFiltered.map((lab) => (
                            <button
                              key={lab.lab_id}
                              onClick={() => setSelectedLabs((prev) => [...prev, lab])}
                              disabled={isBusy}
                              className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm text-white/82 transition last:border-b-0 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                            >
                              <span className="truncate">
                                {lab.name || "Unknown lab"}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-white/35">
                                Add
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )
                  ) : null}
                </InputShell>

                {selectedLabs.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-white/45">
                      Pending labs
                    </div>

                    <div className="space-y-2">
                      {selectedLabs.map((lab) => (
                        <div
                          key={lab.lab_id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="min-w-0 text-sm text-white/85">
                            <div className="truncate">{lab.name || "Unknown lab"}</div>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedLabs((prev) =>
                                prev.filter((entry) => entry.lab_id !== lab.lab_id),
                              )
                            }
                            disabled={isBusy}
                            className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmLabs}
                      disabled={busyAction === "add-labs"}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-sky-400/40 hover:bg-white/5 ${
                        busyAction === "add-labs"
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }`}
                      type="button"
                    >
                      <FlaskConical className="h-4 w-4" />
                      {busyAction === "add-labs"
                        ? "Assigning labs…"
                        : "Assign selected labs"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Assigned starpaths
              </div>

              <div className="mt-4 space-y-4">
                {starpaths.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/50">
                    No starpaths assigned yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {starpaths.map((starpath) => (
                      <div
                        key={starpath.starpath_id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div className="min-w-0 text-sm text-white/85">
                          <div className="truncate">
                            {starpath.name || "Unknown starpath"}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleUnassignStarpath(starpath.starpath_id)
                          }
                          disabled={rowBusyId === starpath.starpath_id || isBusy}
                          className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <InputShell>
                  <FieldLabel>Add starpaths</FieldLabel>

                  <div className="mt-3 flex items-center gap-3">
                    <Search className="h-4 w-4 text-white/35" />
                    <input
                      placeholder="Search starpath..."
                      value={starpathQuery}
                      onChange={(e) => {
                        setMessage(null);
                        setStarpathQuery(e.target.value.slice(0, 80));
                      }}
                      className="w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28"
                    />
                  </div>

                  {starpathQuery.trim().length >= 2 ? (
                    searchingStarpaths ? (
                      <div className="mt-3 text-sm text-white/45">
                        Searching starpaths…
                      </div>
                    ) : (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                        {starpathResultsFiltered.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-white/50">
                            No available starpaths found.
                          </div>
                        ) : (
                          starpathResultsFiltered.map((starpath) => (
                            <button
                              key={starpath.starpath_id}
                              onClick={() =>
                                setSelectedStarpaths((prev) => [...prev, starpath])
                              }
                              disabled={isBusy}
                              className="flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm text-white/82 transition last:border-b-0 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                              type="button"
                            >
                              <span className="truncate">
                                {starpath.name || "Unknown starpath"}
                              </span>
                              <span className="text-[11px] uppercase tracking-wide text-white/35">
                                Add
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )
                  ) : null}
                </InputShell>

                {selectedStarpaths.length > 0 && (
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-white/45">
                      Pending starpaths
                    </div>

                    <div className="space-y-2">
                      {selectedStarpaths.map((starpath) => (
                        <div
                          key={starpath.starpath_id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                        >
                          <div className="min-w-0 text-sm text-white/85">
                            <div className="truncate">
                              {starpath.name || "Unknown starpath"}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedStarpaths((prev) =>
                                prev.filter(
                                  (entry) =>
                                    entry.starpath_id !== starpath.starpath_id,
                                ),
                              )
                            }
                            disabled={isBusy}
                            className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConfirmStarpaths}
                      disabled={busyAction === "add-starpaths"}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/85 transition hover:border-orange-400/35 hover:bg-white/5 ${
                        busyAction === "add-starpaths"
                          ? "cursor-not-allowed opacity-60"
                          : ""
                      }`}
                      type="button"
                    >
                      <Orbit className="h-4 w-4" />
                      {busyAction === "add-starpaths"
                        ? "Assigning starpaths…"
                        : "Assign selected starpaths"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Group details
              </div>

              <div className="mt-5 space-y-4">
                <InputShell>
                  <FieldLabel>Name</FieldLabel>
                  <input
                    value={name}
                    onChange={(e) => {
                      setMessage(null);
                      setName(e.target.value.slice(0, 120));
                    }}
                    disabled={!editing || busyAction === "save-group"}
                    placeholder="Group name"
                    className="mt-3 w-full border-0 bg-transparent p-0 text-sm text-white/88 outline-none placeholder:text-white/28 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </InputShell>

                <InputShell>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setMessage(null);
                      setDescription(e.target.value.slice(0, 2000));
                    }}
                    disabled={!editing || busyAction === "save-group"}
                    rows={5}
                    placeholder="Describe the group purpose and audience"
                    className="mt-3 w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-white/82 outline-none placeholder:text-white/28 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </InputShell>

                {!editing && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/50">
                    Click Edit details to update this group.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="text-[11px] uppercase tracking-wide text-white/50">
                Overview
              </div>

              <div className="mt-5 space-y-4">
                <InputShell>
                  <FieldLabel>Members</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">{members.length}</div>
                </InputShell>

                <InputShell>
                  <FieldLabel>Labs</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">{labs.length}</div>
                </InputShell>

                <InputShell>
                  <FieldLabel>Starpaths</FieldLabel>
                  <div className="mt-3 text-sm text-white/76">{starpaths.length}</div>
                </InputShell>
              </div>
            </div>

            <div className="rounded-3xl border border-red-400/20 bg-red-500/5 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-md">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-red-200/80">
                <AlertTriangle className="h-3.5 w-3.5" />
                Danger zone
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Deleting this group permanently removes the group and its current
                assignments.
              </p>

              <button
                onClick={() => setConfirmDelete(true)}
                disabled={isBusy}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                Delete group
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white/92">
                  Delete this group?
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  This action cannot be undone.
                </p>
              </div>

              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busyAction === "delete-group"}
                className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:bg-white/5 hover:text-white/85 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={busyAction === "delete-group"}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={busyAction === "delete-group"}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/25 ${
                  busyAction === "delete-group"
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
                {busyAction === "delete-group" ? "Deleting…" : "Delete group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}