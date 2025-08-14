'use client';
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlinePhone } from "react-icons/md";
import { TbCurrencyDollar } from "react-icons/tb";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase"; // المسار حسب مكان ملف firebase.js

function Clients() {
    const router = useRouter();
    const email = typeof window !== 'undefined' ? localStorage.getItem('email') : ''
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAddClient = async () => {
        if (!name || !phone || !amount) {
            alert("من فضلك املأ كل الحقول");
            return;
        }

        setLoading(true); // ابدأ التحميل
        try {
            await addDoc(collection(db, "clients"), {
                name,
                phone,
                email,
                amount: parseFloat(amount),
                createdAt: new Date()
            });
            alert("تم إضافة العميل بنجاح!");
            setName("");
            setPhone("");
            setAmount("");
        } catch (err) {
            console.error(err);
            alert("حدث خطأ أثناء الإضافة");
        }
        setLoading(false); // وقف التحميل
    };

    return (
        <div className={styles.clients}>
            <div className={styles.header}>
                <h2>اضف عميل جديد</h2>
                <button onClick={() => router.push('/')}><MdKeyboardArrowLeft/></button>
            </div>
            <div className={styles.content}>
                <div className="inputContainer">
                    <label><IoPersonOutline/></label>
                    <input 
                        type="text" 
                        placeholder="اسم العميل"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="inputContainer">
                    <label><MdOutlinePhone/></label>
                    <input 
                        type="text" 
                        placeholder="رقم الهاتف"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="inputContainer">
                    <label><TbCurrencyDollar/></label>
                    <input 
                        type="number" 
                        placeholder="المبلغ بالدولار"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleAddClient} 
                    disabled={loading} // قفل الزرار لو بيحمل
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    {loading ? (
                        <span 
                            style={{
                                border: "2px solid #f3f3f3",
                                borderTop: "2px solid #fff",
                                borderRadius: "50%",
                                width: "16px",
                                height: "16px",
                                animation: "spin 1s linear infinite"
                            }}
                        ></span>
                    ) : (
                        "اضف العميل"
                    )}
                </button>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        </div>
    );
}

export default Clients;
