'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import Link from "next/link";
import { IoSearchOutline } from "react-icons/io5";
import { PiCurrencyDollarSimple } from "react-icons/pi";
import { FiSend } from "react-icons/fi";
import { IoPersonAddOutline } from "react-icons/io5";
import { CiTrash } from "react-icons/ci";
import { MdOutlineCall } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { BiLogOutCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase";
import Dollar from "../Dollar/page";

function Main() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [dollar, setDollar] = useState(false)
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageName = localStorage.getItem("userName");
      const storageEmail = localStorage.getItem("email");
      setUserName(storageName || "");
      setUserEmail(storageEmail || "");
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const q = query(
      collection(db, "clients"),
      where("email", "==", userEmail)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    });

    return () => unsubscribe();
  }, [userEmail]);

  // حذف العميل
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "clients", id));
    } catch (error) {
      console.error("خطأ أثناء الحذف:", error);
    }
  };

  // فلترة البحث
  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    if(typeof window !== 'undefined') {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className={styles.main}>
      <Dollar dollar={dollar} setDollar={setDollar}/>
      <div className={styles.header}>
        <div className={styles.name}>
          <h2>مرحبا, <br /> {userName}👋</h2>
        </div>
        <div className={styles.icon}>
          <div className={openSearch ? `${styles.inputContainer} ${styles.open}` : `${styles.inputContainer}`}>
            <label onClick={() => setOpenSearch(!openSearch)}><IoSearchOutline /></label>
            <input
              type="text"
              placeholder="ابحث عن شخص"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              list="clientsList"
            />
            <datalist id="clientsList">
              {clients.map(client => (
                <option key={client.id} value={client.name} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className={styles.btns}>
        <button onClick={() => router.push('/clients')}>
          <span><IoPersonAddOutline /></span>
          <span>عميل جديد</span>
        </button>
        <button onClick={() => setDollar(true)}>
          <span><PiCurrencyDollarSimple /></span>
          <span>سعر الدولار</span>
        </button>
        <button onClick={handleLogout}>
          <span><BiLogOutCircle /></span>
          <span> تسجيل الخروج</span>
        </button>
      </div>
      <div className={styles.clientsContainer}>
        <div className={styles.title}>
          <h3>كل العملاء المتاحين</h3>
        </div>
        <div className={styles.content}>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div className={styles.card} key={client.id}>
                <div className={styles.cardHead}>
                  <div className={styles.text}>
                    <p>{client.name ? client.name[0] : "?"}</p>
                    <strong>{client.name}</strong>
                  </div>
                  <button onClick={() => handleDelete(client.id)}>
                    <CiTrash />
                  </button>
                </div>
                <hr />
                <div className={styles.cardBody}>
                  <p>
                    <span><MdOutlineCall /></span>
                    <span>{client.phone}</span>
                  </p>
                  <Link href={`/info/${encodeURIComponent(client.id)}`} className={styles.clientPage}>
                    <span>صفحة العميل</span>
                    <span><MdKeyboardArrowLeft /></span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>لا يوجد عملاء حاليا</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Main;
