import React, { useEffect, useState } from "react";
import { listWaves, deleteWave } from "../Services/ApiService";
import type { Wave } from "../models/WaveModels";
import { Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const WaveList: React.FC = () => {
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadWaves = async () => {
    setLoading(true);
    try {
      const all = await listWaves();
      setWaves(all);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaves();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this wave?")) return;
    await deleteWave(id);
    loadWaves();
    setTimeout(() => {
      toast.success("Deleted Successfully!")
    }, 50)
    
  };

  const handleEdit = (id: string) => {
    // Navigate to /edit/:id (for example), where ECGGenerator will read the id param and fetch the data.
    navigate(`/create-pattern/${id}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-100 border-b text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Wave Name</th>
            <th className="px-4 py-3 font-semibold text-center w-32">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={2} className="text-center py-6 text-gray-400">
                Loading...
              </td>
            </tr>
          ) : waves.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-6 text-gray-400">
                No waves found.
              </td>
            </tr>
          ) : (
            waves.map((wave, i) => (
              <tr
                key={wave.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3">{wave.name}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    className="px-3 rounded hover:bg-blue-50 group"
                    title="Edit"
                    onClick={() => handleEdit(wave.id!)}
                  >
                    <Pencil className="h-5 w-5 text-blue-500 group-hover:text-blue-700" />
                    <span className="sr-only">Edit</span>
                  </button>
                  <button
                    className="px-3 rounded hover:bg-red-50 group"
                    title="Delete"
                    onClick={() => handleDelete(wave.id!)}
                  >
                    <Trash2
                      className="h-5 w-5 text-red-500 group-hover:text-red-700 transition-colors"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Delete</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WaveList;
