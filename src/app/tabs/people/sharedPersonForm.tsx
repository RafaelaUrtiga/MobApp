import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { DB, Event } from "../../../storage/db";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";

const schema = Yup.object().shape({
  name: Yup.string().required("Obrigatório"),
  email: Yup.string().email("Email inválido").optional(),
});

export default function PersonForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const camRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);

  const openCamera = async () => {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert("Permissão", "Permita acesso à câmera para tirar a foto.");
      return;
    }
    setShowCamera(true);
  };

  const takePhoto = async () => {
    if (!camRef.current) return;
    const pic = await camRef.current.takePictureAsync({ quality: 0.7 });
    setPhotoUri(pic.uri);
    setShowCamera(false);
  };

  if (showCamera) {
    return (
      <CameraView style={{ flex: 1 }} facing="back" ref={camRef}>
        <View
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={takePhoto}
            style={{
              backgroundColor: "#fff",
              width: 72,
              height: 72,
              borderRadius: 36,
            }}
          />
        </View>
      </CameraView>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={s.title}>{isEdit ? "Editar Pessoa" : "Nova Pessoa"}</Text>
      <Formik
        enableReinitialize
        initialValues={{ name: "", email: "" }}
        validationSchema={schema}
        onSubmit={async (vals) => {
          if (!eventId) {
            Alert.alert("Evento", "Crie e selecione um evento primeiro.");
            return;
          }
          await DB.savePerson({
            id: id as string | undefined,
            name: vals.name,
            email: vals.email,
            eventId,
            photoUri,
          });
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
            <Text style={{ marginBottom: 6 }}>
              Evento: {events.find((e) => e.id === eventId)?.title || "—"}
            </Text>

            <TextInput
              style={s.input}
              placeholder="Nome"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
            />
            {touched.name && errors.name && (
              <Text style={s.err}>{errors.name}</Text>
            )}

            <TextInput
              style={s.input}
              placeholder="Email"
              autoCapitalize="none"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />
            {touched.email && errors.email && (
              <Text style={s.err}>{errors.email}</Text>
            )}

            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  marginVertical: 10,
                }}
              />
            ) : null}

            <TouchableOpacity
              style={[s.btn, { backgroundColor: "#888" }]}
              onPress={openCamera}
            >
              <Text style={s.btnText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.btn} onPress={() => handleSubmit()}>
              <Text style={s.btnText}>{isEdit ? "Salvar" : "Cadastrar"}</Text>
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
