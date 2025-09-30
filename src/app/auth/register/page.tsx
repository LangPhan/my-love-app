"use client";

import { createCoupleRoom } from "@/app/actions/createCoupleRoom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@radix-ui/react-label";
import { Heart, Loader2, Users } from "lucide-react";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  inviteCode: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  inviteCode?: string;
  submit?: string;
}

export default function RegisterPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    inviteCode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Display name validation
    if (!formData.displayName) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters long";
    }

    // Invite code validation (optional, but if provided should be 6 chars)
    if (formData.inviteCode && formData.inviteCode.length !== 6) {
      newErrors.inviteCode = "Invite code must be exactly 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "inviteCode" ? e.target.value.toUpperCase() : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Create user account
      const signupResult = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.displayName,
      });

      if (!signupResult.success) {
        setErrors({ submit: signupResult.error || "Failed to create account" });
        return;
      }

      // If signup successful and user provided invite code, create/join couple room
      if (signupResult.data && formData.inviteCode) {
        const coupleResult = await createCoupleRoom({
          userId: signupResult.data.$id,
          inviteCode: formData.inviteCode,
          displayName: formData.displayName,
        });

        if (!coupleResult.success) {
          setErrors({
            inviteCode: coupleResult.error || "Failed to join couple room",
          });
          return;
        }
      } else if (signupResult.data) {
        // Create new couple room if no invite code provided
        await createCoupleRoom({
          userId: signupResult.data.$id,
          displayName: formData.displayName,
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mb-4 flex justify-center">
              <Heart className="h-12 w-12 animate-pulse text-pink-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">
              Welcome to Love App! 💕
            </h2>
            <p className="text-slate-600">
              {formData.inviteCode
                ? "You've successfully joined your partner!"
                : "Your couple room is ready. Share your invite code with your partner!"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Join Love App
          </CardTitle>
          <CardDescription className="text-slate-600">
            Create your account to start your love journey together
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="What should we call you?"
                value={formData.displayName}
                onChange={handleInputChange("displayName")}
                className={errors.displayName ? "border-red-500" : ""}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleInputChange("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Partner's Invite Code (Optional)
              </Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="ABC123"
                value={formData.inviteCode}
                onChange={handleInputChange("inviteCode")}
                maxLength={6}
                className={errors.inviteCode ? "border-red-500" : ""}
              />
              {errors.inviteCode && (
                <p className="text-sm text-red-500">{errors.inviteCode}</p>
              )}
              <p className="text-xs text-slate-500">
                Have a code from your partner? Enter it here to join their room.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              variant="romantic"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-pink-600 hover:text-pink-800"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
