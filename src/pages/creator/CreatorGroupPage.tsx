import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardCard from "@/components/ui/DashboardCard";
import { ALT_COLORS } from "@/lib/theme";
import { api } from "@/api";
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

export default function CreatorGroupPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<EditableGroup | null>(null);
  const [members, setMembers] = useState<GroupMemberResult[]>([]);
  const [labs, setLabs] = useState<GroupLabResult[]>([]);

  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<SearchUserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SearchUserResult[]>([]);

  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [labQuery, setLabQuery] = useState("");
  const [labResults, setLabResults] = useState<SearchLabResult[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<SearchLabResult[]>([]);

  const [starpaths, setStarpaths] = useState<GroupStarpathResult[]>([]);

  const [starpathQuery, setStarpathQuery] = useState("");
  const [starpathResults, setStarpathResults] = useState<SearchStarpathResult[]>([]);
  const [selectedStarpaths, setSelectedStarpaths] = useState<SearchStarpathResult[]>([]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {

    async function load() {

      try {

        const g = await api.getGroupById(id!);
        const m = await api.getGroupMembers(id!);
        const l = await api.getGroupLabs(id!);
        const sp = await api.getGroupStarpaths(id!);

        setGroup(g);
        setMembers(m);
        setLabs(l);
        setName(g.name);
        setDescription(g.description ?? "");
        setStarpaths(sp);

      } catch (err) {
        console.error("Failed to load group:", err);
      } finally {
        setLoading(false);
      }

    }

    load();

  }, [id]);

  useEffect(() => {

    if (labQuery.length < 2) {
        setLabResults([]);
        return;
    }

    const timeout = setTimeout(async () => {
        try {
        const labs = await api.searchLabs(labQuery);
        setLabResults(labs);

        } catch (err) {
        console.error("Failed to search labs:", err);
        }
    }, 300);

    return () => clearTimeout(timeout);

    }, [labQuery]);


  useEffect(() => {
    if (userQuery.length < 2) {
      setUserResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const users = await api.searchUsers(userQuery);
        setUserResults(users);

      } catch (err) {
        console.error("Failed to search users:", err);
      }
    }, 300);

    return () => clearTimeout(timeout);

  }, [userQuery]);

  useEffect(() => {
    if (starpathQuery.length < 2) {
      setStarpathResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const starpaths = await api.searchStarpaths(starpathQuery);
        setStarpathResults(starpaths);
      } catch (err) {
        console.error("Failed to search starpaths:", err);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [starpathQuery]);


  // ========================
  // MODIFY
  // ========================  
  const handleSaveGroup = async () => {
    try {
      const updated = await api.updateGroup(id!, {
        name,
        description,
      });

      setGroup(updated);
      setEditing(false);

    } catch (err) {
      console.error("Failed to update group:", err);
    }
  };

  // ========================
  // REMOVE MEMBER
  // ========================

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeGroupMember(id!, userId);

      setMembers(prev =>
        prev.filter(m => m.user_id !== userId)
      );

    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };



  // ========================
  // UNASSIGN LAB
  // ========================

  const handleUnassignLab = async (labId: string) => {
    try {
      await api.unassignLabFromGroup(id!, labId);

      setLabs(prev =>
        prev.filter(l => l.lab_id !== labId)
      );

    } catch (err) {
      console.error("Failed to unassign lab:", err);
    }
  };


    // ========================
    // CONFIRM LABS
    // ========================

    const handleConfirmLabs = async () => {

    if (selectedLabs.length === 0) return;
    try {

        for (const lab of selectedLabs) {
        await api.assignLabToGroup(id!, lab.lab_id);
        }

        setLabs(prev => [
          ...prev,
          ...selectedLabs
        ]);

        setSelectedLabs([]);
        setLabQuery("");
        setLabResults([]);

    } catch (err) {
        console.error("Failed to assign labs:", err);
    }
    };


    // ========================
    // CONFIRM USERS
    // ========================

    const handleConfirmUsers = async () => {

    if (selectedUsers.length === 0) return;
    try {

      for (const user of selectedUsers) {
        await api.addGroupMember(id!, user.user_id);
      }

      setMembers(prev => [
        ...prev,
        ...selectedUsers
      ]);

      setSelectedUsers([]);
      setUserQuery("");
      setUserResults([]);

    } catch (err) {
      console.error("Failed to add users:", err);
    }
  };

  // ========================
  // ADD STARPATH
  // ========================
  const handleConfirmStarpaths = async () => {
    if (selectedStarpaths.length === 0) return;
    try {
      for (const sp of selectedStarpaths) {
        await api.assignStarpathToGroup(id!, sp.starpath_id);
      }
      setStarpaths(prev => [
        ...prev,
        ...selectedStarpaths
      ]);
      setSelectedStarpaths([]);
      setStarpathQuery("");
      setStarpathResults([]);

    } catch (err) {
      console.error("Failed to assign starpaths:", err);
    }

  };

  // ========================
  // DELETE STARPATH
  // ========================
  const handleUnassignStarpath = async (starpathId: string) => {
    try {
      await api.unassignStarpathFromGroup(id!, starpathId);
      setStarpaths(prev =>
        prev.filter(sp => sp.starpath_id !== starpathId)
      );
    } catch (err) {
      console.error("Failed to unassign starpath:", err);
    }
  };

  // ========================
  // DELETE GROUP
  // ========================
  const handleDelete = async () => {
    try {

      await api.deleteGroup(id!);
      navigate("/creator/dashboard");

    } catch (err) {
      console.error("Failed to delete group:", err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
        Loading group...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#0B0F19] text-white px-8 py-10 space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-start">

        {/* LEFT SIDE */}

        <div>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold bg-transparent border-b border-white/20 outline-none"
            />

          ) : (

            <h1
              className="text-3xl font-bold"
              style={{
                background: `linear-gradient(90deg, ${ALT_COLORS.purple}, ${ALT_COLORS.orange})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {group?.name}
            </h1>

          )}

          {editing ? (

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full max-w-xl rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
            />

          ) : (

            <p className="text-white/50 text-sm mt-2">
              {group?.description || "No description"}
            </p>

          )}

        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/creator/dashboard")}
            className="text-white/60 hover:text-white transition text-sm"
          >
            ← Back to dashboard
          </button>

          {editing ? (

            <button
              onClick={handleSaveGroup}
              className="px-4 py-2 rounded-xl border border-green-400/30 bg-green-500/10 text-green-200 text-sm hover:bg-green-500/20 transition"
            >
              Save
            </button>

          ) : (

            <button
              onClick={() => setEditing(true)}
              className="
              px-4 py-2
              rounded-xl
              border border-sky-400/30
              bg-sky-500/10
              text-sky-200
              text-sm
              hover:bg-sky-500/20
              transition
              "
            >
              Edit
            </button>

          )}

        </div>

      </div>


      {/* MEMBERS */}

      <DashboardCard className="p-6 space-y-4">

        <div className="text-lg text-purple-400 font-semibold">
          Members
        </div>

        {members.length === 0 && (
          <p className="text-white/50 text-sm">
            No members yet.
          </p>
        )}

        {members.map((m) => (

          <div
            key={m.user_id}
            className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-3"
          >

            <span className="text-sm">{m.pseudo ?? m.user_id}</span>

            <button
              onClick={() => handleRemoveMember(m.user_id)}
              className="text-red-400 text-xs hover:text-red-300"
            >
              Remove
            </button>

          </div>

        ))}

        {/* SEARCH USER */}

        <div className="pt-2">

        <input
          placeholder="Search user by pseudo..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
        />

        {userQuery.length >= 2 && (

          <div className="mt-2 border border-white/10 rounded-xl bg-black/40 overflow-hidden">

            {userResults.length === 0 ? (

              <div className="px-4 py-2 text-sm text-white/50">
                No users found.
              </div>

            ) : (

              userResults.map((user) => (

                <div
                  key={user.user_id}
                  onClick={() => {

                    const alreadySelected =
                      selectedUsers.some(u => u.user_id === user.user_id);

                    const alreadyMember =
                      members.some(m => m.user_id === user.user_id);

                    if (!alreadySelected && !alreadyMember) {
                      setSelectedUsers(prev => [...prev, user]);
                    }

                  }}
                  className="px-4 py-2 text-sm hover:bg-white/10 cursor-pointer"
                >
                  {user.pseudo}
                </div>

              ))

            )}

          </div>

        )}

        </div>


        {selectedUsers.length > 0 && (

        <div className="mt-4 mb-6 space-y-2">

          <div className="text-xs text-white/50">
            Selected users
          </div>

          {selectedUsers.map((user) => (

            <div
              key={user.user_id}
              className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-2"
            >

              <span className="text-sm">
                {user.pseudo}
              </span>

              <button
                onClick={() =>
                  setSelectedUsers(prev =>
                    prev.filter(u => u.user_id !== user.user_id)
                  )
                }
                className="text-red-400 text-xs hover:text-red-300"
              >
                Remove
              </button>

            </div>

          ))}

          <button
            onClick={handleConfirmUsers}
            className="
            mt-2
            px-4 py-2
            rounded-xl
            bg-purple-500/20
            text-purple-200
            text-sm
            hover:bg-purple-500/30
            "
          >
            Confirm users
          </button>

        </div>

      )}

        </DashboardCard>


        


      {/* LABS */}

      <DashboardCard className="p-6 space-y-4">

        <div className="text-lg text-sky-400 font-semibold">
          Assigned Labs
        </div>

        {labs.length === 0 && (
          <p className="text-white/50 text-sm">
            No labs assigned.
          </p>
        )}

        {labs.map((lab) => (
        <div
          key={lab.lab_id}
          className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-3"
        >

          <span className="text-sm">
            {lab.name ?? lab.lab_id}
          </span>

          <button
            onClick={() => handleUnassignLab(lab.lab_id)}
            className="text-red-400 text-xs hover:text-red-300"
          >
            Remove
          </button>

        </div>

      ))}


        {/* SEARCH LAB */}

        <div className="pt-2">

        {selectedLabs.length > 0 && (

        <div className="mt-4 mb-6 space-y-2">

            <div className="text-xs text-white/50">
            Selected labs
            </div>

            {selectedLabs.map((lab) => (

            <div
                key={lab.lab_id}
                className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-2"
            >

                <span className="text-sm">{lab.name}</span>

                <button
                onClick={() =>
                    setSelectedLabs(prev =>
                    prev.filter(l => l.lab_id !== lab.lab_id)
                    )
                }
                className="text-red-400 text-xs hover:text-red-300"
                >
                Remove
                </button>

            </div>

            ))}

            <button
            onClick={handleConfirmLabs}
            className="
            mt-2
            px-4 py-2
            rounded-xl
            bg-sky-500/20
            text-sky-200
            text-sm
            hover:bg-sky-500/30
            "
            >
            Confirm labs
            </button>

        </div>

        )}

        <input
        placeholder="Search lab..."
        value={labQuery}
        onChange={(e) => setLabQuery(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
        />

        {labQuery.length >= 2 && (

        <div className="mt-2 border border-white/10 rounded-xl bg-black/40 overflow-hidden">

            {labResults.length === 0 ? (

            <div className="px-4 py-2 text-sm text-white/50">
                No labs found.
            </div>

            ) : (

            labResults.map((lab) => (

                <div
                key={lab.lab_id}
                onClick={() => {
                    const alreadyAssigned = labs.some(l => l.lab_id === lab.lab_id);
                    const alreadySelected = selectedLabs.some(l => l.lab_id === lab.lab_id);
                    if (!alreadyAssigned && !alreadySelected) {
                        setSelectedLabs(prev => [...prev, lab]);
                    }
                }}
                className="px-4 py-2 text-sm hover:bg-white/10 cursor-pointer"
                >
                {lab.name}
                </div>

            ))

            )}

        </div>

        )}

        </div>

      </DashboardCard>

      {/* STARPATHS */}

      <DashboardCard className="p-6 space-y-4">

      <div className="text-lg text-orange-400 font-semibold">
      Assigned Starpaths
      </div>

      {starpaths.length === 0 && (
      <p className="text-white/50 text-sm">
      No starpaths assigned.
      </p>
      )}

      {starpaths.map((sp) => (

      <div
      key={sp.starpath_id}
      className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-3"
      >

      <span className="text-sm">
      {sp.name ?? sp.starpath_id}
      </span>

      <button
      onClick={() => handleUnassignStarpath(sp.starpath_id)}
      className="text-red-400 text-xs hover:text-red-300"
      >
      Remove
      </button>

      </div>

      ))}

      <div className="pt-2">

      {selectedStarpaths.length > 0 && (

      <div className="mt-4 mb-6 space-y-2">

      <div className="text-xs text-white/50">
      Selected starpaths
      </div>

      {selectedStarpaths.map((sp) => (

      <div
      key={sp.starpath_id}
      className="flex justify-between items-center bg-black/30 rounded-xl px-4 py-2"
      >

      <span className="text-sm">{sp.name}</span>

      <button
      onClick={() =>
      setSelectedStarpaths(prev =>
      prev.filter(s => s.starpath_id !== sp.starpath_id)
      )
      }
      className="text-red-400 text-xs hover:text-red-300"
      >
      Remove
      </button>

      </div>

      ))}

      <button
      onClick={handleConfirmStarpaths}
      className="
      mt-2
      px-4 py-2
      rounded-xl
      bg-orange-500/20
      text-orange-200
      text-sm
      hover:bg-orange-500/30
      "
      >
      Confirm starpaths
      </button>

      </div>

      )}

      <input
      placeholder="Search starpath..."
      value={starpathQuery}
      onChange={(e) => setStarpathQuery(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm"
      />

      {starpathQuery.length >= 2 && (

      <div className="mt-2 border border-white/10 rounded-xl bg-black/40 overflow-hidden">

      {starpathResults.length === 0 ? (

      <div className="px-4 py-2 text-sm text-white/50">
      No starpaths found.
      </div>

      ) : (

      starpathResults.map((sp) => (

      <div
      key={sp.starpath_id}
      onClick={() => {

      const alreadyAssigned =
      starpaths.some(s => s.starpath_id === sp.starpath_id);

      const alreadySelected =
      selectedStarpaths.some(s => s.starpath_id === sp.starpath_id);

      if (!alreadyAssigned && !alreadySelected) {
      setSelectedStarpaths(prev => [...prev, sp]);
      }

      }}
      className="px-4 py-2 text-sm hover:bg-white/10 cursor-pointer"
      >
      {sp.name}
      </div>

      ))

      )}

      </div>

      )}

      </div>

      </DashboardCard>

      {/* DELETE GROUP */}

      <DashboardCard
      className="
      rounded-3xl
      border border-red-400/20
      bg-red-500/5
      backdrop-blur-xl
      p-6
      space-y-5
      max-w-xl
      "
      >

      <div className="text-red-300 font-semibold">
      Danger Zone
      </div>

      <div className="text-sm text-white/60 leading-relaxed">
      Deleting this group will permanently remove the group,
      all members and assigned labs.
      </div>

      <button
      onClick={() => setConfirmDelete(true)}
      className="
      px-5 py-2
      rounded-xl
      border border-red-400/30
      bg-red-500/10
      text-red-200
      text-sm
      hover:bg-red-500/20
      transition
      "
      >
      Delete group
      </button>

      </DashboardCard>

      {/* DELETE CONFIRMATION */}

      {confirmDelete && (

      <div
      className="
      fixed inset-0
      flex items-center justify-center
      bg-black/60
      backdrop-blur-sm
      "
      >

      <div
      className="
      bg-[#111827]
      border border-white/10
      rounded-2xl
      p-6
      space-y-5
      w-[420px]
      "
      >

      <div className="text-lg font-semibold">
      Delete this group?
      </div>

      <div className="text-sm text-white/60 leading-relaxed">
      This action cannot be undone.
      </div>

      <div className="flex justify-end gap-3 pt-2">

      <button
      onClick={() => setConfirmDelete(false)}
      className="
      px-4 py-2
      rounded-lg
      border border-white/10
      text-sm
      hover:bg-white/5
      "
      >
      Cancel
      </button>

      <button
      onClick={handleDelete}
      className="
      px-4 py-2
      rounded-lg
      border border-red-400/30
      bg-red-500/20
      text-red-200
      text-sm
      hover:bg-red-500/30
      "
      >
      Delete
      </button>

      </div>

      </div>

      </div>

      )}

    </div>
  );
}
