import { useEffect , useState } from "react";


import { useAppDispatch, useAppSelector } from "../../hooks/redux";

import { fetchLeads } from "../../store/slices/leadSlice";

import { useNavigate } from "react-router-dom";


export default function LeadListPage() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

  const dispatch = useAppDispatch();

const {
  leads,
  loading,
  error,
  total,
  totalPages,
} = useAppSelector(
  (state) => state.lead
);

 useEffect(() => {
  dispatch(
    fetchLeads({
      page,
      limit: 10,
      search,
    })
  );
}, [dispatch, page, search]);

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">
            Lead Management
          </h1>

          <p className="text-gray-500">
            Total Leads: {total}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-6 shadow">
            Loading Leads...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white p-4 shadow">
  <input
    type="text"
    placeholder="Search Lead..."
    value={search}
    onChange={(e) => {
      setPage(1);
      setSearch(e.target.value);
    }}
    className="w-full rounded-lg border px-4 py-2"
  />
</div>

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl bg-white shadow">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4 text-left">
                    Lead Code
                  </th>

                  <th className="p-4 text-left">
                    Name
                  </th>

                  <th className="p-4 text-left">
                    Mobile
                  </th>

                  <th className="p-4 text-left">
                    Stage
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead: any) => (
                  <tr
  key={lead.id}
  className="border-t cursor-pointer hover:bg-slate-50"
  onClick={() =>
    navigate(`/leads/${lead.id}`)
  }
>
                    <td className="p-4">
                      {lead.leadCode}
                    </td>

                    <td className="p-4">
                      {lead.name || "-"}
                    </td>

                    <td className="p-4">
                      {lead.mobile}
                    </td>

                    <td className="p-4">
                      {lead.stage}
                    </td>

                    <td className="p-4">
                      {lead.status?.name || "-"}
                    </td>

                    <td className="p-4">
                      {new Date(
                        lead.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex items-center justify-center gap-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
  >
    Prev
  </button>

  <span>
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page >= totalPages}
    onClick={() => setPage(page + 1)}
    className="rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
  >
    Next
  </button>
</div>

            {leads.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No Leads Found
              </div>
            )}
          </div>
        )}
      </div>
  );
}