/**
 * Stylist Services Management
 * Path: /stylist/services
 * Protected route - stylist role only
 */

import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../../context/AuthContext";
import withRoleGuard from "../../utils/withRoleGuard";
import api from "../../utils/api";
import { Service } from "../../types/booking";

// Duration options in minutes
const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240];

// Service categories
const CATEGORIES = ["Hair", "Nails", "Spa", "Makeup", "Barber", "Waxing", "Other"];

// Empty service template
const EMPTY_SERVICE: Omit<Service, "id" | "stylistId"> = {
  name: "",
  description: "",
  price: 0,
  durationMinutes: 60,
  category: "Hair",
  imageUrl: undefined,
};

function ServicesScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>(EMPTY_SERVICE);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const res = await api.get('/stylist/services');
      // setServices(res.data.services || []);

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 600));
      const mockServices: Service[] = [
        {
          id: "svc_1",
          name: "Haircut & Styling",
          description: "Professional haircut with wash and style",
          price: 45,
          durationMinutes: 60,
          stylistId: user?.id || "",
          category: "Hair",
        },
        {
          id: "svc_2",
          name: "Hair Coloring",
          description: "Full color treatment with premium products",
          price: 85,
          durationMinutes: 120,
          stylistId: user?.id || "",
          category: "Hair",
        },
        {
          id: "svc_3",
          name: "Box Braids",
          description: "Classic box braids with your choice of length",
          price: 120,
          durationMinutes: 180,
          stylistId: user?.id || "",
          category: "Hair",
        },
      ];
      setServices(mockServices);
    } catch (err) {
      console.error("Error fetching services:", err);
      Toast.show({
        type: "error",
        text1: "Failed to load services",
        text2: "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open modal for adding new service
  const openAddModal = () => {
    setCurrentService(EMPTY_SERVICE);
    setIsEditing(false);
    setEditingId(null);
    setModalVisible(true);
  };

  // Open modal for editing existing service
  const openEditModal = (service: Service) => {
    setCurrentService({ ...service });
    setIsEditing(true);
    setEditingId(service.id);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setCurrentService(EMPTY_SERVICE);
    setIsEditing(false);
    setEditingId(null);
  };

  // Validate service data
  const validateService = (): boolean => {
    if (!currentService.name?.trim()) {
      Toast.show({
        type: "error",
        text1: "Service name required",
        text2: "Please enter a name for your service",
      });
      return false;
    }
    if (!currentService.description?.trim()) {
      Toast.show({
        type: "error",
        text1: "Description required",
        text2: "Please describe your service",
      });
      return false;
    }
    if (!currentService.price || currentService.price <= 0) {
      Toast.show({
        type: "error",
        text1: "Invalid price",
        text2: "Price must be greater than 0",
      });
      return false;
    }
    return true;
  };

  // Save service (create or update)
  const saveService = async () => {
    if (!validateService()) return;

    try {
      setSaving(true);

      const serviceData = {
        ...currentService,
        price: Number(currentService.price),
        durationMinutes: currentService.durationMinutes || 60,
      };

      if (isEditing && editingId) {
        // Update existing service
        // TODO: Replace with actual API call
        // await api.put(`/stylist/services/${editingId}`, serviceData);
        
        // Optimistic update
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? { ...s, ...serviceData, id: editingId, stylistId: s.stylistId }
              : s
          )
        );

        Toast.show({
          type: "success",
          text1: "Service updated",
          text2: "Changes saved successfully ✅",
        });
      } else {
        // Create new service
        // TODO: Replace with actual API call
        // const res = await api.post('/stylist/services', serviceData);
        
        // Mock create
        const newService: Service = {
          ...serviceData,
          id: `svc_${Date.now()}`,
          stylistId: user?.id || "",
        } as Service;
        
        setServices((prev) => [...prev, newService]);

        Toast.show({
          type: "success",
          text1: "Service created",
          text2: "New service added to your menu ✅",
        });
      }

      closeModal();
    } catch (err: any) {
      console.error("Save error:", err);
      Toast.show({
        type: "error",
        text1: "Save failed",
        text2: err?.response?.data?.message || "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete service
  const deleteService = (serviceId: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await api.delete(`/stylist/services/${serviceId}`);
              
              setServices((prev) => prev.filter((s) => s.id !== serviceId));
              
              Toast.show({
                type: "success",
                text1: "Service deleted",
                text2: "Removed from your menu",
              });
            } catch (err) {
              Toast.show({
                type: "error",
                text1: "Delete failed",
                text2: "Please try again",
              });
            }
          },
        },
      ]
    );
  };

  // Render service item
  const renderServiceItem = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.serviceActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteService(item.id)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>${item.price}</Text>
          <View style={styles.serviceMeta}>
            <Text style={styles.serviceMetaText}>⏱ {item.durationMinutes} min</Text>
            <Text style={styles.serviceCategory}>{item.category}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💇</Text>
      <Text style={styles.emptyTitle}>No services yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first service to start accepting bookings
      </Text>
      <TouchableOpacity style={styles.emptyAddButton} onPress={openAddModal}>
        <Text style={styles.emptyAddButtonText}>+ Add Your First Service</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Services</Text>
          <Text style={styles.headerSubtitle}>
            {services.length} {services.length === 1 ? "service" : "services"} listed
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Service" : "Add Service"}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Service Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentService.name}
                  onChangeText={(text) =>
                    setCurrentService((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="e.g., Haircut & Styling"
                  placeholderTextColor="#8E8E93"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={currentService.description}
                  onChangeText={(text) =>
                    setCurrentService((prev) => ({ ...prev, description: text }))
                  }
                  placeholder="Describe what this service includes..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price ($) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentService.price?.toString() || ""}
                  onChangeText={(text) =>
                    setCurrentService((prev) => ({
                      ...prev,
                      price: text ? parseFloat(text) : 0,
                    }))
                  }
                  placeholder="0.00"
                  placeholderTextColor="#8E8E93"
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <View style={styles.durationGrid}>
                  {DURATION_OPTIONS.map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationOption,
                        currentService.durationMinutes === duration &&
                          styles.durationOptionSelected,
                      ]}
                      onPress={() =>
                        setCurrentService((prev) => ({
                          ...prev,
                          durationMinutes: duration,
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.durationText,
                          currentService.durationMinutes === duration &&
                            styles.durationTextSelected,
                        ]}
                      >
                        {duration} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        currentService.category === category &&
                          styles.categoryOptionSelected,
                      ]}
                      onPress={() =>
                        setCurrentService((prev) => ({ ...prev, category }))
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          currentService.category === category &&
                            styles.categoryTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Photo Upload Placeholder */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Photo (Optional)</Text>
                <TouchableOpacity style={styles.photoUpload}>
                  <Text style={styles.photoUploadText}>📷 Add Photo</Text>
                  <Text style={styles.photoUploadSubtext}>
                    Showcase your work
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={saveService}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? "Save Changes" : "Create Service"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Bottom spacer */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default withRoleGuard(ServicesScreen, "stylist");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "#E75480",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2C2C2C",
    flex: 1,
    marginRight: 8,
  },
  serviceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FFEBEB",
  },
  actionButtonText: {
    fontSize: 16,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E75480",
  },
  serviceMeta: {
    flexDirection: "row",
    gap: 12,
  },
  serviceMetaText: {
    fontSize: 13,
    color: "#8E8E93",
  },
  serviceCategory: {
    fontSize: 12,
    color: "#8E8E93",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: "#E75480",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyAddButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  closeButton: {
    fontSize: 24,
    color: "#8E8E93",
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#2C2C2C",
    backgroundColor: "#F9F9FB",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#fff",
  },
  durationOptionSelected: {
    backgroundColor: "#E75480",
    borderColor: "#E75480",
  },
  durationText: {
    fontSize: 13,
    color: "#2C2C2C",
  },
  durationTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#fff",
  },
  categoryOptionSelected: {
    backgroundColor: "#E75480",
    borderColor: "#E75480",
  },
  categoryText: {
    fontSize: 13,
    color: "#2C2C2C",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  photoUpload: {
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  photoUploadText: {
    fontSize: 16,
    color: "#E75480",
    fontWeight: "600",
    marginBottom: 4,
  },
  photoUploadSubtext: {
    fontSize: 13,
    color: "#8E8E93",
  },
  saveButton: {
    backgroundColor: "#E75480",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
