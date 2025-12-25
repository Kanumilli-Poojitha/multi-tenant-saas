import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="border p-4 rounded">
      <h2 className="font-semibold">{project.name}</h2>
      <p>{project.description?.slice(0, 80)}...</p>

      <div className="text-sm mt-2">
        <span>Status: {project.status}</span>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={() => navigate(`/projects/${project.id}`)}>
          View
        </button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}