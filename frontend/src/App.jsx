
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import StudentDecision from "./StudentDecision";
import { useEffect, useMemo, useState } from "react";

import {
  getOrders,
  createOrder,
  updateOrderStatus as saveOrderStatus,
  updateOrderDecision as saveOrderDecision,
} from "./services/orderServices";

import {
  LayoutDashboard, ClipboardList, Plus, Search,
  Shirt, Clock3, CheckCircle2, Package,
  Menu, X, Bell, ChevronRight, ArrowUpRight,
  MapPin, Phone, CalendarDays, Filter,
  WashingMachine, PackageCheck, LogOut,
  MoreHorizontal, AlertCircle, ArrowDownLeft
} from "lucide-react";

import "./index.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "All Orders", icon: ClipboardList },
  { id: "closing", label: "Closing Report", icon: PackageCheck },
];

function StatusBadge({ status }) {
  const styles = {
    Received: "received",
    Washing: "washing",
    Ready: "ready",
    Collected: "collected",
  };

  return (
    <span className={`status-badge ${styles[status] || ""}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function PreferenceBadge({ value }) {
  if (!value) {
    return <span className="muted-text">No response yet</span>;
  }

  const outside = value.toLowerCase().includes("outside");

  return (
    <span className={`preference-badge ${outside ? "outside" : "inside"}`}>
      {outside ? "↗" : "↙"} {value}
    </span>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch orders from MongoDB when the application loads
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.message || "Unable to load orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function copyStudentLink(order) {
  if (!order.studentToken) {
    setError("Student link is not available for this order.");
    return;
  }

  const studentLink =
    `${window.location.origin}/decision/${order.studentToken}`;

  try {
    await navigator.clipboard.writeText(studentLink);
    setCopiedOrderId(order.id);
  } catch {
    setError("Unable to copy link. Please try again.");
  }
  }

  // Dashboard statistics
  const stats = useMemo(() => ({
    total: orders.length,
    received: orders.filter(o => o.status === "Received").length,
    washing: orders.filter(o => o.status === "Washing").length,
    ready: orders.filter(o => o.status === "Ready").length,
    collected: orders.filter(o => o.status === "Collected").length,
  }), [orders]);

  // Closing report: only ready and uncollected buckets
  const closingOrders = orders.filter(
    o => o.status === "Ready" && o.decision !== "Collect now"
  );

  // Search and filter orders
  const filteredOrders = orders.filter(order => {
    const term = search.toLowerCase();

    const matchesSearch =
      (order.name || "").toLowerCase().includes(term) ||
      (order.id || "").toString().toLowerCase().includes(term) ||
      (order.room || "").toLowerCase().includes(term) ||
      (order.roll || "").toLowerCase().includes(term);

    const matchesFilter =
      filter === "All" || order.status === filter;

    return matchesSearch && matchesFilter;
  });

  // Update order status through backend
  async function updateStatus(id, status) {
    try {
      setSaving(true);
      setError("");

      const updatedOrder = await saveOrderStatus(id, status);

      setOrders(prev =>
        prev.map(order =>
          order.id === id ? updatedOrder : order
        )
      );
    } catch (err) {
      setError(err.message || "Could not update order status.");
    } finally {
      setSaving(false);
    }
  }

  // Update collection decision through backend
  async function updateDecision(id, decision) {
    try {
      setSaving(true);
      setError("");

      const updatedOrder = await saveOrderDecision(id, decision);

      setOrders(prev =>
        prev.map(order =>
          order.id === id ? updatedOrder : order
        )
      );
    } catch (err) {
      setError(err.message || "Could not update collection decision.");
    } finally {
      setSaving(false);
    }
  }

  // Register a new order through backend
  async function addOrder(formData) {
    try {
      setSaving(true);
      setError("");

      const newOrder = await createOrder(formData);

      setOrders(prev => [newOrder, ...prev]);
      setShowForm(false);
      setActivePage("orders");
    } catch (err) {
      setError(err.message || "Could not register the order.");
    } finally {
      setSaving(false);
    }
  }

  function navigate(page) {
    setActivePage(page);
    setMobileMenu(false);
  }

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <WashingMachine size={25} />
          </div>

          <div>
            <h2>LaundryMate</h2>
            <span>Management system</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-section">
          <p className="nav-heading">MENU</p>

          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-link ${activePage === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>

                {item.id === "closing" && closingOrders.length > 0 && (
                  <span className="nav-count">
                    {closingOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="avatar">A</div>

            <div className="profile-info">
              <strong>Alok Bhaiya</strong>
              <span>Administrator</span>
            </div>

            <MoreHorizontal size={19} color="#8a9690" />
          </div>

          <p className="sidebar-footer">LaundryMate v1.0</p>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* Main area */}
      <main className="main-content">

        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="breadcrumb">LaundryMate / </span>
              <strong>
                {navItems.find(n => n.id === activePage)?.label}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            <span className="today-date">
              <CalendarDays size={16} />
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <button className="notification-icon" title="Notifications">
              <Bell size={19} />
            </button>
          </div>
        </header>

        <div className="page-container">

          {/* Error message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="empty-state">
              <WashingMachine size={35} />
              <h3>Loading orders...</h3>
              <p>Connecting to LaundryMate server.</p>
            </div>
          ) : (
            <>

              {/* DASHBOARD */}
              {activePage === "dashboard" && (
                <>
                  <section className="welcome-section">
                    <div>
                      <p className="eyebrow">
                        YOUR LAUNDRY OVERVIEW
                      </p>

                      <h1>
                        Good morning, Alok Bhaiya! <span>👋</span>
                      </h1>

                      <p className="welcome-subtitle">
                        Here's what's happening with your laundry today.
                      </p>
                    </div>

                    <button
                      className="primary-button"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus size={19} /> New laundry order
                    </button>
                  </section>

                  <section className="stats-grid">
                    <StatCard
                      title="Total orders"
                      value={stats.total}
                      icon={ClipboardList}
                      color="green"
                      subtitle="All registered buckets"
                    />

                    <StatCard
                      title="Received"
                      value={stats.received}
                      icon={Package}
                      color="blue"
                      subtitle="Waiting to be washed"
                    />

                    <StatCard
                      title="Washing"
                      value={stats.washing}
                      icon={WashingMachine}
                      color="orange"
                      subtitle="Currently processing"
                    />

                    <StatCard
                      title="Ready"
                      value={stats.ready}
                      icon={CheckCircle2}
                      color="purple"
                      subtitle="Awaiting collection"
                    />
                  </section>

                  <section className="attention-card">
                    <div className="attention-icon">
                      <AlertCircle size={23} />
                    </div>

                    <div className="attention-content">
                      <h3>Closing-time attention</h3>
                      <p>
                        {closingOrders.length} ready buckets need collection
                        instructions.
                      </p>
                    </div>

                    <button onClick={() => navigate("closing")}>
                      View report <ChevronRight size={17} />
                    </button>
                  </section>

                  <section className="content-card">
                    <div className="section-header">
                      <div>
                        <h2>Recent orders</h2>
                        <p>
                          Keep track of your latest laundry orders.
                        </p>
                      </div>

                      <button
                        className="text-button"
                        onClick={() => navigate("orders")}
                      >
                        View all <ArrowUpRight size={16} />
                      </button>
                    </div>

                    <OrderTable
                      orders={orders.slice(0, 5)}
                      updateStatus={updateStatus}
                      updateDecision={updateDecision}
                      copyStudentLink={copyStudentLink}
                      copiedOrderId={copiedOrderId}
                      saving={saving}
                    />
                  </section>
                </>
              )}

              {/* ALL ORDERS */}
              {activePage === "orders" && (
                <>
                  <section className="welcome-section">
                    <div>
                      <p className="eyebrow">ORDER MANAGEMENT</p>
                      <h1>All laundry orders</h1>
                      <p className="welcome-subtitle">
                        Manage students, buckets and washing status.
                      </p>
                    </div>

                    <button
                      className="primary-button"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus size={19} /> New order
                    </button>
                  </section>

                  <section className="content-card">
                    <div className="toolbar">
                      <div className="search-box">
                        <Search size={18} />

                        <input
                          placeholder="Search name, room or order ID..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>

                      <div className="filter-box">
                        <Filter size={17} />

                        <select
                          value={filter}
                          onChange={e => setFilter(e.target.value)}
                        >
                          {[
                            "All",
                            "Received",
                            "Washing",
                            "Ready",
                            "Collected"
                          ].map(s => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <OrderTable
                      orders={filteredOrders}
                      updateStatus={updateStatus}
                      updateDecision={updateDecision}
                      copyStudentLink={copyStudentLink}
                      copiedOrderId={copiedOrderId}
                      saving={saving}
                    />
                  </section>
                </>
              )}

              {/* CLOSING REPORT */}
              {activePage === "closing" && (
                <>
                  <section className="welcome-section">
                    <div>
                      <p className="eyebrow">
                        END OF DAY MANAGEMENT
                      </p>

                      <h1>Closing-time report</h1>

                      <p className="welcome-subtitle">
                        Know exactly where every uncollected bucket belongs.
                      </p>
                    </div>
                  </section>

                  <section className="closing-summary">
                    <ClosingCard
                      title="Keep outside"
                      count={closingOrders.filter(
                        o => o.decision === "Outside"
                      ).length}
                      description="Students will collect later"
                      color="green"
                      icon={ArrowUpRight}
                    />

                    <ClosingCard
                      title="Keep inside"
                      count={closingOrders.filter(
                        o => o.decision === "Inside tomorrow"
                      ).length}
                      description="Students will collect tomorrow"
                      color="blue"
                      icon={ArrowDownLeft}
                    />

                    <ClosingCard
                      title="Decision pending"
                      count={closingOrders.filter(
                        o => !o.decision
                      ).length}
                      description="No response received"
                      color="orange"
                      icon={Clock3}
                    />
                  </section>

                  <section className="content-card">
                    <div className="section-header">
                      <div>
                        <h2>Ready but not collected</h2>
                        <p>
                          Review instructions before closing the laundry room.
                        </p>
                      </div>

                      <span className="total-pill">
                        {closingOrders.length} buckets
                      </span>
                    </div>

                    <div className="closing-list">
                      {closingOrders.length === 0 ? (
                        <div className="empty-state">
                          <CheckCircle2 size={34} />
                          <h3>All caught up!</h3>
                          <p>
                            No uncollected ready buckets at the moment.
                          </p>
                        </div>
                      ) : (
                        closingOrders.map(order => (
                          <div
                            className="closing-row"
                            key={order.id}
                          >
                            <div className="order-avatar">
                              {(order.name || "?").charAt(0)}
                            </div>

                            <div className="closing-person">
                              <strong>{order.name}</strong>
                              <span>
                                {order.id} · Room {order.room}
                              </span>
                            </div>

                            <div className="closing-action">
                              <PreferenceBadge value={order.decision} />

                              <select
                                disabled={saving}
                                value={order.decision || ""}
                                onChange={e =>
                                  updateDecision(
                                    order.id,
                                    e.target.value || null
                                  )
                                }
                              >
                                <option value="">Pending</option>
                                <option value="Outside">
                                  Keep outside
                                </option>
                                <option value="Inside tomorrow">
                                  Keep inside
                                </option>
                              </select>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </>
              )}

            </>
          )}
        </div>
      </main>

      {/* Mobile navigation */}
      <nav className="mobile-nav">
        {navItems.map(item => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              className={activePage === item.id ? "selected" : ""}
              onClick={() => navigate(item.id)}
            >
              <Icon size={21} />

              <span>
                {item.id === "closing"
                  ? "Closing"
                  : item.id === "dashboard"
                    ? "Home"
                    : "Orders"}
              </span>
            </button>
          );
        })}
      </nav>

      {/* New order modal */}
      {showForm && (
        <NewOrderModal
          onClose={() => setShowForm(false)}
          onSubmit={addOrder}
          saving={saving}
        />
      )}

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={21} />
      </div>

      <div className="stat-number">{value}</div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  );
}

function ClosingCard({ title, count, description, color, icon: Icon }) {
  return (
    <div className="closing-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={21} />
      </div>

      <div className="stat-number">{count}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function OrderTable({
  orders,
  updateStatus,
  updateDecision,
  copyStudentLink,
  copiedOrderId,
  saving
}) {
  if (!orders.length) {
    return (
      <div className="empty-state">
        <Package size={35} />
        <h3>No orders found</h3>
        <p>Try another search or add a new laundry order.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="orders-table">
        <thead>
          <tr>
            <th>STUDENT</th>
            <th>ORDER / ROOM</th>
            <th>STATUS</th>
            <th>COLLECTION</th>
            <th>ACTION</th>
            <th>STUDENT LINK</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>
                <div className="student-cell">
                  <div className="order-avatar">
                    {(order.name || "?").charAt(0)}
                  </div>

                  <div>
                    <strong>{order.name}</strong>
                    <span>{order.roll}</span>
                  </div>
                </div>
              </td>

              <td>
                <strong>{order.id}</strong>
                <span className="table-secondary">
                  Room {order.room}
                </span>
              </td>

              <td>
                <StatusBadge status={order.status} />
              </td>

              <td>
                <PreferenceBadge
                  value={order.decision || order.preference}
                />
              </td>

              <td>
                <select
                  className="status-select"
                  disabled={saving}
                  value={order.status}
                  onChange={e =>
                    updateStatus(order.id, e.target.value)
                  }
                >
                  {[
                    "Received",
                    "Washing",
                    "Ready",
                    "Collected"
                  ].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </td>

              <td>
                {order.status === "Ready" && (
                  <button
                    type="button"
                    className="student-link-button"
                    onClick={() => copyStudentLink(order)}
                    disabled={!order.studentToken}
                  >
                    {copiedOrderId === order.id ? "Copied!" : "Copy Link"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile order list */}
      <div className="mobile-order-list">
        {orders.map(order => (
          <div className="mobile-order-card" key={order.id}>
            <div className="mobile-order-top">
              <div className="student-cell">
                <div className="order-avatar">
                  {(order.name || "?").charAt(0)}
                </div>

                <div>
                  <strong>{order.name}</strong>
                  <span>
                    {order.id} · Room {order.room}
                  </span>
                </div>
              </div>

              <StatusBadge status={order.status} />
            </div>

            <div className="mobile-order-bottom">
              <div>
                <span className="table-secondary">
                  Collection
                </span>

                <PreferenceBadge
                  value={order.decision || order.preference}
                />
              </div>

              <select
                className="status-select"
                disabled={saving}
                value={order.status}
                onChange={e =>
                  updateStatus(order.id, e.target.value)
                }
              >
                {[
                  "Received",
                  "Washing",
                  "Ready",
                  "Collected"
                ].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              {order.status === "Ready" && (
                <button
                  type="button"
                  className="student-link-button"
                  onClick={() => copyStudentLink(order)}
                  disabled={!order.studentToken}
                >
                  {copiedOrderId === order.id
                    ? "Copied!"
                    : "Copy Student Link"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewOrderModal({ onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    room: "",
    roll: "",
    preference: "Outside",
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    onSubmit(form);
  }

  function change(e) {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">NEW REGISTRATION</p>
            <h2>Register laundry order</h2>
            <p>
              Add student details and collection preference.
            </p>
          </div>

          <button
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Student name
              <input
                name="name"
                value={form.name}
                onChange={change}
                placeholder="Enter full name"
                required
              />
            </label>

            <label>
              Phone number
              <input
                name="phone"
                value={form.phone}
                onChange={change}
                placeholder="10-digit number"
                maxLength={10}
                required
              />
            </label>

            <label>
              Room number
              <input
                name="room"
                value={form.room}
                onChange={change}
                placeholder="e.g. B-214"
                required
              />
            </label>

            <label>
              Roll number
              <input
                name="roll"
                value={form.roll}
                onChange={change}
                placeholder="Enter roll number"
                required
              />
            </label>
          </div>

          <div className="form-divider" />

          <div className="preference-field">
            <label>Initial collection preference</label>

            <p>
              What should we do if the student doesn't collect the bucket?
            </p>

            {[
              {
                value: "Outside",
                title: "Keep outside",
                detail: "Student will collect later"
              },
              {
                value: "Inside tomorrow",
                title: "Keep inside",
                detail: "Student will collect tomorrow"
              },
              {
                value: "Same day",
                title: "Same day collection",
                detail: "Student intends to collect today"
              },
            ].map(option => (
              <label
                className={`preference-option ${
                  form.preference === option.value ? "chosen" : ""
                }`}
                key={option.value}
              >
                <input
                  type="radio"
                  name="preference"
                  value={option.value}
                  checked={form.preference === option.value}
                  onChange={change}
                />

                <span>
                  <strong>{option.title}</strong>
                  <small>{option.detail}</small>
                </span>
              </label>
            ))}
          </div>

          <div className="price-row">
            <span>Price per bucket</span>
            <strong>₹10</strong>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              <Plus size={18} />
              {saving ? "Registering..." : "Register order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/decision/:token" element={<StudentDecision />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
