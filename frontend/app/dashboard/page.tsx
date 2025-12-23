"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FiLogOut,
  FiTrash,
  FiPlus,
  FiMic,
  FiMicOff,
  FiVolume2,
  FiVolumeX,
  FiEdit2,
  FiX,
  FiSend,
  FiMenu,
  FiMessageSquare,
} from "react-icons/fi";

interface User {
  id: number;
  name: string;
  email: string;
  picture: string;
}
interface Conversation {
  id: number;
  title: string;
  created_at: string;
}
interface Message {
  id?: number;
  tempId?: string;
  sender: "user" | "assistant";
  content: string;
  created_at: string;
  documents?: { metadata: any; page_content: string }[];
  temp?: boolean;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [newConvTitle, setNewConvTitle] = useState("");
  const [modalCreate, setModalCreate] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [sttActive, setSttActive] = useState(false);
  const [ttsPlayingId, setTtsPlayingId] = useState<number | null>(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const recognitionRef = useRef<any | null>(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [renameConv, setRenameConv] = useState<{ id: number; title: string } | null>(null);

  // === API ===
  const fetchUser = async () => {
  try {
    const res = await axios.get("http://localhost:8000/auth/me", {
      headers: authHeaders,
    });
    setUser(res.data); // compte OK
  } catch (err: any) {
    setUser(null); // on nettoie l'état user
    // Cas compte supprimé ou non autorisé
    if (err.response?.status === 404 || err.response?.status === 401) {
      toast.error("Votre compte n'existe plus ou a été supprimé par l'administrateur. Déconnexion...");
      setTimeout(() => {
        logout(); // redirection + nettoyage
      }, 3700); // délai pour lire le message
    } else {
      toast.error("Erreur lors de la récupération des informations utilisateur");
    }
  }
};

useEffect(() => {
  if (!token) return;

  // check initial
  fetchUser();

  // auto-refresh toutes les 15s
  const interval = setInterval(fetchUser, 20000);

  return () => clearInterval(interval); // nettoyage
}, [token]);


  // === fetchConversations retourne les données pour chaînage ===
  const fetchConversations = async () => {
    try {
      const res = await axios.get("http://localhost:8000/chatbot/conversations", {
        headers: authHeaders,
      });
      setConversations(res.data);
      return res.data;
    } catch {
      toast.error("Erreur chargement conversations");
      return [];
    }
  };

  const fetchMessages = async (convId: number) => {
    setActiveConv(convId);
    try {
      const res = await axios.get(`http://localhost:8000/chatbot/history/${convId}`, {
        headers: authHeaders,
      });
      // Si pas de messages, afficher message d'accueil local avant le premier envoi
      if (!res.data || res.data.length === 0) {
        const welcomeMsg: Message = {
          tempId: `welcome-${convId}`,
          sender: "assistant",
          content:
            "How can I assist you today?",
          created_at: new Date().toISOString(),
          temp: true,
        };
        setMessages([welcomeMsg]);
      } else {
        setMessages(res.data);
      }
    } catch {
      toast.error("Erreur chargement historique");
    }
  };

  const createConversation = async () => {
    if (!newConvTitle.trim()) {
      toast.error("Donnez un titre");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/chatbot/conversations",
        { title: newConvTitle },
        { headers: authHeaders }
      );
      setConversations([...conversations, res.data]);
      setModalCreate(false);
      setNewConvTitle("");
      fetchMessages(res.data.id);
      toast.success("Conversation créée 🎉");
    } catch {
      toast.error("Erreur création");
    }
  };

  const renameConversation = async () => {
    if (!renameConv?.title.trim()) {
      toast.error("Titre invalide");
      return;
    }
    try {
      const res = await axios.patch(
        `http://localhost:8000/chatbot/conversations/${renameConv.id}`,
        { title: renameConv.title },
        { headers: authHeaders }
      );
      setConversations((prev) =>
        prev.map((c) => (c.id === renameConv.id ? { ...c, title: res.data.title } : c))
      );
      setRenameConv(null);
      toast.success("Conversation renommée ✅");
    } catch {
      toast.error("Erreur lors du renommage");
    }
  };

  const deleteConversation = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/chatbot/conversations/${id}`, {
        headers: authHeaders,
      });
      const updatedConversations = conversations.filter((c) => c.id !== id);
      setConversations(updatedConversations);

      // Si la conversation supprimée était active, ou s'il ne reste plus de conversations,
      // reproduire le flux "premier login" : pas de création auto, on réinitialise l'état
      if (updatedConversations.length === 0) {
        setActiveConv(null);
        setMessages([]); // l'UI affiche le message d'accueil quand pas de conversation active
      } else if (activeConv === id) {
        // S'il reste des conversations et que l'on a supprimé la conversation active,
        // on sélectionne la dernière (comportement identique au chargement initial)
        const last = updatedConversations[updatedConversations.length - 1];
        setActiveConv(last.id);
        fetchMessages(last.id);
      }
      toast.success("Conversation supprimée");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const removeMsgFromState = (msg: Message) => {
    setMessages((prev) =>
      prev.filter((m) => {
        if (msg.id) return m.id !== msg.id;
        if (msg.tempId) return m.tempId !== msg.tempId;
        return true;
      })
    );
  };

  const deleteMessage = async (msg: Message) => {
    if (msg.id) {
      try {
        await axios.delete(`http://localhost:8000/chatbot/messages/${msg.id}`, {
          headers: authHeaders,
        });
        removeMsgFromState(msg);
        toast.success("Message supprimé");
      } catch {
        toast.error("Erreur suppression message");
      }
    } else {
      removeMsgFromState(msg);
      toast.success("Message supprimé (local)");
    }
  };

  const sendMessage = async () => {
    if (!question.trim()) return;
    setLoadingSend(true);

    try {
      // Si pas de conversation active, en créer une d'abord
      let convId = activeConv;
      if (!convId) {
        const resConv = await axios.post(
          "http://localhost:8000/chatbot/conversations",
          { title: newConvTitle?.trim() || "Nouvelle conversation" },
          { headers: authHeaders }
        );
        convId = resConv.data.id;
        setConversations((prev) => [...prev, resConv.data]);
        setActiveConv(convId);
        // ajouter un message d'accueil local pour cette nouvelle conversation (optionnel)
        setMessages([
          {
            tempId: `welcome-${convId}`,
            sender: "assistant",
            content:
              "How can I assist you today?",
            created_at: new Date().toISOString(),
            temp: true,
          },
        ]);
      }

      // Créer messages temporaires et afficher immédiatement
      const userTempId = `temp-u-${Date.now()}`;
      const assistantTempId = `temp-a-${Date.now() + 1}`;
      const userMsg: Message = {
        tempId: userTempId,
        sender: "user",
        content: question,
        created_at: new Date().toISOString(),
        temp: true,
      };
      const waitingMsg: Message = {
        tempId: assistantTempId,
        sender: "assistant",
        content: "⏳ En attente...",
        created_at: new Date().toISOString(),
        temp: true,
      };
      setMessages((prev) => [...prev.filter(m => !(m.temp && m.tempId?.startsWith('welcome-'))), userMsg, waitingMsg]);
      const q = question;
      setQuestion("");

      // Envoyer la question au backend avec le conversation_id (nouvelle ou existante)
      const res = await axios.post(
        "http://localhost:8000/chatbot/ask",
        { question: q, conversation_id: convId },
        { headers: authHeaders }
      );
      const returnedConvId = res.data?.conversation_id ?? convId;
      await fetchMessages(returnedConvId);
    } catch (err) {
      toast.error("Erreur envoi");
      // retirer le message assistant temporaire "En attente..."
      setMessages((prev) => prev.filter((m) => !(m.temp && m.sender === "assistant")));
    } finally {
      setLoadingSend(false);
    }
  };

  const dropAccount = async () => {
    try {
      await axios.delete("http://localhost:8000/auth/drop-account", {
        headers: authHeaders,
      });
      localStorage.removeItem("token");
      setUser(null);
      setConversations([]);
      setMessages([]);
      setActiveConv(null);

      router.push("/login");
      toast.success("Compte supprimé ✅");
    } catch {
      toast.error("Erreur suppression compte");
    }
  };

  const logout = () => {
    router.push("/login");
    localStorage.removeItem("token");
    setUser(null);
    setConversations([]);
    setMessages([]);
    setActiveConv(null);
    //toast.success("Déconnecté");
  };

  // === STT ===
  const startSTT = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SpeechRecognition) return toast.error("STT non supporté");
    const recog = new SpeechRecognition();
    recognitionRef.current = recog;
    recog.lang = "fr-FR";
    recog.start();
    setSttActive(true);
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setQuestion((prev) => (prev ? prev + " " + transcript : transcript));
      setSttActive(false);
      recognitionRef.current = null;
    };
    recog.onerror = () => {
      setSttActive(false);
      recognitionRef.current = null;
    };
    recog.onend = () => {
      setSttActive(false);
      recognitionRef.current = null;
    };
  };
  const stopSTT = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setSttActive(false);
  };

  // === TTS ===
  const toggleTTS = (id: number, text: string) => {
    if (ttsPlayingId === id) {
      speechSynthesis.cancel();
      setTtsPlayingId(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.onend = () => setTtsPlayingId(null);
    speechSynthesis.speak(u);
    setTtsPlayingId(id);
  };

  // Scroll to bottom of messages (scroll ONLY the messages container)
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // === Chargement initial ===
  useEffect(() => {
    if (token) {
      fetchUser();
      fetchConversations().then((convs) => {
        // Ne pas créer automatiquement une nouvelle conversation.
        // Si il y a des conversations, on sélectionne la dernière, sinon on reste sans conversation
        if (convs.length === 0) {
          setActiveConv(null);
          setConversations([]);
          setMessages([]);
        } else {
          const last = convs[convs.length - 1];
          setActiveConv(last.id);
          fetchMessages(last.id);
        }
      });
    } else {
      setUser(null);
      setConversations([]);
      setMessages([]);
      setActiveConv(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="flex h-screen w-screen  m-0 bg-white text-[#0A2342] font-sans ">
      <Toaster position="bottom-right" />
      
      {/* Sidebar */}
      <aside className={`w-72 bg-gray-800/90 m-0 text-white flex flex-col shadow-xl transition-all duration-300 z-10 fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#1a3a62]">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h1 className="font-bold font-poppins text-center">🤖 Health Assistant</h1>
            </div>
            {/* Mobile internal close button (visible only on small screens) */}
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer la barre latérale"
              title="Fermer"
              className="md:hidden  text-[#FFD300] p-2 rounded-md shadow-sm transition-colors focus:outline-none"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-3 px-6 h-20 border-b border-[#1a3a62]">
            <img src={user.picture} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#FFD300]" />
            <div className="min-w-0">
              <p className="font-semibold truncate font-poppins">{user.name}</p>
              <p className="text-sm text-gray-300 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Make conversations list scrollable independently */}
        <div className="flex-1 px-3 py-4  space-y-2 overflow-y-auto">
          <div className="px-3 py-2 text-xs uppercase text-gray-400 font-semibold tracking-wider">Conversations</div>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                fetchMessages(conv.id);
                setSidebarOpen(false);
              }}
              className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                activeConv === conv.id
                  ? "bg-[#FFD300] text-[#0A2342] font-medium shadow-sm"
                  : "hover:bg-[#1a3a62]"
              }`}
            >
              <span className="truncate flex-1 text-sm">{conv.title}</span>

              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameConv({ id: conv.id, title: conv.title });
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#2a4a72] text-white transition-colors"
                  title="Renommer"
                >
                  <FiEdit2 size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmModal({
                      title: "Supprimer conversation",
                      message: "Êtes-vous sûr de vouloir supprimer cette conversation ?",
                      onConfirm: () => deleteConversation(conv.id),
                    });
                  }}
                  className="p-1.5 rounded-lg hover:bg-[#2a4a72] text-white transition-colors"
                  title="Supprimer"
                >
                  <FiTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-4 border-t border-[#1a3a62] space-y-3">
          <button
            onClick={() => setModalCreate(true)}
            className="flex items-center justify-center gap-2 bg-[#FFD300] text-[#0A2342] px-4 py-3 rounded-xl w-full font-semibold hover:bg-yellow-400 transition-colors shadow-sm hover:shadow font-poppins"
          >
            <FiPlus size={18} /> New conversation
          </button>
          <button
            onClick={() =>
              setConfirmModal({
                title: "Déconnexion",
                message: "Voulez-vous vous déconnecter ?",
                onConfirm: logout,
              })
            }
            className="flex items-center gap-2 text-gray-300 hover:text-[#FFD300] w-full p-2 rounded-lg transition-colors hover:bg-[#1a3a62]"
          >
            <FiLogOut /> Logout
          </button>
          <button
            onClick={() =>
              setConfirmModal({
                title: "Supprimer le compte",
                message: "Cette action est irréversible. Supprimer le compte ?",
                onConfirm: dropAccount,
              })
            }
            className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full p-2 rounded-lg transition-colors hover:bg-[#1a3a62]"
          >
            <FiTrash /> Delete account
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Main Area */}
      <section className={`flex-1 flex flex-col bg-gray-50 relative transition-all ${sidebarOpen ? 'md:ml-72' : 'md:ml-0'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 pt-2 px-6 py-0 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="mr-4 text-[#0A2342]"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label={sidebarOpen ? "Masquer la barre latérale" : "Afficher la barre latérale"}
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className=" p-2 rounded-lg">
                <img src="/logo.png" alt="MedBot" className="h-7 w-auto" />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>

        {/* Messages area - make this the scrollable region */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
          {/* Show welcome before any conversation is created/selected */}
          {!activeConv && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-l font-medium font-poppins text-[#0A2342]">
                How can I assist you today?
              </p>
            </div>
          )}

          {/* Messages for active conversation */}
          {activeConv && (
            <>
              {messages.length > 0 && (
                <div className="text-center py-4">
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    Aujourd'hui
                  </span>
                </div>
              )}

              {messages.map((msg) => {
                const key = msg.id ?? msg.tempId!;
                const docKey = String(key);
                const isExpanded = !!expandedDocs[docKey];
                return (
                  <div
                    key={key}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-5 py-3 rounded-2xl max-w-xl relative transition-all duration-200 ${
                        msg.sender === "user"
                          ? "bg-[#FFD300] text-[#0A2342] shadow-sm"
                          : "bg-white shadow-md border border-gray-100"
                      }`}
                    >
                      <div className="pr-6 text-gray-800">{msg.content}</div>

                      {msg.sender === "assistant" && !msg.temp && (
                        <button
                          onClick={() => msg.id && toggleTTS(msg.id, msg.content)}
                          className="absolute bottom-2 right-2 text-gray-400 hover:text-[#0A2342] p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {ttsPlayingId === msg.id ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setConfirmModal({
                            title: "Supprimer le message",
                            message: "Voulez-vous vraiment supprimer ce message ?",
                            onConfirm: () => deleteMessage(msg),
                          })
                        }
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-md p-1 hover:bg-red-50 transition-colors border border-gray-200"
                      >
                        <FiX size={14} />
                      </button>

                      {msg.sender === "assistant" &&
                        msg.documents &&
                        msg.documents.length > 0 &&
                        !msg.temp && (
                          <div className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <p className="font-semibold mb-2 text-[#0A2342]">📚 Sources :</p>
                            <ul className="space-y-2">
                              {msg.documents.map((d, i) => (
                                <li key={i} className="bg-white p-2 rounded-lg border border-gray-100">
                                  <span className="font-medium text-[#0A2342]">
                                    {d.metadata?.source || "Inconnu"}:
                                  </span>{" "}
                                  {isExpanded
                                    ? d.page_content
                                    : d.page_content.slice(0, 100) + (d.page_content.length > 100 ? "..." : "")}
                                </li>
                              ))}
                            </ul>
                            <button
                              onClick={() =>
                                setExpandedDocs((prev) => ({
                                  ...prev,
                                  [docKey]: !prev[docKey],
                                }))
                              }
                              className="text-[#0A2342] mt-2 text-xs font-medium hover:underline transition-colors flex items-center"
                            >
                              {isExpanded ? "Voir moins" : "Voir plus"}
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area -> footer to keep it fixed below the scrollable messages */}
        <footer className="border-t border-gray-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center space-x-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your health-related question..."
                disabled={loadingSend}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed font-poppins"
              />
              <div className="absolute right-3 top-3">
                {sttActive ? (
                  <button 
                    onClick={stopSTT} 
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                    title="Arrêter la reconnaissance vocale"
                  >
                    <FiMicOff size={16} />
                  </button>
                ) : (
                  <button
                    onClick={startSTT}
                    disabled={loadingSend}
                    className="bg-[#0A2342] text-white p-2 rounded-lg hover:bg-[#1a3a62] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Démarrer la reconnaissance vocale"
                  >
                    <FiMic size={16} />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={loadingSend || !question.trim()}
              className="bg-[#FFD300] text-[#0A2342] font-semibold px-5 py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow font-poppins"
            >
              {loadingSend ? (
                <div className="w-5 h-5 border-2 border-[#0A2342] border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSend size={18} />
              )}
              Send
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-3">
            MedBot may make mistakes. Please verify any important information.
          </p>
        </footer>
      </section>
      
      {/* Modal création */}
      {modalCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 font-poppins text-[#0A2342]">New conversation</h2>
            <input
              type="text"
              value={newConvTitle}
              onChange={(e) => setNewConvTitle(e.target.value)}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent font-poppins"
              placeholder="Titre de la conversation..."
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalCreate(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-poppins"
              >
                Annuler
              </button>
              <button
                onClick={createConversation}
                className="px-4 py-2 bg-[#FFD300] text-[#0A2342] rounded-lg font-semibold hover:bg-yellow-400 transition-colors font-poppins"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal renommage */}
      {renameConv && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold mb-4 font-poppins text-[#0A2342]">Renommer la conversation</h2>
            <input
              type="text"
              value={renameConv.title}
              onChange={(e) => setRenameConv({ ...renameConv, title: e.target.value })}
              className="border border-gray-300 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD300] focus:border-transparent font-poppins"
              placeholder="Nouveau titre..."
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRenameConv(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-poppins"
              >
                Annuler
              </button>
              <button
                onClick={renameConversation}
                className="px-4 py-2 bg-[#FFD300] text-[#0A2342] rounded-lg font-semibold hover:bg-yellow-400 transition-colors font-poppins"
              >
                Renommer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 font-poppins text-[#0A2342]">{confirmModal.title}</h2>
            <p className="mb-6 text-gray-600">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors font-poppins"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-poppins"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* Do NOT hide page scrolling. Let the messages container handle scroll. */
        html, body {
          overflow: hidden;  
        }

        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </main>
  );
}