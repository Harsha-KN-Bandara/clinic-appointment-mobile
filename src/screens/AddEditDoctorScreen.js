import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import api from "../services/api";

// Reused for both "Add Doctor" and "Edit Doctor" — route.params.doctor
// is present only when editing.
const AddEditDoctorScreen = ({ route, navigation }) => {
  const existingDoctor = route.params?.doctor;
  const isEditing = Boolean(existingDoctor);

  const [name, setName] = useState(existingDoctor?.name || "");
  const [specialization, setSpecialization] = useState(
    existingDoctor?.specialization || ""
  );
  const [consultationFee, setConsultationFee] = useState(
    existingDoctor ? String(existingDoctor.consultationFee) : ""
  );
  const [dailyCapacity, setDailyCapacity] = useState(
    existingDoctor ? String(existingDoctor.dailyCapacity) : ""
  );
  const [isAvailable, setIsAvailable] = useState(
    existingDoctor ? existingDoctor.isAvailable : true
  );
  const [imageAsset, setImageAsset] = useState(null); // newly picked image, if any
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to choose a doctor image"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageAsset(result.assets[0]);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) nextErrors.name = "Name is required";
    if (!specialization.trim())
      nextErrors.specialization = "Specialization is required";

    const fee = Number(consultationFee);
    if (!consultationFee.trim() || Number.isNaN(fee) || fee < 0) {
      nextErrors.consultationFee = "Enter a fee of 0 or more";
    }

    const capacity = Number(dailyCapacity);
    if (
      !dailyCapacity.trim() ||
      !Number.isInteger(capacity) ||
      capacity <= 0
    ) {
      nextErrors.dailyCapacity = "Enter a whole number greater than 0";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("specialization", specialization.trim());
    formData.append("consultationFee", consultationFee.trim());
    formData.append("dailyCapacity", dailyCapacity.trim());
    formData.append("isAvailable", String(isAvailable));

    if (imageAsset) {
      const filename = imageAsset.uri.split("/").pop();
      formData.append("image", {
        uri: imageAsset.uri,
        name: filename,
        type: imageAsset.mimeType || "image/jpeg",
      });
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/doctors/${existingDoctor._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/doctors", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      Alert.alert("Success", isEditing ? "Doctor updated" : "Doctor added", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        "Save Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayImage = imageAsset?.uri || existingDoctor?.image;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Edit Doctor" : "Add Doctor"}
      </Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>Tap to choose photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[styles.input, errors.name && styles.inputError]}
        placeholder="Dr Nimal Perera"
      />
      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

      <Text style={styles.label}>Specialization</Text>
      <TextInput
        value={specialization}
        onChangeText={setSpecialization}
        style={[styles.input, errors.specialization && styles.inputError]}
        placeholder="General Physician"
      />
      {errors.specialization ? (
        <Text style={styles.errorText}>{errors.specialization}</Text>
      ) : null}

      <Text style={styles.label}>Consultation Fee (Rs.)</Text>
      <TextInput
        value={consultationFee}
        onChangeText={setConsultationFee}
        keyboardType="numeric"
        style={[styles.input, errors.consultationFee && styles.inputError]}
        placeholder="2000"
      />
      {errors.consultationFee ? (
        <Text style={styles.errorText}>{errors.consultationFee}</Text>
      ) : null}

      <Text style={styles.label}>Daily Capacity</Text>
      <TextInput
        value={dailyCapacity}
        onChangeText={setDailyCapacity}
        keyboardType="numeric"
        style={[styles.input, errors.dailyCapacity && styles.inputError]}
        placeholder="10"
      />
      {errors.dailyCapacity ? (
        <Text style={styles.errorText}>{errors.dailyCapacity}</Text>
      ) : null}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Available</Text>
        <Switch value={isAvailable} onValueChange={setIsAvailable} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isEditing ? "Save Changes" : "Add Doctor"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  imagePicker: {
    alignSelf: "center",
    marginBottom: 20,
  },

  image: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#eee",
  },

  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },

  imagePlaceholderText: {
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 10,
  },

  label: {
    fontSize: 14,
    color: "#444",
    marginTop: 10,
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
  },

  inputError: {
    borderColor: "#d32f2f",
  },

  errorText: {
    color: "#d32f2f",
    fontSize: 13,
    marginTop: 4,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  button: {
    backgroundColor: "#0d3b66",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddEditDoctorScreen;