"use client";

import React, { useState } from "react";
import {
  Globe,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Server,
  Copy,
  Check,
} from "lucide-react";

interface DomainRecord {
  id: string;
  domain: string;
  company: string;
  type: "Custom Domain" | "Subdomain";
  target: string;
  sslStatus: "Secured" | "Pending Verification" | "Expired";
  createdDate: string;
}

const DOMAINS: DomainRecord[] = [
  {
    id: "DOM-01",
    domain: "pos.stellarcoffee.io",
    company: "Stellar Coffee Roasters",
    type: "Custom Domain",
    target: "cname.smartpos.app",
    sslStatus: "Secured",
    createdDate: "18 Feb 2025",
  },
  {
    id: "DOM-02",
    domain: "freshmart.smartpos.app",
    company: "Freshmart Supermarket Ltd",
    type: "Subdomain",
    target: "app.smartpos.app",
    sslStatus: "Secured",
    createdDate: "12 Jan 2025",
  },
  {
    id: "DOM-03",
    domain: "pos.apex.net",
    company: "Apex Electronics Hub",
    type: "Custom Domain",
    target: "cname.smartpos.app",
    sslStatus: "Pending Verification",
    createdDate: "29 May 2025",
  },
  {
    id: "DOM-04",
    domain: "urbankicks.smartpos.app",
    company: "Urban Kicks Footwear",
    type: "Subdomain",
    target: "app.smartpos.app",
    sslStatus: "Secured",
    createdDate: "03 Mar 2025",
  },
];

export default function DomainPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filtered = DOMAINS.filter(
    (d) =>
      d.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Domain & DNS Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Manage custom tenant domains, wildcard routing, automated SSL provisioning, and DNS records
            </p>
          </div>
        </div>

        <button
          type="button"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Connect New Domain</span>
        </button>
      </div>

      {/* DNS Configuration Helper Banner */}
      <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Server className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              SaaS CNAME Target Configuration
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Have tenant administrators point their DNS CNAME record to{" "}
              <code className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 font-mono font-bold text-orange-600 dark:text-orange-400">
                cname.smartpos.app
              </code>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCopy("cname.smartpos.app")}
          className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-zinc-900 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100/50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          {copiedText === "cname.smartpos.app" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span>{copiedText === "cname.smartpos.app" ? "Copied!" : "Copy CNAME"}</span>
        </button>
      </div>

      {/* Domains Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search domains or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800 uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Domain Name</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target DNS</th>
                <th className="py-3 px-4">SSL Certificate</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-300">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-orange-500 hover:underline"
                    >
                      <span>{d.domain}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-zinc-200">
                    {d.company}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                    {d.target}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        d.sslStatus === "Secured"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : d.sslStatus === "Pending Verification"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {d.sslStatus === "Secured" && <ShieldCheck className="h-2.5 w-2.5" />}
                      {d.sslStatus === "Pending Verification" && <Clock className="h-2.5 w-2.5" />}
                      {d.sslStatus === "Expired" && <AlertCircle className="h-2.5 w-2.5" />}
                      {d.sslStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">{d.createdDate}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      Verify DNS
                    </button>
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
