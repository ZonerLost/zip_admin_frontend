import React from "react";
import Drawer from "../shared/Drawer.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { formatDate } from "../../utils/formatters.js";

export default function UserDetailsDrawer({ open, user, onClose }) {
  return (
    <Drawer open={open} title="User Details" onClose={onClose}>
      {!user ? (
        <p className="text-sm text-slate-500">No user selected.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-xs text-slate-500">Name</p>
            <p className="text-sm font-semibold text-slate-900">{user.name}</p>

            <p className="mt-3 text-xs text-slate-500">Email</p>
            <p className="text-sm text-slate-800">{user.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill value={user.status} />
              <StatusPill value={user.verified ? "Verified" : "Unverified"} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <p className="text-sm text-slate-800">
                  {user.isOwner ? "Owner" : "Renter"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Last active</p>
                <p className="text-sm text-slate-800">
                  {formatDate(user.lastActive)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Listings</p>
                <p className="text-sm text-slate-800">
                  {user.listingsCount ?? 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Bookings</p>
                <p className="text-sm text-slate-800">
                  {user.bookingsCount ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
