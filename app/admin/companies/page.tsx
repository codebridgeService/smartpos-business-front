"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Store,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpDown,
  Mail,
  Phone,
  Globe,
  Download,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  domain: string;
  plan: "Enterprise" | "Advanced" | "Basic" | "Free Trial";
  outletsCount: number;
  status: "Active" | "Pending" | "Suspended";
  registeredDate: string;
}

const SAMPLE_COMPANIES: Company[] = [
  {
    id: "COMP-001",
    name: "Freshmart Supermarket Ltd",
    owner: "Alex Morgan",
    email: "alex@freshmart.com",
    phone: "+1 (555) 234-5678",
    domain: "freshmart.smartpos.app",
    plan: "Enterprise",
    outletsCount: 14,
    status: "Active",
    registeredDate: "12 Jan 2025",
  },
  {
    id: "COMP-002",
    name: "Stellar Coffee Roasters",
    owner: "Sarah Jenkins",
    email: "sarah@stellarcoffee.io",
    phone: "+1 (555) 345-6789",
    domain: "pos.stellarcoffee.io",
    plan: "Advanced",
    outletsCount: 5,
    status: "Active",
    registeredDate: "18 Feb 2025",
  },
  {
    id: "COMP-003",
    name: "Urban Kicks Footwear",
    owner: "David Chen",
    email: "d.chen@urbankicks.co",
    phone: "+1 (555) 456-7890",
    domain: "urbankicks.smartpos.app",
    plan: "Basic",
    outletsCount: 2,
    status: "Active",
    registeredDate: "03 Mar 2025",
  },
  {
    id: "COMP-004",
    name: "Apex Electronics Hub",
    owner: "Marcus Vance",
    email: "vance@apexelectronics.com",
    phone: "+1 (555) 567-8901",
    domain: "pos.apex.net",
    plan: "Enterprise",
    outletsCount: 8,
    status: "Pending",
    registeredDate: "29 May 2025",
  },
  {
    id: "COMP-005",
    name: "Boutique Bella Floral",
    owner: "Elena Rostova",
    email: "elena@bellaflowers.com",
    phone: "+1 (555) 678-9012",
    domain: "bella.smartpos.app",
    plan: "Free Trial",
    outletsCount: 1,
    status: "Suspended",
    registeredDate: "04 Jun 2025",
  },
];

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCompanies = SAMPLE_COMPANIES.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Companies Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Oversee multi-tenant accounts, subscriber businesses, outlets, and custom domains
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Companies</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">868</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Active Tenants</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">811</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Total Outlets</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">2,430</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Free Trials</span>
            <div className="text-xl font-bold text-slate-900 dark:text-white">45</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies, owner, domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-medium">
              {["All", "Active", "Pending", "Suspended"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === status
                      ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800 uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Owner & Contact</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Outlets</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {filteredCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {company.name}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{company.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-900 dark:text-white">{company.owner}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{company.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-orange-500 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3 text-slate-400" />
                      <span>{company.domain}</span>
                    </a>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        company.plan === "Enterprise"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                          : company.plan === "Advanced"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          : company.plan === "Basic"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {company.plan}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <Link
                      href="/admin/businesses/outlets"
                      className="inline-flex items-center gap-1 hover:text-orange-500"
                    >
                      <span>{company.outletsCount}</span>
                      <span className="text-slate-400 text-[10px] font-normal">branches</span>
                    </Link>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        company.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : company.status === "Pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {company.status === "Active" && <CheckCircle2 className="h-2.5 w-2.5" />}
                      {company.status === "Pending" && <Clock className="h-2.5 w-2.5" />}
                      {company.status === "Suspended" && <Ban className="h-2.5 w-2.5" />}
                      {company.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                    {company.registeredDate}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href="/admin/businesses/outlets"
                        className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        Outlets
                      </Link>
                      <button
                        type="button"
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
