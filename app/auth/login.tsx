import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Link } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const schema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("Obrigatório"),
  password: Yup.string().min(4, "Mínimo 4").required("Obrigatório"),
});

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={s.container}>
      <Text style={s.title}>Entrar</Text>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (vals, { setSubmitting }) => {
          try {
            await signIn(vals.email, vals.password);
          } catch (e: any) {
            Alert.alert("Erro", e.message || "Não foi possível entrar");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <TextInput
              style={s.input}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              value={values.email}
            />
            {touched.email && errors.email && (
              <Text style={s.err}>{errors.email}</Text>
            )}

            {/* Campo de senha com ícone dentro do TextInput */}
            <View style={s.inputWrapper}>
              <TextInput
                style={[s.input, s.inputWithIcon]}
                placeholder="Senha"
                secureTextEntry={!showPassword}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={s.iconBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={s.err}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={s.btn}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
            >
              <Text style={s.btnText}>Entrar</Text>
            </TouchableOpacity>

            <Link href="/auth/register" style={s.link}>
              Não tem conta? Cadastre-se
            </Link>
          </>
        )}
      </Formik>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  // Wrapper para posicionar o ícone sobre o TextInput
  inputWrapper: {
    position: "relative",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 42, // espaço para o ícone
    marginBottom: 0,
  },
  inputWithIcon: {
    // extra se quiser ajustar altura, etc.
  },
  // Botão do ícone posicionado dentro do input (lado direito)
  iconBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -11 }], // metade do tamanho do ícone (22/2)
    padding: 4,
  },
  btn: {
    backgroundColor: "#0066cc",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  err: { color: "red", marginBottom: 6 },
  link: { color: "#0066cc", marginTop: 16, textAlign: "center" },
});
