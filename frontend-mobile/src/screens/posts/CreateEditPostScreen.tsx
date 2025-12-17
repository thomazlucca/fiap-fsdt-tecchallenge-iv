import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../contexts/AuthContext";
import { postApi } from "../../api/postApi";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

type RootStackParamList = {
  CreatePost: undefined;
  EditPost: { postId: string };
  Posts: undefined;
};

type CreateEditPostScreenRouteProp = RouteProp<
  RootStackParamList,
  "CreatePost" | "EditPost"
>;
type CreateEditPostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreatePost" | "EditPost"
>;

interface CreateEditPostScreenProps {
  route: CreateEditPostScreenRouteProp;
  navigation: CreateEditPostScreenNavigationProp;
}

const CreateEditPostScreen: React.FC<CreateEditPostScreenProps> = ({
  route,
  navigation,
}) => {
  const { user } = useAuth();

  // Verificar se estamos editando
  const isEditing = route.params && "postId" in route.params;
  const postId = isEditing && route.params ? route.params.postId : null;

  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
  });

  const [errors, setErrors] = useState<{ titulo?: string; conteudo?: string }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isEditing && postId) {
      loadPost();
    }

    // Definir título da tela
    navigation.setOptions({
      title: isEditing ? "Editar Post" : "Criar Novo Post",
    });
  }, [isEditing, postId]);

  const loadPost = async (): Promise<void> => {
    if (!postId) return;

    try {
      setLoading(true);
      const post = await postApi.getById(postId);
      setFormData({
        titulo: post.titulo || "",
        conteudo: post.conteudo || "",
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar o post");
      console.error("Erro ao carregar post:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { titulo?: string; conteudo?: string } = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = "Título deve ter pelo menos 3 caracteres";
    }

    if (!formData.conteudo.trim()) {
      newErrors.conteudo = "Conteúdo é obrigatório";
    } else if (formData.conteudo.length < 10) {
      newErrors.conteudo = "Conteúdo deve ter pelo menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpa erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // IMPORTANTE: Não enviar campo 'autor' - backend pega do token
      const postData = {
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        // NÃO enviar 'autor' aqui
      };

      console.log("📤 Salvando post:", { isEditing, postId, postData });

      if (isEditing && postId) {
        const response = await postApi.update(postId, postData);
        console.log("✅ Post atualizado:", response);

        Alert.alert("Sucesso", "Post atualizado com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              // Navegar de volta com flag de refresh
              navigation.navigate("Posts", {
                refresh: true,
                updatedPostId: postId,
              });
            },
          },
        ]);
      } else {
        const response = await postApi.create(postData);
        console.log("✅ Post criado:", response);

        Alert.alert("Sucesso", "Post criado com sucesso!", [
          {
            text: "OK",
            onPress: () => {
              // Navegar para posts com flag de refresh
              navigation.navigate("Posts", {
                refresh: true,
                newPost: true,
              });
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Erro ao salvar post:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Não foi possível salvar o post";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Erro", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    if (formData.titulo || formData.conteudo) {
      Alert.alert(
        "Descartar alterações?",
        "Tem certeza que deseja descartar as alterações?",
        [
          { text: "Continuar editando", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Ionicons name="document-text-outline" size={48} color="#bdc3c7" />
          <Text style={styles.loadingText}>Carregando post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <Ionicons name="arrow-back" size={24} color="#3498db" />
            </TouchableOpacity>

            <Text style={styles.title}>
              {isEditing ? "Editar Post" : "Novo Post"}
            </Text>

            <View style={styles.headerRight} />
          </View>

          <View style={styles.form}>
            <Input
              label="Título"
              placeholder="Digite o título do post"
              value={formData.titulo}
              onChangeText={(value) => handleChange("titulo", value)}
              error={errors.titulo}
              editable={!saving}
              maxLength={100}
            />

            <View style={styles.charCount}>
              <Text style={styles.charCountText}>
                {formData.titulo.length}/100 caracteres
              </Text>
            </View>

            <Input
              label="Conteúdo"
              placeholder="Digite o conteúdo do post..."
              value={formData.conteudo}
              onChangeText={(value) => handleChange("conteudo", value)}
              error={errors.conteudo}
              editable={!saving}
              multiline
              numberOfLines={8}
              style={styles.contentInput}
              textAlignVertical="top"
            />

            <View style={styles.charCount}>
              <Text style={styles.charCountText}>
                {formData.conteudo.length} caracteres
              </Text>
            </View>

            <View style={styles.authorContainer}>
              <Ionicons
                name="person-circle-outline"
                size={16}
                color="#7f8c8d"
              />
              <Text style={styles.authorText}>
                Autor: {user?.nome || "Você"}
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                title="Cancelar"
                onPress={handleCancel}
                type="outline"
                disabled={saving}
                style={styles.cancelButton}
              />

              <Button
                title={
                  saving ? "Salvando..." : isEditing ? "Atualizar" : "Publicar"
                }
                onPress={handleSave}
                disabled={saving}
                style={styles.saveButton}
              />
            </View>

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Dicas para um bom post:</Text>
              <Text style={styles.tip}>• Seja claro e objetivo no título</Text>
              <Text style={styles.tip}>
                • Use parágrafos para organizar o conteúdo
              </Text>
              <Text style={styles.tip}>• Revise antes de publicar</Text>
              {user?.role === "professor" && (
                <Text style={styles.tip}>
                  • Como professor, seu post será visível para todos
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  form: {
    padding: 20,
  },
  contentInput: {
    minHeight: 200,
    textAlignVertical: "top",
  },
  charCount: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  charCountText: {
    fontSize: 12,
    color: "#95a5a6",
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  authorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#7f8c8d",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  tipsContainer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default CreateEditPostScreen;
