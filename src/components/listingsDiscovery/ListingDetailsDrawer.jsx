import React from "react";
import Drawer from "../shared/Drawer.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { formatDate } from "../../utils/formatters.js";
import { FiMapPin, FiTag, FiUser, FiStar } from "react-icons/fi";

export default function ListingDetailsDrawer({
  open,
  listing,
  categoryName,
  onClose,
}) {
  return (
    <Drawer open={open} title="Listing Details" onClose={onClose}>
      {!listing ? (
        <p className="text-sm text-neutral-500">No listing selected.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-semibold text-neutral-900">
              {listing.title}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill value={listing.status} />
              <StatusPill value={listing.featured ? "Featured" : "Normal"} />
            </div>

            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="flex items-center gap-2">
                <FiUser className="text-neutral-400" />
                <span className="text-neutral-500">Owner:</span>
                <span className="font-medium">{listing.owner}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-neutral-400" />
                <span className="text-neutral-500">City:</span>
                <span className="font-medium">{listing.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTag className="text-neutral-400" />
                <span className="text-neutral-500">Category:</span>
                <span className="font-medium">{categoryName || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiStar className="text-neutral-400" />
                <span className="text-neutral-500">CO₂:</span>
                <span className="font-medium">
                  {Number(listing.co2Kg || 0).toFixed(1)} kg
                </span>
              </div>
              <div className="text-xs text-neutral-500">
                Created: {formatDate(listing.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
