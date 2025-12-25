import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectById } from "../services/projectService";
import { getTasksByProject } from "../services/taskService";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const p = await getProjectById(projectId);
      const t = await getTasksByProject(projectId);
      setProject(p.data);
      setTasks(t.data);
    };
    load();
  }, [projectId]);

  if (!project) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{project.name}</h1>
      <p>{project.description}</p>

      <h2 className="mt-6 font-semibold">Tasks</h2>
      {tasks.map((task) => (
        <div key={task.id} className="border p-2 mt-2">
          {task.title} – {task.status}
        </div>
      ))}
    </div>
  );
}