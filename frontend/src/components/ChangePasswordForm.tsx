import React from "react";
import { Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";

type ChangePasswordFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "New Group Password must be at least 6 characters"),
    confirmNewPassword: z
      .string()
      .min(6, "New Group Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"], // This error appears on the confirmGroupPassword field
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm({
  isOpen,
  onClose,
}: ChangePasswordFormProps) {
  if (!isOpen) return null;

  const { session } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const formData = new FormData();
      formData.append("gsfGroupId", session?.gsfGroupId ?? "Unknown");
      formData.append("newPassword", data.newPassword);

      const res = await fetch("/api/change-group-password", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Password change failed!");
      }
    } catch (error) {
      toast.error("Password change failed! Please try again.");
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-800 w-full max-w-lg rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-red-500" />
            <h3 className="text-xl font-bold text-zinc-100">
              Change Group Password
            </h3>
          </div>
        </div>

        {/* Body */}
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                New Group Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("newPassword")}
                  type="password"
                  id="newPassword"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your new group password"
                />
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmNewGroupPassword"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Confirm New Group Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmNewPassword")}
                  type="password"
                  id="confirmNewGroupPassword"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Confirm new group password"
                />
              </div>
              {errors.confirmNewPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-zinc-600 text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting
                ? "Changing group password..."
                : "Change group password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
