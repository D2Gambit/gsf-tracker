import React from "react";
import { useAuth } from "../../AuthContext";
import { classes, timezones, type Player } from "../types/list";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const editPlayerSchema = z.object({
  accountName: z.string().min(3, "Account name must be at least 3 characters"),
  characterName: z
    .string()
    .min(3, "Character name must be at least 3 characters"),
  discordName: z.string().min(3, "Discord name must be at least 3 characters"),
  timezone: z.string().min(1, "Please select a timezone"),
  primaryClass: z.string().min(1, "Please select a primary class"),
  secondaryClass: z.string().min(1, "Please select a secondary class"),
});

type EditPlayerForm = z.infer<typeof editPlayerSchema>;

export default function EditUserModal({
  setIsEditUserModalOpen,
  editingPlayer,
  existingPlayers,
  setExistingPlayers,
  gsfGroupId,
}: {
  setIsEditUserModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingPlayer: Player | null;
  existingPlayers: any[];
  setExistingPlayers: React.Dispatch<React.SetStateAction<any[]>>;
  gsfGroupId: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<EditPlayerForm>({
    resolver: zodResolver(editPlayerSchema),
    defaultValues: {
      accountName: editingPlayer?.accountName || "",
      characterName: editingPlayer?.characterName || "",
      discordName: editingPlayer?.discordName || "",
      timezone: editingPlayer?.preferredTimezone || "",
      primaryClass: editingPlayer?.preferredClass || "",
      secondaryClass: editingPlayer?.preferredSecondaryClass || "",
    },
  });

  const { session, logout, selectUser } = useAuth();

  const onSubmit = async (data: EditPlayerForm) => {
    try {
      const formData = new FormData();
      formData.append("gsfGroupId", gsfGroupId);
      formData.append("accountName", data.accountName);
      formData.append("characterName", data.characterName);
      formData.append("preferredTimezone", data.timezone);
      formData.append("preferredClass", data.primaryClass);
      formData.append("preferredSecondaryClass", data.secondaryClass);
      formData.append("discordName", data.discordName);
      const res = await fetch(
        `/api/edit-member/${gsfGroupId}/${editingPlayer?.accountName}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const resData = await res.json();

      selectUser({
        gsfGroupId: resData.gsfGroupId,
        role: resData.role,
        accountName: resData.accountName,
        userInfo: resData,
      });

      setExistingPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === resData.id ? resData : player,
        ),
      );

      setIsEditUserModalOpen(false); // closes the modal
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-4">
          {`Editing member: ${editingPlayer?.accountName}`}
        </h3>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label
              htmlFor="accountName"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Account Name
            </label>
            <input
              {...register("accountName")}
              type="text"
              id="accountName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Your D2 account name"
            />
            {errors.accountName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.accountName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="characterName"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Character Name
            </label>
            <input
              {...register("characterName")}
              type="text"
              id="characterName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Your character name"
            />
            {errors.characterName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.characterName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="discordName"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Discord Name
            </label>
            <input
              {...register("discordName")}
              type="text"
              id="discordName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Your discord name"
            />
            {errors.discordName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.discordName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Preferred Timezone
            </label>
            <select
              {...register("timezone")}
              id="timezone"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select timezone</option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.timezone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="primaryClass"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Primary Class Preference
            </label>
            <select
              {...register("primaryClass")}
              id="primaryClass"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select primary class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.primaryClass && (
              <p className="mt-1 text-sm text-red-600">
                {errors.primaryClass.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="secondaryClass"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Secondary Class Preference
            </label>
            <select
              {...register("secondaryClass")}
              id="secondaryClass"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Select secondary class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.secondaryClass && (
              <p className="mt-1 text-sm text-red-600">
                {errors.secondaryClass.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between space-x-3">
            <button
              className="px-4 py-2 rounded bg-zinc-600 text-zinc-100 hover:bg-zinc-700"
              onClick={(e) => {
                e.preventDefault();
                setIsEditUserModalOpen(false);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Account..." : "Update Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
