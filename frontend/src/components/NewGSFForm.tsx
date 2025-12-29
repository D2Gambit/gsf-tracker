import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Users, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";

const createGSFSchema = z
  .object({
    groupName: z.string().min(6, "Group name must be at least 6 characters"),
    groupPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmGroupPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.groupPassword === data.confirmGroupPassword, {
    message: "Passwords do not match",
    path: ["confirmGroupPassword"], // This error appears on the confirmGroupPassword field
  });

type CreateGSFForm = z.infer<typeof createGSFSchema>;

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGSFForm>({
    resolver: zodResolver(createGSFSchema),
  });

  const { login, isAuthenticated } = useAuth();

  const onSubmit = async (data: CreateGSFForm) => {
    try {
      const formData = new FormData();
      formData.append("gsfGroupId", data.groupName);
      formData.append("password", data.groupPassword);

      const res = await fetch("/api/create-group", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      sessionStorage.setItem("groupOrganizer", true.toString());

      login(
        formData.get("gsfGroupId") as string,
        formData.get("password") as string
      );

      if (isAuthenticated) {
        toast.success("Group created and logged in successfully!");
      }
    } catch (error) {
      toast.error("Group creation failed. Please try again.");
    }
  };

  return (
    <main className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-300">
            Create a new GSF
          </h2>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Group Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("groupName")}
                  type="text"
                  id="groupName"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your new group name"
                />
              </div>
              {errors.groupName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.groupName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="groupPassword"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Group Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("groupPassword")}
                  type="password"
                  id="groupPassword"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your group password"
                />
              </div>
              {errors.groupPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.groupPassword.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmGroupPassword"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Confirm Group Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmGroupPassword")}
                  type="password"
                  id="confirmGroupPassword"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Confirm group password"
                />
              </div>
              {errors.confirmGroupPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmGroupPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating New Group Self Found..." : "Create GSF"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
