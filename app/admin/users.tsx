/**
 * Admin Users Management
 * View, create, edit, and manage all users
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from "../../utils/adminApi";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "client" | "stylist" | "admin";
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    phone: "",
  });

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({
        search: searchQuery,
        role: roleFilter,
      });
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      setModalVisible(false);
      setFormData({ name: "", email: "", password: "", role: "client", phone: "" });
      loadUsers();
      Alert.alert("Success", "User created successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to create user");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      });
      setModalVisible(false);
      setEditingUser(null);
      loadUsers();
      Alert.alert("Success", "User updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to update user");
    }
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to deactivate ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user._id);
              loadUsers();
              Alert.alert("Success", "User deactivated");
            } catch (error) {
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = (user: User) => {
    Alert.prompt(
      "Reset Password",
      `Enter new password for ${user.name}:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async (password) => {
            if (password) {
              try {
                await resetUserPassword(user._id, password);
                Alert.alert("Success", "Password reset successfully");
              } catch (error) {
                Alert.alert("Error", "Failed to reset password");
              }
            }
          },
        },
      ],
      "secure-text"
    );
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "client", phone: "" });
    setModalVisible(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
    });
    setModalVisible(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "#FF3B30";
      case "stylist":
        return "#007AFF";
      default:
        return "#34C759";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {["", "client", "stylist", "admin"].map((role) => (
          <TouchableOpacity
            key={role || "all"}
            style={[styles.filterButton, roleFilter === role && styles.filterButtonActive]}
            onPress={() => setRoleFilter(role)}
          >
            <Text style={[styles.filterText, roleFilter === role && styles.filterTextActive]}>
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Users List */}
      {loading ? (
        <ActivityIndicator size="large" color="#E75480" style={styles.loader} />
      ) : (
        <ScrollView style={styles.userList}>
          {users.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <View
                      style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + "20" }]}
                    >
                      <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                        {user.role}
                      </Text>
                    </View>
                    {!user.isActive && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveText}>Inactive</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(user)}>
                  <Ionicons name="create" size={18} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleResetPassword(user)}>
                  <Ionicons name="key" size={18} color="#FF9500" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteUser(user)}>
                  <Ionicons name="trash" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Create/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? "Edit User" : "Create New User"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            {!editingUser && (
              <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Phone (optional)"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />

            <View style={styles.roleSelector}>
              {["client", "stylist", "admin"].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, formData.role === role && styles.roleOptionActive]}
                  onPress={() => setFormData({ ...formData, role })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === role && styles.roleOptionTextActive,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={editingUser ? handleUpdateUser : handleCreateUser}
              >
                <Text style={styles.saveBtnText}>
                  {editingUser ? "Save Changes" : "Create User"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: "#E75480",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  filters: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  filterButtonActive: {
    backgroundColor: "#E75480",
    borderColor: "#E75480",
  },
  filterText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  loader: {
    marginTop: 50,
  },
  userList: {
    flex: 1,
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#E75480",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  userMeta: {
    flexDirection: "row",
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "#FF3B3020",
    marginLeft: 8,
  },
  inactiveText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FF3B30",
  },
  userActions: {
    flexDirection: "row",
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  roleOption: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 4,
    alignItems: "center",
  },
  roleOptionActive: {
    backgroundColor: "#E75480",
  },
  roleOptionText: {
    color: "#666",
    fontWeight: "500",
  },
  roleOptionTextActive: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: "#F5F5F5",
  },
  cancelBtnText: {
    color: "#666",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#E75480",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
