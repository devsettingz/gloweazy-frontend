/**
 * Admin Index
 * Redirects to the admin dashboard
 */

import { useEffect } from "react";
import { Redirect } from "expo-router";

export default function AdminIndex() {
  // Redirect to the dashboard
  return <Redirect href="/admin/dashboard" />;
}
