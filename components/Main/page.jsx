'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { IoWalletOutline } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { GoGear } from "react-icons/go";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

function Main() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [operations, setOperations] = useState([]);
  const [openOperation, setOpenOperation] = useState(false);
  const [openSittings, setOperSittings] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [total, setTotal] = useState(0);
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [commation, setCommation] = useState("");
  const [wallet, setWallet] = useState("");
  const [cash, setCash] = useState("");
  const [type, setType] = useState("استلام");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageEmail = localStorage.getItem("email");
      if (!storageEmail) {
        console.warn("Email not found in localStorage");
        return;
      }

      setEmail(storageEmail);

      const q = query(collection(db, "snadUsers"), where("email", "==", storageEmail));
      const unsubUsers = onSnapshot(q, (snapshot) => {
        const arr = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setUsers(arr);
      });

      const opQ = query(collection(db, "operations"), where("email", "==", storageEmail));
      const unsubOps = onSnapshot(opQ, (snapshot) => {
        const arr = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setOperations(arr);
      });

      return () => {
        unsubUsers();
        unsubOps();
      };
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      console.log("Users:", users);
      const subtotal = users.reduce((acc, u) => acc + (+u.wallet || 0) + (+u.cash || 0), 0);
      setTotal(subtotal);
    }
  }, [users]);

  const handleAddOperation = async () => {
    if (!amount || !commation) return alert("برجاء ادخال بيانات العملية");

    const date = new Date().toISOString().split("T")[0];
    await addDoc(collection(db, "operations"), { amount, commation, type, email, date });
    await addDoc(collection(db, "reports"), { amount, commation, type, email, date });

    const q = query(collection(db, "snadUsers"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0];
      const ref = doc(db, "snadUsers", docRef.id);
      const data = docRef.data();
      let updateData = {};

      if (type === "استلام") {
        updateData = { wallet: +data.wallet + +amount, cash: +data.cash - +amount };
      } else if (type === "ارسال") {
        updateData = { wallet: +data.wallet - +amount, cash: +data.cash + +amount };
      } else if (type === "مصاريف" || type === "اجل") {
        updateData = {
          cash: +data.cash - +amount,
          expensses: (+data.expensses || 0) + +amount,
        };
      }

      await updateDoc(ref, updateData);
    }

    alert("تم اضافة العملية بنجاح");
    setAmount("");
    setCommation("");
    setType("استلام");
    setOpenOperation(false);
  };

  const handleDeleteOperation = async (id) => {
    await deleteDoc(doc(db, "operations", id));
  };

  const handleUpdateAmount = async () => {
    const q = query(collection(db, "snadUsers"), where("email", "==", email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const ref = doc(db, "snadUsers", snapshot.docs[0].id);
      await updateDoc(ref, { wallet: +wallet, cash: +cash });
      alert("تم تعديل رأس المال بنجاح");
      setWallet("");
      setCash("");
      setOpenSittings(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className={styles.mainContainer}>
      {openOperation && (
        <div className="boxShadow">
          <div className={styles.box}>
            <div className={styles.boxTitle}>
              <h2>عملية جديدة</h2>
              <button onClick={() => setOpenOperation(false)}><IoMdCloseCircleOutline /></button>
            </div>
            <div className={styles.boxContent}>
              <div className="inputContainer">
                <label>قيمة العملية :</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="inputContainer">
                <label>قيمة العمولة :</label>
                <input type="number" value={commation} onChange={(e) => setCommation(e.target.value)} />
              </div>
              <div className="inputContainer">
                <label>نوع العملية :</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="استلام">استلام</option>
                  <option value="ارسال">ارسال</option>
                  <option value="مصاريف">مصاريف</option>
                  <option value="اجل">اجل</option>
                </select>
              </div>
              <button onClick={handleAddOperation}>اكمل العملية</button>
            </div>
          </div>
        </div>
      )}

      {openSittings && (
        <div className="boxShadow">
          <div className={styles.box}>
            <div className={styles.boxTitle}>
              <h2>الاعدادات</h2>
              <button onClick={() => setOperSittings(false)}><IoMdCloseCircleOutline /></button>
            </div>
            <div className={styles.boxContent}>
              <div className="inputContainer">
                <label>قيمة المحافظ :</label>
                <input type="number" value={wallet} onChange={(e) => setWallet(e.target.value)} />
              </div>
              <div className="inputContainer">
                <label>قيمة الكاش :</label>
                <input type="number" value={cash} onChange={(e) => setCash(e.target.value)} />
              </div>
              <button onClick={handleUpdateAmount}>اكمل العملية</button>
              <button onClick={handleLogout}>تسجيل الخروج</button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.title}>
          <h2>رأس المال</h2>
          <strong>{total} جنيه</strong>
        </div>
        <div className={styles.btns}>
          <button onClick={() => setOpenOperation(true)}><IoWalletOutline /></button>
          <button onClick={() => router.push("/reports")}><TbReportSearch /></button>
          <button onClick={() => setOperSittings(true)}><GoGear /></button>
        </div>
      </div>

      <div className={styles.content}>
        {operations.map((op, i) => (
          <div
            key={op.id}
            onClick={() => setActiveCard(activeCard === i ? null : i)}
            className={`${styles.card} ${activeCard === i ? styles.active : ""}`}
          >
            <div className={styles.cardHead}>
              <h2>{op.type}</h2>
              <button onClick={() => handleDeleteOperation(op.id)}><FaTrashAlt /></button>
            </div>
            <hr />
            <div className={styles.cardBody}>
              <strong>قيمة العملية : {op.amount} جنيه</strong>
              <strong>قيمة العمولة : {op.commation} جنيه</strong>
              <strong>قيمة الصافي : {+op.amount - +op.commation} جنيه</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Main;
