'use client';
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { IoPersonOutline } from "react-icons/io5";
import { MdOutlinePhone } from "react-icons/md";
import { TbCurrencyDollar } from "react-icons/tb";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

function Clients() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState('')
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
    if (typeof window !== "undefined") {
        setEmail(localStorage.getItem("email") || "");
    }
    }, []);

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
                type,
                amount: parseFloat(amount),
                createdAt: new Date()
            });
            alert("تم إضافة العميل بنجاح!");
            setName("");
            setPhone("");
            setAmount("");
            setType("");
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
                <div className="inputContainer">
                    <label><TbCurrencyDollar/></label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="" disabled selected>-- اختر المبلغ لمين --</option>
                        <option value="ليك">ليك</option>
                        <option value="عليك">عليك</option>
                    </select>
                </div>
                <button 
                    onClick={handleAddClient} 
                    disabled={loading}
                    style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    {loading ? (<span className={styles.loader}></span>) : ("اضف العميل")}
                </button>
            </div>
        </div>
    );
}

export default Clients;
