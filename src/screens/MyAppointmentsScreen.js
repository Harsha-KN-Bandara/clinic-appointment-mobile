import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../services/api";

const MyAppointmentsScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/appointments/my");
      setAppointments(response.data);
    } catch (err) {
      console.log(err);
      setError("Couldn't load your appointments. Pull down or reopen this screen to try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  const cancelAppointment = async (id) => {
    try {
      await api.patch(`/appointments/${id}/cancel`);
      Alert.alert("Success", "Appointment cancelled");
      loadAppointments();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to cancel appointment"
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0d3b66" />
        <Text style={styles.helperText}>Loading your appointments…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadAppointments} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        onRefresh={loadAppointments}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.helperText}>
              You don't have any appointments yet. Book one from the doctors list.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.doctor}>{item.doctorId?.name}</Text>
            <Text>Specialization: {item.doctorId?.specialization}</Text>
            <Text>
              Date: {new Date(item.appointmentDate).toLocaleDateString()}
            </Text>
            <Text>Time: {item.timeSlot}</Text>
            <Text>Status: {item.status}</Text>

            {item.status !== "Cancelled" && item.status !== "Completed" && (
              <Button
                title="Cancel"
                onPress={() => cancelAppointment(item._id)}
              />
            )}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 15,
  },

  helperText: {
    marginTop: 10,
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },

  errorText: {
    fontSize: 15,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 12,
  },

  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  doctor: {
    fontSize: 19,
    fontWeight: "bold",
  },
});

export default MyAppointmentsScreen;