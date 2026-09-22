"use client";

import React, { useEffect, useState } from "react";
import { useBusiness } from "@/context/business-context";
import { useRegisterStore } from "@/stores/useRegisterStore";
import { outletsApi } from "@/lib/api/outlets";
import type { Outlet, Register } from "@/types";
import { 
  Calculator, 
  Plus, 
  MapPin, 
  Monitor, 
  MoreVertical, 
  Trash2, 
  Edit3,
  Server,
  ToggleRight,
  ToggleLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateRegisterModal, EditRegisterModal } from "@/components/registers";

export default function RegistersPage() {
  const { activeBusiness } = useBusiness();
  const { 
    registers, 
    activeOutletUuid, 
    setActiveOutlet, 
    isLoading, 
    isInitialLoaded, 
    deleteRegister 
  } = useRegisterStore();

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isOutletsLoading, setIsOutletsLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<Register | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!activeBusiness) return;

    const fetchOutlets = async () => {
      setIsOutletsLoading(true);
      try {
        const fetchedOutlets = await outletsApi.getOutlets(activeBusiness.uuid);
        setOutlets(fetchedOutlets);
        
        // Auto-select first outlet if none selected
        if (fetchedOutlets.length > 0 && !activeOutletUuid) {
          setActiveOutlet(fetchedOutlets[0].uuid);
        }
      } catch (error) {
        console.error("Failed to fetch outlets", error);
      } finally {
        setIsOutletsLoading(false);
      }
    };

    fetchOutlets();
  }, [activeBusiness, activeOutletUuid, setActiveOutlet]);

  const handleEdit = (register: Register) => {
    setSelectedRegister(register);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (registerUuid: string) => {
    if (confirm("Are you sure you want to delete this register?")) {
      await deleteRegister(registerUuid);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Cash Registers
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage physical and virtual cash counters across your outlets.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Outlet Selector */}
          <div className="relative w-full sm:w-64">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              className="w-full h-10 pl-9 pr-8 rounded-md border border-input bg-background text-sm focus:ring-1 focus:ring-primary focus:border-primary appearance-none disabled:opacity-50"
              value={activeOutletUuid || ""}
              onChange={(e) => setActiveOutlet(e.target.value)}
              disabled={isOutletsLoading || outlets.length === 0}
            >
              <option value="" disabled>
                {isOutletsLoading ? "Loading outlets..." : "Select an outlet"}
              </option>
              {outlets.map((outlet) => (
                <option key={outlet.uuid} value={outlet.uuid}>
                  {outlet.name} ({outlet.code})
                </option>
              ))}
            </select>
          </div>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!activeOutletUuid}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Register
          </Button>
        </div>
      </div>

      {/* Content */}
      {!activeOutletUuid && !isOutletsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-lg border-dashed">
          <MapPin className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No Outlet Selected</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
            Select an outlet from the dropdown above to view or manage its cash registers.
          </p>
        </div>
      ) : isLoading && !isInitialLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : registers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-lg border-dashed">
          <Calculator className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No Registers Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
            This outlet doesn't have any cash registers yet.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Register
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {registers.map((register) => (
            <Card key={register.uuid} className="group overflow-hidden border-border bg-card hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md">
              <CardContent className="p-0">
                <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Monitor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1" title={register.name}>
                        {register.name}
                      </h3>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {register.code}
                      </p>
                    </div>
                  </div>
                  
                  {register.status === "active" ? (
                    <Badge variant="success" className="bg-success/15 text-success hover:bg-success/25 font-medium border-0">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="font-medium">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <div className="p-5 space-y-4">
                  {register.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {register.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Float Setup</p>
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        <span className="text-primary">$</span>
                        {parseFloat(register.default_cash_amount || "0").toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Hardware</p>
                      <div className="flex items-center gap-1.5 text-foreground font-medium">
                        {register.is_cash_drawer_connected ? (
                          <ToggleRight className="h-4 w-4 text-success" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs">Drawer</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Server className="h-3.5 w-3.5" />
                      {register.devices_count || 0} paired devices
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(register)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(register.uuid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {activeOutletUuid && (
        <CreateRegisterModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          outletUuid={activeOutletUuid}
        />
      )}

      <EditRegisterModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRegister(null);
        }}
        register={selectedRegister}
      />
    </div>
  );
}
