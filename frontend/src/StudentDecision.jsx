import { useEffect, useState } from "react";
import {
  Shirt,
  CheckCircle2,
  Clock3,
  Package,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getStudentOrder,
  submitStudentDecision,
} from "./services/orderServices";

import "./StudentDecision.css";

const decisions = [
  {
    value: "Collect now",
    title: "Collect Now",
    description: "I will collect my laundry shortly.",
    icon: Package,
  },
  {
    value: "Outside",
    title: "Keep Outside",
    description: "Keep my laundry outside. I will collect it later.",
    icon: MapPin,
  },
  {
    value: "Inside tomorrow",
    title: "Keep Inside",
    description: "Keep my laundry safely inside until tomorrow.",
    icon: Clock3,
  },
];

export default function StudentDecision() {
  const token = window.location.pathname.split("/").filter(Boolean).pop();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await getStudentOrder(token);
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [token]);

  async function handleDecision(decision) {
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const updatedOrder = await submitStudentDecision(token, decision);

      setOrder((previous) => ({
        ...previous,
        ...updatedOrder,
      }));

      setSuccess("Your preference has been saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="student-state">
        <Loader2 className="spin" size={32} />
        <p>Loading your laundry details...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="student-page">
        <div className="student-card state-card">
          <AlertCircle size={38} color="#dc2626" />
          <h2>Unable to open your link</h2>
          <p>{error}</p>
          <span>Please contact the laundry room if you need assistance.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-brand">
          <div className="student-logo">
            <Shirt size={25} />
          </div>
          <span>LaundryMate</span>
        </div>

        <div className="student-heading">
          <span className="student-eyebrow">LAUNDRY UPDATE</span>
          <h1>Your laundry is ready!</h1>
          <p>Please tell us how you would like to collect your laundry.</p>
        </div>

        <div className="student-order-info">
          <div>
            <span>Student</span>
            <strong>{order?.name}</strong>
          </div>

          <div>
            <span>Room</span>
            <strong>{order?.room}</strong>
          </div>

          <div>
            <span>Order ID</span>
            <strong>{order?.id}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong className="ready-status">
              <CheckCircle2 size={15} />
              {order?.status}
            </strong>
          </div>
        </div>

        <div className="decision-heading">
          <h2>How would you like your laundry?</h2>
          <span>Choose one option</span>
        </div>

        <div className="decision-options">
          {decisions.map((item) => {
            const Icon = item.icon;
            const selected = order?.decision === item.value;

            return (
              <button
                key={item.value}
                className={`decision-option ${selected ? "selected" : ""}`}
                onClick={() => handleDecision(item.value)}
                disabled={submitting}
              >
                <div className="decision-icon">
                  <Icon size={22} />
                </div>

                <div className="decision-copy">
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </div>

                <div className="decision-check">
                  {selected && <CheckCircle2 size={21} />}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="student-message error-message">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {success && (
          <div className="student-message success-message">
            <CheckCircle2 size={17} />
            {success}
          </div>
        )}

        {submitting && (
          <div className="submitting-message">
            <Loader2 className="spin" size={17} />
            Saving your preference...
          </div>
        )}

        <p className="student-footer">
          LaundryMate · Making hostel laundry simpler
        </p>
      </div>
    </div>
  );
}