import { useEffect, useState } from "react";
import api from "../api/axios";
import UserModal from "../components/UserModal";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    const res = await api.get(`/tenants/${user.tenantId}/users`);
    setUsers(res.data);
  };

  useEffect(() => {
    if (user) fetchUsers();
  }, [user]);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter ? u.role === roleFilter : true)
  );

  if (!user) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Users</h2>

      <button onClick={() => setShowModal(true)}>Add User</button>

      <input
        placeholder="Search name/email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select onChange={(e) => setRoleFilter(e.target.value)}>
        <option value="">All Roles</option>
        <option value="user">User</option>
        <option value="tenant_admin">Tenant Admin</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.active ? "Active" : "Inactive"}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => { setEditUser(u); setShowModal(true); }}>
                  Edit
                </button>
                <button onClick={() => deleteUser(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <UserModal
          onClose={() => { setShowModal(false); setEditUser(null); }}
          refresh={fetchUsers}
          editUser={editUser}
        />
      )}
    </div>
  );
}