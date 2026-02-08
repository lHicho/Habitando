import "./signIn.css"

import { useUser } from "../../context/userContext"
import { useSidebar } from "../../context/sideContext"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

import { MdAlternateEmail } from "react-icons/md"
import { RiLockPasswordLine } from "react-icons/ri"

export default function SignIn() {

    const { signIn, updateInfo } = useUser()
    const { stayFunc } = useSidebar()
    const navigate = useNavigate()

    const [signData, setSignData] = useState({
        email: '',
        password: '',
        rememberMe: false
    })

    useEffect(() => {
        const savedEmail = localStorage.getItem('habitando-email');
        const savedPassword = localStorage.getItem('habitando-password'); // Warning: Saving password in local storage is unsafe for production apps.

        if (savedEmail && savedPassword) {
            setSignData(prev => ({
                ...prev,
                email: savedEmail,
                password: savedPassword,
                rememberMe: true
            }));

            // Auto-login logic
            const performAutoLogin = async () => {
                const respnce = await signIn(savedEmail, savedPassword)
                if (respnce == 200) {
                    await updateInfo(savedEmail)
                    toast.success("Welcome back!")
                    stayFunc()
                    navigate('/')
                }
            };
            performAutoLogin();
        }
    }, [signIn, updateInfo, stayFunc, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setSignData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (signData.email == "" || signData.password == "") {
            toast.error("Please fill both fields.")
        } else {
            if (signData.password.length < 8) {
                toast.error("Password should be at least 8.")
            } else {
                const respnce = await signIn(signData.email, signData.password)
                if (respnce == 100) {
                    toast.error("User e-mail not found.")
                } else if (respnce == 200) {
                    await updateInfo(signData.email)
                    toast.success("Signed in succesfully")

                    if (signData.rememberMe) {
                        localStorage.setItem('habitando-email', signData.email);
                        localStorage.setItem('habitando-password', signData.password);
                    } else {
                        localStorage.removeItem('habitando-email');
                        localStorage.removeItem('habitando-password');
                    }

                    stayFunc()
                    navigate('/')
                } else if (respnce == 300) {
                    toast.error("Password is not correct, try again.")

                }
            }

        }

    }

    return (
        <div className="signIn">
            <h1>Welcome Back, Sign In To Your Account</h1>

            <form onSubmit={handleSubmit}>
                <h2>Sign In</h2>
                <div className="inputCont">
                    <input
                        type="email"
                        name="email"
                        value={signData.email}
                        onChange={handleChange}
                        placeholder="E-mail"
                        required
                    />
                    <MdAlternateEmail />
                </div>

                <div className="inputCont">
                    <input
                        type="password"
                        name="password"
                        value={signData.password}
                        onChange={handleChange}
                        placeholder="PassWord"
                        required
                    />
                    <RiLockPasswordLine />
                </div>

                <div className="rememberMeCont" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', marginLeft: '10px' }}>
                    <input
                        type="checkbox"
                        name="rememberMe"
                        checked={signData.rememberMe}
                        onChange={handleChange}
                        id="rememberMe"
                        style={{ width: 'auto' }}
                    />
                    <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>Remember me</label>
                </div>

                <p>If you don't have an account yet create one <Link to="/regester">Here</Link>.</p>

                <button type="submit">Sign In</button>
            </form>
        </div>
    )
}