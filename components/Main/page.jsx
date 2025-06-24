'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { FaTrashAlt } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { TbReportSearch } from "react-icons/tb";
import { IoWalletOutline } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";

function Main() {
    const router = useRouter();
    const [active, setActive] = useState("");
    const [openBox, setOpenBox] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [type, setType] = useState('ارسال');
    const [amount, setAmount] = useState('');
    const [commation, setCommation] = useState('');
    const [email, setEmail] = useState('');
    const [total, setTotal] = useState(0);
    const [operations, setOperations] = useState([]);
    const [users, setUsers] = useState([]);
    const [wallet, setWallet] = useState('');
    const [cash, setCash] = useState('');

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedEmail = localStorage.getItem('email');
            if (storedEmail) setEmail(storedEmail);
        }
    }, []);

    useEffect(() => {
        if (!email) return;

        const q = query(collection(db, 'operations'), where('email', '==', email));
        const unsubOperations = onSnapshot(q, (querySnapshot) => {
            const operationsArray = [];
            querySnapshot.forEach((doc) => {
                operationsArray.push({ ...doc.data(), id: doc.id });
            });
            setOperations(operationsArray);
        });

        const usersQ = query(collection(db, 'users'), where('email', '==', email));
        const unsubUsers = onSnapshot(usersQ, (querySnapshot) => {
            const userArray = [];
            querySnapshot.forEach((doc) => {
                userArray.push({ ...doc.data(), id: doc.id });
            });
            setUsers(userArray);
        });

        return () => {
            unsubOperations();
            unsubUsers();
        };
    }, [email]);

    useEffect(() => {
        const subTotal = users.reduce((acc, user) => {
            const wallet = Number(user.wallet || 0);
            const cash = Number(user.cash || 0);
            return acc + wallet + cash;
        }, 0);
        setTotal(subTotal);
    }, [users]);

    const handleOperation = async () => {
        const numAmount = Number(amount);
        const numCommation = Number(commation);
        if (isNaN(numAmount) || isNaN(numCommation)) {
            alert("من فضلك ادخل أرقام صحيحة");
            return;
        }

        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            const userRef = doc(db, 'users', userDoc.id);

            if (type === "استلام" && Number(userData.cash) < numAmount) {
                alert("رصيد الكاش غير كافي");
                return;
            }

            const operationData = {
                amount: numAmount,
                commation: numCommation,
                type,
                date: new Date().toISOString().split("T")[0],
                email
            };

            await Promise.all([
                addDoc(collection(db, 'operations'), operationData),
                addDoc(collection(db, 'reports'), operationData)
            ]);

            let updateData = {};
            if (type === "مصاريف") {
                updateData = {
                    expensses: Number(userData.expensses) + numAmount,
                    cash: Number(userData.cash) - numAmount
                };
            } else if (type === "ارسال") {
                updateData = {
                    wallet: Number(userData.wallet) - numAmount,
                    cash: Number(userData.cash) + numAmount
                };
            } else if (type === "استلام") {
                updateData = {
                    cash: Number(userData.cash) - numAmount,
                    wallet: Number(userData.wallet) + numAmount
                };
            }

            await updateDoc(userRef, updateData);
            alert("تم اكمال العملية بنجاح");
            setAmount('');
            setCommation('');
            setType('ارسال');
            setOpenBox(false);
        }
    };

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'operations', id));
    };

    const handleSettings = async () => {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userRef = doc(db, 'users', userDoc.id);
            await updateDoc(userRef, {
                wallet: Number(wallet),
                cash: Number(cash)
            });
            alert('تم تعديل رأس المال');
            setWallet('');
            setCash('');
        }
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className={styles.mainContainer}>
            {/* صندوق العمليات */}
            <div className="boxShadow" style={{ display: openBox ? 'flex' : 'none' }}>
                <div className="mainBox">
                    <div className={styles.boxTitle}>
                        <h2>عملية جديدة</h2>
                        <button onClick={() => setOpenBox(false)}><IoIosCloseCircleOutline /></button>
                    </div>
                    <div className="boxContent">
                        <div className="inputContainer">
                            <label>قيمة العملية : </label>
                            <input type="number" value={amount} placeholder="ادخل قيمة العملية" onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="inputContainer">
                            <label>قيمة العمولة : </label>
                            <input type="number" value={commation} placeholder="ادخل عمولة العملية" onChange={(e) => setCommation(e.target.value)} />
                        </div>
                        <div className="inputContainer">
                            <label>نوع العملية : </label>
                            <select onChange={(e) => setType(e.target.value)} value={type}>
                                <option value="ارسال">ارسال</option>
                                <option value="استلام">استلام</option>
                                <option value="مصاريف">مصاريف</option>
                            </select>
                        </div>
                        <button onClick={handleOperation}>اكمل العملية</button>
                    </div>
                </div>
            </div>

            {/* صندوق الإعدادات */}
            <div className="boxShadow" style={{ display: openSettings ? 'flex' : 'none' }}>
                <div className="mainBox">
                    <div className={styles.boxTitle}>
                        <h2>تعديل رأس المال</h2>
                        <button onClick={() => setOpenSettings(false)}><IoIosCloseCircleOutline /></button>
                    </div>
                    <div className="boxContent">
                        <div className="inputContainer">
                            <label>قيمة المحافظ : </label>
                            <input type="number" value={wallet} placeholder="ادخل قيمة المحافظ" onChange={(e) => setWallet(e.target.value)} />
                        </div>
                        <div className="inputContainer">
                            <label>قيمة الكاش : </label>
                            <input type="number" value={cash} placeholder="ادخل قيمة الكاش" onChange={(e) => setCash(e.target.value)} />
                        </div>
                        <button onClick={handleSettings}>اكمل العملية</button>
                        <button onClick={handleLogout}>تسجيل الخروج</button>
                    </div>
                </div>
            </div>

            {/* رأس الصفحة */}
            <div className={styles.header}>
                <div className={styles.title}>
                    <h2>رأس المال</h2>
                    <strong>{total} جنية</strong>
                </div>
                <div className={styles.btns}>
                    <button onClick={() => setOpenBox(true)}><IoWalletOutline /></button>
                    <button onClick={() => router.push('/reports')}><TbReportSearch /></button>
                    <button onClick={() => setOpenSettings(true)}><GoGear /></button>
                </div>
            </div>

            {/* جدول العمليات */}
            <div className={styles.tableContainer}>
                {operations.map((operation, index) => (
                    <div key={operation.id} onClick={() => setActive(active === index ? null : index)} className={active === index ? "card active" : 'card'}>
                        <div className="head">
                            <h2>{operation.type}</h2>
                            <button onClick={() => handleDelete(operation.id)}><FaTrashAlt /></button>
                        </div>
                        <hr />
                        <div className="buttom">
                            <strong>قيمة العملية : <p>{operation.amount}</p></strong>
                            <strong>قيمة العمولة : <p>{operation.commation}</p></strong>
                            <strong>صافي المبلغ : <p>{Number(operation.amount) - Number(operation.commation)}</p></strong>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Main;
