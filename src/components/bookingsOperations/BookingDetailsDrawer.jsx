import React from "react";
import Drawer from "../shared/Drawer.jsx";
import StatusPill from "../shared/StatusPill.jsx";
import { formatDate } from "../../utils/formatters.js";
import {
  FiTruck,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiMail,
  FiDollarSign,
} from "react-icons/fi";
import Button from "../shared/Button.jsx";

export default function BookingDetailsDrawer({
  open,
  booking,
  onClose,
  onRefund,
}) {
  return (
    <Drawer open={open} title="Booking Details" onClose={onClose}>
      {!booking ? (
        <p className="text-sm text-slate-500">No booking selected.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">
              {booking.listingTitle}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill value={booking.status} />
              <StatusPill value={booking.deliveryMethod} />
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-400" />
                <span className="text-slate-500">Booking:</span>
                <span className="font-medium">
                  {formatDate(booking.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiUser className="text-slate-400" />
                <span className="text-slate-500">Owner:</span>
                <span className="font-medium">
                  {booking.ownerName || booking.owner}
                </span>
              </div>
              {booking.ownerEmail ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Owner email:</span>
                  <span className="font-medium text-sm text-slate-700">
                    {booking.ownerEmail}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <FiUser className="text-slate-400" />
                <span className="text-slate-500">Renter:</span>
                <span className="font-medium">{booking.renterName}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-400" />
                <span className="text-slate-500">Item rental:</span>
                <span className="font-medium">
                  {formatDate(booking.startDate)} —{" "}
                  {formatDate(booking.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-slate-400" />
                <span className="text-slate-500">End:</span>
                <span className="font-medium">
                  {formatDate(booking.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="text-slate-400" />
                <span className="text-slate-500">Distance:</span>
                <span className="font-medium">{booking.distanceKm} km</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="text-slate-400" />
                <span className="text-slate-500">Amount:</span>
                <span className="font-medium">
                  ${Number(booking.amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {booking.renterEmail ? (
                  <a
                    href={`mailto:${booking.renterEmail}`}
                    className="rounded-full border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <FiMail className="inline mr-2" /> Contact renter
                  </a>
                ) : null}

                {booking.ownerEmail ? (
                  <a
                    href={`mailto:${booking.ownerEmail}`}
                    className="rounded-full border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <FiMail className="inline mr-2" /> Contact owner
                  </a>
                ) : null}

                <div className="ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => onRefund?.(booking)}
                    disabled={booking.refunded}
                  >
                    <FiDollarSign className="mr-2" />
                    {booking.refunded ? "Refund issued" : "Issue refund"}
                  </Button>
                </div>
              </div>
              {booking.cancelReason ? (
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="text-slate-500">Cancel reason:</span>{" "}
                  <span className="font-medium">{booking.cancelReason}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
