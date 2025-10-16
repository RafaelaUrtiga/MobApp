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
import { useAuth } from "../../context/AuthContext";

const schema = Yup.object().shape({
  name: Yup.string().required("Obrigatório"),
  email: Yup.string().email("Email inválido").required("Obrigatório"),
  password: Yup.string().min(4, "Mínimo 4").required("Obrigatório"),
});

export default function RegisterScreen() {
  const { signUp } = useAuth();

  return (
    <View style={s.container}>
      <Text style={s.title}>Criar conta</Text>
      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (vals, { setSubmitting }) => {
          try {
            await signUp(vals.name, vals.email, vals.password);
          } catch (e: any) {
            Alert.alert("Erro", e.message || "Não foi possível cadastrar");
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
              placeholder="Nome"
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              value={values.name}
            />
            {touched.name && errors.name && (
              <Text style={s.err}>{errors.name}</Text>
            )}

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

            <TextInput
              style={s.input}
              placeholder="Senha"
              secureTextEntry
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
            />
            {touched.password && errors.password && (
              <Text style={s.err}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={s.btn}
              onPress={() => handleSubmit()}
              disabled={isSubmitting}
            >
              <Text style={s.btnText}>Cadastrar</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  err: { color: "red", marginBottom: 6 },
});
