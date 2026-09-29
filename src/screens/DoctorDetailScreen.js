import React from "react";

import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
} from "react-native";

const DoctorDetailScreen = ({ route, navigation }) => {
  const { doctor } = route.params;

  return (
    <View style={styles.container}>
      {doctor.image ? (
        <Image
          source={{ uri: doctor.image }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoPlaceholderText}>No photo available</Text>
        </View>
      )}

      <Text style={styles.name}>{doctor.name}</Text>

      <Text style={styles.text}>
        Specialization: {doctor.specialization}
      </Text>

      <Text style={styles.text}>
        Consultation Fee: Rs. {doctor.consultationFee}
      </Text>

      <Text style={styles.text}>
        Daily Capacity: {doctor.dailyCapacity}
      </Text>

      <Text style={styles.text}>
        Status: {doctor.isAvailable ? "Available" : "Unavailable"}
      </Text>

      <Button
        title="Book Appointment"
        disabled={!doctor.isAvailable}
        onPress={() =>
          navigation.navigate("BookAppointment", {
            doctor,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  photo: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#eee",
  },

  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },

  photoPlaceholderText: {
    color: "#888",
  },

  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  text: {
    fontSize: 17,
    marginBottom: 12,
  },
});

export default DoctorDetailScreen;