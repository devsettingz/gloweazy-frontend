import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { showError, showSuccess } from "../../utils/toast";

export default function ProfileSecurityScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      return showError("Please fill in all fields");
    }
    // TODO: Hook into backend password change endpoint
    showSuccess("Password changed successfully ✅");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Security</Text>

      <TextInput
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <Button title="Change Password" onPress={handleChangePassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
