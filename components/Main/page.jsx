'use client';
import { useEffect, useState } from "react";
import stylse from "./styles.module.css";
import { FaTrashAlt } from "react-icons/fa";
import { GoGear } from "react-icons/go";
import { TbReportSearch } from "react-icons/tb";
import { IoWalletOutline } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";

function Main() {
    const router = useRouter()
    const [acitve, setActive] = useState("")
    const [openBox, setOpenBox] = useState(false)
    const [openSittinges, setOpenSittings] = useState(false)
    const [type, setType] = useState('ارسال')
    const [amount, setAmount] = useState('')
    const [commation, setCommation] = useState('')
    const [email, setEmail] = useState('')
    const [total, setTotal] = useState(0)
    const [operations, setOperations] = useState([])
    const [users, setUsers] = useState([])
    const [wallet, setWallet] = useState('')
    const [cash, setCash] = useState('')

    useEffect(() => {
        if(typeof window !== "undefined") {
            const stroageEamil = localStorage.getItem('email')
            if(stroageEamil) {
                setEmail(stroageEamil)
            }
            const q = query(collection(db, 'operations'), where('email', '==', stroageEamil))
            const unsubscripe = onSnapshot(q, (querySnapshot) => {
                const operationsArray = []
                querySnapshot.forEach((doc) => {
                    operationsArray.push({...doc.data(), id: doc.id})
                })
                setOperations(operationsArray)
            })
            const usersQ = query(collection(db, 'users'), where('email', '==', stroageEamil))
            const unsubscripeUser = onSnapshot(usersQ, (querySnapshot) => {
                const userArray = []
                querySnapshot.forEach((doc) => {
                    userArray.push({...doc.data(), id: doc.id})
                })
                setUsers(userArray)
            })
            return () => {unsubscripe(), unsubscripeUser()}
        }
        
    }, [])

    useEffect(() => {
        const subTotal = users.reduce((acc, user) => {
            const wallet = Number(user.wallet || 0);
            const cash = Number(user.cash || 0);
            return acc + wallet + cash;
        }, 0);
        setTotal(subTotal)
    }, [users])

    const handleOperation = async() => {
        const q = query(collection(db, 'users'), where('email', '==', email))
        const querySnapshot = await getDocs(q)
        if(!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userData = userDoc.data()
            const userRef = doc(db, 'users', userDoc.id)
            await addDoc(collection(db, 'operations'), {
                amount,
                commation,
                type,
                date: new Date().toISOString().split("T")[0],
                email
            })
            await addDoc(collection(db, 'reports'), {
                amount, 
                commation,
                type,
                date: new Date().toISOString().split("T")[0],
                email
            })
            let updateData = {};
            if (type === "مصاريف") {
                updateData = {
                    expensses: Number(userData.expensses) + Number(amount),
                    cash: Number(userData.cash) - Number(amount) 
                };
            } else if (type === "ارسال") {
                updateData = {
                    wallet: Number(userData.wallet) - Number(amount),
                    cash: Number(userData.cash) + Number(amount),
                };
            } else if (type === "استلام") {
                updateData = {
                    cash: Number(userData.cash) - Number(amount),
                    wallet: Number(userData.wallet) + Number(amount),
                };
            }
            await updateDoc(userRef, updateData)
            alert("تم اكمال العملية بنجاح")
            setAmount('');
            setCommation('');
            setType('ارسال');
            setOpenBox(false);
        }
    }

    const handleDelete = async(id) => {
        await deleteDoc(doc(db, 'operations', id))
    }

    const handleSittings = async() => {
        const q = query(collection(db, 'users'), where('email', '==', email))
        const querySnapshot = await getDocs(q)
        if(!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userRef = doc(db, 'users', userDoc.id)
            const userData = userDoc.data()
            await updateDoc(userRef, {
                wallet,
                cash
            })
            alert('تم تعديل راس المال')
            setWallet('')
            setCash('')
        }
    }

    const handleLogout = () => {
        if(typeof window !== 'undefined') {
            localStorage.clear()
            window.location.reload()
        }
    }

    return(
        <div className={stylse.mainContainer}>
            <div className="boxShadow" style={{display: openBox ? 'flex' : 'none'}}>
                <div className="mainBox">
                    <div className={stylse.boxTitle}>
                        <h2>عملية جديدة</h2>
                        <button onClick={() => setOpenBox(false)}><IoIosCloseCircleOutline/></button>
                    </div>
                    <div className="boxContent">
                        <div className="inputContainer">
                            <label>قيمة العملية : </label>
                            <input type="number" value={amount} placeholder="ادخل قيمة العملية" onChange={(e) => setAmount(e.target.value)}/>
                        </div>
                        <div className="inputContainer">
                            <label>قيمة العمولة : </label>
                            <input type="number" value={commation} placeholder="ادخل عمولة العملية" onChange={(e) => setCommation(e.target.value)}/>
                        </div>
                        <div className="inputContainer">
                            <label>نوع العملية : </label>
                            <select onChange={(e) => setType(e.target.value)}>
                                <option value="ارسال">ارسال</option>
                                <option value="استلام">استلام</option>
                                <option value="مصاريف">مصاريف</option>
                            </select>
                        </div>
                        <button onClick={handleOperation}>اكمل العملية</button>
                    </div>
                </div>
            </div>
            <div className="boxShadow" style={{display: openSittinges ? 'flex' : 'none'}}>
                <div className="mainBox">
                    <div className={stylse.boxTitle}>
                        <h2>تعديل راس المال</h2>
                        <button onClick={() => setOpenSittings(false)}><IoIosCloseCircleOutline/></button>
                    </div>
                    <div className="boxContent">
                        <div className="inputContainer">
                            <label>قيمة المحافظ : </label>
                            <input type="number" value={wallet} placeholder="ادخل قيمة المحافظ" onChange={(e) => setWallet(e.target.value)}/>
                        </div>
                        <div className="inputContainer">
                            <label>قيمة العمولة : </label>
                            <input type="number" value={cash} placeholder="ادخل عمولة الكاش" onChange={(e) => setCash(e.target.value)}/>
                        </div>
                        <button onClick={handleSittings}>اكمل العملية</button>
                        <button onClick={handleLogout}>تسجيل الخروج</button>
                    </div>
                </div>
            </div>
            <div className={stylse.header}>
                <div className={stylse.title}>
                    <h2>رائس المال</h2>
                    <strong>{total} جنية</strong>
                </div>
                <div className={stylse.btns}>
                    <button onClick={() => setOpenBox(true)}><IoWalletOutline/></button>
                    <button onClick={() => router.push('/reports')}><TbReportSearch/></button>
                    <button onClick={() => setOpenSittings(true)}><GoGear/></button>
                </div>
            </div>
            <div className={stylse.tableContainer}>
                {operations.map((operation, index) => {
                    return(
                        <div key={operation.id} onClick={() => setActive(acitve === index ? null : index)} className={acitve === index ? "card active" : 'card'}>
                            <div className="head">
                                <h2>{operation.type}</h2>
                                <button onClick={() => handleDelete(operation.id)}><FaTrashAlt/></button>
                            </div>
                            <hr />
                            <div className="buttom">
                                <strong>قيمة العملية : <p>{operation.amount}</p></strong>
                                <strong>قيمة العمولة : <p>{operation.commation}</p></strong>
                                <strong>صافي الملبغ : <p>{Number(operation.amount) - Number(operation.commation)}</p></strong>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Main;