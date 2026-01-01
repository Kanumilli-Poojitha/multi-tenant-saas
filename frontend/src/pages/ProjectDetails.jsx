import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const projectRes = await api.get(`/projects/${projectId}`);
        const tasksRes = await api.get(`/projects/${projectId}/tasks`);

        setProject(projectRes.data?.data?.project || null);
        setTasks(tasksRes.data?.data?.tasks || []);
      } catch (err) {
        console.error("Failed to load project details", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!project) return <p className="p-6">Project not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{project.name}</h1>
      <p className="mb-4">{project.description}</p>

      <h2 className="mt-6 font-semibold">Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="border p-2 mt-2 rounded">
            {task.title} — {task.status}
          </div>
        ))
      )}
    </div>
  );
}