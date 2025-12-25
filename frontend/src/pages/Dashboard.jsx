import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    const projectsRes = await api.get("/projects");
    const tasksRes = await api.get(`/projects/tasks?assignedTo=${user.id}`);

    setProjects(projectsRes.data.slice(0, 5));
    setTasks(tasksRes.data);

    setStats({
      totalProjects: projectsRes.data.length,
      totalTasks: tasksRes.data.length,
      completedTasks: tasksRes.data.filter(t => t.status === "completed").length,
      pendingTasks: tasksRes.data.filter(t => t.status !== "completed").length,
    });
  };

  if (!user) return <p>Loading dashboard...</p>;

  return (
    <>
      <Navbar />
      <h1>Dashboard</h1>

      <div className="stats">
        <div>Total Projects: {stats.totalProjects}</div>
        <div>Total Tasks: {stats.totalTasks}</div>
        <div>Completed Tasks: {stats.completedTasks}</div>
        <div>Pending Tasks: {stats.pendingTasks}</div>
      </div>

      <h2>Recent Projects</h2>
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            {p.name} | {p.status} | {p.taskCount} tasks
          </li>
        ))}
      </ul>

      <h2>My Tasks</h2>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            {t.title} — {t.priority} — Due: {t.dueDate}
          </li>
        ))}
      </ul>
    </>
  );
}