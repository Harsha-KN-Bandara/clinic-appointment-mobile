import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DoctorListScreen from "../screens/DoctorListScreen";
import DoctorDetailScreen from "../screens/DoctorDetailScreen";
import BookAppointmentScreen from "../screens/BookAppointmentScreen";
import MyAppointmentsScreen from "../screens/MyAppointmentsScreen";
import AddEditDoctorScreen from "../screens/AddEditDoctorScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Doctors" component={DoctorListScreen} />
            <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
            <Stack.Screen
              name="BookAppointment"
              component={BookAppointmentScreen}
            />
            <Stack.Screen
              name="MyAppointments"
              component={MyAppointmentsScreen}
            />
            <Stack.Screen
              name="AddEditDoctor"
              component={AddEditDoctorScreen}
              options={({ route }) => ({
                title: route.params?.doctor ? "Edit Doctor" : "Add Doctor",
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;