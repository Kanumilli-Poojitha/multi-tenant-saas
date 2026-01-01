import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects", {
        params: statusFilter ? { status: statusFilter } : {},
      });

      // 🔒 SAFETY: normalize response to array
      const data = res.data?.data;

      if (Array.isArray(data)) {
        setProjects(data);
      } else if (Array.isArray(data?.projects)) {
        setProjects(data.projects);
      } else if (Array.isArray(data?.rows)) {
        setProjects(data.rows);
      } else {
        console.error("Unexpected projects response:", res.data);
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  // 🔒 GUARANTEE array before filter
  const filteredProjects = Array.isArray(projects)
    ? projects.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Projects</h2>

      <button className="mb-4">Create New Project</button>

      <input
        placeholder="Search project"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>

      {filteredProjects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        filteredProjects.map((p) => (
          <div
            key={p.id}
            className="border p-3 mt-3 rounded cursor-pointer"
            onClick={() => navigate(`/projects/${p.id}`)}
          >
            <h3 className="font-semibold">{p.name}</h3>
            <p>{p.description}</p>
            <small>Status: {p.status}</small>
          </div>
        ))
      )}
    </div>
  );
}