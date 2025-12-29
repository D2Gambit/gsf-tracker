import React from "react";
import { set, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { LogIn, Lock, Users, Loader } from "lucide-react";
import { useAuth } from "../../AuthContext";

const loginSchema = z.object({
  groupName: z
    .string()
    .min(6, "Group not found. Please enter a valid Group Name"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginForm({
  setShowNewGSFForm,
}: {
  setShowNewGSFForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const { login, isAuthenticated } = useAuth();

  const [invalidLogin, setInvalidLogin] = React.useState(false);

  const onSubmit = async (data: LoginForm) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await login(data.groupName, data.password);
      if (isAuthenticated) {
        toast.success("Login successful!");
      } else {
        setInvalidLogin(true);
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <main className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full">
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-300">
            Sign in to your Group
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Or{" "}
            <span
              onClick={() => setShowNewGSFForm(true)}
              className="font-medium text-red-600 hover:text-red-500"
            >
              create a new GSF
            </span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
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
                  placeholder="Enter your group's name"
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your group's password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-400"
              >
                Remember me
              </label>
            </div>
          </div>
          {invalidLogin && (
            <div className="flex mb-4">
              <p className="mt-1 text-sm text-red-600">
                Invalid group name or password.
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex justify-center">
                <Loader className="animate-spin mr-2" /> Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
