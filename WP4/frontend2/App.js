import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomepageApp from "./src/pages/Homepage";
import Dashboard from "./src/pages/dashboard";
import DomainsApp from "./src/pages/DomainsApp";
import CoursesApp from "./src/pages/Coursespage";
import LoginApp from "./src/pages/Login";
import RegisterApp from "./src/pages/Register";
import InstancesApp from "./src/pages/Instancespage";
import ModulesApp from "./src/pages/modulespage";
import ProgressOverview from "./src/pages/ProgressOverview";
import ActivitiesPage from "./src/pages/ActivitiesPage";
import GradedProgressOverview from "./src/pages/GradedProgressOverview";

const Stack = createNativeStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Homepage" component={HomepageApp}/>
                <Stack.Screen name="Domains" component={DomainsApp}/>
                <Stack.Screen name="Courses" component={CoursesApp}/>
                <Stack.Screen name="Dashboard" component={Dashboard}/>
                <Stack.Screen name="Login" component={LoginApp}/>
                <Stack.Screen name="Register" component={RegisterApp}/>
                <Stack.Screen name="Instances" component={InstancesApp}/>
                <Stack.Screen name="Modules" component={ModulesApp}/>
                <Stack.Screen name="Activities" component={ActivitiesPage}/>
                <Stack.Screen name="ProgressOverview" component={ProgressOverview}/>
                <Stack.Screen name="GradedProgressOverview" component={GradedProgressOverview}/>
             </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
