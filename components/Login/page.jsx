'use client';
import styles from "./styles.module.css";
import Image from "next/image";
import logo from "../../public/images/logo.png"
import { useState } from "react";
import { db } from "@/app/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

function Login() {
    const [creat, setCreat] = useState(false)
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cash, setCah] = useState(0)
    const [wallet, setWallets] = useState(0)

        const handleCreatAcc = async() => {
        if(!userName) {
            alert("يجب ادخال اسم المستخدم")
            return
        }
        if(!password) {
            alert("يجب ادخال كلمة المرور")
            return
        }
        if(!email) {
            alert("يجب ادخال البريد الالكتروني ")
            return
        }
        if(!wallet) {
            alert("يجب ادخال قيمة الكاش ")
            return
        }
        if(!cash) {
            alert("يجب ادخال قيمة المحافظ ")
            return
        }
        const q = query(collection(db, 'snadUsers'), where('emial', '==', email))
        const querySnapshot = await getDocs(q)
        if(querySnapshot.empty) {
            await addDoc(collection(db, 'snadUsers'), {
                userName,
                 password, 
                 email,
                 wallet,
                 cash,
                 expensses: 0
                })
            alert("تم انشاء حساب للمستخدم")
            setUserName('')
            setPassword('')
            setEmail('')
            setWallets('')
            setCah('')
        }else {
            alert('المستخدم موجود بالفعل')
        }
    }

    const handleLogin = async() => {
        const q = query(collection(db, 'snadUsers'), where('email', '==', email))
        const querySnapshot = await getDocs(q)
        if(querySnapshot.empty) {
            alert('اسم المستخدم غير صحيح')
        }else {
            const userDoc = querySnapshot.docs[0] 
            const userData = userDoc.data()
            if(userData.password !== password) {
                alert("كلمة المرور غير صحيحة")
            }else {
                if(typeof window !== 'undefinde') {
                    localStorage.setItem('userName', userData.userName)
                    localStorage.setItem('email', email)
                    window.location.reload()
                }
            }
        }
    }

    return(
        <div className={styles.loginContainer}>
            <div className={styles.imageContainer}>
                <Image src={logo} fill style={{objectFit: 'cover', borderRadius: '8px'}} alt="logoImage"/>
            </div>
            <div className={styles.loginContent} style={{display: creat ? 'none' : 'flex'}}>
                <div className={styles.title}>
                    <h2>مرحبا بك برجاء تسجيل الدخول</h2>
                </div>
                <div className="inputContainer">
                    <label>البريد الالكتروني : </label>
                    <input type="text" placeholder="برجاء ادخال البريد الالكتروني" onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="inputContainer">
                    <label>كلمة المرور : </label>
                    <input type="password" placeholder="برجاء ادخال كلمة المرور" onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <button className={styles.loginBtn} onClick={handleLogin}>تسجيل الدخول</button>
                <button className={styles.creatBtn} onClick={() => setCreat(true)}>ليس لديك لديك حساب؟ <span>انشاء حساب جديد</span></button>
            </div>
            <div className={styles.loginContent} style={{display: creat ? 'flex' : 'none'}}>
                <div className={styles.title}>
                    <h2>مرحبا بك برجاء انشاء حساب جديد</h2>
                </div>
                <div className="inputContainer">
                    <label> الاسم : </label>
                    <input type="text" value={userName} placeholder="برجاء ادخال اسم المستخدم" onChange={(e) => setUserName(e.target.value)}/>
                </div>
                <div className="inputContainer">
                    <label>البريد الالكتروني : </label>
                    <input type="text" value={email} placeholder="برجاء ادخال البريد الالكتروني" onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="inputContainer">
                    <label>كلمة المرور : </label>
                    <input type="password" value={password} placeholder="برجاء ادخال كلمة المرور" onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="inputContainer">
                    <label>قيمة المحافظ: </label>
                    <input type="number" value={wallet} placeholder="برجاء ادخال رائس مال المحافظ " onChange={(e) => setWallets(e.target.value)}/>
                </div>
                <div className="inputContainer">
                    <label> قيمة الكاش : </label>
                    <input type="number" value={cash} placeholder="برجاء ادخال رائس مال الكاش" onChange={(e) => setCah(e.target.value)}/>
                </div>
                <button className={styles.loginBtn}  onClick={handleCreatAcc}> انشاء حساب جديد</button>
                <button className={styles.creatBtn} onClick={() => setCreat(false)}>لديك حساب بالفعل؟ <span>تسجيل الدخول</span></button>
            </div>
        </div>
    )
}

export default Login;