'use client';
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Operations() {
    const router = useRouter()
    const [loading, setLoading] = useState(false);

    // بيانات العملاء
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");

    // باقي الحقول
    const [operationType, setOperationType] = useState("");
    const [amountType, setAmountType] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [amount, setAmount] = useState("");

    // جلب العملاء من firestore
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const querySnap = await getDocs(collection(db, "clients"));
                const clientsList = querySnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setClients(clientsList);
            } catch (err) {
                console.error("Error fetching clients:", err);
            }
        };
        fetchClients();
    }, []);

    // إضافة عملية جديدة
    const handleAddOperation = async () => {
        if (!selectedClient || !operationType || !amountType || !paymentMethod || !amount) {
            alert("من فضلك املأ كل الحقول");
            return;
        }

        setLoading(true);
        try {
            // 1️⃣ هات سعر الدولار من users
            const usersSnap = await getDocs(collection(db, "users"));
            if (usersSnap.empty) {
                alert("❌ لم يتم العثور على سعر الدولار");
                setLoading(false);
                return;
            }
            const dollarRate = usersSnap.docs[0].data().dollar; // نفترض أول doc فيه السعر

            // 2️⃣ هات بيانات العميل
            const clientDocRef = doc(db, "clients", selectedClient);
            const clientDocSnap = await getDoc(clientDocRef);
            if (!clientDocSnap.exists()) {
                alert("❌ العميل غير موجود");
                setLoading(false);
                return;
            }
            const clientData = clientDocSnap.data();
            let currentAmount = clientData.amount;

            // 3️⃣ حساب العملية بالدولار
            let operationValueInDollar = 0;
            if (amountType === "جنية") {
                operationValueInDollar = parseFloat(amount) / dollarRate;
            } else {
                operationValueInDollar = parseFloat(amount);
            }

            // 4️⃣ تعديل الرصيد حسب نوع العملية
            if (operationType === "ارسال") {
                currentAmount -= operationValueInDollar;
            } else if (operationType === "استلام") {
                currentAmount += operationValueInDollar;
            }

            // 5️⃣ تحديث رصيد العميل في clients
            await updateDoc(clientDocRef, {
                amount: currentAmount
            });

            // 6️⃣ إضافة العملية في operations
            await addDoc(collection(db, "operations"), {
                clientId: selectedClient,
                operationType,
                amountType,
                paymentMethod,
                amount: parseFloat(amount),
                confirmation: false,
                createdAt: new Date()
            });

            alert("✅ تمت إضافة العملية بنجاح!");
            // reset fields
            setSelectedClient("");
            setOperationType("");
            setAmountType("");
            setPaymentMethod("");
            setAmount("");
        } catch (err) {
            console.error("Error adding operation:", err);
            alert("❌ حدث خطأ أثناء الإضافة");
        }
        setLoading(false);
    };

    return(
        <div className={styles.operations}>
            <div className={styles.header}>
                <h2>عملية جديدة</h2>
                <button onClick={() => router.push('/')}><MdKeyboardArrowLeft/></button>
            </div>
            <div className={styles.content}>
                <div className="inputContainer">
                    <select 
                        value={selectedClient} 
                        onChange={(e) => setSelectedClient(e.target.value)}
                    >
                        <option value="" disabled>-- اختر العميل --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="inputContainer">
                    <select 
                        value={operationType} 
                        onChange={(e) => setOperationType(e.target.value)}
                    >
                        <option value="" disabled>-- اختر نوع العملية --</option>
                        <option value="ارسال">ارسال</option>
                        <option value="استلام">استلام</option>
                    </select>
                </div>
                <div className="inputContainer">
                    <select 
                        value={amountType} 
                        onChange={(e) => setAmountType(e.target.value)}
                    >
                        <option value="" disabled>-- اختر نوع المبلغ --</option>
                        <option value="دولار">دولار</option>
                        <option value="جنية">جنية</option>
                    </select>
                </div>
                <div className="inputContainer">
                    <input 
                        type="text" 
                        placeholder="طريقة الدفع"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                </div>
                <div className="inputContainer">
                    <input 
                        type="number" 
                        placeholder="المبلغ المدفوع"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleAddOperation}
                    disabled={loading}
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    {loading ? (<span className={styles.loader}></span>) : ("اضف العملية")}
                </button>
            </div>
        </div>
    )
}

export default Operations;
