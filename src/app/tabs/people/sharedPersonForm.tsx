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
import { DB, Event, Person } from "../../../storage/db";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Picker } from "@react-native-picker/picker";

const schema = Yup.object().shape({
  name: Yup.string().required("Obrigatório"),
  email: Yup.string().email("Email inválido").optional(),
});

export default function PersonForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [events, setEvents] = useState<Event[]>([]);
  // Estado: null => nenhum selecionado. Quando salvar, convertemos para "" se necessário.
  const [eventId, setEventId] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
  });

  const camRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);

  // Carrega eventos e, se for edição, carrega a pessoa
  useEffect(() => {
    let mounted = true;
    (async () => {
      const eventos = await DB.listEvents();
      if (!mounted) return;
      setEvents(eventos);

      if (isEdit && id) {
        const people = await DB.listPeople();
        const person = people.find((p) => p.id === id);
        if (person && mounted) {
          setInitialValues({
            name: person.name ?? "",
            email: person.email ?? "",
          });
          // se eventId for string vazia no storage, interpretamos como "nenhum"
          setEventId(person.eventId ? person.eventId : null);
          setPhotoUri(person.photoUri ?? undefined);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

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
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={async (vals) => {
          // Se nenhum evento selecionado, gravamos "" (string vazia) porque seu DB exige eventId string
          const eventIdToSave = eventId ?? "";
          await DB.savePerson({
            id: id as string | undefined,
            name: vals.name,
            email: vals.email,
            eventId: eventIdToSave,
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

            <View style={{ marginBottom: 8 }}>
              <Text style={{ marginBottom: 6 }}>
                Selecionar evento (opcional)
              </Text>
              <Picker
                selectedValue={eventId ?? ""}
                onValueChange={(v) => setEventId(v === "" ? null : v)}
              >
                <Picker.Item label="Nenhum" value="" />
                {events.map((e) => (
                  <Picker.Item key={e.id} label={e.title} value={e.id} />
                ))}
              </Picker>
            </View>

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
              <Text style={s.btnText}>Tirar foto (opcional)</Text>
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
