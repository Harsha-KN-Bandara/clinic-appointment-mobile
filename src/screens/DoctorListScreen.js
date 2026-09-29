import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const DoctorListScreen = ({ navigation }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const loadDoctors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/doctors");
      setDoctors(response.data);
    } catch (err) {
      console.log(err);
      setError("Couldn't load doctors. Pull down to try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDoctors();
    }, [])
  );

  const handleDelete = (doctor) => {
    Alert.alert(
      "Delete Doctor",
      `Delete ${doctor.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/doctors/${doctor._id}`);
              loadDoctors();
            } catch (err) {
              Alert.alert(
                "Delete Failed",
                err.response?.data?.message || "Something went wrong"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0d3b66" />
        <Text style={styles.helperText}>Loading doctors…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={loadDoctors} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Doctors</Text>

        <View style={styles.headerButtons}>
          <Button
            title="My Appointments"
            onPress={() => navigation.navigate("MyAppointments")}
          />

          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddEditDoctor")}
        >
          <Text style={styles.addButtonText}>+ Add Doctor</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={doctors}
        keyExtractor={(item) => item._id}
        onRefresh={loadDoctors}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.helperText}>No doctors available right now.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("DoctorDetail", {
                doctor: item,
              })
            }
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
            )}

            <View style={styles.cardInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.specialization}</Text>
              <Text>Consultation Fee: Rs. {item.consultationFee}</Text>
              <Text>Daily Capacity: {item.dailyCapacity}</Text>

              {isAdmin && (
                <View style={styles.adminButtons}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AddEditDoctor", { doctor: item })
                    }
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
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

  header: {
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },

  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#d32f2f",
    borderRadius: 6,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },

  addButton: {
    backgroundColor: "#0d3b66",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    flexDirection: "row",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },

  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#eee",
  },

  thumbnailPlaceholder: {
    backgroundColor: "#eee",
  },

  cardInfo: {
    flex: 1,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  adminButtons: {
    flexDirection: "row",
    marginTop: 10,
  },

  editButton: {
    backgroundColor: "#0d3b66",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 10,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#d32f2f",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },

  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default DoctorListScreen;