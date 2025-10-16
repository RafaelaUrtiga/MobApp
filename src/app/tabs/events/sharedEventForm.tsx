import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { DB } from "../../../storage/db";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";

const schema = Yup.object().shape({
  title: Yup.string().required("Obrigatório"),
  date: Yup.string().required("Obrigatório"),
  location: Yup.string().optional(),
  description: Yup.string().optional(),
});

export default function EventForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const [initial, setInitial] = useState({
    title: "",
    date: new Date().toISOString(),
    location: "",
    description: "",
  });

  useEffect(() => {
    (async () => {
      if (isEdit) {
        const e = await DB.getEvent(id!);
        if (e)
          setInitial({
            title: e.title,
            date: e.date,
            location: e.location || "",
            description: e.description || "",
          });
      }
    })();
  }, [id]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={s.title}>{isEdit ? "Editar Evento" : "Novo Evento"}</Text>
      <Formik
        enableReinitialize
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (vals) => {
          await DB.saveEvent({ id: id as string | undefined, ...vals });
          router.back();
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <TextInput
              style={s.input}
              placeholder="Título"
              value={values.title}
              onChangeText={handleChange("title")}
              onBlur={handleBlur("title")}
            />
            {touched.title && errors.title && (
              <Text style={s.err}>{errors.title}</Text>
            )}

            <TextInput
              style={s.input}
              placeholder="Data ISO (YYYY-MM-DDTHH:mm:ssZ)"
              value={values.date}
              onChangeText={handleChange("date")}
              onBlur={handleBlur("date")}
            />
            {touched.date && errors.date && (
              <Text style={s.err}>{errors.date}</Text>
            )}

            <TextInput
              style={s.input}
              placeholder="Local"
              value={values.location}
              onChangeText={handleChange("location")}
            />
            <TextInput
              style={[s.input, { height: 100 }]}
              multiline
              placeholder="Descrição"
              value={values.description}
              onChangeText={handleChange("description")}
            />

            <TouchableOpacity style={s.btn} onPress={() => handleSubmit()}>
              <Text style={s.btnText}>{isEdit ? "Salvar" : "Criar"}</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
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
  err: { color: "red" },
});
