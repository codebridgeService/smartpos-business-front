"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Shield, Mail, Phone, Lock, User as UserIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextInput, PasswordInput } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api";
import type { Role, LengthAwarePaginator, ApiListResponse } from "@/types";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const toast = useToast();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [roleCode, setRoleCode] = useState("cashier");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      void apiClient
        .get<LengthAwarePaginator<Role> | ApiListResponse<Role>>("/roles")
        .then((res) => {
          if (res && "data" in res && Array.isArray(res.data)) {
            setRoles(res.data);
          }
        })
        .catch(() => { });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter the user's full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/users", {
        name: name.trim(),
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password || undefined,
        role_code: roleCode,
        status,
      });

      toast.success(`Staff user "${name}" created successfully.`);
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRoleCode("cashier");
      setStatus("active");
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      toast.error(
        errObj.response?.data?.message || "Failed to create user. Please verify input fields."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions =
    roles.length > 0
      ? roles.map((r) => ({
        value: r.code,
        label: `${r.name} (${r.code})`,
      }))
      : [
        { value: "owner", label: "Business Owner" },
        { value: "admin", label: "System Administrator" },
        { value: "manager", label: "Branch Manager" },
        { value: "cashier", label: "Cashier" },
      ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Staff Member / User"
      description="Onboard a new employee or administrator, assign an access role, and generate login credentials."
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Create Staff Member
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <TextInput
          label="Full Legal Name"
          placeholder="e.g. Alex Morgan"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />

        {/* Username & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Username (Login Handle)"
            placeholder="e.g. alex.morgan"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />

          <Select
            label="Initial Access Role"
            value={roleCode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRoleCode(e.target.value)}
            options={roleOptions}
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Work Email Address"
            type="email"
            placeholder="alex@company.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />

          <TextInput
            label="Contact Phone"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
          />
        </div>

        {/* Temporary Password & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordInput
            label="Initial Password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />

          <Select
            label="Account Status"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value as "active" | "inactive")}
            options={[
              { value: "active", label: "Active (Allowed to login)" },
              { value: "inactive", label: "Inactive / Suspended" },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}
