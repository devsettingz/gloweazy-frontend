import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileInfoScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Info</Text>
      <Text style={styles.item}>Name: {user?.name ?? "N/A"}</Text>
      <Text style={styles.item}>Email: {user?.email ?? "N/A"}</Text>
      <Text style={styles.item}>Role: {user?.role ?? "N/A"}</Text>
      <Text style={styles.item}>Bio: {user?.bio ?? "No bio provided"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  item: { fontSize: 16, marginBottom: 8 },
});
