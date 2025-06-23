'use client';
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

function Reports() {
    const router = useRouter()
    const [reports, setReports] = useState([])
    const [date, setDate] = useState('')
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if(typeof window !== 'undefined') {
            const storageEmail = localStorage.getItem('email')
            
            const q = query(collection(db, 'reports'), where('date', '==', date), where('email', '==', storageEmail))
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const reportsArray = []
                querySnapshot.forEach((doc) => {
                    reportsArray.push({...doc.data(), id: doc.id})
                })
                setReports(reportsArray)
            })
            return () => unsubscribe()

        }
    }, [date])

    useEffect(() => {
        const subTotal = reports.reduce((acc, report) => {
            return acc + Number(report.commation)
        }, [])
        setTotal(subTotal)
    } ,[reports])

    return(
        <div className={styles.Reports}>
            <div className={styles.header}>
                <div className="inputContainer">
                    <input type="date" onChange={(e) => setDate(e.target.value)} placeholder="ابحث بالتاريخ"/>
                </div>
                <button onClick={() => router.push('/')}><IoIosArrowDropleftCircle/></button>
            </div>
            <div className={styles.content}>
                <table>
                    <thead>
                        <tr>
                            <th>العملية</th>
                            <th>المبلغ</th>
                            <th>العمولة</th>
                            <th>الصافي</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => {
                            return(
                                <tr key={report.id}>
                                    <td>{report.type}</td>
                                    <td>{report.amount}</td>
                                    <td>{report.commation}</td>
                                    <td>{Number(report.amount) - Number(report.commation)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={1}>الربح : {total}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

export default Reports;