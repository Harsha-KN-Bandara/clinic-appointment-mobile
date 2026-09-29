import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import api from "../services/api";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const BookAppointmentScreen = ({ route, navigation }) => {
  const { doctor } = route.params;

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!date.trim()) {
      nextErrors.date = "Date is required";
    } else if (!DATE_REGEX.test(date.trim())) {
      nextErrors.date = "Use the format YYYY-MM-DD, e.g. 2026-10-05";
    } else {
      const entered = new Date(date.trim());
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(entered.getTime())) {
        nextErrors.date = "That date doesn't exist";
      } else if (entered < today) {
        nextErrors.date = "Date cannot be in the past";
      }
    }

    if (!timeSlot.trim()) {
      nextErrors.timeSlot = "Time slot is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const bookAppointment = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post("/appointments", {
        doctorId: doctor._id,
        appointmentDate: date.trim(),
        timeSlot: timeSlot.trim(),
      });

      Alert.alert("Success", "Appointment booked successfully", [
        { text: "OK", onPress: () => navigation.navigate("MyAppointments") },
      ]);
    } catch (error) {
      // Server-side rules (capacity full, slot taken, etc.) surface here,
      // since they can't be checked on the client alone.
      Alert.alert(
        "Booking Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book with {doctor.name}</Text>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        placeholder="2026-10-05"
        value={date}
        onChangeText={(value) => {
          setDate(value);
          if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
        }}
        style={[styles.input, errors.date && styles.inputError]}
      />
      {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

      <Text style={styles.label}>Time slot</Text>
      <TextInput
        placeholder="10:00 AM - 10:30 AM"
        value={timeSlot}
        onChangeText={(value) => {
          setTimeSlot(value);
          if (errors.timeSlot)
            setErrors((prev) => ({ ...prev, timeSlot: null }));
        }}
        style={[styles.input, errors.timeSlot && styles.inputError]}
      />
      {errors.timeSlot ? (
        <Text style={styles.errorText}>{errors.timeSlot}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={bookAppointment}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Booking</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 20,
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

export default BookAppointmentScreen;