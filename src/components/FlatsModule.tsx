/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Building2, Plus, Search, User, Phone, Mail, Home, ArrowUpRight, Check } from "lucide-react";
import { Flat, OccupancyStatus } from "../types";

interface FlatsModuleProps {
  flats: Flat[];
  onAddFlat: (flat: Omit<Flat, "id">) => void;
  isAdmin: boolean;
}

export default function FlatsModule({ flats, onAddFlat, isAdmin }: FlatsModuleProps) {
  const [search, setSearch] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string>("All");
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>("All");
  
  // Modal toggle state
  const [isOpen, setIsOpen] = useState(false);
  
  // Form state
  const [block, setBlock] = useState("Tower A");
  const [number, setNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [occupancyStatus, setOccupancyStatus] = useState<OccupancyStatus>(OccupancyStatus.OCCUPIED_OWNER);
  const [monthlyMaintenanceCharge, setMonthlyMaintenanceCharge] = useState(3500);
  const [monthlyRentCharge, setMonthlyRentCharge] = useState(0);

  // Filter flats logic
  const filteredFlats = flats.filter((flat) => {
    const matchesSearch = 
      flat.number.toLowerCase().includes(search.toLowerCase()) ||
      flat.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (flat.tenantName && flat.tenantName.toLowerCase().includes(search.toLowerCase()));

    const matchesBlock = selectedBlock === "All" || flat.block === selectedBlock;
    const matchesOccupancy = selectedOccupancy === "All" || flat.occupancyStatus === selectedOccupancy;

    return matchesSearch && matchesBlock && matchesOccupancy;
  });

  // Unique blocks in flat list for filter lists
  const blocks = ["All", ...Array.from(new Set(flats.map((f) => f.block)))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!number || !ownerName || !ownerPhone || !ownerEmail) {
      alert("Please fill in all mandatory owner fields");
      return;
    }

    onAddFlat({
      block,
      number,
      ownerName,
      ownerPhone,
      ownerEmail,
      tenantName: occupancyStatus === OccupancyStatus.OCCUPIED_TENANT ? tenantName : undefined,
      tenantPhone: occupancyStatus === OccupancyStatus.OCCUPIED_TENANT ? tenantPhone : undefined,
      occupancyStatus,
      monthlyMaintenanceCharge,
      monthlyRentCharge: occupancyStatus === OccupancyStatus.OCCUPIED_TENANT ? monthlyRentCharge : undefined
    });

    // Reset and close
    setNumber("");
    setOwnerName("");
    setOwnerPhone("");
    setOwnerEmail("");
    setTenantName("");
    setTenantPhone("");
    setMonthlyMaintenanceCharge(3500);
    setMonthlyRentCharge(0);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Directory Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="text-indigo-600" size={20} /> Society Register & Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Map gated blocks, flats, tenant occupancies, ownership contact cards, and standard maintenance structures.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={15} /> Add Apartment Flat
          </button>
        )}
      </div>

      {/* Directory Filtering HUD */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search flat number, owner name, occupant..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto items-center gap-2.5">
          {/* Block Selection Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Block:</span>
            <div className="flex bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              {blocks.map((bl) => (
                <button
                  key={bl}
                  onClick={() => setSelectedBlock(bl)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedBlock === bl ? "bg-white text-indigo-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {bl}
                </button>
              ))}
            </div>
          </div>

          {/* Occupancy selection Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none"
              value={selectedOccupancy}
              onChange={(e) => setSelectedOccupancy(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value={OccupancyStatus.OCCUPIED_OWNER}>Owner Occupied</option>
              <option value={OccupancyStatus.OCCUPIED_TENANT}>Tenant Occupied</option>
              <option value={OccupancyStatus.VACANT}>Vacant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFlats.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs italic bg-white rounded-2xl border border-slate-200">
            No apartment properties mapped inside database records matching selections.
          </div>
        ) : (
          filteredFlats.map((flat) => (
            <div
              key={flat.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative"
            >
              {/* Badge representing occupancy Status */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-extrabold block">
                    {flat.block}
                  </span>
                  <h3 className="text-lg font-sans font-black text-slate-800 flex items-center gap-1">
                    <Home className="text-indigo-600" size={16} /> Flat {flat.number}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    flat.occupancyStatus === OccupancyStatus.OCCUPIED_OWNER
                      ? "bg-indigo-50 text-indigo-700"
                      : flat.occupancyStatus === OccupancyStatus.OCCUPIED_TENANT
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {flat.occupancyStatus}
                </span>
              </div>

              {/* Owner and Tenant Contacts cards */}
              <div className="space-y-3 bg-slate-50/50 rounded-xl p-3 border border-slate-100 font-sans text-xs">
                {/* Owner contact info */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1">
                    <User size={10} className="text-indigo-400" /> Ownership Profile
                  </p>
                  <p className="font-bold text-slate-800">{flat.ownerName}</p>
                  <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px] mt-0.5">
                    <span className="flex items-center gap-0.5"><Phone size={10} /> {flat.ownerPhone}</span>
                    <span className="flex items-center gap-0.5 truncate"><Mail size={10} /> {flat.ownerEmail}</span>
                  </div>
                </div>

                {/* Tenant optional contact info if status: Tenant Occupied */}
                {flat.occupancyStatus === OccupancyStatus.OCCUPIED_TENANT && (
                  <div className="border-t border-slate-200/60 pt-2.5 mt-2.5 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide flex items-center gap-1">
                      <User size={10} className="text-emerald-400" /> Tenant/Occupant Details
                    </p>
                    <p className="font-bold text-slate-800">{flat.tenantName}</p>
                    <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                      <span className="flex items-center gap-0.5"><Phone size={10} /> {flat.tenantPhone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* standard Maintenance collection structures */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Standard Charge</span>
                <span className="text-slate-900 font-bold font-mono text-sm">
                  ₹{flat.monthlyMaintenanceCharge}/mo
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over Form Overlay Modal (Admin Only) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
            {/* Modal Heading */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm uppercase tracking-widest font-mono font-black text-indigo-300">
                Register New Gated Apartment Flat
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors font-sans text-xs border border-slate-800 rounded px-2 py-1"
              >
                Esc
              </button>
            </div>

            {/* Modal form components */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-sm max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Block Name *
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  >
                    <option value="Tower A">Tower A</option>
                    <option value="Tower B">Tower B</option>
                    <option value="Tower C">Tower C</option>
                    <option value="Grounded Villas">Grounded Villas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                    Flat Code/Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-302"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Owner card fields */}
              <div className="space-y-2 border-t border-slate-150 pt-3.5">
                <h4 className="text-xs font-bold text-indigo-650 uppercase tracking-wider">Owner Contact Card</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Owner Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Owner Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="owner@example.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Occupancy settings */}
              <div className="space-y-2 border-t border-slate-150 pt-3.5">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Occupancy Handshake</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Occupancy Classification</label>
                  <select
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold"
                    value={occupancyStatus}
                    onChange={(e) => setOccupancyStatus(e.target.value as OccupancyStatus)}
                  >
                    <option value={OccupancyStatus.OCCUPIED_OWNER}>Owner Occupied</option>
                    <option value={OccupancyStatus.OCCUPIED_TENANT}>Tenant Occupied</option>
                    <option value={OccupancyStatus.VACANT}>Vacant</option>
                  </select>
                </div>

                {occupancyStatus === OccupancyStatus.OCCUPIED_TENANT && (
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">Tenant Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2 bg-white border border-slate-250 rounded-xl text-xs"
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">Tenant Phone</label>
                      <input
                        type="text"
                        className="w-full px-3.5 py-2 bg-white border border-slate-250 rounded-xl text-xs"
                        value={tenantPhone}
                        onChange={(e) => setTenantPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1">Active Monthly Rent *</label>
                      <input
                        type="number"
                        className="w-full px-3.5 py-2 bg-white border border-slate-250 rounded-xl text-xs"
                        value={monthlyRentCharge}
                        onChange={(e) => setMonthlyRentCharge(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Maintenance charge settings */}
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1">
                  Mandated Monthly Maintenance Charge (INR) *
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-900"
                  value={monthlyMaintenanceCharge}
                  onChange={(e) => setMonthlyMaintenanceCharge(Number(e.target.value))}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3.5 border-t border-slate-150 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-bold font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 transition-all shadow shadow-indigo-650/40 cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
