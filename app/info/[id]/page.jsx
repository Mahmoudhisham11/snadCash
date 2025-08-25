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
  updateDoc,
  addDoc 
} from "firebase/firestore";
import React from "react";
import { db } from "@/app/firebase";
import { CiTrash } from "react-icons/ci";

function Info({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = decodeURIComponent(unwrappedParams.id);

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [operations, setOperations] = useState([]);
  const [opsLoading, setOpsLoading] = useState(true);

  const [dollar, setDollar] = useState(50); // سعر الدولار الافتراضي

  // states للـ Modal
  const [showModal, setShowModal] = useState(false);
  const [loadingOp, setLoadingOp] = useState(false);
  const [operationType, setOperationType] = useState("");
  const [amountType, setAmountType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amount, setAmount] = useState("");

  // -------------------- جلب بيانات العميل --------------------
  useEffect(() => {
    if (!id) return;

    const clientRef = doc(db, "clients", id);
    const unsub = onSnapshot(clientRef, (docSnap) => {
      if (docSnap.exists()) {
        setClient(docSnap.data());
      } else {
        console.log("❌ العميل مش موجود");
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching client:", err);
      setLoading(false);
    });

    return () => unsub();
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

  // -------------------- جلب سعر الدولار Live --------------------
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        setDollar(userDoc.data().dollar || 50);
      }
    });
    return () => unsub();
  }, []);

  // -------------------- إضافة عملية جديدة --------------------
  const handleAddOperation = async () => {
    if (!operationType || !amountType || !paymentMethod || !amount) {
      alert("من فضلك املأ كل الحقول");
      return;
    }

    setLoadingOp(true);
    try {
      // هات بيانات العميل
      const clientDocRef = doc(db, "clients", id);
      const clientDocSnap = await getDoc(clientDocRef);
      if (!clientDocSnap.exists()) {
        alert("❌ العميل غير موجود");
        setLoadingOp(false);
        return;
      }
      const clientData = clientDocSnap.data();
      let currentAmount = clientData.amount;

      // حساب العملية بالدولار
      let operationValueInDollar = 0;
      if (amountType === "جنية") {
        operationValueInDollar = parseFloat(amount) / dollar;
      } else {
        operationValueInDollar = parseFloat(amount);
      }

      // تعديل الرصيد
      if (operationType === "ارسال") {
        currentAmount -= operationValueInDollar;
      } else if (operationType === "استلام") {
        currentAmount += operationValueInDollar;
      }

      // تحديث رصيد العميل
      await updateDoc(clientDocRef, { amount: currentAmount });

      // إضافة العملية
      await addDoc(collection(db, "operations"), {
        clientId: id,
        operationType,
        amountType,
        paymentMethod,
        amount: parseFloat(amount),
        confirmation: false,
        createdAt: new Date()
      });

      alert("✅ تمت إضافة العملية بنجاح!");
      setShowModal(false);
      setOperationType("");
      setAmountType("");
      setPaymentMethod("");
      setAmount("");
    } catch (err) {
      console.error("Error adding operation:", err);
      alert("❌ حدث خطأ أثناء الإضافة");
    }
    setLoadingOp(false);
  };

  // -------------------- حساب الاجمالي بالدولار --------------------
  const totalDollar = operations.reduce((sum, op) => {
    const amountInDollar =
      op.amountType === "جنية"
        ? (op.amount / dollar)
        : op.amount;
    return sum + (parseFloat(amountInDollar) || 0);
  }, 0).toFixed(2);

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
        <button 
          className={styles.addBtn}
          onClick={() => setShowModal(true)}
        >
           عملية جديدة
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>تأكيد</th>
              <th>المبلغ</th>
              <th>المبلغ بالدولار</th>
              <th>النوع</th>
              <th>طريقة الدفع</th>
              <th>التاريخ</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {opsLoading ? (
              <tr>
                <td colSpan={7}>
                  <div className={styles.loaderInline}>
                    <span className={styles.loader}></span>
                  </div>
                </td>
              </tr>
            ) : operations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  لا توجد عمليات لهذا العميل
                </td>
              </tr>
            ) : (
              operations.map((op) => {
                const dt = op.createdAt?.toDate
                  ? op.createdAt.toDate()
                  : (op.createdAt ? new Date(op.createdAt) : null);
                const dateStr = dt ? dt.toLocaleDateString('ar-EG') : '-';

                const amountInDollar =
                  op.amountType === "جنية"
                    ? (op.amount / dollar).toFixed(2)
                    : op.amount;

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
                    <td>${amountInDollar}</td>
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
                              const clientDocRef = doc(db, "clients", id);
                              const clientDocSnap = await getDoc(clientDocRef);
                              if (!clientDocSnap.exists()) return;
                              const clientData = clientDocSnap.data();
                              let currentAmount = clientData.amount;

                              // حساب قيمة العملية بالدولار
                              let operationValueInDollar = 0;
                              if (op.amountType === "جنية") {
                                operationValueInDollar = parseFloat(op.amount) / dollar;
                              } else {
                                operationValueInDollar = parseFloat(op.amount);
                              }

                              // عكس العملية
                              if (op.operationType === "ارسال") {
                                currentAmount += operationValueInDollar;
                              } else if (op.operationType === "استلام") {
                                currentAmount -= operationValueInDollar;
                              }

                              // تحديث رصيد العميل
                              await updateDoc(clientDocRef, { amount: currentAmount });

                              // حذف العملية
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
          <tfoot>
            <tr>
              <td colSpan={7} style={{ textAlign: "center", fontWeight: "bold" }}>
                الاجمالي بالدولار: ${totalDollar}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* -------------------- Modal -------------------- */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>إضافة عملية جديدة</h3>
            <div className={styles.form}>
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
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleAddOperation} disabled={loadingOp}>
                {loadingOp ? "جاري الحفظ..." : "إضافة"}
              </button>
              <button onClick={() => setShowModal(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Info;
