import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";

// Screens
import PostsScreen from "../screens/posts/PostsScreen";
import PostDetailScreen from "../screens/posts/PostDetailScreen";
import CreateEditPostScreen from "../screens/posts/CreateEditPostScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import UsersScreen from "../screens/users/UsersScreen";
import UserDetailScreen from "../screens/users/UserDetailScreen";
import TestConnectionScreen from "../screens/TestConnectionScreen";
import CreateUserScreen from "../screens/users/CreateUserScreen";

export type RootStackParamList = {
  Posts:
    | { refresh?: boolean; updatedPostId?: string; newPost?: boolean }
    | undefined;
  PostDetail: { postId: string };
  Login: undefined;
  Register: undefined;
  CreatePost: undefined;
  EditPost: { postId: string };
  Users: undefined;
  UserDetail: { userId: string };
  TestConnection: undefined;
  CreateUser: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth(); // Mudei para pegar user completo

  // ⏳ Aguarda carregar usuário do AsyncStorage
  if (loading) {
    return null; // pode colocar splash depois
  }

  const isProfessor = user?.role === "professor";

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Posts"
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#3498db" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {/* 🌍 TELAS PÚBLICAS */}
        <Stack.Screen
          name="Posts"
          component={PostsScreen}
          options={{ title: "Posts Acadêmicos" }}
        />

        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={{ title: "Detalhes do Post" }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Login" }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Criar Conta" }}
        />

        <Stack.Screen
          name="TestConnection"
          component={TestConnectionScreen}
          options={{ title: "Teste de Conexão" }}
        />

        {/* 🔐 TELA USERS - disponível para todos logados */}
        <Stack.Screen
          name="Users"
          component={UsersScreen}
          options={{ title: "Usuários" }}
        />

        <Stack.Screen
          name="UserDetail"
          component={UserDetailScreen}
          options={{ title: "Detalhes do Usuário" }}
        />

        {/* 🔐 TELAS RESTRITAS (somente professor) */}
        {isProfessor && (
          <>
            <Stack.Screen
              name="CreatePost"
              component={CreateEditPostScreen}
              options={{ title: "Criar Novo Post" }}
            />

            <Stack.Screen
              name="EditPost"
              component={CreateEditPostScreen}
              options={{ title: "Editar Post" }}
            />

            <Stack.Screen
              name="CreateUser"
              component={CreateUserScreen}
              options={{ title: "Criar Usuário" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
