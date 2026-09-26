"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  MapPin,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import { getAvatarUrl } from "../../lib/utils/image";
import { AvatarUploadModal } from "./avatar-upload-modal";
import { DeleteAvatarModal } from "./delete-avatar-modal";

export function DreamPosProfileView() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [isAvatarUploadOpen, setIsAvatarUploadOpen] = useState(false);
  const [isAvatarDeleteOpen, setIsAvatarDeleteOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields matching screenshot
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // Address Information matching screenshot
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("California");
  const [city, setCity] = useState("Los Angeles");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    if (user) {
      const parts = (user.name || "").trim().split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setUsername(user.username || "");
      setPhoneNumber(user.phone || "");
      setEmail(user.email || "");

      // Load address info from localStorage or defaults
      try {
        const savedAddr = localStorage.getItem(`smartpos_addr_${user.uuid}`);
        if (savedAddr) {
          const parsed = JSON.parse(savedAddr);
          setAddress(parsed.address || "");
          setCountry(parsed.country || "United States");
          setState(parsed.state || "California");
          setCity(parsed.city || "Los Angeles");
          setPostalCode(parsed.postalCode || "");
        } else {
          setAddress("123 Business Avenue, Suite 400");
          setPostalCode("90001");
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!firstName.trim() || !username.trim() || !email.trim()) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    setIsSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await apiClient.put(`/users/${user.uuid}`, {
        name: fullName,
        username: username.trim(),
        email: email.trim(),
        phone: phoneNumber.trim() || undefined,
      });

      // Save address info
      localStorage.setItem(
        `smartpos_addr_${user.uuid}`,
        JSON.stringify({
          address,
          country,
          state,
          city,
          postalCode,
        })
      );

      await refreshUser();
      toast.success("Profile information updated successfully.");
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      toast.error(errObj.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      const parts = (user.name || "").trim().split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setUsername(user.username || "");
      setPhoneNumber(user.phone || "");
      setEmail(user.email || "");
      toast.info("Changes reverted to previous saved state.");
    }
  };

  const avatarSrc = getAvatarUrl(user?.avatar_url, user?.avatar);

  // Reset error state when avatar changes
  useEffect(() => {
    setImageError(false);
  }, [avatarSrc]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-500">
            <UserIcon className="h-4 w-4" />
            <span>Basic Information</span>
          </div>

          {/* Avatar Upload Area matching screenshot */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-1">
            <div
              onClick={() => setIsAvatarUploadOpen(true)}
              className="group relative h-28 w-28 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-orange-400 bg-zinc-50/70 dark:bg-zinc-800/40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden shrink-0"
            >
              {avatarSrc && !imageError ? (
                <>
                  <img
                    src={avatarSrc}
                    alt={user?.name || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-medium">
                    Change
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-zinc-400 group-hover:text-orange-500 transition-colors">
                  <div className="h-7 w-7 rounded-full border border-zinc-300 dark:border-zinc-600 flex items-center justify-center mb-1">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">Add Image</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="md"
                  onClick={() => setIsAvatarUploadOpen(true)}
                  className="bg-[#FF8433] hover:bg-[#F27320] text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs"
                >
                  Upload Image
                </Button>

                {avatarSrc && !imageError && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAvatarDeleteOpen(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Upload an image below 2 MB, Accepted File format JPG, PNG
              </p>
            </div>
          </div>

          {/* Form Inputs Grid: 3 cols for names, 2 cols for contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                User Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+1 (555) 000-0000"
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@company.com"
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address Information matching screenshot */}
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-500">
            <MapPin className="h-4 w-4" />
            <span>Address Information</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Street address or building"
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Country <span className="text-rose-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="California">California</option>
                <option value="New York">New York</option>
                <option value="Texas">Texas</option>
                <option value="Florida">Florida</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Central Java">Central Java</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                City <span className="text-rose-500">*</span>
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="Los Angeles">Los Angeles</option>
                <option value="San Francisco">San Francisco</option>
                <option value="San Diego">San Diego</option>
                <option value="New York City">New York City</option>
                <option value="Austin">Austin</option>
                <option value="Miami">Miami</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Postal Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                placeholder="e.g. 90001"
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#FF8433] hover:bg-[#F27320] text-white text-xs font-bold shadow-sm shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Avatar Modals */}
      {user && (
        <>
          <AvatarUploadModal
            isOpen={isAvatarUploadOpen}
            onClose={() => setIsAvatarUploadOpen(false)}
            user={user}
            onSuccess={refreshUser}
          />
          <DeleteAvatarModal
            isOpen={isAvatarDeleteOpen}
            onClose={() => setIsAvatarDeleteOpen(false)}
            user={user}
            onSuccess={refreshUser}
          />
        </>
      )}
    </div>
  );
}
