import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function UserModal({ onClose, refresh, editUser }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    email: editUser?.email || "",
    fullName: editUser?.fullName || "",
    password: "",
    role: editUser?.role || "user",
    active: editUser?.active ?? true,
  });

  const submit = async (e) => {
    e.preventDefault();

    if (editUser) {
      await api.put(`/users/${editUser.id}`, form);
    } else {
      await api.post(
        `/tenants/${user.tenantId}/users`,
        form
      );
    }

    refresh();
    onClose();
  };

  return (
    <div className="modal">
      <form onSubmit={submit}>
        <h3>{editUser ? "Edit User" : "Add User"}</h3>

        <input
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Full Name"
          required
          value={form.fullName}
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
        />

        {!editUser && (
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        )}

        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="user">User</option>
          <option value="tenant_admin">Tenant Admin</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) =>
              setForm({ ...form, active: e.target.checked })
            }
          />
          Active
        </label>

        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}