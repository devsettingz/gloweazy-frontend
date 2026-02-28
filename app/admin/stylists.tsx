/**
 * Admin Stylist Management
 * View, approve, and feature stylists
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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getStylists, approveStylist, featureStylist } from "../../utils/adminApi";

interface Stylist {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string[];
  bio?: string;
  location?: string;
  isApproved: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  profileImage?: string;
}

export default function AdminStylists() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "featured">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);

  useEffect(() => {
    loadStylists();
  }, [searchQuery, filter]);

  const loadStylists = async () => {
    try {
      setLoading(true);
      const params: any = { search: searchQuery };
      if (filter === "pending") params.approved = false;
      if (filter === "approved") params.approved = true;
      
      const data = await getStylists(params);
      let stylistsData = data.stylists || [];
      
      // Filter featured locally since API might not support it
      if (filter === "featured") {
        stylistsData = stylistsData.filter((s: Stylist) => s.isFeatured);
      }
      
      setStylists(stylistsData);
    } catch (error) {
      console.error("Failed to load stylists:", error);
      Alert.alert("Error", "Failed to load stylists");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (stylist: Stylist) => {
    Alert.alert(
      "Approve Stylist",
      `Are you sure you want to approve ${stylist.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await approveStylist(stylist._id);
              loadStylists();
              Alert.alert("Success", `${stylist.name} has been approved`);
            } catch (error) {
              Alert.alert("Error", "Failed to approve stylist");
            }
          },
        },
      ]
    );
  };

  const handleFeature = async (stylist: Stylist) => {
    const action = stylist.isFeatured ? "unfeature" : "feature";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Stylist`,
      `Are you sure you want to ${action} ${stylist.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await featureStylist(stylist._id, !stylist.isFeatured);
              loadStylists();
              Alert.alert("Success", `${stylist.name} has been ${action}d`);
            } catch (error) {
              Alert.alert("Error", `Failed to ${action} stylist`);
            }
          },
        },
      ]
    );
  };

  const openStylistDetail = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setModalVisible(true);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color="#FF9500"
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Actions */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stylists..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadStylists}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {["all", "pending", "approved", "featured"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stylists.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {stylists.filter((s) => !s.isApproved).length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {stylists.filter((s) => s.isFeatured).length}
          </Text>
          <Text style={styles.statLabel}>Featured</Text>
        </View>
      </View>

      {/* Stylists List */}
      {loading ? (
        <ActivityIndicator size="large" color="#E75480" style={styles.loader} />
      ) : (
        <ScrollView style={styles.stylistList}>
          {stylists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cut" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No stylists found</Text>
            </View>
          ) : (
            stylists.map((stylist) => (
              <TouchableOpacity
                key={stylist._id}
                style={styles.stylistCard}
                onPress={() => openStylistDetail(stylist)}
              >
                <View style={styles.stylistHeader}>
                  <View style={styles.stylistAvatar}>
                    {stylist.profileImage ? (
                      <Image source={{ uri: stylist.profileImage }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{stylist.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View style={styles.stylistInfo}>
                    <Text style={styles.stylistName}>{stylist.name}</Text>
                    <Text style={styles.stylistEmail}>{stylist.email}</Text>
                    {stylist.location && (
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.locationText}>{stylist.location}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.badges}>
                    {stylist.isFeatured && (
                      <View style={styles.featuredBadge}>
                        <Ionicons name="star" size={12} color="#FFFFFF" />
                      </View>
                    )}
                    {!stylist.isApproved && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingText}>Pending</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.stylistDetails}>
                  {stylist.specialty && stylist.specialty.length > 0 && (
                    <View style={styles.specialties}>
                      {stylist.specialty.slice(0, 3).map((spec, idx) => (
                        <View key={idx} style={styles.specialtyTag}>
                          <Text style={styles.specialtyText}>{spec}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.stylistStats}>
                    {renderStars(stylist.rating || 0)}
                    <Text style={styles.ratingText}>
                      {stylist.rating?.toFixed(1) || "0.0"} ({stylist.reviewCount || 0} reviews)
                    </Text>
                  </View>
                </View>

                <View style={styles.stylistActions}>
                  {!stylist.isApproved && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(stylist)}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      stylist.isFeatured ? styles.unfeatureBtn : styles.featureBtn,
                    ]}
                    onPress={() => handleFeature(stylist)}
                  >
                    <Ionicons
                      name={stylist.isFeatured ? "star-outline" : "star"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionBtnText}>
                      {stylist.isFeatured ? "Unfeature" : "Feature"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Stylist Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStylist && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    {selectedStylist.profileImage ? (
                      <Image
                        source={{ uri: selectedStylist.profileImage }}
                        style={styles.modalAvatarImage}
                      />
                    ) : (
                      <Text style={styles.modalAvatarText}>
                        {selectedStylist.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.modalHeaderInfo}>
                    <Text style={styles.modalName}>{selectedStylist.name}</Text>
                    <Text style={styles.modalEmail}>{selectedStylist.email}</Text>
                    <View style={styles.modalBadges}>
                      {selectedStylist.isApproved ? (
                        <View style={styles.approvedBadge}>
                          <Text style={styles.approvedText}>Approved</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingBadgeLarge}>
                          <Text style={styles.pendingTextLarge}>Pending Approval</Text>
                        </View>
                      )}
                      {selectedStylist.isFeatured && (
                        <View style={styles.featuredBadgeLarge}>
                          <Ionicons name="star" size={12} color="#FFFFFF" />
                          <Text style={styles.featuredText}>Featured</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedStylist.bio && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Bio</Text>
                      <Text style={styles.detailText}>{selectedStylist.bio}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Contact</Text>
                    <View style={styles.contactItem}>
                      <Ionicons name="mail-outline" size={16} color="#666" />
                      <Text style={styles.contactText}>{selectedStylist.email}</Text>
                    </View>
                    {selectedStylist.phone && (
                      <View style={styles.contactItem}>
                        <Ionicons name="call-outline" size={16} color="#666" />
                        <Text style={styles.contactText}>{selectedStylist.phone}</Text>
                      </View>
                    )}
                    {selectedStylist.location && (
                      <View style={styles.contactItem}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.contactText}>{selectedStylist.location}</Text>
                      </View>
                    )}
                  </View>

                  {selectedStylist.specialty && selectedStylist.specialty.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Specialties</Text>
                      <View style={styles.specialtiesWrap}>
                        {selectedStylist.specialty.map((spec, idx) => (
                          <View key={idx} style={styles.specialtyTagLarge}>
                            <Text style={styles.specialtyTextLarge}>{spec}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Rating</Text>
                    <View style={styles.ratingRow}>
                      {renderStars(selectedStylist.rating || 0)}
                      <Text style={styles.ratingValue}>
                        {selectedStylist.rating?.toFixed(1) || "0.0"}
                      </Text>
                      <Text style={styles.reviewCount}>
                        ({selectedStylist.reviewCount || 0} reviews)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Member Since</Text>
                    <Text style={styles.detailText}>
                      {new Date(selectedStylist.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Close</Text>
                  </TouchableOpacity>
                  {!selectedStylist.isApproved && (
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.approveModalBtn]}
                      onPress={() => {
                        setModalVisible(false);
                        handleApprove(selectedStylist);
                      }}
                    >
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
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
  refreshButton: {
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
  statsRow: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  loader: {
    marginTop: 50,
  },
  stylistList: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
  },
  stylistCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  stylistHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stylistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E75480",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  stylistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  stylistName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  stylistEmail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  badges: {
    alignItems: "flex-end",
  },
  featuredBadge: {
    backgroundColor: "#FF9500",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  pendingBadge: {
    backgroundColor: "#FF3B3020",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FF3B30",
  },
  stylistDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  specialties: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  specialtyTag: {
    backgroundColor: "#E7548020",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: "#E75480",
    fontWeight: "500",
  },
  stylistStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
  },
  stylistActions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  approveBtn: {
    backgroundColor: "#34C759",
  },
  featureBtn: {
    backgroundColor: "#FF9500",
  },
  unfeatureBtn: {
    backgroundColor: "#8E8E93",
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E75480",
    justifyContent: "center",
    alignItems: "center",
  },
  modalAvatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  modalAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  modalHeaderInfo: {
    flex: 1,
    marginLeft: 15,
  },
  modalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  modalBadges: {
    flexDirection: "row",
    marginTop: 8,
  },
  approvedBadge: {
    backgroundColor: "#34C75920",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34C759",
  },
  pendingBadgeLarge: {
    backgroundColor: "#FF3B3020",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  pendingTextLarge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
  },
  featuredBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9500",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  modalBody: {
    maxHeight: 300,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  specialtiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specialtyTagLarge: {
    backgroundColor: "#E7548020",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  specialtyTextLarge: {
    fontSize: 13,
    color: "#E75480",
    fontWeight: "500",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
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
  approveModalBtn: {
    backgroundColor: "#34C759",
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
