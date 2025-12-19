import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const signUpSchema = z.object({
  hasPlayedGSF: z.coerce.boolean(),
  accountName: z.string().min(3, "Account name must be at least 3 characters"),
  characterName: z
    .string()
    .min(2, "Character name must be at least 2 characters"),
  discordName: z.string().min(3, "Discord name must be at least 3 characters"),
  timezone: z.string().min(1, "Please select a timezone"),
  primaryClass: z.string().min(1, "Please select a primary class"),
  secondaryClass: z.string().min(1, "Please select a secondary class"),
});

type SignUpForm = z.infer<typeof signUpSchema>;

const classes = [
  "Amazon",
  "Assassin",
  "Barbarian",
  "Druid",
  "Necromancer",
  "Paladin",
  "Sorceress",
];

const timezones = [
  "UTC-12:00 - Baker Island",
  "UTC-11:00 - American Samoa",
  "UTC-10:00 - Hawaii",
  "UTC-09:00 - Alaska",
  "UTC-08:00 - Pacific Time",
  "UTC-07:00 - Mountain Time",
  "UTC-06:00 - Central Time",
  "UTC-05:00 - Eastern Time",
  "UTC-04:00 - Atlantic Time",
  "UTC-03:00 - Argentina",
  "UTC-02:00 - South Georgia",
  "UTC-01:00 - Azores",
  "UTC+00:00 - London",
  "UTC+01:00 - Central Europe",
  "UTC+02:00 - Eastern Europe",
  "UTC+03:00 - Moscow",
  "UTC+04:00 - Dubai",
  "UTC+05:00 - Pakistan",
  "UTC+06:00 - Bangladesh",
  "UTC+07:00 - Thailand",
  "UTC+08:00 - China",
  "UTC+09:00 - Japan",
  "UTC+10:00 - Australia East",
  "UTC+11:00 - Solomon Islands",
  "UTC+12:00 - New Zealand",
];

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account added to GSF!");
      console.log("Sign up data:", data);
    } catch (error) {
      toast.error("Sign up failed. Please try again.");
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof SignUpForm)[] => {
    switch (step) {
      case 1:
        return ["hasPlayedGSF", "accountName", "characterName"];
      case 2:
        return ["discordName", "timezone", "primaryClass", "secondaryClass"];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Have you played GSF before?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    {...register("hasPlayedGSF")}
                    type="radio"
                    value="false"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-400">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register("hasPlayedGSF")}
                    type="radio"
                    value="true"
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-400">No</span>
                </label>
              </div>
            </div>

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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
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
                placeholder="username#1234"
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <UserPlus className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-300">
              Join our GSF
            </h2>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? "bg-red-600 text-white"
                    : step < currentStep
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          <form
            className="mt-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            {renderStep()}

            <div className="flex justify-between space-x-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-400 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 ml-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="ml-auto px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
