const API_URL = "http://localhost:5000/api/orders";

// Fetch all orders
export async function getOrders() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const data = await response.json();
  return data.orders;
}

// Create a new order
export async function createOrder(orderData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create order");
  }

  return data.order;
}

// Update order status
export async function updateOrderStatus(id, status) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update status");
  }

  return data.order;
}

// Update student's collection decision
export async function updateOrderDecision(id, decision) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}/decision`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update decision");
  }

  return data.order;
}
export async function getStudentOrder(token) {
  const response = await fetch(
    `${API_URL}/student/${encodeURIComponent(token)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load laundry details");
  }

  return data.order;
}

export async function submitStudentDecision(token, decision) {
  const response = await fetch(
    `${API_URL}/student/${encodeURIComponent(token)}/decision`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decision }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit decision");
  }

  return data.order;
}