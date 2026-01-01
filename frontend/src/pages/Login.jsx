import { useState } from "react";
import { registerTenant } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.adminPassword !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!form.terms) {
      return setError("You must accept terms & conditions");
    }

    try {
      setLoading(true);

      await registerTenant({
        tenantName: form.tenantName,
        subdomain: form.subdomain,
        subscriptionPlan: "free",
        adminFullName: form.adminFullName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Register Tenant</h2>

      <input
        name="tenantName"
        placeholder="Organization Name"
        onChange={handleChange}
        required
      />

      <input
        name="subdomain"
        placeholder="Subdomain"
        onChange={handleChange}
        required
      />
      <small>{form.subdomain}.yourapp.com</small>

      <input
        type="email"
        name="adminEmail"
        placeholder="Admin Email"
        onChange={handleChange}
        required
      />

      <input
        name="adminFullName"
        placeholder="Admin Full Name"
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="adminPassword"
        placeholder="Password"
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        onChange={handleChange}
        required
      />

      <label>
        <input type="checkbox" name="terms" onChange={handleChange} /> Accept
        Terms
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      <Link to="/login">Already have an account?</Link>
    </form>
  );
}