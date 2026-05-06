import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { canEditTournament, resolveTournamentRole } from "@tenis/shared";

const demoTournament = {
  id: "demo-uuid",
  name: "TeSTE",
  ownerId: "owner-user-id",
};

export default function App() {
  const viewerId = "participant-user-id";
  const role = resolveTournamentRole(demoTournament, viewerId);
  const canEdit = canEditTournament(demoTournament, viewerId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciador de Campeonato</Text>
      <Text style={styles.label}>Mobile pronto (Expo + TypeScript)</Text>
      <Text style={styles.info}>Role compartilhado: {role}</Text>
      <Text style={styles.info}>Pode editar: {canEdit ? "Sim" : "Nao"}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#0f766e",
    marginBottom: 20,
    fontWeight: "700",
  },
  info: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 8,
  },
});
