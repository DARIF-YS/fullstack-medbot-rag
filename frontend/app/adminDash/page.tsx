"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiMessageSquare,
  FiMail,
  FiSearch,
  FiLogOut,
  FiTrash2,
  FiEye,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

// ------------------- INTERFACES -------------------
interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  picture?: string;
}

interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  created_at: string;
}

interface UserStats {
  conversations: number;
  messages: number;
  last_active: string | null;
}

interface Stats {
  users: number;
  conversations: number;
  messages: number;
  active_today: number;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

// ------------------- MODAL -------------------
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-slideUp">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-4">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ------------------- DASHBOARD -------------------
export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    conversations: 0,
    messages: 0,
    active_today: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userConversations, setUserConversations] = useState<Conversation[]>(
    []
  );
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "deleteUser" | "deleteConversation" | "deleteMessage" | null;
    data: any;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: null,
    data: null,
    title: "",
    message: "",
  });

  const usersPerPage = 10;
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  
    
  useEffect(() => {
    if (!token) router.push("/adminLogin");
    else {
      fetchStats();
      fetchUsers();
    }
  }, [token]);

  useEffect(() => {
  if (!token) return;

  const interval = setInterval(async () => {
    try {
      // -------------------- USERS --------------------
      const resUsers = await fetch("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resUsers.ok) throw new Error();
      const newUsers: User[] = await resUsers.json();
      if (newUsers.length !== users.length) {
        setUsers(newUsers);
        toast.success("La liste des utilisateurs a été mise à jour !");
      }

      // ---------------- CONVERSATIONS ----------------
      if (selectedUser) {
        const resConvs = await fetch(
          `http://localhost:8000/admin/users/${selectedUser.id}/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!resConvs.ok) throw new Error();
        const newConversations: Conversation[] = await resConvs.json();
        if (newConversations.length !== userConversations.length) {
          setUserConversations(newConversations);
          toast.success(`Les conversations de ${selectedUser.name} ont été mises à jour !`);
        }
      }

      // ------------------- MESSAGES -------------------
      if (selectedConversation) {
        const resMsgs = await fetch(
          `http://localhost:8000/admin/conversations/${selectedConversation.id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!resMsgs.ok) throw new Error();
        const newMessages: Message[] = await resMsgs.json();
        if (newMessages.length !== messages.length) {
          setMessages(newMessages);
          toast.success(`Les messages de "${selectedConversation.title}" ont été mis à jour !`);
        }
      }

      // ------------------- STATS -------------------
      const resStats = await fetch("http://localhost:8000/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resStats.ok) throw new Error();
      const newStats: Stats = await resStats.json();
      if (
        newStats.users !== stats.users ||
        newStats.conversations !== stats.conversations ||
        newStats.messages !== stats.messages
      ) {
        setStats(newStats);
      }

    } catch (err) {
      console.error("Erreur mise à jour auto:", err);
    }
  }, 10000); // toutes les 10 secondes

  return () => clearInterval(interval);
}, [token, users, selectedUser, userConversations, selectedConversation, messages, stats]);


  // ---------------- FETCH API ----------------
  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      toast.error("Impossible de charger les statistiques.");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error("Erreur lors du chargement des utilisateurs.");
    }
    setLoading(false);
  };

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) return fetchUsers();
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/admin/users/search?email=${encodeURIComponent(
          searchEmail
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data) {
        setUsers([data]);
        toast.success("Utilisateur trouvé !");
      } else {
        setUsers([]);
        toast.error("Aucun utilisateur trouvé.");
      }
    } catch {
      toast.error("Erreur lors de la recherche.");
    }
    setLoading(false);
  };

  const fetchUserConversations = async (user: User) => {
    setSelectedUser(user);
    setSelectedConversation(null);
    setMessages([]);
    setActiveTab("conversations");
    try {
      const res = await fetch(
        `http://localhost:8000/admin/users/${user.id}/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setUserConversations(await res.json());
      fetchUserStats(user.id);
    } catch {
      toast.error("Impossible de charger les conversations.");
    }
  };

  const fetchUserStats = async (userId: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/admin/users/${userId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setUserStats(await res.json());
    } catch {
      toast.error("Impossible de charger les statistiques utilisateur.");
    }
  };

  
  const fetchConversationMessages = async (conv: Conversation) => {
    setSelectedConversation(conv);
    setActiveTab("messages");
    try {
      const res = await fetch(
        `http://localhost:8000/admin/conversations/${conv.id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setMessages(await res.json());
    } catch {
      toast.error("Impossible de charger les messages.");
    }
  };

  // ---------------- MODAL HANDLERS ----------------
  const openModal = (
    type: "deleteUser" | "deleteConversation" | "deleteMessage",
    data: any
  ) => {
    if (type === "deleteUser") {
      setModal({
        isOpen: true,
        type,
        data,
        title: "Supprimer l'utilisateur",
        message:
          "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses conversations seront également supprimées.",
      });
    } else if (type === "deleteConversation") {
      setModal({
        isOpen: true,
        type,
        data,
        title: "Supprimer la conversation",
        message:
          "Supprimer cette conversation ? Tous les messages associés seront également supprimés.",
      });
    } else if (type === "deleteMessage") {
      setModal({
        isOpen: true,
        type,
        data,
        title: "Supprimer le message",
        message: "Supprimer ce message ?",
      });
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, data: null, title: "", message: "" });
  };

  const handleConfirm = async () => {
    try {
      if (modal.type === "deleteUser") {
        await fetch(`http://localhost:8000/admin/users/${modal.data}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUsers();
        setSelectedUser(null);
        setUserConversations([]);
        setSelectedConversation(null);
        setMessages([]);
        setUserStats(null);
        toast.success("Utilisateur supprimé avec succès !");
      } else if (modal.type === "deleteConversation") {
        await fetch(`http://localhost:8000/admin/conversations/${modal.data}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (selectedUser) fetchUserConversations(selectedUser);
        setSelectedConversation(null);
        setMessages([]);
        toast.success("Conversation supprimée !");
      } else if (modal.type === "deleteMessage") {
        await fetch(`http://localhost:8000/admin/messages/${modal.data}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (selectedConversation) fetchConversationMessages(selectedConversation);
        toast.success("Message supprimé !");
      }

      fetchStats();

    } catch {
      toast.error("Erreur lors de la suppression.");
    }
    closeModal();
  };

  // ---------------- ACTIONS ----------------
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    toast.success("Déconnexion réussie !");
    router.push("/adminLogin");
  };

  useEffect(() => {
    if (searchEmail.trim() === "") fetchUsers();
  }, [searchEmail]);

  
  // Pagination
  const indexOfLastUser = usersPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber: number) => setUsersPage(pageNumber);

  // ---------------- RENDER ----------------
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* TOASTER EN BAS */}
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />

      {/* HEADER */}
      <header className="bg-[#0A2342] text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center ">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="h-10 w-13 object-contain m-0"
            />
            <h1 className="text-xl font-bold">
              Admin Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-[#FFD300] text-[#0A2342] rounded-lg hover:bg-yellow-400 active:scale-95 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {/* ... (le reste de ton code de rendu est identique, pas besoin de répéter) ... */}

    <main className="flex-1 container mx-auto p-4 md:p-6">
        {/* STATS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-bold">{stats.users}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <FiMessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Conversations</p>
              <p className="text-2xl font-bold">{stats.conversations}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <FiMail size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Messages</p>
              <p className="text-2xl font-bold">{stats.messages}</p>
            </div>
          </div>
        </section>

        {/* RECHERCHE UTILISATEUR */}
        <section className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
            <FiSearch className="mr-2" /> Rechercher un utilisateur
          </h2>

          <div className="flex gap-2 items-center">
            {/* Input avec bouton "vider" */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Adresse email"
                className="w-full border border-gray-300 p-3 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUserByEmail()}
              />
              {searchEmail && (
                <button
                  onClick={() => setSearchEmail("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Bouton Rechercher */}
            <button
              onClick={searchUserByEmail}
              className="px-4 py-3 bg-[#0A2342] text-white rounded-lg hover:bg-blue-800 transition flex items-center font-medium"
            >
              <FiSearch className="mr-2" /> Rechercher
            </button>
          </div>
        </section>


        {/* TABS NAVIGATION */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden border border-gray-100">
          <div className="flex border-b overflow-x-auto">
            <button
              className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === "users" ? "border-b-2 border-[#0A2342] text-[#0A2342]" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("users")}
            >
              Utilisateurs
            </button>
            {selectedUser && (
              <button
                className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === "conversations" ? "border-b-2 border-[#0A2342] text-[#0A2342]" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("conversations")}
              >
                Conversations
              </button>
            )}
            {selectedConversation && (
              <button
                className={`py-3 px-6 font-medium whitespace-nowrap ${activeTab === "messages" ? "border-b-2 border-[#0A2342] text-[#0A2342]" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("messages")}
              >
                Messages
              </button>
            )}
          </div>

          {/* UTILISATEURS TAB */}
          {activeTab === "users" && (
            <div className="p-5">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Liste des Utilisateurs</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0A2342]"></div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                          <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition">
                            <td className="p-3 text-sm text-gray-700">{user.id}</td>
                            <td className="p-3 text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="p-3 text-sm text-gray-700">{user.email}</td>
                            <td className="p-3 text-sm text-gray-700">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => fetchUserConversations(user)}
                                  className="p-2 bg-[#0A2342] text-white rounded-lg hover:bg-blue-800 transition"
                                  title="Voir conversations"
                                >
                                  <FiEye />
                                </button>
                                <button 
                                  onClick={() => openModal("deleteUser", user.id)}
                                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                  title="Supprimer"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {users.length > usersPerPage && (
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => paginate(usersPage - 1)}
                        disabled={usersPage === 1}
                        className={`px-4 py-2 rounded-lg flex items-center ${usersPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        <FiChevronLeft className="inline mr-1" /> Précédent
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {usersPage} sur {totalPages}
                      </span>
                      <button
                        onClick={() => paginate(usersPage + 1)}
                        disabled={usersPage === totalPages}
                        className={`px-4 py-2 rounded-lg flex items-center ${usersPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        Suivant <FiChevronRight className="inline ml-1" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* CONVERSATIONS TAB */}
          {activeTab === "conversations" && selectedUser && (
            <div className="p-5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Conversations de {selectedUser.name}</h2>
                
                {/* USER STATS */}
                {userStats && (
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-blue-50 p-2 rounded-lg flex items-center text-sm">
                      <FiMessageSquare className="text-blue-600 mr-2" />
                      <span className="text-blue-800">{userStats.conversations} conversations</span>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg flex items-center text-sm">
                      <FiMail className="text-green-600 mr-2" />
                      <span className="text-green-800">{userStats.messages} messages</span>
                    </div>
                    {userStats.last_active && (
                      <div className="bg-purple-50 p-2 rounded-lg flex items-center text-sm">
                        <FiCalendar className="text-purple-600 mr-2" />
                        <span className="text-purple-800">Dernière activité: {new Date(userStats.last_active).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {userConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  Cet utilisateur n'a aucune conversation.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userConversations.map((conv) => (
                        <tr key={conv.id} className="hover:bg-gray-50 transition">
                          <td className="p-3 text-sm text-gray-700">{conv.id}</td>
                          <td className="p-3 text-sm font-medium text-gray-900">{conv.title}</td>
                          <td className="p-3 text-sm text-gray-700">{new Date(conv.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => fetchConversationMessages(conv)}
                                className="p-2 bg-[#0A2342] text-white rounded-lg hover:bg-blue-800 transition"
                                title="Voir messages"
                              >
                                <FiEye />
                              </button>
                              <button 
                                onClick={() => openModal("deleteConversation", conv.id)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                title="Supprimer"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && selectedConversation && (
            <div className="p-5">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Messages de "{selectedConversation.title}"</h2>
              
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  Cette conversation ne contient aucun message.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50 transition">
                          <td className="p-3 text-sm text-gray-700">{msg.id}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${msg.sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {msg.sender === 'user' ? 'Utilisateur' : 'Assistant'}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-700 max-w-md">{msg.content}</td>
                          <td className="p-3 text-sm text-gray-700">{new Date(msg.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => openModal("deleteMessage", msg.id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                              title="Supprimer"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modal.title}
        message={modal.message}
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}
