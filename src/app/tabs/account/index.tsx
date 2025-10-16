import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";

export default function AccountScreen() {
  const { user, changePassword, signOut } = useAuth();
  const [pwd, setPwd] = useState("");

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Olá, {user?.name}</Text>
      <Text style={{ color: "#666", marginBottom: 16 }}>{user?.email}</Text>

      <Text style={{ marginBottom: 6 }}>Trocar senha</Text>
      <TextInput
        style={s.input}
        value={pwd}
        onChangeText={setPwd}
        placeholder="Nova senha"
        secureTextEntry
      />
      <TouchableOpacity
        style={s.btn}
        onPress={async () => {
          await changePassword(pwd);
          setPwd("");
        }}
      >
        <Text style={s.btnText}>Salvar senha</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.btn, { backgroundColor: "#d9534f", marginTop: 24 }]}
        onPress={signOut}
      >
        <Text style={s.btnText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  btn: {
    backgroundColor: "#0066cc",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
