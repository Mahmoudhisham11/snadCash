'use client';
import styles from "./styles.module.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  doc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import React from "react";
import { db } from "@/app/firebase";
import { CiTrash } from "react-icons/ci";

function Info({ params }) {
  const router = useRouter();

  // ✅ نفك الباراميتر بالطريقة الصحيحة
  const unwrappedParams = React.use(params);
  const id = decodeURIComponent(unwrappedParams.id);

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [operations, setOperations] = useState([]);
  const [opsLoading, setOpsLoading] = useState(true);

  // -------------------- جلب بيانات العميل --------------------
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const docRef = doc(db, "clients", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClient(docSnap.data());
        } else {
          console.log("❌ العميل مش موجود");
        }
      } catch (err) {
        console.error("Error fetching client:", err);
      }
      setLoading(false);
    };

    if (id) fetchClient();
  }, [id]);

  // -------------------- جلب العمليات الخاصة بالعميل --------------------
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "operations"),
      where("clientId", "==", id)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOperations(data);
        setOpsLoading(false);
      },
      (err) => {
        console.error("Error subscribing operations:", err);
        setOpsLoading(false);
      }
    );

    return () => unsub();
  }, [id]);

  // -------------------- ريندر --------------------
  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <span className={styles.loader}></span>
      </div>
    );
  }

  if (!client) return <p>❌ لم يتم العثور على العميل</p>;

  return (
    <div className={styles.info}>
      <button className={styles.backBtn} onClick={() => router.push('/')}>
        <MdKeyboardArrowLeft />
      </button>

      <div className={styles.infoContent}>
        <h2>{client.name ? client.name[0] : "?"}</h2>
        <h3>{client.name}</h3>
        <div className={styles.amountInfo}>
          <p>${client.amount}</p>
          <p>{client.type}</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>تأكيد</th>
              <th>المبلغ</th>
              <th>النوع</th>
              <th>طريقة الدفع</th>
              <th>التاريخ</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {opsLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className={styles.loaderInline}>
                    <span className={styles.loader}></span>
                  </div>
                </td>
              </tr>
            ) : operations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  لا توجد عمليات لهذا العميل
                </td>
              </tr>
            ) : (
              operations.map((op) => {
                const dt = op.createdAt?.toDate
                  ? op.createdAt.toDate()
                  : (op.createdAt ? new Date(op.createdAt) : null);
                const dateStr = dt ? dt.toLocaleDateString('ar-EG') : '-';

                return (
                  <tr key={op.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!op.confirmation}
                        onChange={async (e) => {
                          try {
                            await updateDoc(doc(db, "operations", op.id), {
                              confirmation: e.target.checked,
                            });
                          } catch (err) {
                            console.error("Error updating confirmation:", err);
                          }
                        }}
                      />
                    </td>
                    <td>
                      {op.amountType === "جنية"
                        ? `${op.amount} ج.م`
                        : `$${op.amount}`}
                    </td>
                    <td>{op.operationType || "-"}</td>
                    <td>{op.paymentMethod || "-"}</td>
                    <td>{dateStr}</td>
                    <td>
                      <button
                        className={styles.delBtn}
                        title="حذف"
                        onClick={async () => {
                          const pass = prompt("ادخل كلمة السر لحذف العملية:");
                          if (pass === "1234") {
                            try {
                              await deleteDoc(doc(db, "operations", op.id));
                            } catch (err) {
                              console.error("Error deleting operation:", err);
                            }
                          } else {
                            alert("❌ كلمة السر غير صحيحة");
                          }
                        }}
                      >
                        <CiTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Info;
