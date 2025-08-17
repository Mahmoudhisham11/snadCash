'use client'; 
import styles from "./styles.module.css";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { TbCurrencyDollar } from "react-icons/tb";
import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

function Dollar({ dollar, setDollar }) {
    const [dollarValue, setDollarValue] = useState("");
    const [userId, setUserId] = useState(""); // علشان نمسك الـ id بتاع اليوزر

    // هجيب أول user من الcollection
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const querySnap = await getDocs(collection(db, "users"));
                if (!querySnap.empty) {
                    const userDoc = querySnap.docs[0];
                    setUserId(userDoc.id);
                    setDollarValue(userDoc.data().dollar); // القيمة الحالية
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchUser();
    }, []);

    // تحديث سعر الدولار
    const handleUpdateDollar = async () => {
        if (!userId || !dollarValue) {
            alert("❌ من فضلك أدخل قيمة صحيحة");
            return;
        }

        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                dollar: parseFloat(dollarValue)
            });
            alert("✅ تم تحديث سعر الدولار بنجاح");
            setDollar(false); // يقفل البوكس بعد الحفظ
        } catch (err) {
            console.error("Error updating dollar:", err);
            alert("❌ حدث خطأ أثناء التحديث");
        }
    };

    return (
        <div className={dollar ? `${styles.shadowBox} ${styles.open}` : `${styles.shadowBox}`}>
            <div className={styles.box}>
                <div className={styles.title}>
                    <h2>سعر الدولار</h2>
                    <button onClick={() => setDollar(false)} className={styles.closeBtn}>
                        <IoIosCloseCircleOutline />
                    </button>
                </div>
                <div className="inputContainer">
                    <label><TbCurrencyDollar /></label>
                    <input
                        type="number"
                        placeholder="سعر الدولار"
                        value={dollarValue}
                        onChange={(e) => setDollarValue(e.target.value)}
                    />
                </div>
                <button onClick={handleUpdateDollar} className={styles.saveBtn}>
                    حفظ
                </button>
            </div>
        </div>
    );
}

export default Dollar;
