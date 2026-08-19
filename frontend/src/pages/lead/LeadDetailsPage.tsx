import { useEffect } from "react";
import { useParams } from "react-router-dom";


import { useAppDispatch, useAppSelector } from "../../hooks/redux";

import { fetchLeadDetails } from "../../store/slices/leadDetailsSlice";

import { useState } from "react";

import { createFollowUp } from "../../services/followup.service";

import {
  getLeadStatuses,
  changeLeadStatus,
} from "../../services/leadStatus.service";

export default function LeadDetailsPage() {

  const [statuses, setStatuses] =
  useState<any[]>([]);

const [selectedStatus, setSelectedStatus] =
  useState("");

const [statusRemarks, setStatusRemarks] =
  useState("");

  const [followUpDate, setFollowUpDate] =
  useState("");

const [remarks, setRemarks] =
  useState("");

const [saving, setSaving] =
  useState(false);


  const { id } = useParams();

  const dispatch = useAppDispatch();

  const { lead, loading, error } =
    useAppSelector(
      (state) => state.leadDetails
    );

    const handleFollowUp = async () => {
  if (!lead) return;

  try {
    setSaving(true);

    await createFollowUp({
      leadId: lead.id,
      employeeId:
        "cmru1otir0006ux0gs4kmioca",
      followUpDate,
      remarks,
    });

    alert(
      "Follow Up Created Successfully"
    );

    setFollowUpDate("");
    setRemarks("");

    dispatch(
      fetchLeadDetails(lead.id)
    );
  } catch (error) {
    alert("Failed");
  } finally {
    setSaving(false);
  }
};

const handleStatusUpdate =
  async () => {
    if (!selectedStatus) return;

    try {
      await changeLeadStatus(
        lead.id,
        {
          statusId:
            selectedStatus,
          remarks:
            statusRemarks,
        }
      );

      alert(
        "Status Updated Successfully"
      );

      dispatch(
        fetchLeadDetails(
          lead.id
        )
      );

      setSelectedStatus("");
      setStatusRemarks("");
    } catch {
      alert(
        "Status Update Failed"
      );
    }
  };


useEffect(() => {
  const loadStatuses = async () => {
    const result =
      await getLeadStatuses();

    setStatuses(
      result.leadStatuses || []
    );
  };

  loadStatuses();
}, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchLeadDetails(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
        <div>Loading Lead...</div>
      
    );
  }

  if (error) {
    return (
        <div className="text-red-600">
          {error}
        </div>
    );
  }

  if (!lead) {
    return (
      
        <div>No Lead Found</div>
      
    );
  }

  return (
  
      <div className="space-y-6">

        {/* Lead Info */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Lead Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Lead Code:</strong>{" "}
              {lead.leadCode}
            </div>

            <div>
              <strong>Mobile:</strong>{" "}
              {lead.mobile}
            </div>

            <div>
              <strong>Name:</strong>{" "}
              {lead.name || "-"}
            </div>

            <div>
              <strong>Status:</strong>{" "}
              {lead.status?.name}
            </div>

            <div>
              <strong>Stage:</strong>{" "}
              {lead.stage}
            </div>

            <div>
              <strong>City:</strong>{" "}
              {lead.city || "-"}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
  <h2 className="mb-4 text-xl font-bold">
    Change Lead Status
  </h2>

  <div className="space-y-3">

    <select
      value={selectedStatus}
      onChange={(e) =>
        setSelectedStatus(
          e.target.value
        )
      }
      className="w-full rounded-lg border p-3"
    >
      <option value="">
        Select Status
      </option>

      {statuses.map(
        (status) => (
          <option
            key={status.id}
            value={status.id}
          >
            {status.name}
          </option>
        )
      )}
    </select>

    <textarea
      rows={3}
      placeholder="Remarks"
      value={statusRemarks}
      onChange={(e) =>
        setStatusRemarks(
          e.target.value
        )
      }
      className="w-full rounded-lg border p-3"
    />

    <button
      onClick={
        handleStatusUpdate
      }
      className="rounded-lg bg-green-600 px-5 py-3 text-white"
    >
      Update Status
    </button>

  </div>
</div>

        {/* Client */}
        {lead.client && (
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">
              Client Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Client Code:</strong>{" "}
                {lead.client.clientCode}
              </div>

              <div>
                <strong>Name:</strong>{" "}
                {lead.client.name}
              </div>

              <div>
                <strong>Mobile:</strong>{" "}
                {lead.client.mobile}
              </div>

              <div>
                <strong>City:</strong>{" "}
                {lead.client.city || "-"}
              </div>
            </div>
          </div>
        )}

        {/* Follow Ups */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Follow Ups
          </h2>

          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">
                  Date
                </th>

                <th className="text-left">
                  Remarks
                </th>

                <th className="text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {lead.followUps?.map(
                (item: any) => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td>
                      {new Date(
                        item.followUpDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {item.remarks}
                    </td>

                    <td>
                      {item.isCompleted
                        ? "Completed"
                        : "Pending"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
  <h2 className="mb-4 text-xl font-bold">
    Add Follow Up
  </h2>

  <div className="space-y-3">

    <input
      type="datetime-local"
      value={followUpDate}
      onChange={(e) =>
        setFollowUpDate(
          e.target.value
        )
      }
      className="w-full rounded-lg border p-3"
    />

    <textarea
      rows={4}
      placeholder="Remarks"
      value={remarks}
      onChange={(e) =>
        setRemarks(e.target.value)
      }
      className="w-full rounded-lg border p-3"
    />

    <button
      onClick={handleFollowUp}
      disabled={saving}
      className="rounded-lg bg-blue-700 px-5 py-3 text-white"
    >
      {saving
        ? "Saving..."
        : "Create Follow Up"}
    </button>

  </div>
</div>

        {/* History */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Lead History
          </h2>

          <div className="space-y-3">
            {lead.histories?.map(
              (history: any) => (
                <div
                  key={history.id}
                  className="border-l-4 border-blue-700 pl-4"
                >
                  <p>
                    {history.remarks}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(
                      history.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
  );
}