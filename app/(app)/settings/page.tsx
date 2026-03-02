"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { auth, db } from "@/lib/firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { toast } from "sonner";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { User, Shield, Sliders, Download, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [defaultSettlementCharge, setDefaultSettlementCharge] = useState<
    string | number
  >(0);
  const [defaultCustomerCharge, setDefaultCustomerCharge] = useState<
    string | number
  >(0);
  const [defaultCashMarginPercent, setDefaultCashMarginPercent] = useState<
    string | number
  >(0);

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [updatingPresets, setUpdatingPresets] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setDefaultSettlementCharge(
        profile.settings?.defaultSettlementCharge || 0,
      );
      setDefaultCustomerCharge(profile.settings?.defaultCustomerCharge || 0);
      setDefaultCashMarginPercent(
        profile.settings?.defaultCashMarginPercent || 0,
      );
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setUpdatingProfile(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { displayName }, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        toast.error("Please re-login to change your password");
      } else {
        toast.error(error.message || "Failed to update password");
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleUpdatePresets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setUpdatingPresets(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        {
          settings: {
            defaultSettlementCharge: Number(defaultSettlementCharge),
            defaultCustomerCharge: Number(defaultCustomerCharge),
            defaultCashMarginPercent: Number(defaultCashMarginPercent),
          },
        },
        { merge: true },
      );
      toast.success("Default preferences saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update presets");
    } finally {
      setUpdatingPresets(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and dashboard defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <AppCard
          title="Account Details"
          description="Update your profile information"
          icon={<User className="w-5 h-5" />}
        >
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <AppInput
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
            />
            <AppInput
              label="Email Address"
              value={profile?.email || ""}
              disabled
              placeholder="Email"
            />
            <div className="pt-2 flex justify-end">
              <AppButton type="submit" loading={updatingProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </AppButton>
            </div>
          </form>
        </AppCard>

        {/* Security */}
        <AppCard
          title="Security"
          description="Update your password"
          icon={<Shield className="w-5 h-5" />}
        >
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <AppInput
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={6}
            />
            <AppInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
            />
            <div className="pt-2 flex justify-end">
              <AppButton
                type="submit"
                variant="outline"
                loading={updatingPassword}
              >
                Update Password
              </AppButton>
            </div>
          </form>
        </AppCard>

        {/* Form Presets */}
        <AppCard
          title="Form Presets"
          description="Default values for new transactions"
          icon={<Sliders className="w-5 h-5" />}
          className="md:col-span-2"
        >
          <form onSubmit={handleUpdatePresets} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AppInput
                label="Default Settlement (INR)"
                type="number"
                step="1"
                value={defaultSettlementCharge}
                onChange={(e) => setDefaultSettlementCharge(e.target.value)}
                placeholder="0"
              />
              <AppInput
                label="Default Cash Margin %"
                type="number"
                step="0.1"
                value={defaultCashMarginPercent}
                onChange={(e) => setDefaultCashMarginPercent(e.target.value)}
                placeholder="0.0"
              />
              <AppInput
                label="Default Cust. Charge %"
                type="number"
                step="0.1"
                value={defaultCustomerCharge}
                onChange={(e) => setDefaultCustomerCharge(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              * These values will automatically pre-fill when you create a new
              transaction.
            </p>
            <div className="pt-2 flex justify-end">
              <AppButton type="submit" loading={updatingPresets}>
                <Save className="w-4 h-4 mr-2" />
                Save Presets
              </AppButton>
            </div>
          </form>
        </AppCard>
      </div>
    </div>
  );
}
