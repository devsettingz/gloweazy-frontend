/**
 * Admin System Settings
 * Manage platform configuration and send announcements
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getSettings, updateSettings, sendAnnouncement } from "../../utils/adminApi";

interface AppSettings {
  platformFee: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  bookingAdvanceDays: number;
  cancellationPolicy: string;
  enableReviews: boolean;
  enableChat: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"general" | "payments" | "communications">("general");
  
  // Announcement modal
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    target: "all",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data.settings || data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      Alert.alert("Error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await updateSettings(settings);
      Alert.alert("Success", "Settings saved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await sendAnnouncement(announcementForm);
      setAnnouncementModalVisible(false);
      setAnnouncementForm({ title: "", message: "", target: "all" });
      Alert.alert("Success", "Announcement sent successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to send announcement");
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const updateSocialLink = (platform: string, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        socialLinks: { ...settings.socialLinks, [platform]: value },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E75480" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Failed to load settings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSettings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section Tabs */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === "general" && styles.tabButtonActive]}
          onPress={() => setActiveSection("general")}
        >
          <Ionicons
            name="settings-outline"
            size={18}
            color={activeSection === "general" ? "#E75480" : "#666"}
          />
          <Text style={[styles.tabText, activeSection === "general" && styles.tabTextActive]}>
            General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === "payments" && styles.tabButtonActive]}
          onPress={() => setActiveSection("payments")}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color={activeSection === "payments" ? "#E75480" : "#666"}
          />
          <Text style={[styles.tabText, activeSection === "payments" && styles.tabTextActive]}>
            Payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeSection === "communications" && styles.tabButtonActive]}
          onPress={() => setActiveSection("communications")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color={activeSection === "communications" ? "#E75480" : "#666"}
          />
          <Text style={[styles.tabText, activeSection === "communications" && styles.tabTextActive]}>
            Communications
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings Content */}
      <ScrollView style={styles.content}>
        {activeSection === "general" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform Configuration</Text>
            
            {/* Booking Settings */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Booking Settings</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Booking Advance Days</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={String(settings.bookingAdvanceDays || 7)}
                  onChangeText={(value) => updateSetting("bookingAdvanceDays", parseInt(value) || 0)}
                />
                <Text style={styles.inputHelper}>
                  How many days in advance users can book
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cancellation Policy</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  value={settings.cancellationPolicy || ""}
                  onChangeText={(value) => updateSetting("cancellationPolicy", value)}
                  placeholder="Enter cancellation policy..."
                />
              </View>
            </View>

            {/* Feature Toggles */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Features</Text>
              
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Enable Reviews</Text>
                  <Text style={styles.toggleHelper}>Allow clients to leave reviews</Text>
                </View>
                <Switch
                  value={settings.enableReviews}
                  onValueChange={(value) => updateSetting("enableReviews", value)}
                  trackColor={{ false: "#E5E5EA", true: "#E75480" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, styles.toggleRowLast]}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Enable Chat</Text>
                  <Text style={styles.toggleHelper}>Allow in-app messaging</Text>
                </View>
                <Switch
                  value={settings.enableChat}
                  onValueChange={(value) => updateSetting("enableChat", value)}
                  trackColor={{ false: "#E5E5EA", true: "#E75480" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Maintenance Mode */}
            <View style={[styles.settingCard, styles.maintenanceCard]}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={[styles.toggleLabel, styles.maintenanceLabel]}>
                    Maintenance Mode
                  </Text>
                  <Text style={styles.toggleHelper}>
                    Temporarily disable the app for all users
                  </Text>
                </View>
                <Switch
                  value={settings.maintenanceMode}
                  onValueChange={(value) => updateSetting("maintenanceMode", value)}
                  trackColor={{ false: "#E5E5EA", true: "#FF3B30" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

        {activeSection === "payments" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Configuration</Text>
            
            {/* Platform Fee */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Platform Fees</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Platform Fee (%)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={String(settings.platformFee || 10)}
                  onChangeText={(value) => updateSetting("platformFee", parseFloat(value) || 0)}
                />
                <Text style={styles.inputHelper}>
                  Percentage fee charged on each booking
                </Text>
              </View>
            </View>

            {/* Withdrawal Limits */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Withdrawal Limits (GHS)</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minimum Withdrawal</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={String(settings.minWithdrawal || 50)}
                  onChangeText={(value) => updateSetting("minWithdrawal", parseFloat(value) || 0)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Maximum Withdrawal</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={String(settings.maxWithdrawal || 5000)}
                  onChangeText={(value) => updateSetting("maxWithdrawal", parseFloat(value) || 0)}
                />
              </View>
            </View>
          </View>
        )}

        {activeSection === "communications" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact & Social</Text>
            
            {/* Contact Information */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Contact Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Email</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  value={settings.contactEmail || ""}
                  onChangeText={(value) => updateSetting("contactEmail", value)}
                  placeholder="support@example.com"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  value={settings.contactPhone || ""}
                  onChangeText={(value) => updateSetting("contactPhone", value)}
                  placeholder="+233 XX XXX XXXX"
                />
              </View>
            </View>

            {/* Social Links */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Social Media Links</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Facebook</Text>
                <TextInput
                  style={styles.input}
                  value={settings.socialLinks?.facebook || ""}
                  onChangeText={(value) => updateSocialLink("facebook", value)}
                  placeholder="https://facebook.com/..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Instagram</Text>
                <TextInput
                  style={styles.input}
                  value={settings.socialLinks?.instagram || ""}
                  onChangeText={(value) => updateSocialLink("instagram", value)}
                  placeholder="https://instagram.com/..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Twitter</Text>
                <TextInput
                  style={styles.input}
                  value={settings.socialLinks?.twitter || ""}
                  onChangeText={(value) => updateSocialLink("twitter", value)}
                  placeholder="https://twitter.com/..."
                />
              </View>
            </View>

            {/* Announcements */}
            <View style={styles.settingCard}>
              <Text style={styles.cardTitle}>Announcements</Text>
              <Text style={styles.cardSubtitle}>
                Send important announcements to all users
              </Text>
              
              <TouchableOpacity
                style={styles.announcementButton}
                onPress={() => setAnnouncementModalVisible(true)}
              >
                <View style={styles.announcementIconBg}>
                  <Ionicons name="megaphone-outline" size={24} color="#E75480" />
                </View>
                <View style={styles.announcementInfo}>
                  <Text style={styles.announcementTitle}>Send Announcement</Text>
                  <Text style={styles.announcementSubtitle}>
                    Notify users about updates or important info
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Announcement Modal */}
      <Modal visible={announcementModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Announcement</Text>
              <TouchableOpacity onPress={() => setAnnouncementModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Announcement Title"
              value={announcementForm.title}
              onChangeText={(text) => setAnnouncementForm({ ...announcementForm, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Write your announcement message..."
              multiline
              numberOfLines={5}
              value={announcementForm.message}
              onChangeText={(text) => setAnnouncementForm({ ...announcementForm, message: text })}
            />

            <Text style={styles.targetLabel}>Target Audience</Text>
            <View style={styles.targetOptions}>
              {["all", "clients", "stylists"].map((target) => (
                <TouchableOpacity
                  key={target}
                  style={[
                    styles.targetOption,
                    announcementForm.target === target && styles.targetOptionActive,
                  ]}
                  onPress={() => setAnnouncementForm({ ...announcementForm, target })}
                >
                  <Text
                    style={[
                      styles.targetOptionText,
                      announcementForm.target === target && styles.targetOptionTextActive,
                    ]}
                  >
                    {target.charAt(0).toUpperCase() + target.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendAnnouncement}
            >
              <Ionicons name="send-outline" size={18} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Send Announcement</Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    marginTop: 10,
    color: "#FF3B30",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#E75480",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tabNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#E75480",
  },
  tabText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#E75480",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  maintenanceCard: {
    borderColor: "#FF3B30",
    backgroundColor: "#FF3B3008",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: -10,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputHelper: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  toggleRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  maintenanceLabel: {
    color: "#FF3B30",
  },
  toggleHelper: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  announcementButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F7",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E7548030",
  },
  announcementIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFE4EC",
    justifyContent: "center",
    alignItems: "center",
  },
  announcementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  announcementSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E75480",
    margin: 15,
    padding: 16,
    borderRadius: 12,
    marginTop: 0,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
    marginTop: 5,
  },
  targetOptions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  targetOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  targetOptionActive: {
    backgroundColor: "#E75480",
  },
  targetOptionText: {
    fontSize: 14,
    color: "#666",
  },
  targetOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E75480",
    padding: 16,
    borderRadius: 12,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
