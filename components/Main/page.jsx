'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import { IoWalletOutline } from "react-icons/io5";
import { TbReportSearch } from "react-icons/tb";
import { GoGear } from "react-icons/go";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";

function Main() {
    const [users, setUsers] = useState([])
    const [operations, setOperations] = useState([])
    const [openOperation, setOpenOperation] = useState(false)
    const [activeCard, setActiveCard] = useState('')
    const [total, setTotal] = useState('')
    const [email, setEmail] = useState('')
    const [amount, setAmount] = useState('')
    const [commation, setCommation] = useState('')
    const [type, setType] = useState('استلام')

    useEffect(() => {
        if(typeof window !== 'undefined') {
            const storageEmail = localStorage.getItem('email')
            setEmail(storageEmail)
            // GET USERS DATA
            const q = query(collection(db, 'snadUsers'), where('email', '==', storageEmail))
            const unSubscribe = onSnapshot(q, (querySnapshot) => {
                const userArray = []
                querySnapshot.forEach((doc) => {
                    userArray.push({...doc.data(), id: doc.id})
                })
                setUsers(userArray)
            })
            // GET OPERATIONS DATA
            const operationsQ = query(collection(db, 'operations'), where('email', '==', storageEmail))
            const unSubscribeOp = onSnapshot(operationsQ, (querySnapshot) => {
                const operationsArray = []
                querySnapshot.forEach((doc) => {
                    operationsArray.push({...doc.data(), id: doc.id})
                })
                setOperations(operationsArray)
            })
            return () => {unSubscribe(), unSubscribeOp()}
        }
    }, [])

    useEffect(() => {
        // GET SUBTOTAL
        const subTotal = users.reduce((acc, user) => {
            return acc + (Number(user.wallet) + Number(user.cash))
        }, 0)
        setTotal(subTotal)
    }, [users])

    // ADD OPERATION TO FIREBASE 
    const handleAddOperation = async() => {
        if(!amount || !commation) {
            alert('برجاء ادخال بيانات العملية')
        }else {
            await addDoc(collection(db, 'operations'), {
                amount,
                commation,
                type,
                email,
                date: new Date().toISOString().split("T")[0]
            })
            await addDoc(collection(db, 'reports'), {
                amount,
                commation,
                type,
                email,
                date: new Date().toISOString().split("T")[0]
            })
            const q = query(collection(db, 'snadUsers'), where('email', '==', email))
            const querySnapshot = await getDocs(q)
            if(!querySnapshot.empty){
                const userDoc = querySnapshot.docs[0]
                const userRef = doc(db, 'snadUsers', userDoc.id)
                const userData = userDoc.data()
                let updateData = {};
                if (type === "استلام") {
                    updateData = {
                        wallet: Number(userData.wallet || 0) + Number(amount),
                        cash: Number(userData.cash || 0) - Number(amount),
                    };
                } else if (type === "ارسال") {
                    updateData = {
                        wallet: Number(userData.wallet || 0) - Number(amount),
                        cash: Number(userData.cash || 0) + Number(amount),
                    };
                } else if (type === "مصاريف") {
                    updateData = {
                        cash: Number(cash || 0) - Number(amount),
                        expensses: Number(userData.expensses || 0) + Number(amount),
                    };
                } else if (type === 'اجل') {
                    updateData = {
                        cash: Number(userData.cash || 0) - Number(amount),
                        expensses: Number(userData.expensses || 0) + Number(amount),
                    };
                }
                 await updateDoc(userRef, updateData);
            }
            alert('تم اضافة العملية بنجاح')
            setAmount('')
            setCommation('')
            setType('استلام')
        }
    }
    // DELETE OPERATION 
    const handleDeleteOperation = async(id) => {
        await deleteDoc(doc(db, 'operations', id))
    }


    return(
        <div className={styles.mainContainer}>
            <div className="boxShadow" style={{display: openOperation ? 'flex' : 'none'}}>
                <div className={styles.box}>
                    <div className={styles.boxTitle}>
                        <h2>عملية جديدة</h2>
                        <button onClick={() => setOpenOperation(false)}><IoMdCloseCircleOutline/></button>
                    </div>
                    <div className={styles.boxContent}>
                        <div className="inputContainer">
                            <label>قيمة العملية : </label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                        </div>
                        <div className="inputContainer">
                            <label>قيمة العمولة : </label>
                            <input type="number" value={commation} onChange={(e) => setCommation(e.target.value)}/>
                        </div>
                        <div className="inputContainer">
                            <label>قيمة العمولة : </label>
                            <select onChange={(e) => setType(e.target.value)}>
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
            <div className={styles.header}>
                <div className={styles.title}>
                    <h2>رائس المال</h2>
                    <strong>{total} جنية</strong>
                </div>
                <div className={styles.btns}>
                    <button onClick={() => setOpenOperation(true)}><IoWalletOutline/></button>
                    <button><TbReportSearch/></button>
                    <button><GoGear/></button>
                </div>
            </div>
            <div className={styles.content}>
                {operations.map((operation, index) => {
                    return(
                        <div onClick={() => setActiveCard(activeCard === index ? null : index)} className={activeCard === index ? `${styles.card} ${styles.active}` : `${styles.card}`} key={operation.id}>
                            <div className={styles.cardHead}>
                                <h2>{operation.type}</h2>
                                <button onClick={() => handleDeleteOperation(operation.id)}><FaTrashAlt/></button>
                            </div>
                            <hr />
                            <div className={styles.cardBody}>
                                <strong>قيمة العملية : {operation.amount} جنية</strong>
                                <strong>قيمة العمولة : {operation.commation} جنية</strong>
                                <strong>قيمة الصافي : {(Number(operation.amount) - Number(operation.commation))} جنية</strong>
                            </div>
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default Main;