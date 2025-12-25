import { useState } from "react";
import { createProject, updateProject } from "../services/projectService";

export default function ProjectModal({ project, onClose, onSaved }) {
  const [name, setName] = useState(project?.name || "");
  const [desc, setDesc] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");

  const submit = async () => {
    if (!name) return alert("Project name required");

    if (project) {
      await updateProject(project.id, { name, description: desc, status });
    } else {
      await createProject({ name, description: desc, status });
    }

    onSaved();
    onClose();
  };

  return (
    <div className="modal">
      <h2>{project ? "Edit Project" : "Create Project"}</h2>

      <input value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="archived">Archived</option>
      </select>

      <button onClick={onClose}>Cancel</button>
      <button onClick={submit}>Save</button>
    </div>
  );
}