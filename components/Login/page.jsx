'use client';
import styles from "./styles.module.css";
import Image from "next/image";
import logo from "../../public/images/logo.png"
import { useState } from "react";
import { db } from "@/app/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { IoPerson } from "react-icons/io5";

function Login() {
    const [creat, setCreat] = useState(false)
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

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
        const q = query(collection(db, 'users'), where('emial', '==', email))
        const querySnapshot = await getDocs(q)
        if(querySnapshot.empty) {
            await addDoc(collection(db, 'users'), {
                userName,
                 password, 
                 email,
                })
            alert("تم انشاء حساب للمستخدم")
            setUserName('')
            setPassword('')
            setEmail('')
        }else {
            alert('المستخدم موجود بالفعل')
        }
    }

    const handleLogin = async() => {
        const q = query(collection(db, 'users'), where('email', '==', email))
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
            <div className={styles.loginContent} style={{display: creat ? 'none' : 'flex'}}>
                <div className={styles.title}>
                    <h2>مرحبا بك برجاء تسجيل الدخول</h2>
                    <p>مرحبا بعودتك دائما</p>
                </div>
                <div className={styles.inputBox}>
                    <div className="inputContainer">
                        <label><CiMail/></label>
                        <input type="text" placeholder="البريد الالكتروني" onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="inputContainer">
                        <label><CiLock/></label>
                        <input type="password" placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <button className={styles.loginBtn} onClick={handleLogin}>تسجيل الدخول</button>
                    <button className={styles.creatBtn} onClick={() => setCreat(true)}>ليس لديك لديك حساب؟ <span>انشاء حساب جديد</span></button>
                </div>
            </div>
            <div className={styles.loginContent} style={{display: creat ? 'flex' : 'none'}}>
                <div className={styles.title}>
                    <h2>انشاء حساب جديد</h2>
                    <p>انت دائما مرحب بك في المكان المناسب لمتابعة مالك</p>
                </div>
                <div className={styles.inputBox}>
                    <div className="inputContainer">
                        <label><IoPerson/></label>
                        <input type="text" value={userName} placeholder="اسم المستخدم" onChange={(e) => setUserName(e.target.value)}/>
                    </div>
                    <div className="inputContainer">
                        <label><CiMail/></label>
                        <input type="text" value={email} placeholder="البريد الالكتروني" onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                    <div className="inputContainer">
                        <label><CiLock/></label>
                        <input type="password" value={password} placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <button className={styles.loginBtn}  onClick={handleCreatAcc}> انشاء حساب جديد</button>
                    <button className={styles.creatBtn} onClick={() => setCreat(false)}>لديك حساب بالفعل؟ <span>تسجيل الدخول</span></button>
                </div>
            </div>
        </div>
    )
}

export default Login;