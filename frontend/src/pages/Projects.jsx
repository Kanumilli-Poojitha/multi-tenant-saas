import { useEffect, useState } from "react";
import { getProjects, deleteProject } from "../services/projectService";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const loadProjects = async () => {
    const res = await getProjects(status);
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, [status]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Projects</h1>
        <button onClick={() => setOpenModal(true)}>Create New Project</button>
      </div>

      <div className="flex gap-4 mb-4">
        <select onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <input
          placeholder="Search project"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={async () => {
                if (confirm("Delete project?")) {
                  await deleteProject(project.id);
                  loadProjects();
                }
              }}
            />
          ))}
        </div>
      )}

      {openModal && (
        <ProjectModal
          onClose={() => setOpenModal(false)}
          onSaved={loadProjects}
        />
      )}
    </div>
  );
}